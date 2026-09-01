import { apiRequest } from "@/admin/api/client";
import type { Paginated, Product, ProductFormValues } from "@/admin/types";

export async function listProducts(page = 1, search = ""): Promise<Paginated<Product>> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  return apiRequest<Paginated<Product>>(`/admin/products?${params.toString()}`);
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
