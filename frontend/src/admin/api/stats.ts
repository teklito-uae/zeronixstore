import { listOrders } from "@/admin/api/orders";
import { listProducts } from "@/admin/api/products";
import type { DashboardStats, Order, OrderStatus } from "@/admin/types";

// Neither admin endpoint exposes aggregate stats, so totals are computed here
// by walking the existing paginator (`?page=`) rather than adding a new
// backend route. Capped so a very large order history can't stall the page.
const MAX_PAGES = 20;

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const [productsPage, firstOrdersPage] = await Promise.all([
    listProducts({ page: 1 }),
    listOrders(1),
  ]);

  const allOrders: Order[] = [...firstOrdersPage.data];
  const lastPage = Math.min(firstOrdersPage.last_page, MAX_PAGES);

  const remainingPages = [];
  for (let page = 2; page <= lastPage; page += 1) {
    remainingPages.push(listOrders(page));
  }
  const rest = await Promise.all(remainingPages);
  rest.forEach((p) => allOrders.push(...p.data));

  const statusCounts: Record<OrderStatus, number> = {
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
  };
  let totalRevenue = 0;
  for (const order of allOrders) {
    statusCounts[order.status] += 1;
    if (order.payment_status === "paid") {
      totalRevenue += Number(order.total);
    }
  }

  return {
    totalProducts: productsPage.total,
    totalOrders: firstOrdersPage.total,
    pendingOrders: statusCounts.pending,
    totalRevenue,
    statusCounts,
    recentOrders: firstOrdersPage.data.slice(0, 8),
    partial: firstOrdersPage.last_page > MAX_PAGES,
  };
}
