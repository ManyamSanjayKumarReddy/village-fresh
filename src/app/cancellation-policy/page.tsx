import { LegalPage } from "@/components/legal/legal-page";
import { SITE_INFO } from "@/lib/site-info";

export default function CancellationPolicyPage() {
  return (
    <LegalPage title="Cancellation Policy" updatedAt="20 July 2026">
      <p>
        Orders on {SITE_INFO.name} are prepared fresh in small batches once
        confirmed. Because of this, we currently do not offer order
        cancellations once an order has been placed and confirmed.
      </p>

      <h2>Need help with an order?</h2>
      <p>
        If you placed an order by mistake or need to discuss a change, reach
        out as soon as possible at{" "}
        <a href={`mailto:${SITE_INFO.email}`}>{SITE_INFO.email}</a> or call{" "}
        {SITE_INFO.phones.join(" / ")}. If your order hasn&apos;t been packed
        yet, we&apos;ll try our best to help — but we can&apos;t guarantee a
        cancellation once preparation has started.
      </p>
    </LegalPage>
  );
}
