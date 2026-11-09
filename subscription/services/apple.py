from datetime import datetime, timezone as dt_timezone
from decimal import Decimal
from pathlib import Path

from django.conf import settings

from .store_types import StoreUnavailableError, StoreVerificationError, VerifiedStorePurchase


def _milliseconds_to_datetime(value):
    if value in (None, ""):
        return None
    return datetime.fromtimestamp(int(value) / 1000, tz=dt_timezone.utc)


def _load_private_key():
    if settings.APPLE_IAP_PRIVATE_KEY:
        return settings.APPLE_IAP_PRIVATE_KEY.encode("utf-8")
    if settings.APPLE_IAP_PRIVATE_KEY_PATH:
        return Path(settings.APPLE_IAP_PRIVATE_KEY_PATH).read_bytes()
    raise StoreUnavailableError("Apple IAP credentials are not configured on the server.")


def _load_root_certificates():
    if not settings.APPLE_ROOT_CA_PATHS:
        raise StoreUnavailableError("Apple root certificates are not configured on the server.")
    try:
        return [Path(path).read_bytes() for path in settings.APPLE_ROOT_CA_PATHS]
    except OSError as exc:
        raise StoreUnavailableError("An Apple root certificate could not be read.") from exc


def _build_verifier(environment):
    try:
        from appstoreserverlibrary.models.Environment import Environment
        from appstoreserverlibrary.signed_data_verifier import SignedDataVerifier
    except ImportError as exc:
        raise StoreUnavailableError("The Apple verification library is not installed.") from exc

    app_apple_id = None
    if environment == Environment.PRODUCTION:
        if not settings.APPLE_IAP_APP_ID:
            raise StoreUnavailableError("APPLE_IAP_APP_ID is required for production verification.")
        app_apple_id = int(settings.APPLE_IAP_APP_ID)
    return SignedDataVerifier(
        _load_root_certificates(),
        True,
        environment,
        settings.APPLE_IAP_BUNDLE_ID,
        app_apple_id,
    )


def _verify_jws(signed_transaction):
    try:
        from appstoreserverlibrary.models.Environment import Environment
        from appstoreserverlibrary.signed_data_verifier import VerificationException
    except ImportError as exc:
        raise StoreUnavailableError("The Apple verification library is not installed.") from exc

    errors = []
    for environment in (Environment.SANDBOX, Environment.PRODUCTION):
        try:
            verifier = _build_verifier(environment)
            method = getattr(verifier, "verify_and_decode_transaction", None)
            if method is None:  # Compatibility with pre-3.x releases.
                method = verifier.verify_and_decode_signed_transaction
            return method(signed_transaction), environment, verifier
        except VerificationException as exc:
            errors.append(exc)
        except StoreUnavailableError:
            if environment == Environment.PRODUCTION:
                raise
    raise StoreVerificationError("invalid_purchase", "Apple could not verify this purchase.") from (errors[-1] if errors else None)


def _authoritative_transaction(transaction_id, environment, verifier):
    if not settings.APPLE_IAP_KEY_ID or not settings.APPLE_IAP_ISSUER_ID:
        raise StoreUnavailableError("Apple App Store Server API credentials are not configured.")
    try:
        from appstoreserverlibrary.api_client import APIException, AppStoreServerAPIClient

        client = AppStoreServerAPIClient(
            _load_private_key(),
            settings.APPLE_IAP_KEY_ID,
            settings.APPLE_IAP_ISSUER_ID,
            settings.APPLE_IAP_BUNDLE_ID,
            environment,
        )
        response = client.get_transaction_info(str(transaction_id))
        signed_info = getattr(response, "signedTransactionInfo", None)
        if not signed_info:
            raise StoreUnavailableError("Apple returned no signed transaction information.")
        method = getattr(verifier, "verify_and_decode_transaction", None)
        if method is None:
            method = verifier.verify_and_decode_signed_transaction
        return method(signed_info)
    except StoreUnavailableError:
        raise
    except APIException as exc:
        raise StoreUnavailableError("Apple could not confirm this transaction right now.") from exc
    except Exception as exc:
        raise StoreUnavailableError("Apple purchase verification failed temporarily.") from exc


def verify_apple_purchase(*, verification_data, submitted_product_id, transaction_id=""):
    if not verification_data or verification_data.count(".") != 2:
        raise StoreVerificationError("invalid_purchase", "Apple verification_data must be a signed transaction JWS.")
    decoded, environment, verifier = _verify_jws(verification_data)
    decoded_transaction_id = str(getattr(decoded, "transactionId", "") or transaction_id)
    if not decoded_transaction_id:
        raise StoreVerificationError("invalid_purchase", "Apple transaction ID is missing.")
    decoded = _authoritative_transaction(decoded_transaction_id, environment, verifier)

    product_id = str(getattr(decoded, "productId", "") or "")
    if product_id != submitted_product_id:
        raise StoreVerificationError("invalid_purchase", "The verified Apple product does not match the submitted product.")
    ownership = str(getattr(decoded, "inAppOwnershipType", "") or "")
    if ownership and "PURCHASED" not in ownership.upper():
        raise StoreVerificationError("invalid_purchase", "Family-shared purchases are not accepted.")
    if getattr(decoded, "revocationDate", None):
        raise StoreVerificationError("invalid_purchase", "This Apple purchase was revoked or refunded.")

    price = getattr(decoded, "price", None)
    price_amount = Decimal(str(price)) / Decimal("1000") if price is not None else None
    env_value = str(getattr(environment, "value", environment)).lower()
    return VerifiedStorePurchase(
        platform="apple",
        product_id=product_id,
        transaction_id=decoded_transaction_id,
        original_transaction_id=str(getattr(decoded, "originalTransactionId", "") or decoded_transaction_id),
        app_account_token=str(getattr(decoded, "appAccountToken", "") or "") or None,
        environment="sandbox" if "sandbox" in env_value else "production",
        is_test="sandbox" in env_value,
        purchase_date=_milliseconds_to_datetime(getattr(decoded, "purchaseDate", None)),
        period_start=_milliseconds_to_datetime(getattr(decoded, "purchaseDate", None)),
        period_end=_milliseconds_to_datetime(getattr(decoded, "expiresDate", None)),
        price_amount=price_amount,
        currency=str(getattr(decoded, "currency", "") or "USD"),
        raw={
            "transaction_id": decoded_transaction_id,
            "original_transaction_id": str(getattr(decoded, "originalTransactionId", "") or ""),
            "product_id": product_id,
            "environment": env_value,
        },
    )
