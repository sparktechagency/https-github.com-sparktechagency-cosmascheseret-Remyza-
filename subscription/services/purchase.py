from django.db.models import Q
from django.utils import timezone

from credits.models import CreditSettings
from subscription.models import UserSubscription


class SubscriptionValidationService:
    @classmethod
    def get_paid_active_subscription(cls, user):
        return cls.get_current_subscription(user)

    @classmethod
    def get_current_subscription(cls, user):
        now = timezone.now()
        candidates = (
            UserSubscription.objects
            .select_related("user", "organization", "store_product", "store_product__plan")
            .filter(user=user)
            .order_by("-current_period_end", "-expiry_date", "-created_at")
        )
        settings_obj = CreditSettings.get_solo()
        allowlisted = {
            int(item) for item in settings_obj.sandbox_allowlist_user_ids if str(item).isdigit()
        }
        for subscription in candidates:
            if not subscription.is_active:
                continue
            if subscription.is_test:
                if settings_obj.sandbox_purchase_policy == "reject":
                    continue
                if settings_obj.sandbox_purchase_policy == "allowlist" and user.id not in allowlisted:
                    continue
            return subscription
        return None

    @staticmethod
    def get_active_subscription(user):
        return SubscriptionValidationService.get_current_subscription(user)

    @classmethod
    def has_active_subscription(cls, user):
        return cls.get_current_subscription(user) is not None

    @classmethod
    def get_active_free_trail_subscription(cls, user):
        return None

    @classmethod
    def has_active_subscription_with_free_trial(cls, user):
        return False

    @classmethod
    def get_free_trail_subscription(cls, user):
        return None

    @classmethod
    def has_free_trail_claimed(cls, user):
        return False
