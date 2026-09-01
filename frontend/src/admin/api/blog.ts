import { apiRequest } from "@/admin/api/client";
import type { BlogPost, BlogPostFormValues, Paginated } from "@/admin/types";

export async function listBlogPosts(page = 1, search = ""): Promise<Paginated<BlogPost>> {
  const params = new URLSearchParams({ page: String(page) });
  if (search) params.set("search", search);
  return apiRequest<Paginated<BlogPost>>(`/admin/blog-posts?${params.toString()}`);
}

function toFormData(values: BlogPostFormValues): FormData {
  const fd = new FormData();
  fd.append("title", values.title);
  if (values.excerpt) fd.append("excerpt", values.excerpt);
  fd.append("content", values.content);
  if (values.author_name) fd.append("author_name", values.author_name);
  fd.append("status", values.status);
  if (values.meta_title) fd.append("meta_title", values.meta_title);
  if (values.meta_description) fd.append("meta_description", values.meta_description);
  if (values.cover_image) fd.append("cover_image", values.cover_image);
  return fd;
}

export async function createBlogPost(values: BlogPostFormValues): Promise<BlogPost> {
  return apiRequest<BlogPost>("/admin/blog-posts", {
    method: "POST",
    body: toFormData(values),
    isFormData: true,
  });
}

export async function updateBlogPost(id: number, values: BlogPostFormValues): Promise<BlogPost> {
  const fd = toFormData(values);
  // PHP never populates $_POST/$_FILES for multipart bodies on PUT requests,
  // so uploads must ride a real POST with Laravel's _method override instead.
  fd.append("_method", "PUT");
  return apiRequest<BlogPost>(`/admin/blog-posts/${id}`, {
    method: "POST",
    body: fd,
    isFormData: true,
  });
}

export async function deleteBlogPost(id: number): Promise<void> {
  return apiRequest<void>(`/admin/blog-posts/${id}`, { method: "DELETE" });
}
