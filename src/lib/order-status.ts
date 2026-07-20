import {
  Clock,
  CircleCheck,
  PackageCheck,
  Truck,
  MapPinned,
  PartyPopper,
  CircleX,
  type LucideIcon,
} from "lucide-react";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/**
 * Linear happy-path order of stages shown in the timeline; "cancelled" is a
 * separate terminal branch. "pending" is a valid enum value (reserved for a
 * future online-payment-awaiting state) but orders are created straight into
 * "confirmed" today (COD only), so it's never a real stage to display.
 */
export const ORDER_STAGE_SEQUENCE: OrderStatus[] = [
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
];

type StatusMeta = {
  label: string;
  icon: LucideIcon;
  /** Tailwind classes for the solid "reached this stage" state. */
  solid: string;
  /** Tailwind classes for badges/pills. */
  badge: string;
};

export const ORDER_STATUS_META: Record<OrderStatus, StatusMeta> = {
  pending: {
    label: "Pending",
    icon: Clock,
    solid: "bg-amber-500 text-white border-amber-500",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  confirmed: {
    label: "Confirmed",
    icon: CircleCheck,
    solid: "bg-blue-500 text-white border-blue-500",
    badge: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  },
  packed: {
    label: "Packed",
    icon: PackageCheck,
    solid: "bg-violet-500 text-white border-violet-500",
    badge: "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-500/15 dark:text-violet-300 dark:border-violet-500/30",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    solid: "bg-cyan-500 text-white border-cyan-500",
    badge: "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-300 dark:border-cyan-500/30",
  },
  out_for_delivery: {
    label: "Out for delivery",
    icon: MapPinned,
    solid: "bg-orange-500 text-white border-orange-500",
    badge: "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-500/15 dark:text-orange-300 dark:border-orange-500/30",
  },
  delivered: {
    label: "Delivered",
    icon: PartyPopper,
    solid: "bg-green-600 text-white border-green-600",
    badge: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
  },
  cancelled: {
    label: "Cancelled",
    icon: CircleX,
    solid: "bg-red-600 text-white border-red-600",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
  },
};

export function getStageIndex(status: OrderStatus): number {
  return ORDER_STAGE_SEQUENCE.indexOf(status);
}
