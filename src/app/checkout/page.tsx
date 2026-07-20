import { Navbar } from "@/components/layout/navbar";
import { CheckoutClient } from "@/components/checkout/checkout-client";

export default function CheckoutPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold">Checkout</h1>
        <CheckoutClient />
      </main>
    </div>
  );
}
