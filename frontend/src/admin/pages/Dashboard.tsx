import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { DollarSign, Package, ShoppingCart, Clock, Loader2 } from "lucide-react";
import { fetchDashboardStats } from "@/admin/api/stats";
import { StatCard } from "@/admin/components/StatCard";
import { OrderStatusChart } from "@/admin/components/OrderStatusChart";
import { OrderStatusBadge, PaymentStatusBadge } from "@/admin/components/StatusBadge";
import type { DashboardStats } from "@/admin/types";
import { formatPrice } from "@/lib/format";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchDashboardStats()
      .then((data) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load stats.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-sm text-destructive">{error}</p>;
  }

  if (!stats) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your store's performance.
          {stats.partial && " (revenue reflects the most recent orders only)"}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue (paid)" value={formatPrice(stats.totalRevenue)} icon={DollarSign} />
        <StatCard label="Total orders" value={String(stats.totalOrders)} icon={ShoppingCart} />
        <StatCard label="Total products" value={String(stats.totalProducts)} icon={Package} />
        <StatCard
          label="Pending orders"
          value={String(stats.pendingOrders)}
          icon={Clock}
          iconClassName="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Orders by status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart counts={stats.statusCounts} />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>Recent orders</CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link to="/admin/orders">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {stats.recentOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No orders yet.
                    </TableCell>
                  </TableRow>
                )}
                {stats.recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link
                        to={`/admin/orders/${order.id}`}
                        className="font-medium hover:underline"
                      >
                        {order.order_number}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {order.user?.name ?? order.email ?? "Guest"}
                      </p>
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
