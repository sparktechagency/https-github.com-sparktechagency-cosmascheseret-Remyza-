import uuid

from dateutil.relativedelta import relativedelta
from django.db import transaction
from django.db.models import Q
from django.utils import timezone

from credits.choices import CreditBucketSource
from credits.models import CreditAccount, CreditSettings
from credits.services.wallet import get_credit_account, grant_credits
from subscription.choices import (
    EntitlementState,
    PaymentMediumChoices,
    StoreProductKind,
    StoreTransactionState,
    SubscriptionStatus,
)
from subscription.models import StoreProduct, StoreTransaction, UserSubscription

from .apple import verify_apple_purchase
from .google import finalize_google_purchase, verify_google_purchase
from .store_types import StoreUnavailableError, StoreVerificationError


def _product_for(platform, product_id):
    field = "apple_product_id" if platform == PaymentMediumChoices.APPLE else "google_product_id"
    product = StoreProduct.objects.select_related("plan").filter(
        Q(**{field: product_id}) | Q(code=product_id)
    ).first()
    if not product:
        raise StoreVerificationError("invalid_purchase", "This product is not configured in Chesera.")
    expected = getattr(product, field) or product.code
    return product, expected


def _owner_for_purchase(caller, token, product):
    caller_account = get_credit_account(caller)
    if not token:
        return caller, caller_account, False
    try:
        parsed = uuid.UUID(str(token))
    except (ValueError, TypeError, AttributeError):
        raise StoreVerificationError("invalid_purchase", "The purchase account token is invalid.")
    owner_account = CreditAccount.objects.select_related("user").filter(billing_account_token=parsed).first()
    if not owner_account or not owner_account.user:
        return caller, caller_account, False
    if owner_account.user_id == caller.id:
        return caller, owner_account, False
    if product.kind == StoreProductKind.SUBSCRIPTION:
        raise StoreVerificationError(
            "purchase_owned_by_other_account",
            "This subscription belongs to another Chesera account.",
            http_status=409,
        )
    return owner_account.user, owner_account, True


def _sandbox_entitled(user, verified):
    if not verified.is_test:
        return True
    settings_obj = CreditSettings.get_solo()
    if settings_obj.sandbox_purchase_policy == "accept_all":
        return True
    if settings_obj.sandbox_purchase_policy == "reject":
        return False
    return user.id in {int(item) for item in settings_obj.sandbox_allowlist_user_ids if str(item).isdigit()}


def _subscription_defaults(owner, product, verified):
    plan = product.plan
    return {
        "user": owner,
        "organization": getattr(owner, "organization", None),
        "store_product": product,
        "product_id": verified.product_id,
        "plan_type": plan.code if plan else "pro",
        "medium": verified.platform,
        "purchase_token": verified.purchase_token,
        "transaction_id": verified.transaction_id,
        "order_id": verified.transaction_id,
        "store_environment": verified.environment,
        "store_status": verified.entitlement_state,
        "status": SubscriptionStatus.ACTIVE if verified.entitlement_state in {
            EntitlementState.ACTIVE, EntitlementState.GRACE_PERIOD, EntitlementState.CANCELED
        } else SubscriptionStatus.AWAITING_PAYMENT,
        "entitlement_state": verified.entitlement_state,
        "is_subscription_active": verified.entitlement_state in {
            EntitlementState.ACTIVE, EntitlementState.GRACE_PERIOD, EntitlementState.CANCELED
        },
        "start_date": verified.period_start or verified.purchase_date or timezone.now(),
        "purchase_date": verified.purchase_date,
        "expiry_date": verified.period_end,
        "expires_at": verified.period_end,
        "next_billing_date": verified.period_end if verified.auto_renew else None,
        "current_period_start": verified.period_start,
        "current_period_end": verified.period_end,
        "auto_renew": verified.auto_renew,
        "app_account_token": verified.app_account_token or get_credit_account(owner).billing_account_token,
        "linked_purchase_token": verified.linked_purchase_token,
        "verified_at": timezone.now(),
        "last_synced_at": timezone.now(),
        "is_test": verified.is_test,
        "amount": verified.price_amount or product.reference_price_usd,
        "currency_code": verified.currency,
        "locked_price": verified.price_amount or product.reference_price_usd,
        "locked_currency": verified.currency,
        "locked_monthly_credits": plan.monthly_credits if plan else 0,
        "locked_number_limit": plan.dedicated_numbers if plan else 0,
        "locked_features": list(plan.features) if plan else [],
        "verification_payload": verified.raw,
    }


@transaction.atomic
def _grant_verified_purchase(caller, product, verified):
    owner, account, credited_to_other = _owner_for_purchase(caller, verified.app_account_token, product)
    existing = StoreTransaction.objects.select_for_update().filter(
        platform=verified.platform, transaction_id=verified.transaction_id
    ).first()
    if existing and existing.transaction_state == StoreTransactionState.GRANTED:
        return existing, owner, credited_to_other, "already_granted"

    if not _sandbox_entitled(owner, verified):
        return None, owner, credited_to_other, "test_purchase_not_entitled"

    subscription = None
    if product.kind == StoreProductKind.SUBSCRIPTION:
        lookup = {
            "medium": verified.platform,
            "original_transaction_id": verified.original_transaction_id or verified.transaction_id,
        }
        subscription = UserSubscription.objects.select_for_update().filter(**lookup).first()
        defaults = _subscription_defaults(owner, product, verified)
        if subscription:
            for field, value in defaults.items():
                if field.startswith("locked_") and getattr(subscription, field):
                    continue
                setattr(subscription, field, value)
            subscription.save()
        else:
            subscription = UserSubscription.objects.create(
                original_transaction_id=lookup["original_transaction_id"], **defaults
            )

    store_transaction, _ = StoreTransaction.objects.update_or_create(
        platform=verified.platform,
        transaction_id=verified.transaction_id,
        defaults={
            "kind": product.kind,
            "store_product": product,
            "product_id": verified.product_id,
            "user": owner,
            "subscription": subscription,
            "original_transaction_id": verified.original_transaction_id,
            "purchase_token": verified.purchase_token,
            "app_account_token": verified.app_account_token or account.billing_account_token,
            "environment": verified.environment,
            "is_test": verified.is_test,
            "transaction_state": StoreTransactionState.GRANTED,
            "purchase_date": verified.purchase_date,
            "period_start": verified.period_start,
            "period_end": verified.period_end,
            "price_amount": verified.price_amount or product.reference_price_usd,
            "currency": verified.currency,
            "price_estimated": verified.price_amount is None,
            "raw": verified.raw,
        },
    )

    granted = 0
    if product.kind == StoreProductKind.SUBSCRIPTION:
        now = timezone.now()
        if verified.period_end and verified.period_end > now and subscription and subscription.is_active:
            settings_obj = CreditSettings.get_solo()
            expires_at = verified.period_end
            if settings_obj.rollover_enabled:
                expires_at = expires_at + relativedelta(months=settings_obj.rollover_months)
            granted = subscription.locked_monthly_credits
            grant_credits(
                account,
                CreditBucketSource.SUBSCRIPTION,
                granted,
                key=f"grant:subscription:{verified.platform}:{verified.transaction_id}",
                expires_at=expires_at,
                period_start=verified.period_start,
                period_end=verified.period_end,
                store_transaction=store_transaction,
                note=f"{product.plan.name if product.plan else 'Chesera Pro'} monthly allowance",
            )
    elif product.kind == StoreProductKind.CREDIT_PACK:
        granted = product.credits
        grant_credits(
            account,
            CreditBucketSource.TOPUP,
            granted,
            key=f"grant:pack:{verified.platform}:{verified.transaction_id}",
            store_transaction=store_transaction,
            note=f"Purchased {product.code}",
        )
    elif product.kind == StoreProductKind.SETUP_FEE:
        account.setup_fee_paid_at = account.setup_fee_paid_at or timezone.now()
        account.save(update_fields=["setup_fee_paid_at", "updated_at"])

    store_transaction.credits_granted = granted
    store_transaction.save(update_fields=["credits_granted", "updated_at"])
    return store_transaction, owner, credited_to_other, "granted"


def verify_purchase(*, user, platform, product_id, verification_data, transaction_id="", source="purchase"):
    product, expected_product_id = _product_for(platform, product_id)
    if platform == PaymentMediumChoices.APPLE:
        verified = verify_apple_purchase(
            verification_data=verification_data,
            submitted_product_id=expected_product_id,
            transaction_id=transaction_id,
        )
    elif platform == PaymentMediumChoices.GOOGLE:
        verified = verify_google_purchase(
            verification_data=verification_data,
            submitted_product_id=expected_product_id,
            product_kind=product.kind,
        )
    else:
        raise StoreVerificationError("invalid_purchase", "Unsupported purchase platform.")

    if verified.state == "pending":
        return {
            "state": "purchase_pending", "kind": product.kind, "credits_granted": 0,
            "finish_transaction": False, "store_finalized": False, "owner": user,
        }

    store_transaction, owner, credited_to_other, state = _grant_verified_purchase(user, product, verified)
    if state == "test_purchase_not_entitled":
        return {
            "state": state, "kind": product.kind, "credits_granted": 0,
            "finish_transaction": True, "store_finalized": verified.platform == "apple" or verified.already_finalized,
            "owner": owner,
        }

    store_finalized = verified.platform == "apple" or verified.already_finalized
    if verified.platform == "google" and not store_finalized:
        try:
            store_finalized = finalize_google_purchase(verified, product.kind)
            if store_finalized:
                store_transaction.finalized_at = timezone.now()
                store_transaction.save(update_fields=["finalized_at", "updated_at"])
        except StoreUnavailableError:
            store_finalized = False

    if credited_to_other and state == "granted":
        state = "granted_to_other_account"
    return {
        "state": state,
        "kind": product.kind,
        "credits_granted": store_transaction.credits_granted,
        "finish_transaction": True,
        "store_finalized": store_finalized,
        "owner": owner,
    }
