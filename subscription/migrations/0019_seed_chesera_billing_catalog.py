from decimal import Decimal

from django.db import migrations


def seed_catalog(apps, schema_editor):
    BillingPlan = apps.get_model("subscription", "BillingPlan")
    StoreProduct = apps.get_model("subscription", "StoreProduct")

    plan, _ = BillingPlan.objects.update_or_create(
        code="chesera_pro",
        defaults={
            "name": "Chesera Pro",
            "description": "Everything you need to capture and convert leads by text.",
            "monthly_credits": 1000,
            "dedicated_numbers": 1,
            "features": [
                "1,000 credits every month",
                "1 dedicated business number",
                "AI auto-replies",
                "Automated follow-ups",
                "Lead capture and CRM",
            ],
            "reference_price_usd": Decimal("99.00"),
            "setup_fee_enabled": False,
            "free_setup_badge_enabled": True,
            "free_setup_badge_text": "Free setup",
            "is_active": True,
            "sort_order": 0,
        },
    )

    products = [
        ("chesera_pro_monthly", "subscription", 0, "99.00", "", 0),
        ("credits_250", "credit_pack", 250, "15.00", "", 10),
        ("credits_1000", "credit_pack", 1000, "45.00", "Popular", 20),
        ("credits_5000", "credit_pack", 5000, "175.00", "Best value", 30),
        ("pro_setup_fee", "setup_fee", 0, "99.00", "", 40),
    ]
    for code, kind, credits, price, badge, order in products:
        StoreProduct.objects.update_or_create(
            code=code,
            defaults={
                "kind": kind,
                "plan": plan if kind in {"subscription", "setup_fee"} else None,
                "apple_product_id": code,
                "google_product_id": code,
                "google_base_plan_id": "monthly" if kind == "subscription" else "",
                "credits": credits,
                "reference_price_usd": Decimal(price),
                "badge_text": badge,
                "is_active": kind != "setup_fee",
                "sort_order": order,
            },
        )


def noop_reverse(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [("subscription", "0018_billingplan_usersubscription_app_account_token_and_more")]
    operations = [migrations.RunPython(seed_catalog, noop_reverse)]

