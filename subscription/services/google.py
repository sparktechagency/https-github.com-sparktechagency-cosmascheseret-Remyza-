import json
from datetime import datetime, timezone as dt_timezone
from decimal import Decimal

import requests
from django.conf import settings
from django.utils.dateparse import parse_datetime

from .store_types import StoreUnavailableError, StoreVerificationError, VerifiedStorePurchase


ANDROID_PUBLISHER_SCOPE = "https://www.googleapis.com/auth/androidpublisher"


def _credentials():
    try:
        from google.oauth2 import service_account
    except ImportError as exc:
        raise StoreUnavailableError("The Google authentication library is not installed.") from exc
    try:
        if settings.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON:
            info = json.loads(settings.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON)
            return service_account.Credentials.from_service_account_info(info, scopes=[ANDROID_PUBLISHER_SCOPE])
        if settings.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE:
            return service_account.Credentials.from_service_account_file(
                settings.GOOGLE_PLAY_SERVICE_ACCOUNT_FILE, scopes=[ANDROID_PUBLISHER_SCOPE]
            )
    except (OSError, ValueError, TypeError) as exc:
        raise StoreUnavailableError("Google Play service-account credentials are invalid.") from exc
    raise StoreUnavailableError("Google Play service-account credentials are not configured.")


def _headers():
    try:
        from google.auth.transport.requests import Request

        credentials = _credentials()
        credentials.refresh(Request())
        return {"Authorization": f"Bearer {credentials.token}", "Content-Type": "application/json"}
    except StoreUnavailableError:
        raise
    except Exception as exc:
        raise StoreUnavailableError("Google Play authentication failed.") from exc


def _request(method, path, **kwargs):
    url = f"https://androidpublisher.googleapis.com/androidpublisher/v3/applications/{settings.GOOGLE_PLAY_PACKAGE_NAME}/{path}"
    try:
        response = requests.request(method, url, headers=_headers(), timeout=20, **kwargs)
    except requests.RequestException as exc:
        raise StoreUnavailableError("Google Play could not be reached.") from exc
    if response.status_code == 404:
        raise StoreUnavailableError("Google Play has not exposed this new purchase yet. Please retry.")
    if response.status_code >= 500 or response.status_code == 429:
        raise StoreUnavailableError("Google Play is temporarily unavailable.")
    if response.status_code >= 400:
        raise StoreVerificationError("invalid_purchase", "Google Play rejected this purchase.")
    return response.json() if response.content else {}


def _parse_time(value):
    if not value:
        return None
    parsed = parse_datetime(value)
    return parsed if parsed else None


def _millis_time(value):
    if value in (None, ""):
        return None
    return datetime.fromtimestamp(int(value) / 1000, tz=dt_timezone.utc)


def _money(value):
    if not value:
        return None, "USD"
    amount = Decimal(str(value.get("units", "0"))) + Decimal(str(value.get("nanos", 0))) / Decimal("1000000000")
    return amount, value.get("currencyCode") or "USD"


GOOGLE_STATE_MAP = {
    "SUBSCRIPTION_STATE_ACTIVE": "active",
    "SUBSCRIPTION_STATE_IN_GRACE_PERIOD": "grace_period",
    "SUBSCRIPTION_STATE_CANCELED": "canceled",
    "SUBSCRIPTION_STATE_ON_HOLD": "on_hold",
    "SUBSCRIPTION_STATE_PAUSED": "paused",
    "SUBSCRIPTION_STATE_EXPIRED": "expired",
    "SUBSCRIPTION_STATE_PENDING": "pending",
    "SUBSCRIPTION_STATE_PENDING_PURCHASE_CANCELED": "expired",
}


def verify_google_purchase(*, verification_data, submitted_product_id, product_kind):
    token = verification_data
    if not token:
        raise StoreVerificationError("invalid_purchase", "Google purchase token is required.")
    package = settings.GOOGLE_PLAY_PACKAGE_NAME
    if not package:
        raise StoreUnavailableError("GOOGLE_PLAY_PACKAGE_NAME is not configured.")

    if product_kind == "subscription":
        payload = _request("GET", f"purchases/subscriptionsv2/tokens/{token}")
        line_items = payload.get("lineItems") or []
        item = next((entry for entry in line_items if entry.get("productId") == submitted_product_id), None)
        if not item:
            raise StoreVerificationError("invalid_purchase", "The verified Google subscription does not match the submitted product.")
        order_id = item.get("latestSuccessfulOrderId") or payload.get("latestOrderId") or token
        price, currency = _money((item.get("autoRenewingPlan") or {}).get("recurringPrice"))
        state = GOOGLE_STATE_MAP.get(payload.get("subscriptionState"), "pending")
        account_token = (payload.get("externalAccountIdentifiers") or {}).get("obfuscatedExternalAccountId")
        return VerifiedStorePurchase(
            platform="google", product_id=submitted_product_id, transaction_id=order_id,
            original_transaction_id=order_id, purchase_token=token, app_account_token=account_token,
            environment="sandbox" if payload.get("testPurchase") is not None else "production",
            is_test=payload.get("testPurchase") is not None,
            state="pending" if state == "pending" else "purchased",
            purchase_date=_parse_time(payload.get("startTime")), period_start=_parse_time(payload.get("startTime")),
            period_end=_parse_time(item.get("expiryTime")), auto_renew=bool((item.get("autoRenewingPlan") or {}).get("autoRenewEnabled")),
            entitlement_state=state, linked_purchase_token=payload.get("linkedPurchaseToken") or "",
            price_amount=price, currency=currency,
            already_finalized=payload.get("acknowledgementState") == "ACKNOWLEDGEMENT_STATE_ACKNOWLEDGED",
            raw=payload,
        )

    payload = _request("GET", f"purchases/products/{submitted_product_id}/tokens/{token}")
    if payload.get("productId") and payload.get("productId") != submitted_product_id:
        raise StoreVerificationError("invalid_purchase", "The verified Google product does not match the submitted product.")
    purchase_state = payload.get("purchaseState")
    if purchase_state == 2:
        return VerifiedStorePurchase(
            platform="google", product_id=submitted_product_id,
            transaction_id=payload.get("orderId") or token, purchase_token=token,
            state="pending", raw=payload,
        )
    if purchase_state != 0:
        raise StoreVerificationError("invalid_purchase", "This Google purchase is canceled or invalid.")
    return VerifiedStorePurchase(
        platform="google", product_id=submitted_product_id,
        transaction_id=payload.get("orderId") or token, original_transaction_id=payload.get("orderId") or "",
        purchase_token=token, app_account_token=payload.get("obfuscatedExternalAccountId"),
        environment="sandbox" if payload.get("purchaseType") == 0 else "production",
        is_test=payload.get("purchaseType") == 0, purchase_date=_millis_time(payload.get("purchaseTimeMillis")),
        period_start=_millis_time(payload.get("purchaseTimeMillis")),
        already_finalized=payload.get("consumptionState") == 1,
        raw=payload,
    )


def finalize_google_purchase(verified, product_kind):
    if verified.already_finalized:
        return True
    if product_kind == "subscription":
        _request(
            "POST",
            f"purchases/subscriptions/{verified.product_id}/tokens/{verified.purchase_token}:acknowledge",
            json={},
        )
    else:
        _request(
            "POST",
            f"purchases/products/{verified.product_id}/tokens/{verified.purchase_token}:consume",
            json={},
        )
    return True
