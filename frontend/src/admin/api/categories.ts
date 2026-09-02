import { apiRequest } from "@/admin/api/client";
import type { Category } from "@/admin/types";

export async function listCategories(): Promise<Category[]> {
  return apiRequest<Category[]>("/categories");
}

export interface CategoryFormValues {
  name: string;
  description: string;
  parent_id: string;
  image?: File | null;
}

function toFormData(values: CategoryFormValues): FormData {
  const fd = new FormData();
  fd.append("name", values.name);
  if (values.description) fd.append("description", values.description);
  if (values.parent_id) fd.append("parent_id", values.parent_id);
  if (values.image) fd.append("image", values.image);
  return fd;
}

export async function createCategory(values: CategoryFormValues): Promise<Category> {
  return apiRequest<Category>("/admin/categories", {
    method: "POST",
    body: toFormData(values),
    isFormData: true,
  });
}

export async function updateCategory(id: number, values: CategoryFormValues): Promise<Category> {
  const fd = toFormData(values);
  // PHP never populates $_POST/$_FILES for multipart bodies on PUT requests,
  // so uploads must ride a real POST with Laravel's _method override instead.
  fd.append("_method", "PUT");
  return apiRequest<Category>(`/admin/categories/${id}`, {
    method: "POST",
    body: fd,
    isFormData: true,
  });
}

export async function deleteCategory(id: number): Promise<void> {
  return apiRequest<void>(`/admin/categories/${id}`, { method: "DELETE" });
}
