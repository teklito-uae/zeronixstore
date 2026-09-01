// Base shape mirrors the Laravel API (app/Models/{Product,Category,Brand,Variant}.php).
// Per direction: the merchandising fields below (rating, deliveryEstimate, warranty) are
// sourced from the real Microless import JSON, not the current Product model — they're
// UI-only for now. Wire them from the backend (e.g. import_metadata) when it exposes them;
// don't block rendering on that.

export interface Brand {
  id: number;
  name: string;
  slug: string;
  logo: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  parent_id: number | null;
  total_products_count: number;
  children?: Category[];
}

export interface Variant {
  id: number;
  product_id: number;
  sku: string;
  name: string;
  price: string;
  stock: number;
  attributes: Record<string, string> | null;
}

export type ProductStatus = "active" | "draft";

export interface Rating {
  average: number;
  count: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category: Category;
  brand: Brand | null;
  price: string;
  sale_price: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  specs: Record<string, string> | null;
  primary_image_url: string | null;
  images_gallery_urls: string[];
  featured: boolean;
  status: ProductStatus;
  badge: string | null;
  badge_color: string | null;
  variants: Variant[];
  /** UI-only merchandising data, sourced from the Microless import feed. */
  rating: Rating | null;
  deliveryEstimate: string | null;
  warranty: string | null;
}
