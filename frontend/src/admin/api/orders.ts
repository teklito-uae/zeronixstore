import { apiRequest } from "@/admin/api/client";
import type { Order, OrderStatus, Paginated, PaymentStatus } from "@/admin/types";

export async function listOrders(page = 1): Promise<Paginated<Order>> {
  return apiRequest<Paginated<Order>>(`/admin/orders?page=${page}`);
}

export async function updateOrder(
  id: number,
  values: Partial<{ status: OrderStatus; payment_status: PaymentStatus }>,
): Promise<Order> {
  return apiRequest<Order>(`/admin/orders/${id}`, {
    method: "PUT",
    body: values,
  });
}
