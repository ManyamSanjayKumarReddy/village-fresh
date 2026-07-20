import { LegalPage } from "@/components/legal/legal-page";
import { SITE_INFO } from "@/lib/site-info";

export default function TermsAndConditionsPage() {
  return (
    <LegalPage title="Terms & Conditions" updatedAt="20 July 2026">
      <p>
        Welcome to {SITE_INFO.name}. By using this website and placing an
        order, you agree to the terms below.
      </p>

      <h2>Products</h2>
      <p>
        All products are home-made in small batches. Photos are for
        illustration — natural variation in colour, texture and quantity
        between batches is normal and not a defect.
      </p>

      <h2>Orders &amp; delivery</h2>
      <ul>
        <li>Orders are confirmed once payment/COD details are captured at checkout.</li>
        <li>We currently deliver only within serviceable Chennai pincodes.</li>
        <li>Delivery timelines are estimates and may vary.</li>
        <li>Payment is currently Cash on Delivery only.</li>
      </ul>

      <h2>Pricing</h2>
      <p>
        Prices are listed in Indian Rupees (₹) and may change without prior
        notice. The price shown at checkout is the price charged for that
        order.
      </p>

      <h2>Account</h2>
      <p>
        You&apos;re responsible for keeping your account credentials secure
        and for the accuracy of the delivery address and contact details you
        provide.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        We aren&apos;t liable for delays or issues caused by circumstances
        outside our control (weather, transport disruption, etc.). Our
        liability for any order is limited to the value of that order.
      </p>

      <h2>Governing law</h2>
      <p>These terms are governed by the laws of India.</p>

      <h2>Contact us</h2>
      <p>
        Questions about these terms? Email{" "}
        <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a> or call{" "}
        {SITE_INFO.phones.join(" / ")}.
      </p>
    </LegalPage>
  );
}
