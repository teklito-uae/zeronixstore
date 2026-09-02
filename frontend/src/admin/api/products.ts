import { apiRequest } from "@/admin/api/client";
import type { Paginated, Product, ProductFormValues } from "@/admin/types";

export interface ListProductsParams {
  page?: number;
  perPage?: number;
  search?: string;
  tab?: "all" | "draft" | "promoted";
  status?: "active" | "draft" | "";
  date?: string;
}

export async function listProducts(params: ListProductsParams = {}): Promise<Paginated<Product>> {
  const { page = 1, perPage, search, tab, status, date } = params;
  const query = new URLSearchParams({ page: String(page) });
  if (perPage) query.set("per_page", String(perPage));
  if (search) query.set("search", search);
  if (tab && tab !== "all") query.set("tab", tab);
  if (status) query.set("status", status);
  if (date) query.set("date", date);
  return apiRequest<Paginated<Product>>(`/admin/products?${query.toString()}`);
}

export async function getProduct(id: number): Promise<Product> {
  return apiRequest<Product>(`/admin/products/${id}`);
}

function toPayload(values: ProductFormValues) {
  return {
    name: values.name,
    category_id: Number(values.category_id),
    price: values.price,
    sale_price: values.sale_price || null,
    description: values.description || null,
    brand: values.brand || null,
    cpu: values.cpu || null,
    gpu: values.gpu || null,
    ram: values.ram || null,
    storage: values.storage || null,
    featured: values.featured,
    status: values.status,
    stock: values.stock === "" ? 0 : Number(values.stock),
    badge: values.badge || null,
    badge_color: values.badge_color || null,
  };
}

export async function createProduct(values: ProductFormValues): Promise<Product> {
  return apiRequest<Product>("/admin/products", {
    method: "POST",
    body: toPayload(values),
  });
}

export async function updateProduct(id: number, values: ProductFormValues): Promise<Product> {
  return apiRequest<Product>(`/admin/products/${id}`, {
    method: "PUT",
    body: toPayload(values),
  });
}

export async function deleteProduct(id: number): Promise<void> {
  return apiRequest<void>(`/admin/products/${id}`, { method: "DELETE" });
}

export async function bulkDeleteProducts(ids: number[]): Promise<void> {
  return apiRequest<void>("/admin/products/bulk-delete", {
    method: "POST",
    body: { ids },
  });
}
