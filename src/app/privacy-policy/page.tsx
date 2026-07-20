import { LegalPage } from "@/components/legal/legal-page";
import { SITE_INFO } from "@/lib/site-info";

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updatedAt="20 July 2026">
      <p>
        This policy explains what information {SITE_INFO.name} collects when
        you use this website, and how it&apos;s used. We collect only what we
        need to take and deliver your order.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>Name, email address, and phone number when you create an account.</li>
        <li>Delivery address and phone number when you place an order.</li>
        <li>Order history and order status.</li>
        <li>
          Cart contents, stored in your browser (localStorage) while you shop
          as a guest — this stays on your device until you sign in to check
          out.
        </li>
      </ul>

      <h2>How we use it</h2>
      <ul>
        <li>To process, pack and deliver your orders.</li>
        <li>To contact you about an order (delivery updates, issues).</li>
        <li>To maintain your account and order history.</li>
      </ul>

      <h2>What we don&apos;t do</h2>
      <p>
        We do not sell or rent your personal information to any third party.
        We do not use your data for advertising.
      </p>

      <h2>Data storage</h2>
      <p>
        Your data is stored securely with our database provider (Neon,
        hosted on AWS). Passwords are never stored in plain text.
      </p>

      <h2>Contact us</h2>
      <p>
        For any privacy-related questions or to request that we delete your
        account data, email us at{" "}
        <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a> or call{" "}
        {SITE_INFO.phones.join(" / ")}.
      </p>
    </LegalPage>
  );
}
