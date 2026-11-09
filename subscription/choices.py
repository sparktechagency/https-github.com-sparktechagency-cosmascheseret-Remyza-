from django.db import models


class PaymentMediumChoices(models.TextChoices):
    APPLE = "apple", "Apple"
    GOOGLE = "google", "Google"


class StoreEnvironmentChoices(models.TextChoices):
    PRODUCTION = "production", "Production"
    SANDBOX = "sandbox", "Sandbox"


class StoreProductKind(models.TextChoices):
    SUBSCRIPTION = "subscription", "Subscription"
    CREDIT_PACK = "credit_pack", "Credit pack"
    SETUP_FEE = "setup_fee", "Setup fee"


class EntitlementState(models.TextChoices):
    PENDING = "pending", "Pending"
    ACTIVE = "active", "Active"
    GRACE_PERIOD = "grace_period", "Grace period"
    BILLING_RETRY = "billing_retry", "Billing retry"
    ON_HOLD = "on_hold", "On hold"
    PAUSED = "paused", "Paused"
    CANCELED = "canceled", "Canceled"
    EXPIRED = "expired", "Expired"
    REVOKED = "revoked", "Revoked"
    SUPERSEDED = "superseded", "Superseded"


class StoreTransactionState(models.TextChoices):
    PENDING = "pending", "Pending"
    PENDING_CLAIM = "pending_claim", "Pending claim"
    GRANTED = "granted", "Granted"
    REJECTED = "rejected", "Rejected"
    REFUNDED = "refunded", "Refunded"
    REVOKED = "revoked", "Revoked"


class StoreNotificationStatus(models.TextChoices):
    RECEIVED = "received", "Received"
    PROCESSED = "processed", "Processed"
    FAILED = "failed", "Failed"
    IGNORED = "ignored", "Ignored"


class PlanType(models.TextChoices):
    FREE_TRAIL = "free_trial", "Free Trail"
    PAID = "paid", "Paid"


class BillingType(models.TextChoices):
    DAY = "day", "Day"
    MONTHLY = "monthly", "Monthly"
    YEARLY = "yearly", "Yearly"
    LIFETIME = "lifetime", "Lifetime"


class SubscriptionStatus(models.TextChoices):
    TRIAL = "trial", "Trial"
    AWAITING_PAYMENT = "awaiting_payment", "Awaiting Payment"
    ACTIVE = "active", "Active"
    PAST_DUE = "past_due", "Past Due"
    CANCELLED = "cancelled", "Cancelled"
    EXPIRED = "expired", "Expired"
    SUSPENDED = "suspended", "Suspended"
    CLOSE = "close", "Close"


class PaymentProvider(models.TextChoices):
    STRIPE = "stripe", "Stripe"
    GOOGLE_PLAY = "google_play", "Google Play"
    APP_STORE = "app_store", "App Store"
    MANUAL = "manual", "Manual"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pending"
    PROCESSING = "processing", "Processing"
    SUCCEEDED = "succeeded", "Succeeded"
    FAILED = "failed", "Failed"
    CANCELLED = "cancelled", "Cancelled"
    REFUNDED = "refunded", "Refunded"
    PARTIALLY_REFUNDED = "partially_refunded", "Partially Refunded"


class InvoiceStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING = "pending", "Pending"
    PAID = "paid", "Paid"
    OVERDUE = "overdue", "Overdue"
    CANCELLED = "cancelled", "Cancelled"
    VOID = "void", "Void"


class PurchasePlatform(models.TextChoices):
    GOOGLE_PLAY = "google_play", "Google Play"
    APP_STORE = "app_store", "App Store"


class BillingCycle(models.TextChoices):
    DAY = "day", "Day"
    MONTHLY = "monthly", "Monthly"
    YEARLY = "yearly", "Yearly"
    LIFETIME = "lifetime", "Lifetime"


class Currency(models.TextChoices):
    USD = "USD", "US Dollar"
    EUR = "EUR", "Euro"
    GBP = "GBP", "British Pound"
    CAD = "CAD", "Canadian Dollar"
    AUD = "AUD", "Australian Dollar"
