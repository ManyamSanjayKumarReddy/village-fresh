import { cn } from "@/lib/utils";
import {
  ORDER_STAGE_SEQUENCE,
  ORDER_STATUS_META,
  getStageIndex,
  type OrderStatus,
} from "@/lib/order-status";

type StatusHistoryEntry = {
  id: number;
  status: string;
  note: string | null;
  changedAt: Date | string;
};

export function OrderTimeline({
  currentStatus,
  statusHistory,
}: {
  currentStatus: string;
  statusHistory: StatusHistoryEntry[];
}) {
  if (currentStatus === "cancelled") {
    return (
      <ol className="flex flex-col gap-0">
        {statusHistory.map((entry, i) => (
          <TimelineRow
            key={entry.id}
            status={entry.status as OrderStatus}
            note={entry.note}
            timestamp={entry.changedAt}
            isLast={i === statusHistory.length - 1}
            reached
          />
        ))}
      </ol>
    );
  }

  const currentIndex = getStageIndex(currentStatus as OrderStatus);
  const historyByStatus = new Map(statusHistory.map((h) => [h.status, h]));

  return (
    <ol className="flex flex-col gap-0">
      {ORDER_STAGE_SEQUENCE.map((stage, i) => {
        const entry = historyByStatus.get(stage);
        const reached = i <= currentIndex;
        return (
          <TimelineRow
            key={stage}
            status={stage}
            note={entry?.note ?? null}
            timestamp={entry?.changedAt}
            isLast={i === ORDER_STAGE_SEQUENCE.length - 1}
            reached={reached}
            current={i === currentIndex}
          />
        );
      })}
    </ol>
  );
}

function TimelineRow({
  status,
  note,
  timestamp,
  isLast,
  reached,
  current,
}: {
  status: OrderStatus;
  note?: string | null;
  timestamp?: Date | string;
  isLast: boolean;
  reached: boolean;
  current?: boolean;
}) {
  const meta = ORDER_STATUS_META[status];
  const Icon = meta.icon;

  return (
    <li className="relative flex gap-4 pb-8 last:pb-0">
      {!isLast && (
        <span
          className={cn(
            "absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5",
            reached ? "bg-primary/40" : "bg-border",
          )}
        />
      )}
      <span
        className={cn(
          "relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border-2",
          reached ? meta.solid : "border-border bg-background text-muted-foreground",
          current && "ring-4 ring-primary/20",
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="pt-1">
        <p className={cn("font-medium", !reached && "text-muted-foreground")}>{meta.label}</p>
        {note && <p className="mt-0.5 text-sm text-muted-foreground">{note}</p>}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {timestamp
            ? new Date(timestamp).toLocaleString("en-IN", {
                day: "numeric",
                month: "short",
                hour: "numeric",
                minute: "2-digit",
              })
            : "Upcoming"}
        </p>
      </div>
    </li>
  );
}
