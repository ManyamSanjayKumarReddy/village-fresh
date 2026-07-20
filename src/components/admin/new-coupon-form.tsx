"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function NewCouponForm() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [code, setCode] = useState("");
  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "flat">("percentage");
  const [discountValue, setDiscountValue] = useState("");
  const [minOrder, setMinOrder] = useState("");
  const [maxDiscount, setMaxDiscount] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [maxRedemptions, setMaxRedemptions] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const res = await fetch("/api/v1/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        title,
        discountType,
        discountValue: Number(discountValue),
        minOrderSubtotalPaise: minOrder ? Math.round(Number(minOrder) * 100) : 0,
        maxDiscountPaise:
          discountType === "percentage" && maxDiscount
            ? Math.round(Number(maxDiscount) * 100)
            : undefined,
        startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
        endsAt: endsAt ? new Date(endsAt).toISOString() : undefined,
        maxRedemptions: maxRedemptions ? Number(maxRedemptions) : undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not create coupon.");
      return;
    }

    toast.success(`${code.toUpperCase()} created.`);
    setCode("");
    setTitle("");
    setDiscountValue("");
    setMinOrder("");
    setMaxDiscount("");
    setStartsAt("");
    setEndsAt("");
    setMaxRedemptions("");
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex max-w-md flex-col gap-4 rounded-xl border bg-card p-4"
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coupon-title">Sale name</Label>
        <Input
          id="coupon-title"
          placeholder="Diwali Sale"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="coupon-code">Coupon code</Label>
        <Input
          id="coupon-code"
          placeholder="DIWALI20"
          required
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discount-type">Discount type</Label>
          <Select value={discountType} onValueChange={(v) => v && setDiscountType(v as "percentage" | "flat")}>
            <SelectTrigger id="discount-type">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="percentage">Percentage off</SelectItem>
              <SelectItem value="flat">Flat amount off</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="discount-value">
            {discountType === "percentage" ? "Percent (%)" : "Amount (₹)"}
          </Label>
          <Input
            id="discount-value"
            required
            inputMode="decimal"
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="min-order">Min order (₹, optional)</Label>
          <Input
            id="min-order"
            inputMode="decimal"
            value={minOrder}
            onChange={(e) => setMinOrder(e.target.value)}
          />
        </div>
        {discountType === "percentage" && (
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="max-discount">Max discount (₹, optional)</Label>
            <Input
              id="max-discount"
              inputMode="decimal"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="starts-at">Starts (optional)</Label>
          <Input
            id="starts-at"
            type="datetime-local"
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="ends-at">Ends (optional)</Label>
          <Input
            id="ends-at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="max-redemptions">Usage limit (optional, total uses)</Label>
        <Input
          id="max-redemptions"
          inputMode="numeric"
          value={maxRedemptions}
          onChange={(e) => setMaxRedemptions(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={saving}>
        {saving && <Spinner />}
        {saving ? "Creating..." : "Create coupon"}
      </Button>
    </form>
  );
}
