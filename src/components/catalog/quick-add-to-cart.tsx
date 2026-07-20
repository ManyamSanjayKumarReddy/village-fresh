"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPaise } from "@/lib/money";
import { cn } from "@/lib/utils";
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
  variants,
}: {
  productSlug: string;
  productName: string;
  imageUrl?: string;
  variants: QuickAddVariant[];
}) {
  const hydrated = useHydrated();
  const sorted = [...variants].sort((a, b) => a.pricePaise - b.pricePaise);
  const [selectedId, setSelectedId] = useState(sorted[0]?.id);
  const selected = sorted.find((v) => v.id === selectedId) ?? sorted[0];

  const quantity = useCartStore(
    (s) => s.items.find((i) => i.variantId === selected?.id)?.quantity ?? 0,
  );
  const addItem = useCartStore((s) => s.addItem);
  const setQuantity = useCartStore((s) => s.setQuantity);

  if (!selected) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-1.5">
        {sorted.map((v) => (
          <button
            key={v.id}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSelectedId(v.id);
            }}
            className={cn(
              "rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
              v.id === selected.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:border-primary hover:text-primary",
            )}
          >
            {v.label}
          </button>
        ))}
      </div>

      <p className="font-heading text-lg font-semibold text-primary">
        {formatPaise(selected.pricePaise)}
      </p>

      {!hydrated ? (
        <div className="h-8 w-full" />
      ) : quantity === 0 ? (
        <Button
          size="sm"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            addItem({
              variantId: selected.id,
              productSlug,
              productName,
              variantLabel: selected.label,
              pricePaise: selected.pricePaise,
              imageUrl,
              quantity: 1,
              extraSpicy: false,
            });
          }}
        >
          Add
        </Button>
      ) : (
        <div className="flex w-full items-center justify-between rounded-md border border-primary">
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setQuantity(selected.id, quantity - 1);
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
              setQuantity(selected.id, quantity + 1);
            }}
          >
            <Plus className="size-3" />
          </Button>
        </div>
      )}
    </div>
  );
}
