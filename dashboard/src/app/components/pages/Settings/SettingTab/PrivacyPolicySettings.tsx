import LegalDocumentSettings from "./LegalDocumentSettings";

const privacyPolicyContent = `
  <h2>Privacy Policy</h2>
  <h3>1. Information We Collect</h3>
  <p>We collect information you provide directly to us, such as when you create an account, add contacts, or communicate through our platform. This includes your name, email address, phone number, and business information. We also collect SMS message data that flows through our platform to facilitate lead management.</p>
  <h3>2. How We Use Your Data</h3>
  <p>We use the information we collect to provide, maintain, and improve our services, process transactions, send technical notices and support messages, and respond to your comments and questions. Your data helps power AI features that analyze lead behavior and generate response suggestions.</p>
  <h3>3. SMS Data Handling</h3>
  <p>SMS messages sent and received through your Chesera number are stored securely and used to power AI features. We do not sell message content to third parties.</p>
  <h3>4. Third Party Services</h3>
  <p>We do not share private data with external marketing partners. Selected transaction routes use certified encryption pathways.</p>
`;

export default function PrivacyPolicySettings() {
  return <LegalDocumentSettings title="Privacy Policy" description="Edit the policy content stored in your CKEditor 5 field." initialContent={privacyPolicyContent} publicPath="privacy/" adminPath="admin/privacy/" />;
}
