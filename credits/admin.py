from django.contrib import admin

from .models import CreditAccount, CreditBucket, CreditSettings, CreditTransaction, WhatsAppConversationWindow


@admin.register(CreditSettings)
class CreditSettingsAdmin(admin.ModelAdmin):
    def has_add_permission(self, request):
        return not CreditSettings.objects.exists()

    def has_delete_permission(self, request, obj=None):
        return False


@admin.register(CreditAccount)
class CreditAccountAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "balance", "trial_granted_at", "setup_fee_paid_at", "updated_at")
    search_fields = ("user__email", "user__phone_number", "user__full_name")
    readonly_fields = ("billing_account_token", "balance", "created_at", "updated_at")


@admin.register(CreditBucket)
class CreditBucketAdmin(admin.ModelAdmin):
    list_display = ("id", "account", "source", "granted", "remaining", "expires_at", "revoked_at")
    list_filter = ("source", "revoked_at")
    search_fields = ("account__user__email", "idempotency_key")
    readonly_fields = ("idempotency_key", "created_at", "updated_at")


@admin.register(CreditTransaction)
class CreditTransactionAdmin(admin.ModelAdmin):
    list_display = ("id", "account", "kind", "transaction_status", "amount", "waived", "usage_type", "balance_after", "created_at")
    list_filter = ("kind", "transaction_status", "usage_type", "channel", "direction")
    search_fields = ("account__user__email", "idempotency_key", "reference_id")
    readonly_fields = tuple(field.name for field in CreditTransaction._meta.fields)

    def has_add_permission(self, request):
        return False

    def has_change_permission(self, request, obj=None):
        return False


admin.site.register(WhatsAppConversationWindow)

