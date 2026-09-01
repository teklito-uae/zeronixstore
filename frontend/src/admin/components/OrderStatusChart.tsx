import type { OrderStatus } from "@/admin/types";

const STATUS_ORDER: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];

// Kept in sync with StatusBadge's order-status colors so the dashboard chart
// and the badges elsewhere in the admin never disagree on what a status means.
const STATUS_BAR_COLOR: Record<OrderStatus, string> = {
  pending: "bg-amber-500",
  processing: "bg-sky-500",
  completed: "bg-emerald-500",
  cancelled: "bg-red-500",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

interface OrderStatusChartProps {
  counts: Record<OrderStatus, number>;
}

export function OrderStatusChart({ counts }: OrderStatusChartProps) {
  const max = Math.max(1, ...STATUS_ORDER.map((s) => counts[s]));

  return (
    <div className="flex flex-col gap-3">
      {STATUS_ORDER.map((status) => {
        const value = counts[status];
        const widthPct = Math.round((value / max) * 100);
        return (
          <div key={status} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-secondary-foreground">
              {STATUS_LABEL[status]}
            </span>
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full ${STATUS_BAR_COLOR[status]}`}
                style={{ width: `${Math.max(widthPct, value > 0 ? 3 : 0)}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-sm font-medium tabular-nums">
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}
