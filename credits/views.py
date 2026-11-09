from datetime import timedelta

from django.db.models import Count, Q, Sum
from django.shortcuts import get_object_or_404
from django.utils import timezone
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema
from rest_framework import generics, status
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from crm.choices import AutomatedFollowUpStatus
from crm.models import AutomatedFollowUp
from subscription.choices import EntitlementState, StoreProductKind
from subscription.models import BillingPlan, StoreProduct
from subscription.services.purchase import SubscriptionValidationService
from .choices import CreditBucketSource
from .models import CreditBucket, CreditSettings, CreditTransaction
from .serializers import (
    AdminCreditAdjustmentSerializer,
    AdminCreditAdjustmentResponseSerializer,
    AdminCreditAccountResponseSerializer,
    AdminCreditSettingsResponseSerializer,
    BillingCatalogResponseSerializer,
    BillingEstimateResponseSerializer,
    BillingSubscriptionResponseSerializer,
    BillingUsageResponseSerializer,
    BillingWalletResponseSerializer,
    BillingPlanSerializer,
    CreditBucketSerializer,
    CreditSettingsSerializer,
    CreditTransactionSerializer,
    MessageEstimateSerializer,
    StoreProductSerializer,
)
from .services.pricing import estimate_message_cost
from .services.wallet import adjust_credits, get_credit_account, refresh_account_balance


class CreditPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100


def subscription_data(user):
    subscription = SubscriptionValidationService.get_current_subscription(user)
    if not subscription:
        return {
            "status": "none", "is_entitled": False, "platform": None,
            "product_id": "", "plan_code": None, "current_period_start": None,
            "current_period_end": None, "will_renew": False,
            "grace_period_ends_at": None, "is_test": False, "manage_url": None,
        }
    platform = subscription.medium or None
    manage_url = None
    if platform == "apple":
        manage_url = "https://apps.apple.com/account/subscriptions"
    elif platform == "google":
        manage_url = "https://play.google.com/store/account/subscriptions"
    return {
        "status": subscription.entitlement_state or subscription.status,
        "is_entitled": subscription.is_active,
        "platform": platform,
        "product_id": subscription.product_id,
        "plan_code": subscription.store_product.plan.code if subscription.store_product and subscription.store_product.plan else None,
        "current_period_start": subscription.current_period_start or subscription.start_date,
        "current_period_end": subscription.current_period_end or subscription.expiry_date or subscription.expires_at,
        "will_renew": subscription.auto_renew,
        "grace_period_ends_at": subscription.grace_period_expires_at,
        "is_test": subscription.is_test,
        "manage_url": manage_url,
    }


def wallet_data(user):
    account = refresh_account_balance(get_credit_account(user))
    now = timezone.now()
    buckets = CreditBucket.objects.filter(account=account, remaining__gt=0, revoked_at__isnull=True).filter(
        Q(expires_at__isnull=True) | Q(expires_at__gt=now)
    )
    breakdown = {
        "current_month": 0,
        "rollover": 0,
        "trial": 0,
        "bonus": 0,
        "purchased": 0,
    }
    for bucket in buckets:
        if bucket.source == CreditBucketSource.SUBSCRIPTION:
            key = "current_month" if not bucket.period_end or bucket.period_end > now else "rollover"
        elif bucket.source == CreditBucketSource.TRIAL:
            key = "trial"
        elif bucket.source == CreditBucketSource.TOPUP:
            key = "purchased"
        else:
            key = "bonus"
        breakdown[key] += bucket.remaining

    next_bucket = buckets.filter(expires_at__isnull=False).order_by("expires_at").first()
    settings_obj = CreditSettings.get_solo()
    sub = subscription_data(user)
    active_sub = SubscriptionValidationService.get_current_subscription(user)
    allowance = active_sub.locked_monthly_credits if active_sub and active_sub.locked_monthly_credits else settings_obj.trial_credits
    low_threshold = int(allowance * settings_obj.low_balance_threshold_percent / 100)
    paused = AutomatedFollowUp.objects.filter(
        organization__owner=user, follow_up_status="paused"
    ).count()
    return {
        "balance": account.balance,
        "breakdown": breakdown,
        "next_expiry": {"credits": next_bucket.remaining, "expires_at": next_bucket.expires_at} if next_bucket else None,
        "reference_allowance": allowance,
        "low_balance_threshold": low_threshold,
        "low_balance": account.balance < low_threshold if allowance else False,
        "can_send": account.balance > 0 or settings_obj.enforcement_mode == "shadow",
        "sending_blocked_reason": None if account.balance > 0 or settings_obj.enforcement_mode == "shadow" else "insufficient_credits",
        "enforcement_mode": settings_obj.enforcement_mode,
        "paused_followups": paused,
        "trial": {
            "granted": bool(account.trial_granted_at),
            "credits_granted": settings_obj.trial_credits if account.trial_granted_at else 0,
            "demo_available": settings_obj.demo_enabled and not sub["is_entitled"],
        },
        "setup_fee": {
            "required": bool(active_sub and active_sub.store_product and active_sub.store_product.plan and active_sub.store_product.plan.setup_fee_enabled),
            "paid": bool(account.setup_fee_paid_at),
        },
        "subscription": sub,
    }


class BillingCatalogAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BillingCatalogResponseSerializer

    @extend_schema(tags=["Billing - User"], summary="Get billing catalog", responses={200: BillingCatalogResponseSerializer})
    def get(self, request):
        account = get_credit_account(request.user)
        settings_obj = CreditSettings.get_solo()
        plan = BillingPlan.objects.filter(is_active=True).order_by("sort_order", "id").first()
        subscription_product = StoreProduct.objects.filter(
            kind=StoreProductKind.SUBSCRIPTION, is_active=True, plan=plan
        ).first()
        setup_product = StoreProduct.objects.filter(kind=StoreProductKind.SETUP_FEE, is_active=True, plan=plan).first()
        packs = StoreProduct.objects.filter(kind=StoreProductKind.CREDIT_PACK, is_active=True)

        def product_payload(product):
            if not product:
                return None
            return {
                "code": product.code,
                "apple_product_id": product.apple_product_id,
                "google_product_id": product.google_product_id,
                "google_base_plan_id": product.google_base_plan_id,
                "reference_price_usd": str(product.reference_price_usd),
            }

        data = {
            "billing_account_token": str(account.billing_account_token),
            "plan": None,
            "credit_packs": [
                {
                    **product_payload(item), "credits": item.credits,
                    "badge": item.badge_text or None,
                }
                for item in packs
            ],
            "credit_costs": {
                "sms_outbound_per_segment": settings_obj.sms_outbound_per_segment,
                "sms_inbound_per_message": settings_obj.sms_inbound_per_message,
                "sms_inbound_charge_mode": settings_obj.sms_inbound_charge_mode,
                "sms_segment_mode": settings_obj.sms_segment_mode,
                "mms_outbound": settings_obj.mms_outbound,
                "mms_inbound": settings_obj.mms_inbound,
                "whatsapp_inbound_conversation": settings_obj.whatsapp_inbound_conversation,
                "whatsapp_outbound_conversation": settings_obj.whatsapp_outbound_conversation,
                "whatsapp_window_hours": settings_obj.whatsapp_window_hours,
                "email_outbound": settings_obj.email_outbound,
                "email_inbound": settings_obj.email_inbound,
            },
            "rollover": {"enabled": settings_obj.rollover_enabled, "months": settings_obj.rollover_months},
            "trial": {"enabled": settings_obj.trial_enabled, "credits": settings_obj.trial_credits},
            "low_balance_threshold_percent": settings_obj.low_balance_threshold_percent,
            "topups_require_active_subscription": settings_obj.topups_require_active_subscription,
            "number_setup_eta_text": settings_obj.number_setup_eta_text,
            "number_retention_days_after_lapse": settings_obj.number_retention_days_after_lapse,
            "legal": {
                "terms_url": settings_obj.terms_url,
                "privacy_url": settings_obj.privacy_url,
                "apple_standard_eula_url": "https://www.apple.com/legal/internet-services/itunes/dev/stdeula/",
                "account_deletion_url": settings_obj.account_deletion_url,
            },
        }
        if plan:
            data["plan"] = {
                "code": plan.code, "name": plan.name, "description": plan.description,
                "monthly_credits": plan.monthly_credits, "dedicated_numbers": plan.dedicated_numbers,
                "billing_period": "P1M", "features": plan.features,
                "product": product_payload(subscription_product),
                "setup_fee": {"enabled": plan.setup_fee_enabled, "product": product_payload(setup_product) if plan.setup_fee_enabled else None},
                "marketing_badge": {"enabled": plan.free_setup_badge_enabled and not plan.setup_fee_enabled, "text": plan.free_setup_badge_text},
            }
        return Response({"success": True, "data": data})


class BillingWalletAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BillingWalletResponseSerializer

    @extend_schema(tags=["Billing - User"], summary="Get credit wallet", responses={200: BillingWalletResponseSerializer})
    def get(self, request):
        return Response({"success": True, "data": wallet_data(request.user)})


class BillingWalletTransactionListAPIView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = CreditTransactionSerializer
    pagination_class = CreditPagination

    @extend_schema(tags=["Billing - User"], summary="List wallet transactions")
    def get_queryset(self):
        if getattr(self, "swagger_fake_view", False) or self.request.user.is_anonymous:
            return CreditTransaction.objects.none()
        return CreditTransaction.objects.filter(account=get_credit_account(self.request.user))


class BillingUsageAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BillingUsageResponseSerializer

    @extend_schema(tags=["Billing - User"], summary="Get credit usage", responses={200: BillingUsageResponseSerializer})
    def get(self, request):
        account = get_credit_account(request.user)
        now = timezone.now()
        start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        end = (start.replace(day=28) + timedelta(days=4)).replace(day=1)
        queryset = CreditTransaction.objects.filter(account=account, created_at__gte=start, created_at__lt=end)
        by_type = list(
            queryset.exclude(usage_type="").values("usage_type").annotate(
                count=Count("id"), units=Sum("units"), credits=Sum("amount"), waived=Sum("waived")
            )
        )
        for item in by_type:
            item["credits"] = abs(item["credits"] or 0)
        data = {
            "period": {"start": start, "end": end},
            "totals": {
                "credits_used": abs(queryset.filter(amount__lt=0).aggregate(v=Sum("amount"))["v"] or 0),
                "credits_waived": queryset.aggregate(v=Sum("waived"))["v"] or 0,
                "messages_sent": queryset.filter(direction="outbound").count(),
                "messages_received": queryset.filter(direction="inbound").count(),
            },
            "by_type": by_type,
        }
        return Response({"success": True, "data": data})


class BillingEstimateAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = MessageEstimateSerializer

    @extend_schema(tags=["Billing - User"], summary="Estimate message credit cost", request=MessageEstimateSerializer, responses={200: BillingEstimateResponseSerializer})
    def post(self, request):
        serializer = MessageEstimateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        estimate = estimate_message_cost(
            **serializer.validated_data,
            account=get_credit_account(request.user),
        )
        return Response({"success": True, "data": estimate})


class BillingSubscriptionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = BillingSubscriptionResponseSerializer

    @extend_schema(tags=["Billing - User"], summary="Get verified subscription entitlement", responses={200: BillingSubscriptionResponseSerializer})
    def get(self, request):
        return Response({"success": True, "data": subscription_data(request.user)})


class AdminCreditSettingsAPIView(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = CreditSettingsSerializer

    @extend_schema(tags=["Admin - Billing"], summary="Get billing and credit settings", responses={200: AdminCreditSettingsResponseSerializer})
    def get(self, request):
        return Response({"success": True, "data": CreditSettingsSerializer(CreditSettings.get_solo()).data})

    @extend_schema(tags=["Admin - Billing"], summary="Update billing and credit settings", request=CreditSettingsSerializer, responses={200: AdminCreditSettingsResponseSerializer})
    def patch(self, request):
        instance = CreditSettings.get_solo()
        serializer = CreditSettingsSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"success": True, "message": "Billing settings updated.", "data": serializer.data})


class AdminBillingPlanListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    queryset = BillingPlan.objects.all()
    serializer_class = BillingPlanSerializer

    @extend_schema(tags=["Admin - Billing"])
    def get(self, *args, **kwargs):
        return super().get(*args, **kwargs)

    @extend_schema(tags=["Admin - Billing"])
    def post(self, *args, **kwargs):
        return super().post(*args, **kwargs)


class AdminBillingPlanDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    queryset = BillingPlan.objects.all()
    serializer_class = BillingPlanSerializer
    http_method_names = ["get", "patch", "head", "options"]


class AdminStoreProductListCreateAPIView(generics.ListCreateAPIView):
    permission_classes = [IsAdminUser]
    queryset = StoreProduct.objects.all()
    serializer_class = StoreProductSerializer


class AdminStoreProductDetailAPIView(generics.RetrieveUpdateAPIView):
    permission_classes = [IsAdminUser]
    queryset = StoreProduct.objects.all()
    serializer_class = StoreProductSerializer
    http_method_names = ["get", "patch", "head", "options"]


class AdminCreditAccountAPIView(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCreditAccountResponseSerializer

    @extend_schema(tags=["Admin - Billing"], summary="Get a user's credit account", responses={200: AdminCreditAccountResponseSerializer})
    def get(self, request, user_id):
        from accounts.models import User

        user = get_object_or_404(User, pk=user_id)
        account = get_credit_account(user)
        return Response({
            "success": True,
            "data": {
                "user_id": user.id,
                "wallet": wallet_data(user),
                "buckets": CreditBucketSerializer(account.buckets.order_by("expires_at", "priority"), many=True).data,
                "recent_transactions": CreditTransactionSerializer(account.transactions.all()[:50], many=True).data,
            },
        })


class AdminCreditAdjustmentAPIView(APIView):
    permission_classes = [IsAdminUser]
    serializer_class = AdminCreditAdjustmentSerializer

    @extend_schema(tags=["Admin - Billing"], summary="Adjust a user's credits", request=AdminCreditAdjustmentSerializer, responses={200: AdminCreditAdjustmentResponseSerializer})
    def post(self, request, user_id):
        from accounts.models import User

        user = get_object_or_404(User, pk=user_id)
        serializer = AdminCreditAdjustmentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            txn = adjust_credits(
                get_credit_account(user),
                serializer.validated_data["amount"],
                reason=serializer.validated_data["reason"],
                admin=request.user,
                expires_at=serializer.validated_data.get("expires_at"),
            )
        except ValueError as exc:
            return Response({"detail": str(exc)}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"success": True, "message": "Credits adjusted.", "data": CreditTransactionSerializer(txn).data})

