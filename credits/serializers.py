from rest_framework import serializers

from subscription.models import BillingPlan, StoreProduct
from .models import CreditBucket, CreditSettings, CreditTransaction


class CreditSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditSettings
        exclude = ("status", "created_at", "updated_at")

    def validate_low_balance_threshold_percent(self, value):
        if value > 100:
            raise serializers.ValidationError("Threshold must be between 0 and 100.")
        return value

    def validate_sandbox_purchase_policy(self, value):
        if value not in {"allowlist", "accept_all", "reject"}:
            raise serializers.ValidationError("Use allowlist, accept_all, or reject.")
        return value


class BillingPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = BillingPlan
        fields = "__all__"
        read_only_fields = ("id", "status", "created_at", "updated_at")


class StoreProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = StoreProduct
        fields = "__all__"
        read_only_fields = ("id", "status", "created_at", "updated_at")


class CreditBucketSerializer(serializers.ModelSerializer):
    class Meta:
        model = CreditBucket
        fields = (
            "id", "source", "granted", "remaining", "expires_at", "priority",
            "period_start", "period_end", "revoked_at", "note", "created_at",
        )


class CreditTransactionSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source="transaction_status")
    description = serializers.SerializerMethodField()

    class Meta:
        model = CreditTransaction
        fields = (
            "id", "kind", "status", "amount", "waived", "usage_type",
            "purpose", "channel", "direction", "units", "unit_rate", "lead_id",
            "balance_after", "created_at", "description",
        )

    def get_description(self, obj):
        if obj.kind == "grant":
            source = obj.metadata.get("source", "credits").replace("_", " ").title()
            return f"{source} - {obj.amount} credits"
        if obj.usage_type:
            return f"{obj.usage_type.replace('_', ' ').title()} - {obj.units} unit(s)"
        return obj.kind.replace("_", " ").title()


class MessageEstimateSerializer(serializers.Serializer):
    text = serializers.CharField(allow_blank=True)
    channel = serializers.ChoiceField(choices=("auto", "sms", "rcs", "whatsapp", "email"), default="sms")
    has_media = serializers.BooleanField(default=False)
    to = serializers.CharField(required=False, allow_blank=True)


class AdminCreditAdjustmentSerializer(serializers.Serializer):
    amount = serializers.IntegerField()
    reason = serializers.CharField(max_length=255)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)

    def validate_amount(self, value):
        if value == 0:
            raise serializers.ValidationError("Amount cannot be zero.")
        return value


class BillingSubscriptionDataSerializer(serializers.Serializer):
    status = serializers.CharField()
    is_entitled = serializers.BooleanField()
    platform = serializers.CharField(allow_null=True)
    product_id = serializers.CharField(allow_blank=True)
    plan_code = serializers.CharField(allow_null=True)
    current_period_start = serializers.DateTimeField(allow_null=True)
    current_period_end = serializers.DateTimeField(allow_null=True)
    will_renew = serializers.BooleanField()
    grace_period_ends_at = serializers.DateTimeField(allow_null=True)
    is_test = serializers.BooleanField()
    manage_url = serializers.URLField(allow_null=True)


class BillingWalletDataSerializer(serializers.Serializer):
    balance = serializers.IntegerField()
    breakdown = serializers.DictField(child=serializers.IntegerField())
    next_expiry = serializers.JSONField(allow_null=True)
    reference_allowance = serializers.IntegerField()
    low_balance_threshold = serializers.IntegerField()
    low_balance = serializers.BooleanField()
    can_send = serializers.BooleanField()
    sending_blocked_reason = serializers.CharField(allow_null=True)
    enforcement_mode = serializers.CharField()
    paused_followups = serializers.IntegerField()
    trial = serializers.DictField()
    setup_fee = serializers.DictField()
    subscription = BillingSubscriptionDataSerializer()


class BillingWalletResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = BillingWalletDataSerializer()


class BillingSubscriptionResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = BillingSubscriptionDataSerializer()


class BillingCatalogResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = serializers.DictField()


class BillingUsageResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = serializers.DictField()


class BillingEstimateResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = serializers.DictField()


class AdminCreditSettingsResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField(required=False)
    data = CreditSettingsSerializer()


class AdminCreditAccountResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = serializers.DictField()


class AdminCreditAdjustmentResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = CreditTransactionSerializer()

