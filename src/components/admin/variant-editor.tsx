"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function VariantEditor({
  variantId,
  label,
  pricePaise,
  stockQty,
  isActive,
}: {
  variantId: number;
  label: string;
  pricePaise: number;
  stockQty: number;
  isActive: boolean;
}) {
  const router = useRouter();
  const [price, setPrice] = useState(String(pricePaise / 100));
  const [stock, setStock] = useState(String(stockQty));
  const [active, setActive] = useState(isActive);
  const [saving, setSaving] = useState(false);

  const dirty =
    Number(price) * 100 !== pricePaise || Number(stock) !== stockQty || active !== isActive;

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/v1/admin/variants/${variantId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pricePaise: Math.round(Number(price) * 100),
        stockQty: Number(stock),
        isActive: active,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not update variant.");
      return;
    }

    toast.success(`${label} updated.`);
    router.refresh();
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2 text-sm">
      <span className="w-16 shrink-0 font-medium">{label}</span>
      <span className="text-muted-foreground">₹</span>
      <Input
        className="h-8 w-20"
        inputMode="decimal"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />
      <span className="text-muted-foreground">Stock</span>
      <Input
        className="h-8 w-16"
        inputMode="numeric"
        value={stock}
        onChange={(e) => setStock(e.target.value)}
      />
      <label className="flex items-center gap-1 text-muted-foreground">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} />
        Active
      </label>
      <Button size="sm" disabled={!dirty || saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
