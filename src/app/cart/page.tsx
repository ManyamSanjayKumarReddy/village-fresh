import { Navbar } from "@/components/layout/navbar";
import { CartView } from "@/components/cart/cart-view";

export default function CartPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        <h1 className="font-heading text-2xl font-semibold">Your cart</h1>
        <CartView />
      </main>
    </div>
  );
}
