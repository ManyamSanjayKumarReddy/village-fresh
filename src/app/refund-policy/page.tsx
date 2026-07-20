import { LegalPage } from "@/components/legal/legal-page";
import { SITE_INFO } from "@/lib/site-info";

export default function RefundPolicyPage() {
  return (
    <LegalPage title="Refund Policy" updatedAt="20 July 2026">
      <p>
        All our products are fresh, home-made in small batches, and prepared
        specifically against orders placed. Because of this, we currently do
        not offer refunds once an order has been confirmed.
      </p>

      <h2>Damaged or incorrect items</h2>
      <p>
        If your order arrives damaged, spoiled in transit, or you receive the
        wrong item, please contact us within 24 hours of delivery at{" "}
        <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a> or call{" "}
        {SITE_INFO.phones.join(" / ")}, with a photo of the item. We will
        review each case individually and do our best to make it right.
      </p>

      <h2>Payment</h2>
      <p>
        We currently accept Cash on Delivery only, so no online refund
        process applies at this time.
      </p>
    </LegalPage>
  );
}
