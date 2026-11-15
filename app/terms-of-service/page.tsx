import type { Metadata } from "next";
import LegalPageLayout, { contactEmail } from "@/components/legal/LegalPageLayout";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | Ashik International Social Hub",
  description: "Terms governing access to and use of Ashik International Social Hub.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPageLayout title="Terms of Service" subtitle="Ashik International Social Hub · Last updated November 15, 2026">
      <section>
        <h2>1. Using the service</h2>
        <p>These terms apply to your use of Ashik International Social Hub at <a href="https://social.ashikinternational.com/">social.ashikinternational.com</a>. The service provides tools to connect authorized social media accounts, manage content and interactions, and view available reporting information.</p>
        <p>By using the service, you agree to these terms and our <Link href="/privacy-policy">Privacy Policy</Link>.</p>
      </section>
      <section>
        <h2>2. Accounts and authorized use</h2>
        <p>You must use an account you are authorized to access, provide accurate account information, protect your login credentials and comply with the permissions assigned to your workspace role. You are responsible for activity conducted through your authorized account.</p>
        <p>Only connect social media Pages, business assets and accounts you own or have permission to manage.</p>
      </section>
      <section>
        <h2>3. Connected platforms and permissions</h2>
        <p>Facebook, Instagram and other integrated platforms are independent third-party services. Your use of their APIs and products must comply with their applicable terms, policies and usage restrictions. Availability of publishing, messaging, advertising and reporting features depends on the permissions, approvals and limits imposed by those platforms.</p>
      </section>
      <section>
        <h2>4. Content and communications</h2>
        <p>You retain responsibility for the content you publish and messages you send using the service. You must not publish illegal, misleading, abusive or infringing material, send unauthorized spam, or use the application to violate privacy rights or platform rules.</p>
        <p>Sending, publishing or scheduling an action through the service may cause a real change on the connected social platform. Review the destination, content and intended audience before confirming an action.</p>
      </section>
      <section>
        <h2>5. Workspace roles and access</h2>
        <p>Workspace administrators can assign and revoke user access and permissions. We may restrict or suspend access where necessary to protect the service, its users or connected accounts, or to comply with applicable obligations.</p>
      </section>
      <section>
        <h2>6. Service availability</h2>
        <p>Features may be updated, interrupted or unavailable because of maintenance, provider outages, permission changes, rate limits or integration requirements. We do not guarantee uninterrupted operation or the delivery, approval or publication of content by a third-party platform.</p>
      </section>
      <section>
        <h2>7. Disclaimer and responsibility</h2>
        <p>The service is provided on an as-available basis to the extent permitted by applicable law. You remain responsible for reviewing your published content, advertising budgets, business communications and compliance with relevant laws and platform policies. Nothing in these terms excludes rights or liabilities that cannot lawfully be excluded.</p>
      </section>
      <section>
        <h2>8. Ending access and deleting data</h2>
        <p>You can stop using the service and disconnect supported social accounts. Revoking authorization through a third-party platform may also stop integration access. For the removal of associated workspace records, follow our <Link href="/data-deletion">Data Deletion Instructions</Link>.</p>
      </section>
      <section>
        <h2>9. Changes and contact</h2>
        <p>These terms may be updated as the service evolves. Continued use after updated terms are published is subject to applicable law and any required notice or consent.</p>
        <p>For questions about these terms, contact <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</p>
      </section>
    </LegalPageLayout>
  );
}
