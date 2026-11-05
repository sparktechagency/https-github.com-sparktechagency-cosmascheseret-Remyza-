from django.contrib.auth.base_user import BaseUserManager
import hashlib
import secrets
from datetime import timedelta
from django.db import models
from django.utils import timezone
from .querysets import OTPVerificationQuerySet


class UserManager(BaseUserManager):
    def create_user(self, phone_number, password=None, **extra_fields):
        if not phone_number: raise ValueError("Phone Number is required.")
        phone_number = self.normalize_email(phone_number)
        user = self.model(phone_number=phone_number, **extra_fields )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, phone_number, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        return self.create_user(phone_number, password, **extra_fields )

class OTPVerificationManager(models.Manager):
    def get_queryset(self):
        return OTPVerificationQuerySet(self.model, using=self._db)

    @staticmethod
    def hash_otp(otp: str):
        return hashlib.sha256(otp.encode()).hexdigest()

    def generate_otp(self, length=6):
        digits = "0123456789"
        return "".join(secrets.choice(digits) for _ in range(length))

    def create_otp(self, *, user, purpose, phone_number="", email="", expiry_minutes=5):
        phone_number = (phone_number or "").strip()
        email = (email or "").strip().lower()
        if bool(phone_number) == bool(email):
            raise ValueError("Provide exactly one OTP destination: phone_number or email.")

        otp = self.generate_otp()

        pending = self.filter(user=user, purpose=purpose, is_used=False)
        if phone_number:
            pending = pending.filter(phone_number=phone_number)
        else:
            pending = pending.filter(email__iexact=email)
        pending.delete()

        obj = self.create(
            user=user,
            phone_number=phone_number,
            email=email,
            purpose=purpose,
            otp_hash=self.hash_otp(otp),
            otp_code=otp,
            expires_at=timezone.now() + timedelta(minutes=expiry_minutes),
        )

        return obj, otp

    def latest_active(self, phone_number, purpose):
        return self.get_queryset().active().for_phone(phone_number).for_purpose(purpose).latest().first()

    def latest_active_for_email(self, email, purpose):
        return self.get_queryset().active().for_email(email).for_purpose(purpose).latest().first()
    
    def verify_otp(self, phone_number, purpose, otp):
        otp_obj = self.latest_active(phone_number, purpose)
        if not otp_obj:
            return False, "OTP not found."

        return otp_obj.verify(otp)

    def verify_email_otp(self, email, purpose, otp):
        otp_obj = self.latest_active_for_email(email, purpose)
        if not otp_obj:
            return False, "OTP not found."
        return otp_obj.verify(otp)

