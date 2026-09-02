import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { listOrders, updateOrder } from "@/admin/api/orders";
import { usePageBreadcrumbLabel } from "@/admin/components/AdminShell";
import { OrderStatusBadge, PaymentStatusBadge } from "@/admin/components/StatusBadge";
import type { Order, OrderStatus, PaymentStatus } from "@/admin/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ORDER_STATUSES: OrderStatus[] = ["pending", "processing", "completed", "cancelled"];
const PAYMENT_STATUSES: PaymentStatus[] = ["pending", "paid", "failed", "refunded"];

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingField, setSavingField] = useState<"status" | "payment_status" | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    // No admin single-order endpoint — locate it within the paginated list.
    async function loadOrder(orderId: string) {
      for (let page = 1; page <= 50; page += 1) {
        const result = await listOrders(page);
        const found = result.data.find((o) => String(o.id) === orderId);
        if (found) return found;
        if (page >= result.last_page) break;
      }
      return null;
    }
    loadOrder(id)
      .then((found) => {
        if (cancelled) return;
        setOrder(found);
        if (!found) toast.error("Order not found.");
      })
      .catch(() => toast.error("Failed to load order."))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  async function handleStatusChange(status: OrderStatus) {
    if (!order) return;
    setSavingField("status");
    try {
      const updated = await updateOrder(order.id, { status });
      setOrder(updated);
      toast.success("Order status updated.");
    } catch {
      toast.error("Failed to update order status.");
    } finally {
      setSavingField(null);
    }
  }

  async function handlePaymentStatusChange(payment_status: PaymentStatus) {
    if (!order) return;
    setSavingField("payment_status");
    try {
      const updated = await updateOrder(order.id, { payment_status });
      setOrder(updated);
      toast.success("Payment status updated.");
    } catch {
      toast.error("Failed to update payment status.");
    } finally {
      setSavingField(null);
    }
  }

  usePageBreadcrumbLabel(order?.order_number ?? null);

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">Order not found.</p>
        <Button variant="outline" asChild>
          <Link to="/admin/orders">
            <ArrowLeft />
            Back to orders
          </Link>
        </Button>
      </div>
    );
  }

  const addr = order.shipping_address ?? {};
  const firstName = addr.firstName ?? addr.first_name ?? "";
  const lastName = addr.lastName ?? addr.last_name ?? "";
  const addressLine = addr.address ?? addr.address_line1 ?? "";
  const postalCode = addr.postalCode ?? addr.postal_code ?? "";

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-muted-foreground">
        Placed {new Date(order.created_at).toLocaleString()}
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label>Order status</Label>
              <Select
                value={order.status}
                onValueChange={(v) => handleStatusChange(v as OrderStatus)}
                disabled={savingField === "status"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ORDER_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Payment status</Label>
              <Select
                value={order.payment_status}
                onValueChange={(v) => handlePaymentStatusChange(v as PaymentStatus)}
                disabled={savingField === "payment_status"}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s} className="capitalize">
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <PaymentStatusBadge status={order.payment_status} />
            </div>
            <p className="text-xs text-muted-foreground">
              Payment method: <span className="capitalize">{order.payment_method}</span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="font-medium">
              {order.user?.name ?? (`${firstName} ${lastName}`.trim() || "Guest")}
            </p>
            <p className="text-muted-foreground">{order.user?.email ?? order.email}</p>
            {order.phone && <p className="text-muted-foreground">{order.phone}</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-0.5 text-sm text-muted-foreground">
            <p>{addressLine || "—"}</p>
            <p>
              {[addr.city, addr.state].filter(Boolean).join(", ")} {postalCode}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.product?.name ?? `Product #${item.product_id}`}</TableCell>
                  <TableCell className="text-right tabular-nums">{item.quantity}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(item.price)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatPrice(item.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3}>Subtotal</TableCell>
                <TableCell className="text-right tabular-nums">{formatPrice(order.subtotal)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3}>Tax</TableCell>
                <TableCell className="text-right tabular-nums">{formatPrice(order.tax)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={3} className="font-medium">
                  Total
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatPrice(order.total)}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">{order.notes}</CardContent>
        </Card>
      )}
    </div>
  );
}
