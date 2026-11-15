import type { Metadata } from "next";
import LegalPageLayout, { contactEmail } from "@/components/legal/LegalPageLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Ashik International Social Hub",
  description: "How Ashik International Social Hub collects, uses and handles workspace and connected social account information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPageLayout title="Privacy Policy" subtitle="Ashik International Social Hub · Last updated November 15, 2026">
      <section>
        <h2>1. About this policy</h2>
        <p>Ashik International Social Hub at <a href="https://social.ashikinternational.com/">social.ashikinternational.com</a> is a social media management application operated by Ashik International. This policy explains how information is handled when you use the service or connect a social media account.</p>
      </section>
      <section>
        <h2>2. Information we process</h2>
        <ul>
          <li><strong>Workspace account details:</strong> your name, email address, membership, assigned role and related account settings.</li>
          <li><strong>Connected social accounts:</strong> Page or account identifiers, names, available profile and engagement information, connection status and access credentials needed for authorized API access.</li>
          <li><strong>Activity records:</strong> account connections, publishing and moderation actions, message-reply actions and associated timestamps or external identifiers.</li>
          <li><strong>Social content:</strong> posts, comments and Messenger conversations retrieved from connected providers for display and management. The current Messenger interface fetches conversation content from Meta rather than keeping copies of messages in our application database.</li>
          <li><strong>Drafts:</strong> certain text drafts are saved locally in your browser on the device where they were created.</li>
        </ul>
      </section>
      <section>
        <h2>3. How we use information</h2>
        <p>We use information to authenticate authorized users, display connected Pages and conversations, publish content you submit, process permitted replies and moderation actions, provide reports, enforce role permissions, maintain integration connections, investigate errors and protect the service.</p>
      </section>
      <section>
        <h2>4. Social platform integrations</h2>
        <p>When you connect Facebook or another supported service, we request permissions needed for the features you choose. The third-party platform also processes data under its own terms and privacy policy. We do not claim ownership of your connected social accounts or their content.</p>
        <p>Meta access tokens are stored encrypted in the application database. Other integration credentials may be held in secured server configuration. Only authorized workspace users should be given access to social management functions.</p>
      </section>
      <section>
        <h2>5. Information sharing</h2>
        <p>We exchange information with the relevant social platform APIs to perform actions you authorize. We also rely on service providers supporting hosting, databases and application operation. We do not sell workspace or connected social account information to advertisers. Information may be disclosed where required by applicable law or to protect against misuse.</p>
      </section>
      <section>
        <h2>6. Security and retention</h2>
        <p>We use authentication, workspace role permissions and encrypted storage for saved Meta credentials. No internet service can guarantee absolute security. We retain workspace details, connection records and activity logs while needed for operation, security or legitimate recordkeeping, subject to applicable deletion requests and legal obligations.</p>
      </section>
      <section>
        <h2>7. Cookies and local storage</h2>
        <p>The application uses authentication cookies to keep authorized sessions working. Some draft content may be stored in your browser's local storage. You can clear browser storage using your browser settings, but this may sign you out or remove local drafts.</p>
      </section>
      <section>
        <h2>8. Your choices and deletion requests</h2>
        <p>You can disconnect a connected Facebook Page from its Settings screen. You can also revoke the app from your Facebook business integrations. For workspace account deletion, or removal of associated records, see our <Link href="/data-deletion">Data Deletion Instructions</Link>.</p>
        <p>You can request access, correction or deletion of applicable personal data by contacting us. We may need to verify your identity and confirm which workspace or Page you represent before acting.</p>
      </section>
      <section>
        <h2>9. Changes and contact</h2>
        <p>We may update this policy as the application evolves. Changes will be published on this page with a revised update date.</p>
        <p>For privacy questions or requests, email <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
      </section>
    </LegalPageLayout>
  );
}
