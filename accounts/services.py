import logging

from django.conf import settings
from django.core.mail import EmailMultiAlternatives
from rest_framework.exceptions import APIException

from sentdm.client import SentDMClient, SentDMClientError


logger = logging.getLogger(__name__)


class OTPDeliveryError(APIException):
    status_code = 503
    default_detail = "We could not deliver the verification code. Please try again shortly."
    default_code = "otp_delivery_failed"


def send_registration_otp_sms(*, phone_number, otp, otp_id):
    profile_id = str(getattr(settings, "SENTDM_SYSTEM_PROFILE_ID", "") or "").strip()
    template_id = str(getattr(settings, "SENTDM_OTP_TEMPLATE_ID", "") or "").strip()
    template_name = str(getattr(settings, "SENTDM_OTP_TEMPLATE_NAME", "") or "").strip()

    if not profile_id:
        raise OTPDeliveryError("Signup SMS is temporarily unavailable because the system Sender Profile is not configured.")
    if not template_id and not template_name:
        raise OTPDeliveryError("Signup SMS is temporarily unavailable because the OTP template is not configured.")

    try:
        return SentDMClient().send_template_message(
            to=phone_number,
            template_id=template_id or None,
            template_name=None if template_id else template_name,
            parameters={"code": otp},
            profile_id=profile_id,
            channels=["sms"],
            idempotency_key=f"chesera-registration-otp-{otp_id}",
        )
    except (SentDMClientError, ValueError) as exc:
        logger.exception("Sent.dm registration OTP delivery failed for OTP id %s", otp_id)
        raise OTPDeliveryError() from exc


def send_login_otp_email(*, email, otp):
    subject = "Your Chesera login code"
    text_body = (
        f"Your Chesera login code is {otp}. It expires in 5 minutes. "
        "Do not share this code. If you did not request it, you can ignore this email."
    )
    html_body = f"""
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#172033">
          <h2 style="margin-bottom:8px">Chesera login verification</h2>
          <p>Use this one-time code to sign in:</p>
          <p style="font-size:30px;font-weight:700;letter-spacing:6px;margin:24px 0">{otp}</p>
          <p>This code expires in 5 minutes. Do not share it with anyone.</p>
          <p style="color:#64748b">If you did not request this code, you can safely ignore this email.</p>
        </div>
    """

    try:
        message = EmailMultiAlternatives(
            subject=subject,
            body=text_body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=[email],
        )
        message.attach_alternative(html_body, "text/html")
        sent_count = message.send(fail_silently=False)
        if sent_count != 1:
            raise RuntimeError("Email backend did not confirm delivery acceptance.")
    except Exception as exc:
        logger.exception("Login OTP email delivery failed")
        raise OTPDeliveryError() from exc
