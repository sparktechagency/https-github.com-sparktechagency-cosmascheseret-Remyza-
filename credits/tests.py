from datetime import timedelta

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIRequestFactory, force_authenticate

from accounts.models import User
from credits.choices import CreditBucketSource, EnforcementMode, UsageType
from credits.models import CreditSettings
from credits.services.pricing import sms_segments
from credits.services.trial import grant_starter_credits
from credits.services.wallet import (
    InsufficientCredits,
    get_credit_account,
    grant_credits,
    release_reservation,
    reserve_credits,
    settle_reservation,
)
from credits.views import BillingCatalogAPIView, BillingWalletAPIView
from subscription.models import BillingPlan, StoreProduct
from subscription.models import UserSubscription


class CreditPricingTests(TestCase):
    def test_shared_sms_segmentation_vectors(self):
        self.assertEqual(sms_segments(""), {"encoding": "GSM-7", "units": 0, "segments": 0})
        self.assertEqual(sms_segments("Hello"), {"encoding": "GSM-7", "units": 5, "segments": 1})
        self.assertEqual(sms_segments("a" * 306)["segments"], 2)
        self.assertEqual(sms_segments("a" * 307)["segments"], 3)
        self.assertEqual(sms_segments("\u20ac" * 80), {"encoding": "GSM-7", "units": 160, "segments": 1})
        self.assertEqual(sms_segments("\u20ac" * 81)["segments"], 2)
        self.assertEqual(sms_segments("\U0001f600" * 35), {"encoding": "UCS-2", "units": 70, "segments": 1})
        self.assertEqual(sms_segments("\U0001f600" * 36)["segments"], 2)
        self.assertEqual(sms_segments("a" * 161, "fixed_160")["segments"], 2)

    def test_gsm_and_unicode_segmentation(self):
        self.assertEqual(sms_segments("a" * 160)["segments"], 1)
        self.assertEqual(sms_segments("a" * 161)["segments"], 2)
        self.assertEqual(sms_segments("你" * 70)["segments"], 1)
        self.assertEqual(sms_segments("你" * 71)["segments"], 2)


class CreditWalletTests(TestCase):
    def setUp(self):
        self.user = User.objects.create(phone_number="+15550101010", email="wallet@example.com", is_phone_verified=True)
        self.account = get_credit_account(self.user)
        settings_obj = CreditSettings.get_solo()
        settings_obj.enforcement_mode = EnforcementMode.ENFORCE
        settings_obj.save()

    def test_subscription_credits_are_spent_before_topups(self):
        subscription = grant_credits(
            self.account,
            CreditBucketSource.SUBSCRIPTION,
            5,
            key="grant:sub:test:1",
            expires_at=timezone.now() + timedelta(days=30),
        )
        topup = grant_credits(self.account, CreditBucketSource.TOPUP, 5, key="grant:pack:test:1")
        reservation = reserve_credits(
            self.account,
            6,
            key="send:test:1",
            usage_type=UsageType.SMS_OUTBOUND,
            units=6,
            unit_rate=1,
        )
        settle_reservation(reservation)
        subscription_bucket = subscription.lines.get().bucket
        topup_bucket = topup.lines.get().bucket
        subscription_bucket.refresh_from_db()
        topup_bucket.refresh_from_db()
        self.assertEqual(subscription_bucket.remaining, 0)
        self.assertEqual(topup_bucket.remaining, 4)

    def test_release_restores_the_same_bucket(self):
        grant = grant_credits(self.account, CreditBucketSource.TRIAL, 3, key="trial:test")
        reservation = reserve_credits(self.account, 2, key="send:test:release")
        release_reservation(reservation)
        bucket = grant.lines.get().bucket
        bucket.refresh_from_db()
        self.assertEqual(bucket.remaining, 3)

    def test_insufficient_credits_never_makes_balance_negative(self):
        grant_credits(self.account, CreditBucketSource.TRIAL, 1, key="trial:test:small")
        with self.assertRaises(InsufficientCredits):
            reserve_credits(self.account, 2, key="send:test:too-much")
        self.account.refresh_from_db()
        self.assertEqual(self.account.balance, 1)

    def test_shadow_mode_logs_without_debiting(self):
        settings_obj = CreditSettings.get_solo()
        settings_obj.enforcement_mode = EnforcementMode.SHADOW
        settings_obj.save()
        grant = grant_credits(self.account, CreditBucketSource.TRIAL, 2, key="trial:test:shadow")
        txn = reserve_credits(self.account, 5, key="send:test:shadow")
        self.assertEqual(txn.amount, 0)
        self.assertTrue(txn.metadata["shadow"])
        bucket = grant.lines.get().bucket
        bucket.refresh_from_db()
        self.assertEqual(bucket.remaining, 2)


class StarterCreditAndBillingAPITests(TestCase):
    def setUp(self):
        self.factory = APIRequestFactory()
        self.user = User.objects.create(phone_number="+15550101011", email="starter@example.com", is_phone_verified=True)

    def test_starter_credits_are_idempotent(self):
        first = grant_starter_credits(self.user)
        second = grant_starter_credits(self.user)
        self.assertIsNotNone(first)
        self.assertIsNone(second)
        self.assertEqual(get_credit_account(self.user).buckets.count(), 1)

    def test_catalog_and_wallet_return_seeded_contract(self):
        grant_starter_credits(self.user)
        catalog_request = self.factory.get("/api/v1/billing/catalog/")
        force_authenticate(catalog_request, user=self.user)
        catalog_response = BillingCatalogAPIView.as_view()(catalog_request)
        self.assertEqual(catalog_response.status_code, 200)
        self.assertEqual(catalog_response.data["data"]["plan"]["code"], "chesera_pro")
        self.assertEqual(len(catalog_response.data["data"]["credit_packs"]), 3)

        wallet_request = self.factory.get("/api/v1/billing/wallet/")
        force_authenticate(wallet_request, user=self.user)
        wallet_response = BillingWalletAPIView.as_view()(wallet_request)
        self.assertEqual(wallet_response.data["data"]["balance"], 50)
        self.assertEqual(wallet_response.data["data"]["breakdown"]["trial"], 50)


class SubscriptionPriceLockTests(TestCase):
    def test_existing_subscription_keeps_locked_price_and_credits_after_plan_edit(self):
        user = User.objects.create(phone_number="+15550101999", email="locked@example.com")
        plan = BillingPlan.objects.get(code="chesera_pro")
        product = StoreProduct.objects.get(code="chesera_pro_monthly")
        subscription = UserSubscription.objects.create(
            user=user,
            store_product=product,
            product_id=product.apple_product_id,
            medium="apple",
            transaction_id="locked-price-test",
            verified_at=timezone.now(),
            entitlement_state="active",
            current_period_end=timezone.now() + timedelta(days=30),
            is_subscription_active=True,
            locked_price="99.00",
            locked_currency="USD",
            locked_monthly_credits=1000,
            locked_number_limit=1,
            locked_features=list(plan.features),
        )
        plan.reference_price_usd = "129.00"
        plan.monthly_credits = 800
        plan.save()
        subscription.refresh_from_db()
        self.assertEqual(str(subscription.locked_price), "99.00")
        self.assertEqual(subscription.locked_monthly_credits, 1000)
        self.assertEqual(subscription.locked_number_limit, 1)

