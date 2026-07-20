import { Badge } from "@/components/ui/badge";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_VARIANTS: Record<string, "secondary" | "default" | "destructive" | "outline"> = {
  pending: "outline",
  confirmed: "default",
  packed: "default",
  shipped: "default",
  out_for_delivery: "default",
  delivered: "secondary",
  cancelled: "destructive",
};

export function OrderStatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANTS[status] ?? "outline"}>
      {STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
