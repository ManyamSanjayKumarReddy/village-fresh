"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, X } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { formatPaise } from "@/lib/money";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";

export function CartView() {
  const { items, removeItem, setQuantity, totalPaise } = useCartStore();
  const hydrated = useHydrated();

  if (!hydrated) return null;

  if (items.length === 0) {
    return (
      <div className="mt-8 text-center text-muted-foreground">
        <p>Nothing in your cart yet.</p>
        <Link href="/" className={buttonVariants({ variant: "link" })}>
          Start shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {items.map((item) => (
        <div key={item.variantId} className="flex items-center gap-4 rounded-xl border bg-card p-4">
          <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
            {item.imageUrl && (
              <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" />
            )}
          </div>
          <div className="flex-1">
            <Link href={`/product/${item.productSlug}`} className="font-medium hover:text-primary">
              {item.productName}
            </Link>
            <p className="text-sm text-muted-foreground">{item.variantLabel}</p>
            <p className="text-sm font-medium text-primary">{formatPaise(item.pricePaise)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(item.variantId, item.quantity - 1)}
            >
              <Minus className="size-3" />
            </Button>
            <span className="w-6 text-center">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(item.variantId, item.quantity + 1)}
            >
              <Plus className="size-3" />
            </Button>
          </div>
          <Button variant="ghost" size="icon" aria-label="Remove item" onClick={() => removeItem(item.variantId)}>
            <X className="size-4" />
          </Button>
        </div>
      ))}

      <div className="mt-4 flex items-center justify-between rounded-xl border bg-card p-4">
        <span className="font-medium">Subtotal</span>
        <span className="font-heading text-lg font-semibold">{formatPaise(totalPaise())}</span>
      </div>

      <Link href="/checkout" className={buttonVariants({ size: "lg" })}>
        Checkout
      </Link>
    </div>
  );
}
