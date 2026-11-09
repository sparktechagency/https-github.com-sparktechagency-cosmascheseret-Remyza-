from django.utils import timezone
from django.db import models
from common.models import BaseModel
from .choices import (
    PlanType, SubscriptionStatus, BillingCycle, BillingType,
    PaymentProvider, PaymentStatus, PurchasePlatform, InvoiceStatus, Currency, PaymentMediumChoices, StoreEnvironmentChoices,
    EntitlementState, StoreNotificationStatus, StoreProductKind, StoreTransactionState,
)
import uuid

class SubscriptionPlan(BaseModel):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    plan_type = models.CharField(max_length=20, choices=PlanType.choices)
    billing_type = models.CharField(max_length=20, choices=BillingType.choices)
    
    price = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, choices=Currency.choices, default=Currency.USD)
    trial_days = models.PositiveSmallIntegerField(default=0)
    
    sms_limit = models.PositiveIntegerField(default=0)
    lead_limit = models.PositiveIntegerField(default=0)
    ai_reply_limit = models.PositiveIntegerField(default=0)
    
    custom_welcome_message = models.BooleanField(default=False)
    ai_auto_reply = models.BooleanField(default=True)
    lead_scoring = models.BooleanField(default=False)
    advanced_analytics = models.BooleanField(default=False)
    bulk_import = models.BooleanField(default=False)
    
    ai_token_limit = models.PositiveIntegerField(default=0)
    phone_number_limit = models.PositiveSmallIntegerField(default=1)
    knowledge_document_limit = models.PositiveSmallIntegerField(default=0)
    storage_limit = models.PositiveIntegerField(default=0, help_text="Storage limit in MB.")
    is_active = models.BooleanField(default=True)


class BillingPlan(BaseModel):
    code = models.CharField(max_length=50, unique=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, default="")
    monthly_credits = models.PositiveIntegerField(default=1000)
    dedicated_numbers = models.PositiveSmallIntegerField(default=1)
    features = models.JSONField(default=list, blank=True)
    reference_price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=99)
    setup_fee_enabled = models.BooleanField(default=False)
    free_setup_badge_enabled = models.BooleanField(default=True)
    free_setup_badge_text = models.CharField(max_length=60, default="Free setup")
    is_active = models.BooleanField(default=True)
    sort_order = models.SmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]

    def __str__(self):
        return self.name


class StoreProduct(BaseModel):
    code = models.CharField(max_length=80, unique=True)
    kind = models.CharField(max_length=30, choices=StoreProductKind.choices)
    plan = models.ForeignKey(BillingPlan, on_delete=models.SET_NULL, null=True, blank=True, related_name="products")
    apple_product_id = models.CharField(max_length=150, blank=True, default="")
    google_product_id = models.CharField(max_length=150, blank=True, default="")
    google_base_plan_id = models.CharField(max_length=80, blank=True, default="")
    credits = models.PositiveIntegerField(default=0)
    reference_price_usd = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    badge_text = models.CharField(max_length=40, blank=True, default="")
    is_active = models.BooleanField(default=True)
    sort_order = models.SmallIntegerField(default=0)

    class Meta:
        ordering = ["sort_order", "id"]
        constraints = [
            models.UniqueConstraint(
                fields=["apple_product_id"],
                condition=~models.Q(apple_product_id=""),
                name="unique_nonblank_apple_product_id",
            ),
            models.UniqueConstraint(
                fields=["google_product_id"],
                condition=~models.Q(google_product_id=""),
                name="unique_nonblank_google_product_id",
            ),
        ]

    def __str__(self):
        return self.code

class UserSubscription(BaseModel):
    uuid = models.UUIDField(max_length=120, db_index=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, related_name="subscriptions", blank=True, null=True)
    organization = models.ForeignKey("business.Organization", on_delete=models.SET_NULL, related_name="subscription", blank=True, null=True)
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT, related_name="subscriptions", blank=True, null=True)
    status = models.CharField(max_length=20, choices=SubscriptionStatus.choices, default=SubscriptionStatus.AWAITING_PAYMENT, db_index=True)
    billing_cycle = models.CharField(max_length=20, choices=BillingCycle.choices, blank=True, null=True)
    start_date = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField(null=True, blank=True)
    next_billing_date = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    product_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    plan_type = models.CharField(max_length=100, blank=True, default="")
    medium = models.CharField(max_length=20, choices=PaymentMediumChoices.choices, blank=True, default="", db_index=True)
    purchase_token = models.TextField(blank=True, default="")
    transaction_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    original_transaction_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    order_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    store_environment = models.CharField(max_length=20, choices=StoreEnvironmentChoices.choices, blank=True, default="", db_index=True)
    store_status = models.CharField(max_length=100, blank=True, default="", db_index=True)
    is_subscription_active = models.BooleanField(default=False, db_index=True)
    purchase_date = models.DateTimeField(blank=True, null=True)
    expiry_date = models.DateTimeField(blank=True, null=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    currency_code = models.CharField(max_length=10, blank=True, default="")
    verification_payload = models.JSONField(blank=True, default=dict)
    app_bundle_id = models.CharField(max_length=100, default="com.chesera.app")
    store_product = models.ForeignKey(StoreProduct, on_delete=models.SET_NULL, null=True, blank=True, related_name="subscriptions")
    entitlement_state = models.CharField(max_length=30, choices=EntitlementState.choices, default=EntitlementState.PENDING, db_index=True)
    current_period_start = models.DateTimeField(null=True, blank=True)
    current_period_end = models.DateTimeField(null=True, blank=True, db_index=True)
    grace_period_expires_at = models.DateTimeField(null=True, blank=True)
    app_account_token = models.UUIDField(null=True, blank=True, db_index=True)
    linked_purchase_token = models.TextField(blank=True, default="")
    superseded_by = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="superseded_subscriptions")
    verified_at = models.DateTimeField(null=True, blank=True, db_index=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    is_test = models.BooleanField(default=False, db_index=True)
    locked_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    locked_currency = models.CharField(max_length=10, blank=True, default="USD")
    locked_monthly_credits = models.PositiveIntegerField(default=0)
    locked_number_limit = models.PositiveSmallIntegerField(default=0)
    locked_features = models.JSONField(default=list, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["medium", "original_transaction_id"],
                condition=~models.Q(original_transaction_id=""),
                name="unique_store_original_subscription",
            ),
            models.UniqueConstraint(
                fields=["medium", "purchase_token"],
                condition=~models.Q(purchase_token=""),
                name="unique_store_subscription_token",
            ),
        ]

    @property
    def is_free_trial(self):
        return bool(self.plan and self.plan.plan_type == PlanType.FREE_TRAIL and self.status == SubscriptionStatus.ACTIVE)

    @property
    def is_active(self):
        if self.store_product_id:
            entitled_states = {
                EntitlementState.ACTIVE,
                EntitlementState.GRACE_PERIOD,
                EntitlementState.CANCELED,
            }
            period_end = self.current_period_end or self.expiry_date
            return bool(
                self.verified_at
                and self.entitlement_state in entitled_states
                and (period_end is None or period_end > timezone.now())
            )
        if self.product_id or self.medium:
            return bool(
                self.verified_at
                and self.is_subscription_active
                and (self.expiry_date is None or self.expiry_date > timezone.now())
            )
        return self.status == SubscriptionStatus.ACTIVE and (self.expires_at is None or self.expires_at > timezone.now())
    def release_free_trial(self):
        if self.plan and self.plan.plan_type == PlanType.FREE_TRAIL:
            self.status = SubscriptionStatus.CLOSE
            self.save(update_fields=["status"])

            from core.models import UserFreeTrailNumber
            user_free_trail = UserFreeTrailNumber.objects.filter(user=self.user).first()
            if user_free_trail:
                free_trail_number = user_free_trail.free_trail
                free_trail_number.is_used = False
                free_trail_number.save(update_fields=["is_used"])
                user_free_trail.is_released = True
                user_free_trail.save(update_fields=["is_released"])


class StoreTransaction(BaseModel):
    platform = models.CharField(max_length=20, choices=PaymentMediumChoices.choices, db_index=True)
    kind = models.CharField(max_length=30, choices=StoreProductKind.choices)
    store_product = models.ForeignKey(StoreProduct, on_delete=models.SET_NULL, null=True, blank=True, related_name="transactions")
    product_id = models.CharField(max_length=150, db_index=True)
    user = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True, related_name="store_transactions")
    subscription = models.ForeignKey(UserSubscription, on_delete=models.SET_NULL, null=True, blank=True, related_name="store_transactions")
    transaction_id = models.CharField(max_length=255)
    original_transaction_id = models.CharField(max_length=255, blank=True, default="")
    purchase_token = models.TextField(blank=True, default="")
    app_account_token = models.UUIDField(null=True, blank=True, db_index=True)
    environment = models.CharField(max_length=20, choices=StoreEnvironmentChoices.choices, default=StoreEnvironmentChoices.PRODUCTION)
    is_test = models.BooleanField(default=False, db_index=True)
    transaction_state = models.CharField(max_length=30, choices=StoreTransactionState.choices, default=StoreTransactionState.PENDING, db_index=True)
    purchase_date = models.DateTimeField(null=True, blank=True)
    period_start = models.DateTimeField(null=True, blank=True)
    period_end = models.DateTimeField(null=True, blank=True)
    price_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    currency = models.CharField(max_length=10, blank=True, default="USD")
    price_estimated = models.BooleanField(default=False)
    credits_granted = models.PositiveIntegerField(default=0)
    finalized_at = models.DateTimeField(null=True, blank=True)
    finalize_attempts = models.PositiveSmallIntegerField(default=0)
    refunded_at = models.DateTimeField(null=True, blank=True)
    rejection_code = models.CharField(max_length=100, blank=True, default="")
    raw = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["platform", "transaction_id"], name="unique_store_transaction")]


class StoreNotification(BaseModel):
    platform = models.CharField(max_length=20, choices=PaymentMediumChoices.choices, db_index=True)
    notification_id = models.CharField(max_length=255)
    notification_type = models.CharField(max_length=100, blank=True, default="")
    subtype = models.CharField(max_length=100, blank=True, default="")
    environment = models.CharField(max_length=20, blank=True, default="")
    signed_at = models.DateTimeField(null=True, blank=True)
    notification_status = models.CharField(max_length=20, choices=StoreNotificationStatus.choices, default=StoreNotificationStatus.RECEIVED, db_index=True)
    attempts = models.PositiveSmallIntegerField(default=0)
    error = models.TextField(blank=True, default="")
    payload = models.JSONField(default=dict, blank=True)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]
        constraints = [models.UniqueConstraint(fields=["platform", "notification_id"], name="unique_store_notification")]



class Payment(BaseModel):
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name="payments")
    transaction_id = models.CharField(max_length=150, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, choices=Currency.choices, default=Currency.USD)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)

class Invoice(BaseModel):
    subscription = models.ForeignKey(UserSubscription, on_delete=models.CASCADE, related_name="invoices")
    invoice_number = models.CharField(max_length=100, unique=True, db_index=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, choices=Currency.choices, default=Currency.USD)
    due_date = models.DateTimeField()
    paid_at = models.DateTimeField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=InvoiceStatus.choices, default=InvoiceStatus.PENDING, db_index=True)
    pdf_file = models.FileField(upload_to="invoices/", null=True, blank=True)

class PurchaseInfo(BaseModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="purchase_info")
    payment = models.OneToOneField(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name="purchase_info")
    
    platform = models.CharField(max_length=20, choices=PurchasePlatform.choices)
    product_id = models.CharField(max_length=100, blank=True, null=True)
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    # transaction_id = models.CharField(max_length=255, unique=True, db_index=True)
    original_transaction_id = models.CharField(max_length=255, blank=True, default="", db_index=True)
    purchase_token = models.TextField(blank=True, default="")
    receipt_data = models.JSONField(default=dict, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    metadata = models.JSONField(default=dict, blank=True)

