import type { Brand, Category, Product, ProductSuggestion } from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:8000/api";

// The backend doesn't serve rating/deliveryEstimate/warranty yet (see the
// comment on the Product type) — every real product response is missing
// those keys entirely, so they're filled in as null rather than typed as
// optional, keeping the rest of the app's `product.rating?.average` etc.
// call sites unchanged whether the data came from mock or the API.
type RawProduct = Omit<Product, "rating" | "deliveryEstimate" | "warranty">;

function toProduct(raw: RawProduct): Product {
  return {
    ...raw,
    rating: null,
    deliveryEstimate: null,
    warranty: null,
  };
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE_URL}/categories`);
  if (!res.ok) throw new Error(`Failed to load categories (${res.status})`);
  return res.json();
}

export async function fetchBrands(category?: string): Promise<Brand[]> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE_URL}/products/brands${params}`);
  if (!res.ok) throw new Error(`Failed to load brands (${res.status})`);
  return res.json();
}

export async function fetchPriceRange(category?: string): Promise<{ min: number; max: number }> {
  const params = category ? `?category=${encodeURIComponent(category)}` : "";
  const res = await fetch(`${API_BASE_URL}/products/price-range${params}`);
  if (!res.ok) throw new Error(`Failed to load price range (${res.status})`);
  return res.json();
}

// Lightweight autocomplete endpoint (name/keywords/brand LIKE-match, capped
// server-side at 20) — built for live-typing search UI, not the full listing
// grid that fetchProducts() backs.
export async function searchProductSuggestions(query: string, limit = 6): Promise<ProductSuggestion[]> {
  const params = new URLSearchParams({ q: query, limit: String(limit) });
  const res = await fetch(`${API_BASE_URL}/products/search?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to search products (${res.status})`);
  return res.json();
}

export type ProductSort = "featured" | "price_asc" | "price_desc" | "newest";

interface ProductsQuery {
  category?: string;
  brand?: string;
  search?: string;
  sort?: ProductSort;
  priceMin?: number;
  priceMax?: number;
  perPage?: number;
  page?: number;
}

interface PaginatedProducts {
  data: Product[];
  meta?: { current_page: number; last_page: number; total: number };
}

export async function fetchProducts(query: ProductsQuery = {}): Promise<PaginatedProducts> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.brand) params.set("brand", query.brand);
  if (query.search) params.set("search", query.search);
  if (query.sort && query.sort !== "featured") params.set("sort", query.sort);
  if (query.priceMin != null) params.set("price_min", String(query.priceMin));
  if (query.priceMax != null) params.set("price_max", String(query.priceMax));
  params.set("per_page", String(query.perPage ?? 24));
  if (query.page) params.set("page", String(query.page));

  const res = await fetch(`${API_BASE_URL}/products?${params.toString()}`);
  if (!res.ok) throw new Error(`Failed to load products (${res.status})`);
  const json = await res.json();
  const rawList: RawProduct[] = json.data ?? [];

  // Defense in depth: index() filters status=active server-side, but keep the
  // client-side guard too in case that ever regresses.
  return {
    data: rawList.filter((p) => p.status === "active").map(toProduct),
    meta: json.meta,
  };
}

export class ProductNotFoundError extends Error {}

// show() doesn't filter by status server-side either (see fetchProducts above),
// so a draft product's slug still 200s here — guard it client-side rather than
// trusting the API to have already hidden it.
export async function fetchProduct(slug: string): Promise<Product> {
  const res = await fetch(`${API_BASE_URL}/products/${slug}`);
  if (res.status === 404) throw new ProductNotFoundError(`Product not found: ${slug}`);
  if (!res.ok) throw new Error(`Failed to load product (${res.status})`);
  const raw: RawProduct = await res.json();
  if (raw.status !== "active") throw new ProductNotFoundError(`Product not published: ${slug}`);
  return toProduct(raw);
}
