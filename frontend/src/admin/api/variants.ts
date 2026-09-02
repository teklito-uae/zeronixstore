import { apiRequest } from "@/admin/api/client";
import type { Variant, VariantFormValues } from "@/admin/types";

function toPayload(values: VariantFormValues) {
  const attributes: Record<string, string> = {};
  for (const { key, value } of values.attributes) {
    if (key.trim()) attributes[key.trim()] = value;
  }
  return {
    sku: values.sku,
    name: values.name,
    price: values.price,
    stock: values.stock === "" ? 0 : Number(values.stock),
    attributes,
  };
}

export async function createVariant(productId: number, values: VariantFormValues): Promise<Variant> {
  return apiRequest<Variant>(`/admin/products/${productId}/variants`, {
    method: "POST",
    body: toPayload(values),
  });
}

export async function updateVariant(
  productId: number,
  variantId: number,
  values: VariantFormValues,
): Promise<Variant> {
  return apiRequest<Variant>(`/admin/products/${productId}/variants/${variantId}`, {
    method: "PUT",
    body: toPayload(values),
  });
}

export async function deleteVariant(productId: number, variantId: number): Promise<void> {
  return apiRequest<void>(`/admin/products/${productId}/variants/${variantId}`, { method: "DELETE" });
}
