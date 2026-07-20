import { cn } from "@/lib/utils";
import { ORDER_STATUS_META, type OrderStatus } from "@/lib/order-status";

export function OrderStatusBadge({ status }: { status: string }) {
  const meta = ORDER_STATUS_META[status as OrderStatus];
  if (!meta) {
    return (
      <span className="rounded-full border px-2.5 py-1 text-xs font-medium capitalize">
        {status}
      </span>
    );
  }

  const Icon = meta.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        meta.badge,
      )}
    >
      <Icon className="size-3.5" />
      {meta.label}
    </span>
  );
}
