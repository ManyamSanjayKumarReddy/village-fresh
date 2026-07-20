"use client";

import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/store/cart-store";
import { useHydrated } from "@/store/use-hydrated";

type QuickAddVariant = {
  id: number;
  label: string;
  pricePaise: number;
};

export function QuickAddToCart({
  productSlug,
  productName,
  imageUrl,
  variant,
}: {
  productSlug: string;
  productName: string;
  imageUrl?: string;
  variant: QuickAddVariant;
}) {
  const hydrated = useHydrated();
  const quantity = useCartStore(
    (s) => s.items.find((i) => i.variantId === variant.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  if (!hydrated) {
    return <div className="h-8 w-full" />;
  }

  if (quantity === 0) {
    return (
      <Button
        size="sm"
        className="w-full"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          addItem({
            variantId: variant.id,
            productSlug,
            productName,
            variantLabel: variant.label,
            pricePaise: variant.pricePaise,
            imageUrl,
            quantity: 1,
          });
        }}
      >
        Add
      </Button>
    );
  }

  return (
    <div className="flex w-full items-center justify-between rounded-md border border-primary">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setQuantity(variant.id, quantity - 1);
        }}
      >
        <Minus className="size-3" />
      </Button>
      <span className="text-sm font-medium">{quantity}</span>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 shrink-0"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setQuantity(variant.id, quantity + 1);
        }}
      >
        <Plus className="size-3" />
      </Button>
    </div>
  );
}
