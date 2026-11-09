from dataclasses import dataclass, field
from datetime import datetime
from decimal import Decimal
from typing import Any


@dataclass
class VerifiedStorePurchase:
    platform: str
    product_id: str
    transaction_id: str
    original_transaction_id: str = ""
    purchase_token: str = ""
    app_account_token: str | None = None
    environment: str = "production"
    is_test: bool = False
    state: str = "purchased"
    purchase_date: datetime | None = None
    period_start: datetime | None = None
    period_end: datetime | None = None
    auto_renew: bool = True
    entitlement_state: str = "active"
    linked_purchase_token: str = ""
    price_amount: Decimal | None = None
    currency: str = "USD"
    already_finalized: bool = False
    raw: dict[str, Any] = field(default_factory=dict)


class StoreVerificationError(Exception):
    def __init__(self, code, message, *, http_status=422, finish_transaction=True):
        super().__init__(message)
        self.code = code
        self.message = message
        self.http_status = http_status
        self.finish_transaction = finish_transaction


class StoreUnavailableError(StoreVerificationError):
    def __init__(self, message="The app store could not be reached. Please retry later."):
        super().__init__(
            "store_unavailable", message, http_status=503, finish_transaction=False
        )
