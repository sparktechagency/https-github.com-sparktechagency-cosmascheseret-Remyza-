import LegalDocumentSettings from "./LegalDocumentSettings";

const termsOfServiceContent = `
  <h2>Terms of Service</h2>
  <h3>1. Acceptance of Terms</h3>
  <p>By accessing or using Chesera, you agree to be bound by these Terms of Service and our Privacy Policy. If you disagree with any part of the terms, you may not access the service.</p>
  <h3>2. Use of Service</h3>
  <p>You may use Chesera for lawful purposes only. You agree not to use the service in any way that violates applicable laws or regulations, or that could harm the service or interfere with any other party's use.</p>
  <h3>3. SMS Messaging Compliance</h3>
  <p>You are responsible for ensuring SMS messaging activities comply with applicable laws, including consent requirements before messaging contacts.</p>
  <h3>4. Prohibited Uses</h3>
  <p>You may not use Chesera to send spam, unsolicited messages, or illegal content, or to impersonate any person or entity.</p>
`;

export default function TermsOfServiceSettings() {
  return <LegalDocumentSettings title="Terms of Service" description="Edit the terms content stored in your CKEditor 5 field." initialContent={termsOfServiceContent} publicPath="terms/" adminPath="admin/terms/" />;
}
