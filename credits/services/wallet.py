from django.db import transaction
from django.db.models import F, Q, Sum
from django.utils import timezone
from datetime import timedelta
from rest_framework.exceptions import APIException

from credits.choices import (
    CreditBucketSource,
    CreditTransactionKind,
    CreditTransactionStatus,
    EnforcementMode,
)
from credits.models import (
    CreditAccount,
    CreditBucket,
    CreditSettings,
    CreditTransaction,
    CreditTransactionLine,
)


class InsufficientCredits(APIException):
    status_code = 402
    default_code = "insufficient_credits"
    default_detail = "You're out of credits. Top up to keep sending - incoming messages still arrive."

    def __init__(self, required, available, subscription_active=True, can_buy_topups=True):
        self.required = int(required)
        self.available = int(available)
        super().__init__(
            {
                "success": False,
                "code": self.default_code,
                "message": str(self.default_detail),
                "data": {
                    "required": self.required,
                    "available": self.available,
                    "subscription_active": bool(subscription_active),
                    "can_buy_topups": bool(can_buy_topups),
                },
            }
        )


def get_credit_account(user):
    account, _ = CreditAccount.objects.get_or_create(user=user)
    return account


@transaction.atomic
def refresh_account_balance(account):
    locked = CreditAccount.objects.select_for_update().get(pk=account.pk)
    _recompute_locked_balance(locked)
    return locked


def _live_bucket_queryset(account, now=None):
    now = now or timezone.now()
    return CreditBucket.objects.filter(account=account, revoked_at__isnull=True, remaining__gt=0).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=now)
    )


def _recompute_locked_balance(account, now=None):
    balance = _live_bucket_queryset(account, now).aggregate(total=Sum("remaining"))["total"] or 0
    account.balance = max(0, int(balance))
    account.save(update_fields=["balance", "updated_at"])
    return account.balance


def _priority_for_source(source):
    return {
        CreditBucketSource.TRIAL: 10,
        CreditBucketSource.ADMIN_GRANT: 20,
        CreditBucketSource.REFUND_REVERSAL: 30,
        CreditBucketSource.SUBSCRIPTION: 40,
        CreditBucketSource.TOPUP: 90,
    }.get(source, 50)


def _queue_balance_alert(account, settings_obj):
    if settings_obj.enforcement_mode == EnforcementMode.SHADOW:
        return
    from subscription.services.purchase import SubscriptionValidationService

    subscription = SubscriptionValidationService.get_current_subscription(account.user)
    allowance = subscription.locked_monthly_credits if subscription and subscription.locked_monthly_credits else settings_obj.trial_credits
    threshold = int(allowance * settings_obj.low_balance_threshold_percent / 100) if allowance else 0
    from notifications.services import NotificationTemplates, safe_notify

    if account.balance == 0 and not account.exhausted_alerted:
        account.exhausted_alerted = True
        account.low_balance_alerted = True
        account.save(update_fields=["exhausted_alerted", "low_balance_alerted", "updated_at"])
        transaction.on_commit(lambda: safe_notify(NotificationTemplates.credits_exhausted, account.user))
    elif account.balance < threshold and not account.low_balance_alerted:
        account.low_balance_alerted = True
        account.save(update_fields=["low_balance_alerted", "updated_at"])
        transaction.on_commit(lambda: safe_notify(NotificationTemplates.credits_low, account.user, account.balance, threshold))


def resume_paused_followups(account):
    from crm.choices import AutomatedFollowUpStatus
    from crm.models import AutomatedFollowUp

    paused = list(
        AutomatedFollowUp.objects.filter(
            organization__owner=account.user,
            follow_up_status=AutomatedFollowUpStatus.PAUSED,
            pause_reason="no_credits",
        ).order_by("lead_id", "sequence_day")
    )
    now = timezone.now()
    first_day_by_lead = {}
    for followup in paused:
        first_day = first_day_by_lead.setdefault(followup.lead_id, followup.sequence_day)
        followup.follow_up_status = AutomatedFollowUpStatus.SCHEDULED
        followup.scheduled_time = now + timedelta(days=max(0, followup.sequence_day - first_day))
        followup.paused_at = None
        followup.pause_reason = ""
        followup.error_message = ""
        followup.save(update_fields=[
            "follow_up_status", "scheduled_time", "paused_at", "pause_reason", "error_message", "updated_at"
        ])
    return len(paused)


@transaction.atomic
def grant_credits(
    account,
    source,
    amount,
    *,
    key,
    expires_at=None,
    priority=None,
    period_start=None,
    period_end=None,
    store_transaction=None,
    note="",
    created_by=None,
):
    existing = CreditTransaction.objects.filter(idempotency_key=key).first()
    if existing:
        return existing
    amount = int(amount)
    if amount <= 0:
        raise ValueError("Credit grant amount must be greater than zero.")

    account = CreditAccount.objects.select_for_update().get(pk=account.pk)
    bucket = CreditBucket.objects.create(
        account=account,
        source=source,
        granted=amount,
        remaining=amount,
        expires_at=expires_at,
        priority=priority if priority is not None else _priority_for_source(source),
        period_start=period_start,
        period_end=period_end,
        store_transaction=store_transaction,
        idempotency_key=key,
        note=note,
    )
    balance = _recompute_locked_balance(account)
    account.low_balance_alerted = False
    account.exhausted_alerted = False
    update_fields = ["low_balance_alerted", "exhausted_alerted", "updated_at"]
    if source == CreditBucketSource.TRIAL and not account.trial_granted_at:
        account.trial_granted_at = timezone.now()
        update_fields.append("trial_granted_at")
    account.save(update_fields=update_fields)
    txn = CreditTransaction.objects.create(
        account=account,
        kind=CreditTransactionKind.GRANT,
        transaction_status=CreditTransactionStatus.SETTLED,
        amount=amount,
        idempotency_key=key,
        balance_after=balance,
        created_by=created_by,
        settled_at=timezone.now(),
        metadata={"source": source, "note": note},
    )
    CreditTransactionLine.objects.create(transaction=txn, bucket=bucket, amount=amount)
    transaction.on_commit(lambda: resume_paused_followups(account))
    return txn


@transaction.atomic
def reserve_credits(
    account,
    amount,
    *,
    key,
    usage_type="",
    purpose="direct",
    channel="",
    direction="outbound",
    units=1,
    unit_rate=1,
    counterparty="",
    organization=None,
    lead=None,
    reference_type="",
    reference_id="",
    sandbox=False,
    metadata=None,
):
    existing = CreditTransaction.objects.filter(idempotency_key=key).first()
    if existing:
        return existing
    amount = max(0, int(amount))
    settings_obj = CreditSettings.get_solo()
    account = CreditAccount.objects.select_for_update().get(pk=account.pk)
    available = _recompute_locked_balance(account)

    base = dict(
        account=account,
        kind=CreditTransactionKind.DEBIT,
        usage_type=usage_type,
        purpose=purpose,
        channel=channel,
        direction=direction,
        units=max(0, int(units)),
        unit_rate=max(0, int(unit_rate)),
        counterparty_e164=counterparty,
        organization=organization,
        lead=lead,
        reference_type=reference_type,
        reference_id=reference_id,
        idempotency_key=key,
        sandbox=sandbox,
    )
    if settings_obj.enforcement_mode == EnforcementMode.SHADOW:
        return CreditTransaction.objects.create(
            **base,
            transaction_status=CreditTransactionStatus.SETTLED,
            amount=0,
            balance_after=available,
            settled_at=timezone.now(),
            metadata={**(metadata or {}), "shadow": True, "would_charge": amount},
        )

    if available < amount:
        raise InsufficientCredits(required=amount, available=available)

    txn = CreditTransaction.objects.create(
        **base,
        transaction_status=CreditTransactionStatus.RESERVED,
        amount=-amount,
        balance_after=available,
        metadata=metadata or {},
    )
    remaining_to_take = amount
    buckets = list(
        _live_bucket_queryset(account)
        .select_for_update()
        .order_by(F("expires_at").asc(nulls_last=True), "priority", "id")
    )
    for bucket in buckets:
        if remaining_to_take <= 0:
            break
        take = min(bucket.remaining, remaining_to_take)
        bucket.remaining -= take
        bucket.save(update_fields=["remaining", "updated_at"])
        CreditTransactionLine.objects.create(transaction=txn, bucket=bucket, amount=-take)
        remaining_to_take -= take
    txn.balance_after = _recompute_locked_balance(account)
    txn.save(update_fields=["balance_after", "updated_at"])
    _queue_balance_alert(account, settings_obj)
    return txn


def settle_reservation(txn):
    if txn.transaction_status != CreditTransactionStatus.RESERVED:
        return txn
    txn.transaction_status = CreditTransactionStatus.SETTLED
    txn.settled_at = timezone.now()
    txn.save(update_fields=["transaction_status", "settled_at", "updated_at"])
    return txn


@transaction.atomic
def release_reservation(txn, reason="provider_rejected"):
    txn = CreditTransaction.objects.select_for_update().get(pk=txn.pk)
    if txn.transaction_status != CreditTransactionStatus.RESERVED:
        return txn
    account = CreditAccount.objects.select_for_update().get(pk=txn.account_id)
    for line in txn.lines.select_related("bucket").select_for_update():
        if line.amount < 0:
            line.bucket.remaining = min(line.bucket.granted, line.bucket.remaining + abs(line.amount))
            line.bucket.save(update_fields=["remaining", "updated_at"])
    txn.transaction_status = CreditTransactionStatus.RELEASED
    txn.settled_at = timezone.now()
    txn.metadata = {**txn.metadata, "release_reason": reason}
    txn.balance_after = _recompute_locked_balance(account)
    txn.save(update_fields=["transaction_status", "settled_at", "metadata", "balance_after", "updated_at"])
    return txn


@transaction.atomic
def charge_inbound(account, amount, *, key, **kwargs):
    existing = CreditTransaction.objects.filter(idempotency_key=key).first()
    if existing:
        return existing
    requested = max(0, int(amount))
    settings_obj = CreditSettings.get_solo()
    account = CreditAccount.objects.select_for_update().get(pk=account.pk)
    available = _recompute_locked_balance(account)
    shadow = settings_obj.enforcement_mode == EnforcementMode.SHADOW
    collected = 0 if shadow else min(requested, available)
    waived = 0 if shadow else requested - collected
    txn = CreditTransaction.objects.create(
        account=account,
        kind=CreditTransactionKind.INBOUND_CHARGE,
        transaction_status=CreditTransactionStatus.SETTLED,
        amount=-collected,
        waived=waived,
        usage_type=kwargs.get("usage_type", ""),
        purpose=kwargs.get("purpose", ""),
        channel=kwargs.get("channel", ""),
        direction="inbound",
        units=kwargs.get("units", 1),
        unit_rate=kwargs.get("unit_rate", 1),
        counterparty_e164=kwargs.get("counterparty", ""),
        organization=kwargs.get("organization"),
        lead=kwargs.get("lead"),
        reference_type=kwargs.get("reference_type", ""),
        reference_id=kwargs.get("reference_id", ""),
        idempotency_key=key,
        sandbox=kwargs.get("sandbox", False),
        balance_after=available,
        settled_at=timezone.now(),
        metadata={"shadow": True, "would_charge": requested} if shadow else {},
    )
    remaining_to_take = collected
    if remaining_to_take:
        buckets = list(
            _live_bucket_queryset(account)
            .select_for_update()
            .order_by(F("expires_at").asc(nulls_last=True), "priority", "id")
        )
        for bucket in buckets:
            if remaining_to_take <= 0:
                break
            take = min(bucket.remaining, remaining_to_take)
            bucket.remaining -= take
            bucket.save(update_fields=["remaining", "updated_at"])
            CreditTransactionLine.objects.create(transaction=txn, bucket=bucket, amount=-take)
            remaining_to_take -= take
        txn.balance_after = _recompute_locked_balance(account)
        txn.save(update_fields=["balance_after", "updated_at"])
    _queue_balance_alert(account, settings_obj)
    return txn


def adjust_credits(account, delta, *, reason, admin, expires_at=None):
    delta = int(delta)
    if delta == 0:
        raise ValueError("Adjustment amount cannot be zero.")
    key = f"admin-adjust:{account.id}:{timezone.now().timestamp()}"
    if delta > 0:
        return grant_credits(
            account,
            CreditBucketSource.ADMIN_GRANT,
            delta,
            key=key,
            expires_at=expires_at,
            note=reason,
            created_by=admin,
        )
    txn = reserve_credits(
        account,
        abs(delta),
        key=key,
        purpose="control",
        metadata={"admin_reason": reason},
    )
    txn.kind = CreditTransactionKind.ADJUST
    txn.created_by = admin
    txn.save(update_fields=["kind", "created_by", "updated_at"])
    return settle_reservation(txn)

