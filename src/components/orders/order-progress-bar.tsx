import { cn } from "@/lib/utils";
import { ORDER_STAGE_SEQUENCE, getStageIndex, type OrderStatus } from "@/lib/order-status";

export function OrderProgressBar({ status }: { status: string }) {
  if (status === "cancelled") {
    return <div className="h-1.5 w-full rounded-full bg-red-200 dark:bg-red-500/20" />;
  }

  const currentIndex = getStageIndex(status as OrderStatus);

  return (
    <div className="flex w-full gap-1">
      {ORDER_STAGE_SEQUENCE.map((stage, i) => (
        <div
          key={stage}
          className={cn(
            "h-1.5 flex-1 rounded-full transition-colors",
            i <= currentIndex ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}
