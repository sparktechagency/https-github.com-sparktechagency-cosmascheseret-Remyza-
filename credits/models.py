import uuid

from django.conf import settings
from django.db import models
from django.db.models import F, Q

from common.models import BaseModel
from .choices import (
    CreditBucketSource,
    CreditPurpose,
    CreditTransactionKind,
    CreditTransactionStatus,
    EnforcementMode,
    UsageType,
)


class CreditSettings(BaseModel):
    enforcement_mode = models.CharField(
        max_length=20, choices=EnforcementMode.choices, default=EnforcementMode.SHADOW
    )
    sms_outbound_per_segment = models.PositiveIntegerField(default=1)
    sms_inbound_per_message = models.PositiveIntegerField(default=1)
    sms_inbound_charge_mode = models.CharField(max_length=20, default="per_message")
    sms_segment_mode = models.CharField(max_length=20, default="carrier")
    mms_outbound = models.PositiveIntegerField(default=3)
    mms_inbound = models.PositiveIntegerField(default=3)
    whatsapp_inbound_conversation = models.PositiveIntegerField(default=1)
    whatsapp_outbound_conversation = models.PositiveIntegerField(default=1)
    whatsapp_window_hours = models.PositiveSmallIntegerField(default=24)
    email_outbound = models.PositiveIntegerField(default=0)
    email_inbound = models.PositiveIntegerField(default=0)
    inbound_charge_cap_per_sender_per_day = models.PositiveIntegerField(default=20)

    rollover_enabled = models.BooleanField(default=True)
    rollover_months = models.PositiveSmallIntegerField(default=1)
    renewal_grace_hours = models.PositiveSmallIntegerField(default=72)
    low_balance_threshold_percent = models.PositiveSmallIntegerField(default=20)
    low_balance_email_enabled = models.BooleanField(default=True)
    exhausted_email_enabled = models.BooleanField(default=True)

    trial_enabled = models.BooleanField(default=True)
    trial_credits = models.PositiveIntegerField(default=50)
    trial_credit_expiry_days = models.PositiveIntegerField(null=True, blank=True)
    demo_enabled = models.BooleanField(default=True)
    demo_daily_message_cap = models.PositiveIntegerField(default=30)

    paused_followup_max_age_days = models.PositiveSmallIntegerField(default=30)
    number_retention_days_after_lapse = models.PositiveSmallIntegerField(default=30)
    topups_require_active_subscription = models.BooleanField(default=True)
    sandbox_purchase_policy = models.CharField(max_length=20, default="allowlist")
    sandbox_allowlist_user_ids = models.JSONField(default=list, blank=True)
    sandbox_allows_number_provisioning = models.BooleanField(default=False)
    apple_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15)
    google_commission_percent = models.DecimalField(max_digits=5, decimal_places=2, default=15)

    number_setup_eta_text = models.CharField(
        max_length=120, default="Usually ready within 1-3 business days"
    )
    terms_url = models.URLField(blank=True, default="https://trychesera.com/legal/terms")
    privacy_url = models.URLField(blank=True, default="https://trychesera.com/legal/privacy")
    account_deletion_url = models.URLField(blank=True, default="https://trychesera.com/account/delete")

    class Meta:
        verbose_name = "Credit settings"
        verbose_name_plural = "Credit settings"

    @classmethod
    def get_solo(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        return None


class CreditAccount(BaseModel):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="credit_account"
    )
    billing_account_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    balance = models.PositiveIntegerField(default=0)
    low_balance_alerted = models.BooleanField(default=False)
    exhausted_alerted = models.BooleanField(default=False)
    setup_fee_paid_at = models.DateTimeField(null=True, blank=True)
    trial_granted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.user} - {self.balance} credits"


class CreditBucket(BaseModel):
    account = models.ForeignKey(CreditAccount, on_delete=models.CASCADE, related_name="buckets")
    source = models.CharField(max_length=30, choices=CreditBucketSource.choices)
    granted = models.PositiveIntegerField()
    remaining = models.PositiveIntegerField()
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    priority = models.PositiveSmallIntegerField(default=20)
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    store_transaction = models.ForeignKey(
        "subscription.StoreTransaction",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="credit_buckets",
    )
    idempotency_key = models.CharField(max_length=200, unique=True)
    revoked_at = models.DateTimeField(null=True, blank=True)
    note = models.CharField(max_length=255, blank=True, default="")

    class Meta:
        ordering = ["expires_at", "priority", "id"]
        indexes = [models.Index(fields=["account", "expires_at"])]
        constraints = [
            models.CheckConstraint(
                condition=Q(remaining__gte=0) & Q(remaining__lte=F("granted")),
                name="credit_bucket_remaining_valid",
            )
        ]


class CreditTransaction(BaseModel):
    account = models.ForeignKey(CreditAccount, on_delete=models.CASCADE, related_name="transactions")
    kind = models.CharField(max_length=30, choices=CreditTransactionKind.choices)
    transaction_status = models.CharField(
        max_length=20,
        choices=CreditTransactionStatus.choices,
        default=CreditTransactionStatus.SETTLED,
        db_index=True,
    )
    amount = models.IntegerField(default=0)
    waived = models.PositiveIntegerField(default=0)
    usage_type = models.CharField(max_length=50, choices=UsageType.choices, blank=True, default="")
    purpose = models.CharField(max_length=30, choices=CreditPurpose.choices, blank=True, default="")
    channel = models.CharField(max_length=20, blank=True, default="")
    direction = models.CharField(max_length=20, blank=True, default="")
    units = models.PositiveIntegerField(default=0)
    unit_rate = models.PositiveIntegerField(default=0)
    counterparty_e164 = models.CharField(max_length=20, blank=True, default="", db_index=True)
    organization = models.ForeignKey(
        "business.Organization", on_delete=models.SET_NULL, null=True, blank=True, related_name="credit_transactions"
    )
    lead = models.ForeignKey(
        "crm.Lead", on_delete=models.SET_NULL, null=True, blank=True, related_name="credit_transactions"
    )
    reference_type = models.CharField(max_length=60, blank=True, default="")
    reference_id = models.CharField(max_length=120, blank=True, default="")
    idempotency_key = models.CharField(max_length=200, unique=True)
    balance_after = models.PositiveIntegerField(default=0)
    sandbox = models.BooleanField(default=False)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="credit_adjustments"
    )
    settled_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["account", "counterparty_e164", "created_at"]),
            models.Index(fields=["usage_type", "created_at"]),
        ]


class CreditTransactionLine(models.Model):
    transaction = models.ForeignKey(CreditTransaction, on_delete=models.CASCADE, related_name="lines")
    bucket = models.ForeignKey(CreditBucket, on_delete=models.CASCADE, related_name="transaction_lines")
    amount = models.IntegerField()


class WhatsAppConversationWindow(BaseModel):
    account = models.ForeignKey(CreditAccount, on_delete=models.CASCADE, related_name="whatsapp_windows")
    organization = models.ForeignKey("business.Organization", on_delete=models.SET_NULL, null=True, blank=True)
    lead = models.ForeignKey("crm.Lead", on_delete=models.SET_NULL, null=True, blank=True)
    contact_e164 = models.CharField(max_length=20, db_index=True)
    opened_at = models.DateTimeField()
    expires_at = models.DateTimeField(db_index=True)
    opened_by = models.CharField(max_length=20, choices=(("lead", "Lead"), ("business", "Business")))
    charge_transaction = models.ForeignKey(
        CreditTransaction, on_delete=models.SET_NULL, null=True, blank=True, related_name="whatsapp_windows"
    )

    class Meta:
        indexes = [models.Index(fields=["account", "contact_e164", "expires_at"])]


class TrialClaim(models.Model):
    phone_hmac = models.CharField(max_length=64, unique=True)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True)
    claimed_at = models.DateTimeField(auto_now_add=True)


class DemoOptOut(models.Model):
    phone_hmac = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

