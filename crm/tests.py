from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import User
from business.models import Organization
from communications.choices import ConversationStatus, MessageDirection, MessageStatus
from communications.models import Conversation, Message
from crm.choices import LeadActivityType, LeadSource, LeadStage
from crm.models import Lead, LeadActivity


class LeadContactAPITests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            phone_number="+15550000001",
            password="pass12345",
            email="owner@example.com",
        )
        self.organization = Organization.objects.create(owner=self.user, name="Chesera Test", email="owner@example.com")
        self.client = APIClient()
        self.client.force_authenticate(self.user)

    def response_items(self, response):
        data = response.json()
        if isinstance(data, dict) and "results" in data:
            return data["results"]
        return data

    def test_manual_contact_create_records_lead_activity(self):
        response = self.client.post(
            "/api/v1/leads/",
            {
                "full_name": "Jane Smith",
                "contact_number": "+15551112222",
                "email": "jane@example.com",
                "business_name": "Jane Homes",
                "notes": "Met at open house.",
                "stage": LeadStage.WARM,
            },
            format="json",
        )

        self.assertEqual(response.status_code, 201, response.content)
        lead = Lead.objects.get(contact_number="+15551112222")
        self.assertEqual(lead.organization, self.organization)
        self.assertEqual(lead.company, "Jane Homes")
        self.assertEqual(lead.source, LeadSource.MANUAL)
        self.assertIsNone(lead.business_phone)
        self.assertTrue(lead.activities.filter(activity_type=LeadActivityType.CREATED, title="Lead created").exists())

    def test_csv_upload_creates_contacts_and_returns_duplicates(self):
        Lead.objects.create(
            organization=self.organization,
            full_name="Existing Lead",
            contact_number="+15553334444",
            source=LeadSource.MANUAL,
        )
        csv_content = (
            "full_name,phone_number,email,business_name,notes\n"
            "New Lead,+15552223333,new@example.com,New Co,Fresh lead\n"
            "Duplicate Existing,+15553334444,dup@example.com,Dup Co,Already saved\n"
            "Duplicate In File,+15552223333,dup2@example.com,Dup File,Repeated\n"
            "Missing Phone,,bad@example.com,Bad Co,No phone\n"
        )
        upload = SimpleUploadedFile("contacts.csv", csv_content.encode("utf-8"), content_type="text/csv")

        response = self.client.post("/api/v1/leads/upload-csv/", {"file": upload}, format="multipart")

        self.assertEqual(response.status_code, 200, response.content)
        data = response.json()
        self.assertEqual(data["created_count"], 1)
        self.assertEqual(data["duplicate_count"], 2)
        self.assertEqual(data["error_count"], 1)
        self.assertEqual(Lead.objects.get(contact_number="+15552223333").source, LeadSource.CSV_UPLOAD)
        self.assertEqual({item["contact_number"] for item in data["duplicates"]}, {"+15553334444", "+15552223333"})

    def test_lead_stats_and_stage_filter_groups_hot_warm_cold(self):
        Lead.objects.create(organization=self.organization, contact_number="+15550000002", stage=LeadStage.HOT)
        Lead.objects.create(organization=self.organization, contact_number="+15550000003", stage=LeadStage.WARM)
        Lead.objects.create(organization=self.organization, contact_number="+15550000004", stage=LeadStage.QUALIFIED)
        Lead.objects.create(organization=self.organization, contact_number="+15550000005", stage=LeadStage.COLD)
        Lead.objects.create(organization=self.organization, contact_number="+15550000006", stage=LeadStage.NEW)

        stats_response = self.client.get("/api/v1/leads/stats/")
        self.assertEqual(stats_response.status_code, 200, stats_response.content)
        self.assertEqual(stats_response.json()["hot"], 1)
        self.assertEqual(stats_response.json()["warm"], 2)
        self.assertEqual(stats_response.json()["cold"], 2)

        warm_response = self.client.get("/api/v1/leads/?stage=warm")
        self.assertEqual(warm_response.status_code, 200, warm_response.content)
        self.assertEqual(len(self.response_items(warm_response)), 2)

    def test_lead_detail_includes_conversation_metrics_and_activities(self):
        lead = Lead.objects.create(
            organization=self.organization,
            full_name="Conversation Lead",
            contact_number="+15554445555",
            source=LeadSource.AUTO_CAPTURE,
            score=75,
        )
        LeadActivity.objects.create(
            lead=lead,
            activity_type=LeadActivityType.CREATED,
            title="Lead created",
            description="Auto captured.",
        )
        conversation = Conversation.objects.create(
            organization=self.organization,
            lead=lead,
            status=ConversationStatus.ACTIVE,
        )
        Message.objects.create(
            lead=lead,
            conversation=conversation,
            direction=MessageDirection.INBOUND,
            sender="+15554445555",
            recipient="+15550000001",
            content="Hello",
            provider_message_sid="msg-in-1",
            status=MessageStatus.DELIVERED,
        )
        Message.objects.create(
            lead=lead,
            conversation=conversation,
            direction=MessageDirection.OUTBOUND,
            sender="+15550000001",
            recipient="+15554445555",
            content="Hi there",
            provider_message_sid="msg-out-1",
            status=MessageStatus.SENT,
            is_ai_generated=True,
        )

        response = self.client.get(f"/api/v1/leads/{lead.id}/")

        self.assertEqual(response.status_code, 200, response.content)
        data = response.json()
        self.assertEqual(data["score_percentage"], 75)
        self.assertEqual(data["total_messages"], 2)
        self.assertEqual(data["response_rate"], 100)
        self.assertEqual(len(data["conversation"]), 2)
        self.assertEqual(data["activities"][0]["title"], "Lead created")