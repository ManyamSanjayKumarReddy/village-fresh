"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ORDER_STAGE_SEQUENCE, ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";

const STATUSES: OrderStatus[] = [...ORDER_STAGE_SEQUENCE, "cancelled"];

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

    toast.success(`Order #${orderId} marked ${ORDER_STATUS_META[status as OrderStatus]?.label ?? status}.`);
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
              {ORDER_STATUS_META[s].label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button size="sm" disabled={status === currentStatus || saving} onClick={handleSave}>
        {saving && <Spinner />}
        Save
      </Button>
    </div>
  );
}
