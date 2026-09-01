import type { BlogPost } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

interface PaginatedPosts {
  data: BlogPost[];
  meta?: { current_page: number; last_page: number; total: number };
}

interface BlogPostsQuery {
  perPage?: number;
  page?: number;
}

export async function fetchBlogPosts(query: BlogPostsQuery = {}): Promise<PaginatedPosts> {
  const params = new URLSearchParams();
  params.set("per_page", String(query.perPage ?? 12));
  if (query.page) params.set("page", String(query.page));

  const res = await fetch(`${API_BASE_URL}/blog-posts?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load blog posts (${res.status})`);
  const json = await res.json();
  return { data: json.data ?? [], meta: json.meta };
}

export class BlogPostNotFoundError extends Error {}

export async function fetchBlogPost(slug: string): Promise<BlogPost> {
  const res = await fetch(`${API_BASE_URL}/blog-posts/${slug}`);
  if (res.status === 404) throw new BlogPostNotFoundError(`Post not found: ${slug}`);
  if (!res.ok) throw new Error(`Failed to load post (${res.status})`);
  return res.json();
}
