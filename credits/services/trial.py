import hashlib
import hmac
from datetime import timedelta

from django.conf import settings
from django.db import IntegrityError, transaction
from django.utils import timezone

from credits.choices import CreditBucketSource
from credits.models import CreditSettings, TrialClaim
from .wallet import get_credit_account, grant_credits


def phone_hmac(phone_number):
    secret = str(getattr(settings, "BILLING_HMAC_SECRET", "") or settings.SECRET_KEY).encode()
    normalized = "".join(char for char in (phone_number or "") if char.isdigit() or char == "+")
    return hmac.new(secret, normalized.encode(), hashlib.sha256).hexdigest()


def grant_starter_credits(user):
    credit_settings = CreditSettings.get_solo()
    if not credit_settings.trial_enabled or credit_settings.trial_credits <= 0:
        return None
    claim_key = phone_hmac(user.phone_number)
    with transaction.atomic():
        claim, created = TrialClaim.objects.get_or_create(
            phone_hmac=claim_key,
            defaults={"user": user},
        )
        if not created:
            return None
        expires_at = None
        if credit_settings.trial_credit_expiry_days:
            expires_at = timezone.now() + timedelta(days=credit_settings.trial_credit_expiry_days)
        return grant_credits(
            get_credit_account(user),
            CreditBucketSource.TRIAL,
            credit_settings.trial_credits,
            key=f"trial:{user.id}",
            expires_at=expires_at,
            note="Chesera starter credits",
        )

