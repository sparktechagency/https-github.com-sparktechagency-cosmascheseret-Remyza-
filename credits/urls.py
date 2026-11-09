from django.urls import path

from .views import (
    AdminBillingPlanDetailAPIView,
    AdminBillingPlanListCreateAPIView,
    AdminCreditAccountAPIView,
    AdminCreditAdjustmentAPIView,
    AdminCreditSettingsAPIView,
    AdminStoreProductDetailAPIView,
    AdminStoreProductListCreateAPIView,
    BillingCatalogAPIView,
    BillingEstimateAPIView,
    BillingSubscriptionAPIView,
    BillingUsageAPIView,
    BillingWalletAPIView,
    BillingWalletTransactionListAPIView,
)


urlpatterns = [
    path("billing/catalog/", BillingCatalogAPIView.as_view(), name="billing-catalog"),
    path("billing/wallet/", BillingWalletAPIView.as_view(), name="billing-wallet"),
    path("billing/wallet/transactions/", BillingWalletTransactionListAPIView.as_view(), name="billing-wallet-transactions"),
    path("billing/usage/", BillingUsageAPIView.as_view(), name="billing-usage"),
    path("billing/estimate/", BillingEstimateAPIView.as_view(), name="billing-estimate"),
    path("billing/subscription/", BillingSubscriptionAPIView.as_view(), name="billing-subscription"),
    path("admin/billing/settings/", AdminCreditSettingsAPIView.as_view(), name="admin-billing-settings"),
    path("admin/billing/plans/", AdminBillingPlanListCreateAPIView.as_view(), name="admin-billing-plans"),
    path("admin/billing/plans/<int:pk>/", AdminBillingPlanDetailAPIView.as_view(), name="admin-billing-plan-detail"),
    path("admin/billing/products/", AdminStoreProductListCreateAPIView.as_view(), name="admin-billing-products"),
    path("admin/billing/products/<int:pk>/", AdminStoreProductDetailAPIView.as_view(), name="admin-billing-product-detail"),
    path("admin/billing/accounts/<int:user_id>/", AdminCreditAccountAPIView.as_view(), name="admin-billing-account"),
    path("admin/billing/accounts/<int:user_id>/adjust/", AdminCreditAdjustmentAPIView.as_view(), name="admin-billing-adjust"),
]

