"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STATUSES = [
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

export function OrderStatusUpdater({
  orderId,
  currentStatus,
}: {
  orderId: number;
  currentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/v1/admin/orders/${orderId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      toast.error(body?.error?.message ?? "Could not update status.");
      return;
    }

    toast.success(`Order #${orderId} marked ${status.replace(/_/g, " ")}.`);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={status} onValueChange={(value) => value && setStatus(value)}>
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {s.replace(/_/g, " ")}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={status === currentStatus || saving} onClick={handleSave}>
        {saving ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
