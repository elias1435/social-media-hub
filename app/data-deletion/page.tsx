import type { Metadata } from "next";
import LegalPageLayout, { contactEmail } from "@/components/legal/LegalPageLayout";

export const metadata: Metadata = {
  title: "Data Deletion Instructions | Ashik International Social Hub",
  description: "Instructions to disconnect Facebook Pages, revoke access, or request deletion of Social Media Hub account data.",
};

export default function DataDeletionPage() {
  return (
    <LegalPageLayout title="Data Deletion Instructions" subtitle="Ashik International Social Hub (social.ashikinternational.com)">
      <section>
        <h2>What data we store</h2>
        <ul>
          <li>Your workspace account information (name, email and role).</li>
          <li>Connected Facebook Page details (Page ID and name) and saved access tokens, encrypted at rest using AES-256-GCM.</li>
          <li>Activity logs of actions performed in the workspace (for example, connecting a Page or sending a message).</li>
        </ul>
        <p>Messenger conversations, comments and posts are fetched from Meta when you view them. We do not store the contents of those Messenger conversations in our application database.</p>
      </section>
      <section>
        <h2>Option 1: Disconnect a Page yourself</h2>
        <ol>
          <li>Sign in to Social Media Hub.</li>
          <li>Open <strong>Facebook Pages</strong> and choose the Page.</li>
          <li>Open <strong>Settings</strong>, then choose <strong>Disconnect Page</strong> and confirm. The stored access token for that Page is cleared when the disconnect completes.</li>
        </ol>
        <p>Disconnecting a Page stops our application from using its stored token. Your workspace account and existing activity records are not deleted by this action.</p>
      </section>
      <section>
        <h2>Option 2: Remove the app from Facebook</h2>
        <ol>
          <li>On Facebook, open <strong>Settings &amp; privacy → Settings → Business integrations</strong> (the menu label may vary).</li>
          <li>Find <strong>Ashik International Social Hub</strong> and select <strong>Remove</strong>.</li>
          <li>This revokes Facebook authorization. To have associated records removed from our application, also submit a deletion request below.</li>
        </ol>
      </section>
      <section>
        <h2>Option 3: Request full deletion</h2>
        <p>Email <a href={`mailto:${contactEmail}?subject=Data%20deletion%20request`}>{contactEmail}</a> with the subject <strong>Data deletion request</strong>. Include the email address associated with your workspace or the Facebook Page you connected.</p>
        <p>We will verify your request, delete the applicable account, connected Pages, saved tokens and related logs within 30 days, and confirm by email. If some records must be retained for legal or security reasons, we will explain the applicable exception.</p>
        <p>For your security, do not email passwords or Facebook access tokens.</p>
      </section>
    </LegalPageLayout>
  );
}
