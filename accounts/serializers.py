from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.contrib.auth import authenticate
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, OTPVerification
from .choices import UserType


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


class CurrentUserCheseraNumberResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    data = CurrentUserCheseraNumberSerializer()
