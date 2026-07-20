"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function CouponToggle({ couponId, value }: { couponId: number; value: boolean }) {
  const router = useRouter();
  const [checked, setChecked] = useState(value);
  const [saving, setSaving] = useState(false);

  async function handleChange(next: boolean) {
    setChecked(next);
    setSaving(true);
    const res = await fetch(`/api/v1/admin/coupons/${couponId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: next }),
    });
    setSaving(false);

    if (!res.ok) {
      setChecked(!next);
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not update coupon.");
      return;
    }

    router.refresh();
  }

  return (
    <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
      <input
        type="checkbox"
        checked={checked}
        disabled={saving}
        onChange={(e) => handleChange(e.target.checked)}
      />
      Active
    </label>
  );
}
