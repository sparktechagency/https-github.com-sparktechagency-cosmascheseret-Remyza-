from django.test import SimpleTestCase

from ai.ai_service import AIService


class DummyAIConfiguration:
    model_name = "gpt-test"
    system_prompt = "Only answer questions about active buyer leads."
    temperature = 0.25
    max_tokens = 500
    top_p = 1.0


class DummyBusinessSettings:
    reply_tone = "professional"


class DummyOrganization:
    name = "Example Realty"
    sentdm_legal_name = "Example Realty LLC"
    sentdm_support_email = "support@example.com"
    sentdm_vertical = "REAL_ESTATE"
    sentdm_messaging_use_case = "Lead replies and appointment follow-ups for opted-in real estate leads."
    ai_configuration = DummyAIConfiguration()
    settings = DummyBusinessSettings()


class AICompliancePromptTests(SimpleTestCase):
    def test_system_prompt_contains_sentdm_compliance_rules_and_business_context(self):
        prompt = AIService().build_system_prompt(organization=DummyOrganization())

        self.assertIn("Example Realty LLC", prompt)
        self.assertIn("support@example.com", prompt)
        self.assertIn("REAL_ESTATE", prompt)
        self.assertIn("Lead replies and appointment follow-ups", prompt)
        self.assertIn("Reply STOP to opt out", prompt)
        self.assertIn("Do not use urgency", prompt)
        self.assertIn("Do not use ALL CAPS", prompt)
        self.assertIn("Do not use excessive punctuation", prompt)
        self.assertIn("Do not use link shorteners", prompt)
        self.assertIn("Stay strictly within the approved messaging use case", prompt)
        self.assertIn("Only answer questions about active buyer leads.", prompt)

    def test_fallback_reply_identifies_business_and_includes_stop_language(self):
        result = AIService().generate_reply_and_stage([], organization=DummyOrganization())

        self.assertEqual(result["stage"], "HOT")
        self.assertIn("Example Realty LLC", result["reply"])
        self.assertIn("Reply STOP to opt out", result["reply"])