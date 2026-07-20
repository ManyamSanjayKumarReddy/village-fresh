"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";

export function AddVariantForm({ productId }: { productId: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [label, setLabel] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        + Add size
      </Button>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setSaving(true);

        const res = await fetch(`/api/v1/admin/products/${productId}/variants`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            label,
            pricePaise: Math.round(Number(price) * 100),
            stockQty: Number(stock),
          }),
        });

        setSaving(false);

        if (!res.ok) {
          const body = await res.json().catch(() => null);
          toast.error(body?.error?.message ?? "Could not add size.");
          return;
        }

        toast.success(`${label} added.`);
        setLabel("");
        setPrice("");
        setStock("");
        setOpen(false);
        router.refresh();
      }}
      className="flex flex-wrap items-center gap-2"
    >
      <Input
        placeholder="Label (e.g. 1kg)"
        required
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="h-8 w-28"
      />
      <Input
        placeholder="Price ₹"
        required
        inputMode="decimal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
        className="h-8 w-24"
      />
      <Input
        placeholder="Stock"
        required
        inputMode="numeric"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
        className="h-8 w-20"
      />
      <Button type="submit" size="sm" disabled={saving}>
        {saving && <Spinner />}
        Save
      </Button>
      <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
        Cancel
      </Button>
    </form>
  );
}
