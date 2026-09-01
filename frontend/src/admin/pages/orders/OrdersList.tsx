import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listOrders } from "@/admin/api/orders";
import { Pager } from "@/admin/components/Pager";
import { OrderStatusBadge, PaymentStatusBadge } from "@/admin/components/StatusBadge";
import type { Order, OrderStatus, Paginated } from "@/admin/types";
import { formatPrice } from "@/lib/format";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const FILTERS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

export default function OrdersList() {
  const [result, setResult] = useState<Paginated<Order> | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    listOrders(page)
      .then(setResult)
      .catch(() => toast.error("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [page]);

  const rows = useMemo(() => {
    if (!result) return [];
    return filter === "all" ? result.data : result.data.filter((o) => o.status === filter);
  }, [result, filter]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Orders</h1>
        <p className="text-sm text-muted-foreground">
          {result ? `${result.total} order${result.total === 1 ? "" : "s"}` : "Loading…"}
          {filter !== "all" && " — filtered within this page"}
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.value}
            size="sm"
            variant={filter === f.value ? "secondary" : "ghost"}
            onClick={() => setFilter(f.value)}
          >
            {f.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center">
                    <Loader2 className="mx-auto size-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No orders found.
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                rows.map((order) => (
                  <TableRow key={order.id} className="cursor-pointer">
                    <TableCell className="font-medium">
                      <Link to={`/admin/orders/${order.id}`}>{order.order_number}</Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {order.user?.name ?? order.email ?? "Guest"}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>
                      <PaymentStatusBadge status={order.payment_status} />
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatPrice(order.total)}
                    </TableCell>
                    <TableCell>
                      <Link to={`/admin/orders/${order.id}`}>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {result && (
        <Pager currentPage={result.current_page} lastPage={result.last_page} onPageChange={setPage} />
      )}
    </div>
  );
}
