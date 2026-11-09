from django.db import models


class EnforcementMode(models.TextChoices):
    SHADOW = "shadow", "Shadow (calculate only)"
    ENFORCE = "enforce", "Enforce"


class CreditBucketSource(models.TextChoices):
    TRIAL = "trial", "Starter credits"
    SUBSCRIPTION = "subscription", "Subscription allocation"
    TOPUP = "topup", "Purchased top-up"
    ADMIN_GRANT = "admin_grant", "Admin grant"
    REFUND_REVERSAL = "refund_reversal", "Refund reversal"


class CreditTransactionKind(models.TextChoices):
    GRANT = "grant", "Grant"
    DEBIT = "debit", "Debit"
    INBOUND_CHARGE = "inbound_charge", "Inbound charge"
    RELEASE = "release", "Release"
    EXPIRE = "expire", "Expire"
    REVOKE = "revoke", "Revoke"
    ADJUST = "adjust", "Admin adjustment"


class CreditTransactionStatus(models.TextChoices):
    RESERVED = "reserved", "Reserved"
    SETTLED = "settled", "Settled"
    RELEASED = "released", "Released"


class UsageType(models.TextChoices):
    SMS_OUTBOUND = "sms_outbound", "SMS outbound"
    SMS_INBOUND = "sms_inbound", "SMS inbound"
    MMS_OUTBOUND = "mms_outbound", "MMS outbound"
    MMS_INBOUND = "mms_inbound", "MMS inbound"
    WHATSAPP_INBOUND = "whatsapp_conversation_inbound", "WhatsApp inbound conversation"
    WHATSAPP_OUTBOUND = "whatsapp_conversation_outbound", "WhatsApp outbound conversation"
    EMAIL_OUTBOUND = "email_outbound", "Email outbound"
    EMAIL_INBOUND = "email_inbound", "Email inbound"


class CreditPurpose(models.TextChoices):
    DIRECT = "direct", "Direct"
    FOLLOW_UP = "follow_up", "Follow-up"
    AI_REPLY = "ai_reply", "AI reply"
    DEMO = "demo", "Demo"
    CONTROL = "control", "Compliance control"

