"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPaise } from "@/lib/money";
import { useCartStore } from "@/store/cart-store";

type Variant = {
  id: number;
  label: string;
  pricePaise: number;
  stockQty: number;
};

export function AddToCart({
  productSlug,
  productName,
  imageUrl,
  variants,
}: {
  productSlug: string;
  productName: string;
  imageUrl?: string;
  variants: Variant[];
}) {
  const inStockVariants = variants.filter((v) => v.stockQty > 0);
  const [variantId, setVariantId] = useState<number | undefined>(
    inStockVariants[0]?.id,
  );
  const [extraSpicy, setExtraSpicy] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  const selected = variants.find((v) => v.id === variantId);

  if (variants.length === 0) {
    return <p className="text-muted-foreground">Currently unavailable.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      <Select
        value={variantId ? String(variantId) : undefined}
        onValueChange={(value) => value && setVariantId(Number(value))}
      >
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Choose a size" />
        </SelectTrigger>
        <SelectContent>
          {variants.map((v) => (
            <SelectItem key={v.id} value={String(v.id)} disabled={v.stockQty === 0}>
              {v.label} — {formatPaise(v.pricePaise)}
              {v.stockQty === 0 ? " (out of stock)" : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <label className="flex items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={extraSpicy}
          onChange={(e) => setExtraSpicy(e.target.checked)}
        />
        Make it extra spicy 🌶️
      </label>

      <Button
        disabled={!selected}
        onClick={() => {
          if (!selected) return;
          addItem({
            variantId: selected.id,
            productSlug,
            productName,
            variantLabel: selected.label,
            pricePaise: selected.pricePaise,
            imageUrl,
            quantity: 1,
            extraSpicy,
          });
          toast.success(`Added ${productName} (${selected.label}) to cart`);
        }}
      >
        Add to cart
      </Button>
    </div>
  );
}
