import logging

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model

from .models import Notification, NotificationPriority, NotificationType

User = get_user_model()
logger = logging.getLogger(__name__)


class NotificationService:
    """Web-only notification service for dashboard and admin events."""

    @staticmethod
    def send_notification(
        user,
        notification_type: str,
        title: str,
        body: str,
        data: dict = None,
        priority: str = NotificationPriority.NORMAL,
    ):
        notification = Notification.objects.create(
            user=user,
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority,
        )

        ws_success = NotificationService._send_websocket(
            user_id=str(user.id),
            notification_id=str(notification.id),
            notification_type=notification_type,
            title=title,
            body=body,
            data=data or {},
            priority=priority,
            created_at=notification.created_at.isoformat(),
        )

        if ws_success:
            logger.info(f'Notification sent via WebSocket to {user.email}: {notification_type}')
        else:
            logger.warning(f'WebSocket delivery failed for {user.email}: {notification_type}')

        return notification

    @staticmethod
    def _send_websocket(user_id, notification_id, notification_type, title, body, data, priority, created_at):
        try:
            channel_layer = get_channel_layer()
            group_name = f'user_{user_id}'

            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    'type': 'notification_message',
                    'notification_id': notification_id,
                    'notification_type': notification_type,
                    'title': title,
                    'body': body,
                    'data': data,
                    'priority': priority,
                    'created_at': created_at,
                },
            )
            return True
        except Exception as exc:
            logger.error(f'WebSocket send failed for user {user_id}: {str(exc)}')
            return False

    @staticmethod
    def send_to_admins(notification_type, title, body, data=None):
        staff = User.objects.filter(is_staff=True, is_active=True)
        for user in staff:
            NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data,
            )

    @staticmethod
    def send_to_managers(notification_type, title, body, data=None):
        managers = User.objects.filter(is_staff=True, is_superuser=False, is_active=True)
        for user in managers:
            NotificationService.send_notification(
                user=user,
                notification_type=notification_type,
                title=title,
                body=body,
                data=data,
            )


class NotificationTemplates:
    """Restaurant-specific notification templates used by the dashboard and Celery tasks."""

    @staticmethod
    def welcome(user):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.WELCOME,
            title='Welcome to ProfitPlate',
            body=f'Hi {getattr(user, "full_name", None) or user.email}, your account is ready.',
            priority=NotificationPriority.NORMAL,
        )

    @staticmethod
    def system_alert(user, title, body, data=None):
        NotificationService.send_notification(
            user=user,
            notification_type=NotificationType.SYSTEM_ALERT,
            title=title,
            body=body,
            data=data or {},
            priority=NotificationPriority.HIGH,
        )

    @staticmethod
    def new_user_joined(new_user):
        NotificationService.send_to_admins(
            notification_type=NotificationType.NEW_USER,
            title='New user registered',
            body=f'{getattr(new_user, "full_name", None) or new_user.email} joined the platform.',
            data={'user_id': str(new_user.id)},
        )
        
    # TODO: Add more templates for other notification types as needed.

