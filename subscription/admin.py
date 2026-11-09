from django.contrib import admin
from django.utils import timezone

from .choices import SubscriptionStatus
from .models import BillingPlan, StoreNotification, StoreProduct, StoreTransaction, UserSubscription


@admin.register(BillingPlan)
class BillingPlanAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "reference_price_usd", "monthly_credits", "dedicated_numbers", "setup_fee_enabled", "is_active")
    list_editable = ("monthly_credits", "dedicated_numbers", "setup_fee_enabled", "is_active")
    search_fields = ("code", "name")


@admin.register(StoreProduct)
class StoreProductAdmin(admin.ModelAdmin):
    list_display = ("code", "kind", "plan", "credits", "reference_price_usd", "is_active", "sort_order")
    list_filter = ("kind", "is_active")
    search_fields = ("code", "apple_product_id", "google_product_id")


@admin.register(StoreTransaction)
class StoreTransactionAdmin(admin.ModelAdmin):
    list_display = ("transaction_id", "platform", "kind", "user", "transaction_state", "price_amount", "currency", "credits_granted", "is_test", "created_at")
    list_filter = ("platform", "kind", "transaction_state", "is_test")
    search_fields = ("transaction_id", "product_id", "user__email")
    readonly_fields = tuple(field.name for field in StoreTransaction._meta.fields)

    def has_add_permission(self, request):
        return False


@admin.register(StoreNotification)
class StoreNotificationAdmin(admin.ModelAdmin):
    list_display = ("notification_id", "platform", "notification_type", "notification_status", "attempts", "created_at")
    list_filter = ("platform", "notification_status", "notification_type")
    search_fields = ("notification_id", "error")
    readonly_fields = tuple(field.name for field in StoreNotification._meta.fields)

    def has_add_permission(self, request):
        return False


@admin.register(UserSubscription)
class UserSubscriptionAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "organization",
        "medium",
        "product_id",
        "plan_type",
        "is_subscription_active",
        "store_status",
        "store_environment",
        "expiry_date",
        "created_at",
    )
    list_filter = ("medium", "is_subscription_active", "store_environment", "store_status", "created_at")
    search_fields = (
        "user__email",
        "user__phone_number",
        "user__full_name",
        "organization__name",
        "product_id",
        "plan_type",
        "purchase_token",
        "transaction_id",
        "original_transaction_id",
        "order_id",
    )
    autocomplete_fields = ("user", "organization")
    readonly_fields = ("uuid", "created_at", "updated_at")
    ordering = ("-created_at",)
    date_hierarchy = "created_at"
    list_per_page = 25
    fieldsets = (
        ("User", {"fields": ("user", "organization")}),
        ("Store Purchase", {"fields": (
            "medium", "product_id", "plan_type", "purchase_token", "transaction_id",
            "original_transaction_id", "order_id", "store_environment", "store_status",
        )}),
        ("Subscription Status", {"fields": (
            "is_subscription_active", "purchase_date", "expiry_date",
        )}),
        ("Amount", {"fields": ("amount", "currency_code")}),
        ("Store Payload", {"classes": ("collapse",), "fields": ("verification_payload", "app_bundle_id")} ),
        ("System", {"classes": ("collapse",), "fields": ("uuid", "created_at", "updated_at")} ),
    )

    def save_model(self, request, obj, form, change):
        if obj.user and not obj.organization and hasattr(obj.user, "organization"):
            obj.organization = obj.user.organization

        if not obj.start_date:
            obj.start_date = timezone.now()

        if not obj.purchase_date:
            obj.purchase_date = obj.start_date

        obj.expires_at = obj.expiry_date
        obj.status = SubscriptionStatus.ACTIVE if obj.is_subscription_active else SubscriptionStatus.AWAITING_PAYMENT
        if obj.store_product and obj.store_product.plan:
            plan = obj.store_product.plan
            if obj.locked_price is None:
                obj.locked_price = obj.amount if obj.amount is not None else obj.store_product.reference_price_usd
            if not obj.locked_monthly_credits:
                obj.locked_monthly_credits = plan.monthly_credits
            if not obj.locked_number_limit:
                obj.locked_number_limit = plan.dedicated_numbers
            if not obj.locked_features:
                obj.locked_features = list(plan.features)
        super().save_model(request, obj, form, change)
