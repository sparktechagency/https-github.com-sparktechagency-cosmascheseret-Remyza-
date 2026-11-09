from datetime import timedelta

from celery import shared_task
from django.db import transaction
from django.utils import timezone

from .choices import CreditTransactionKind, CreditTransactionStatus
from .models import CreditAccount, CreditBucket, CreditTransaction, CreditTransactionLine
from .services.wallet import _recompute_locked_balance, release_reservation, resume_paused_followups as resume_account_followups


@shared_task(name="credits.tasks.expire_credit_buckets")
def expire_credit_buckets():
    ids = list(
        CreditBucket.objects.filter(
            expires_at__lte=timezone.now(), remaining__gt=0, revoked_at__isnull=True
        ).values_list("id", flat=True)
    )
    expired = 0
    for bucket_id in ids:
        with transaction.atomic():
            bucket = CreditBucket.objects.select_for_update().select_related("account").filter(pk=bucket_id).first()
            if not bucket or bucket.remaining <= 0:
                continue
            account = CreditAccount.objects.select_for_update().get(pk=bucket.account_id)
            amount = bucket.remaining
            bucket.remaining = 0
            bucket.save(update_fields=["remaining", "updated_at"])
            balance = _recompute_locked_balance(account)
            txn, created = CreditTransaction.objects.get_or_create(
                idempotency_key=f"expire:{bucket.id}",
                defaults={
                    "account": account,
                    "kind": CreditTransactionKind.EXPIRE,
                    "transaction_status": CreditTransactionStatus.SETTLED,
                    "amount": -amount,
                    "balance_after": balance,
                    "settled_at": timezone.now(),
                },
            )
            if created:
                CreditTransactionLine.objects.create(transaction=txn, bucket=bucket, amount=-amount)
            expired += amount
    return {"buckets": len(ids), "credits_expired": expired}


@shared_task(name="credits.tasks.release_stale_reservations")
def release_stale_reservations():
    stale = list(
        CreditTransaction.objects.filter(
            transaction_status=CreditTransactionStatus.RESERVED,
            created_at__lt=timezone.now() - timedelta(minutes=15),
        ).values_list("id", flat=True)
    )
    for transaction_id in stale:
        txn = CreditTransaction.objects.filter(pk=transaction_id).first()
        if txn:
            release_reservation(txn, reason="stale_reservation")
    return {"released": len(stale)}


@shared_task(name="credits.tasks.resume_paused_followups")
def resume_paused_followups():
    accounts = CreditAccount.objects.filter(balance__gt=0, user__organization__automated_followups__follow_up_status="paused").distinct()
    return {"resumed": sum(resume_paused_followups_for_account(account) for account in accounts)}


def resume_paused_followups_for_account(account):
    return resume_account_followups(account)

