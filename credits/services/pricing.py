import math

from credits.models import CreditSettings, WhatsAppConversationWindow


GSM_BASIC = set(
    "@\u00a3$\u00a5\u00e8\u00e9\u00f9\u00ec\u00f2\u00c7\n\u00d8\u00f8\r\u00c5\u00e5\u0394_\u03a6\u0393\u039b\u03a9\u03a0\u03a8\u03a3\u0398\u039e\u00c6\u00e6\u00df\u00c9 !\"#\u00a4%&'()*+,-./0123456789:;<=>?"
    "\u00a1ABCDEFGHIJKLMNOPQRSTUVWXYZ\u00c4\u00d6\u00d1\u00dc\u00a7\u00bfabcdefghijklmnopqrstuvwxyz\u00e4\u00f6\u00f1\u00fc\u00e0"
)
GSM_EXTENDED = set("^{}\\[~]|\u20ac\f")


def sms_segments(text, mode="carrier"):
    text = text or ""
    if not text:
        return {"encoding": "GSM-7", "units": 0, "segments": 0}
    if mode == "fixed_160":
        return {"encoding": "fixed-160", "units": len(text), "segments": math.ceil(len(text) / 160)}
    is_gsm = all(char in GSM_BASIC or char in GSM_EXTENDED for char in text)
    if is_gsm:
        units = sum(2 if char in GSM_EXTENDED else 1 for char in text)
        single, concat, encoding = 160, 153, "GSM-7"
    else:
        units = len(text.encode("utf-16-be")) // 2
        single, concat, encoding = 70, 67, "UCS-2"
    segments = 1 if units <= single else math.ceil(units / concat)
    return {"encoding": encoding, "units": units, "segments": segments}


def estimate_message_cost(*, text, channel, has_media=False, account=None, to=""):
    settings_obj = CreditSettings.get_solo()
    channel = (channel or "sms").lower()
    if channel in {"sms", "rcs", "auto"}:
        if has_media:
            return {
                "channel": "mms", "encoding": None, "units": 1, "segments": 1,
                "credits": settings_obj.mms_outbound, "whatsapp_window_open": False,
            }
        details = sms_segments(text, settings_obj.sms_segment_mode)
        return {
            "channel": "sms" if channel == "auto" else channel,
            **details,
            "credits": details["segments"] * settings_obj.sms_outbound_per_segment,
            "whatsapp_window_open": False,
        }
    if channel == "whatsapp":
        window_open = False
        if account and to:
            from django.utils import timezone

            window_open = WhatsAppConversationWindow.objects.filter(
                account=account, contact_e164=to, expires_at__gt=timezone.now()
            ).exists()
        return {
            "channel": "whatsapp", "encoding": None, "units": 1, "segments": 1,
            "credits": 0 if window_open else settings_obj.whatsapp_outbound_conversation,
            "whatsapp_window_open": window_open,
        }
    if channel == "email":
        return {
            "channel": "email", "encoding": None, "units": 1, "segments": 1,
            "credits": settings_obj.email_outbound, "whatsapp_window_open": False,
        }
    raise ValueError("Unsupported messaging channel.")
