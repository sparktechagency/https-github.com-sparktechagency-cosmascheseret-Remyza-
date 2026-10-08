from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPVerification
from .choices import UserType
from business.serializers import OrganizationSerializer


class ClientSignupSerializer(serializers.Serializer):
    full_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone_number = serializers.CharField(max_length=30)
    city = serializers.CharField(max_length=100)
    country = serializers.CharField(max_length=100)
    country_code = serializers.CharField(max_length=10, required=False, allow_blank=True)

    def validate_phone_number(self, value):
        phone_number = value.strip()
        if not phone_number:
            raise serializers.ValidationError("Phone number is required.")
        return phone_number

    def validate_email(self, value):
        email = value.strip().lower()
        existing_user = User.objects.filter(email__iexact=email, is_phone_verified=True).first()
        if existing_user:
            raise serializers.ValidationError("A verified user with this email already exists.")
        return email

    def validate_full_name(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Full name is required.")
        return value

    def validate_city(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("City is required.")
        return value

    def validate_country(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Country is required.")
        return value

    def validate(self, attrs):
        verified_user = User.objects.filter(phone_number=attrs["phone_number"], is_phone_verified=True).first()
        if verified_user:
            raise serializers.ValidationError({"phone_number": "A verified user with this phone number already exists. Please login instead."})
        return attrs


class ClientSendOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=30)

    def validate_phone_number(self, value):
        return value.strip()


class ClientVerifyOTPSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=30)
    otp = serializers.CharField(max_length=10)

    def validate(self, attrs):
        phone = attrs["phone_number"]
        otp = attrs["otp"]
        otp_obj = (
            OTPVerification.objects
            .filter(phone_number=phone, is_used=False,)
            .order_by("-created_at")
            .first()
        )
        if not otp_obj:
            raise serializers.ValidationError("OTP not found.")
        success, message = otp_obj.verify(otp)
        if not success:
            raise serializers.ValidationError(message)
        attrs["otp_obj"] = otp_obj
        return attrs

    def create(self, validated_data):
        phone = validated_data["phone_number"]
        user, created = User.objects.get_or_create(
            phone_number=phone,
            defaults={
                "user_type": UserType.CLIENT,
                "is_phone_verified": True,
            },
        )

        update_fields = []
        if not user.is_phone_verified:
            user.is_phone_verified = True
            update_fields.append("is_phone_verified")
        if created:
            update_fields = []
        if update_fields:
            user.save(update_fields=update_fields)

        refresh = RefreshToken.for_user(user)
        return {
            "user": user,
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }


class AdminLoginSerializer(serializers.Serializer):
    phone_number = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        phone_number = attrs["phone_number"].strip()
        password = attrs["password"]
        user = authenticate(username=phone_number, password=password,)
        if user is None:
            raise serializers.ValidationError("Invalid credentials.")

        if not user.is_staff:
            raise serializers.ValidationError("Permission denied.")

        refresh = RefreshToken.for_user(user)
        attrs["user"] = user
        attrs["access"] = str(refresh.access_token)
        attrs["refresh"] = str(refresh)
        return attrs


class CurrentUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",
            "phone_number",
            "email",
            "full_name",
            "city",
            "country",
            "country_code",
            "timezone",
            "profile_picture",
            "user_type",
            "is_phone_verified",
            "last_activity_at",
        )
        read_only_fields = ("id", "phone_number", "user_type", "is_phone_verified", "last_activity_at")

    def validate_timezone(self, value):
        timezone_value = (value or "").strip()
        if not timezone_value:
            return ""
        try:
            ZoneInfo(timezone_value)
        except ZoneInfoNotFoundError as exc:
            raise serializers.ValidationError(
                "Enter a valid IANA timezone name, for example 'America/New_York', 'America/Chicago', 'Asia/Dhaka', or 'UTC'."
            ) from exc
        return timezone_value


class CurrentUserCheseraNumberSerializer(serializers.Serializer):
    assigned = serializers.BooleanField()
    phone_number = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    number_assignment_status = serializers.CharField()
    message = serializers.CharField()
    provider = serializers.CharField()
    profile_id = serializers.CharField(allow_null=True)
    profile_status = serializers.CharField(allow_null=True)
    sms_rcs_active = serializers.BooleanField()
    qr_payload = serializers.CharField(allow_null=True)
    qr_code_base64 = serializers.CharField(allow_null=True)


class APIMessageResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()


class ClientSignupDataSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    is_new_user = serializers.BooleanField()
    user = CurrentUserSerializer()


class ClientSignupResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = ClientSignupDataSerializer()


class ClientSendOTPDataSerializer(serializers.Serializer):
    phone_number = serializers.CharField()
    is_new_user = serializers.BooleanField()


class ClientSendOTPResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = ClientSendOTPDataSerializer()


class AuthenticatedUserDataSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    phone_number = serializers.CharField()
    full_name = serializers.CharField(allow_blank=True)
    email = serializers.EmailField(allow_blank=True, allow_null=True)
    city = serializers.CharField(allow_blank=True)
    country = serializers.CharField(allow_blank=True)
    country_code = serializers.CharField(allow_blank=True)
    user_type = serializers.CharField()
    is_phone_verified = serializers.BooleanField()


class ClientVerifyOTPDataSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    business_profile_exists = serializers.BooleanField()
    user = AuthenticatedUserDataSerializer()


class ClientVerifyOTPResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = ClientVerifyOTPDataSerializer()


class AdminUserDataSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    email = serializers.EmailField(allow_blank=True, allow_null=True)
    phone_number = serializers.CharField()
    full_name = serializers.CharField(allow_blank=True)
    user_type = serializers.CharField()


class AdminLoginDataSerializer(serializers.Serializer):
    access = serializers.CharField()
    refresh = serializers.CharField()
    user = AdminUserDataSerializer()


class AdminLoginResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = AdminLoginDataSerializer()


class CurrentUserUpdateResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = CurrentUserSerializer()


class CurrentUserSubscriptionSummarySerializer(serializers.Serializer):
    id = serializers.IntegerField()
    uuid = serializers.CharField()
    user = serializers.IntegerField()
    organization = serializers.IntegerField(allow_null=True)
    product_id = serializers.CharField()
    plan_type = serializers.CharField(allow_blank=True, allow_null=True)
    medium = serializers.CharField()
    purchase_token = serializers.CharField(allow_blank=True, allow_null=True)
    transaction_id = serializers.CharField(allow_blank=True, allow_null=True)
    original_transaction_id = serializers.CharField(allow_blank=True, allow_null=True)
    order_id = serializers.CharField(allow_blank=True, allow_null=True)
    store_environment = serializers.CharField(allow_blank=True, allow_null=True)
    store_status = serializers.CharField(allow_blank=True, allow_null=True)
    is_subscription_active = serializers.BooleanField(allow_null=True)
    purchase_date = serializers.DateTimeField(allow_null=True)
    expiry_date = serializers.DateTimeField(allow_null=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)
    currency_code = serializers.CharField(allow_blank=True, allow_null=True)
    verification_payload = serializers.JSONField()
    app_bundle_id = serializers.CharField()
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


class CurrentUserFreeTrialNumberSerializer(serializers.Serializer):
    id = serializers.IntegerField(required=False)
    user = serializers.IntegerField(required=False)
    free_trail = serializers.IntegerField(required=False)
    trail_number = serializers.CharField(required=False)
    usages_count = serializers.IntegerField(required=False)
    end_at = serializers.DateTimeField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(required=False)
    updated_at = serializers.DateTimeField(required=False)


class CurrentUserDataSerializer(serializers.Serializer):
    user = CurrentUserSerializer()
    has_active_subscription = serializers.BooleanField()
    free_trail_claimed = serializers.BooleanField()
    free_trial_session = serializers.CharField(allow_null=True)
    plan_type = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    expires_at = serializers.DateTimeField(required=False, allow_null=True)
    active_subscription = CurrentUserSubscriptionSummarySerializer(required=False, allow_null=True)
    free_trial_number = CurrentUserFreeTrialNumberSerializer(required=False, allow_null=True)


class CurrentUserResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = CurrentUserDataSerializer()


class CurrentUserCheseraNumberResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = CurrentUserCheseraNumberSerializer()


class UserPlanProgressStepSerializer(serializers.Serializer):
    title = serializers.CharField()
    completed = serializers.BooleanField()
    percentage = serializers.IntegerField()
    description = serializers.CharField(allow_blank=True)
    key = serializers.CharField(required=False, allow_blank=True)
    status = serializers.CharField(required=False, allow_blank=True)


class UserPlanProgressSummarySerializer(serializers.Serializer):
    total_steps = serializers.IntegerField()
    completed_steps = serializers.IntegerField()
    percentage = serializers.IntegerField()
    steps = UserPlanProgressStepSerializer(many=True)


class SentDMComplianceReadinessResponseSerializer(serializers.Serializer):
    ready = serializers.BooleanField()
    missing_fields = serializers.ListField(child=serializers.CharField())
    messages = serializers.DictField(child=serializers.CharField())
    profile_id = serializers.CharField(required=False, allow_blank=True)
    sample_message_count = serializers.IntegerField()
    messaging_use_case_us = serializers.CharField(required=False, allow_blank=True)


class UserPlanSentDMProfileSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    profile_id = serializers.CharField()
    name = serializers.CharField()
    status = serializers.CharField()
    phone_number = serializers.CharField(allow_blank=True, allow_null=True)
    whatsapp_phone_number = serializers.CharField(allow_blank=True, allow_null=True)
    whatsapp_connection_source = serializers.CharField()
    whatsapp_connection_status = serializers.CharField()
    whatsapp_connection_error = serializers.CharField(allow_blank=True)
    is_agent_whatsapp_active = serializers.BooleanField()
    sandbox = serializers.BooleanField()


class UserPlanSentDMCampaignSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    campaign_id = serializers.CharField(allow_blank=True)
    name = serializers.CharField()
    status = serializers.CharField()
    submitted_to_tcr = serializers.BooleanField()
    sandbox = serializers.BooleanField()


class UserPlanSentDMNumberSerializer(serializers.Serializer):
    assigned = serializers.BooleanField()
    phone_number = serializers.CharField(allow_null=True)
    status = serializers.CharField()
    number_assignment_status = serializers.CharField()
    message = serializers.CharField()


class UserPlanWhatsAppStatusSerializer(serializers.Serializer):
    status = serializers.CharField()
    source = serializers.CharField()
    active = serializers.BooleanField()
    phone_number = serializers.CharField(allow_null=True)
    error = serializers.CharField(allow_blank=True)
    message = serializers.CharField()


class UserPlanSMSRCSActivationSerializer(serializers.Serializer):
    number_assigned = serializers.BooleanField()
    number_assignment_status = serializers.CharField()
    phone_number = serializers.CharField(allow_null=True)
    profile_status = serializers.CharField(allow_null=True)
    campaign_status = serializers.CharField(allow_null=True)
    active = serializers.BooleanField()


class UserMessagingActivationSerializer(serializers.Serializer):
    status = serializers.CharField()
    message = serializers.CharField()
    sms_rcs = UserPlanSMSRCSActivationSerializer()
    whatsapp = UserPlanWhatsAppStatusSerializer()


class UserPlanAndProgressDataSerializer(serializers.Serializer):
    has_active_subscription = serializers.BooleanField()
    plan_type = serializers.CharField(allow_blank=True, allow_null=True)
    expires_at = serializers.DateTimeField(allow_null=True)
    active_subscription = CurrentUserSubscriptionSummarySerializer(allow_null=True)
    organization = OrganizationSerializer(allow_null=True)
    sentdm_compliance = SentDMComplianceReadinessResponseSerializer(allow_null=True)
    sentdm_profile = UserPlanSentDMProfileSerializer(allow_null=True)
    sentdm_campaign = UserPlanSentDMCampaignSerializer(allow_null=True)
    number_assignment_status = serializers.CharField()
    sentdm_number = UserPlanSentDMNumberSerializer()
    whatsapp = UserPlanWhatsAppStatusSerializer()
    messaging_activation = UserMessagingActivationSerializer()
    progress = UserPlanProgressSummarySerializer()


class CurrentUserPlanAndProgressResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    message = serializers.CharField()
    data = UserPlanAndProgressDataSerializer()
