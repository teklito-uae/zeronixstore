export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "customer";
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  image_url: string | null;
  total_products_count: number;
  parent_id: number | null;
  microless_category_id: string | null;
  children?: Category[];
}

export type ProductStatus = "active" | "draft";

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  category_id: number;
  category?: Category | null;
  brand: string | null;
  price: string;
  sale_price: string | null;
  cpu: string | null;
  gpu: string | null;
  ram: string | null;
  storage: string | null;
  featured: boolean;
  status: ProductStatus;
  badge: string | null;
  badge_color: string | null;
  primary_image_url: string | null;
  images_gallery_urls?: string[];
  created_at: string;
}

export interface ProductFormValues {
  name: string;
  category_id: string;
  price: string;
  sale_price: string;
  description: string;
  brand: string;
  cpu: string;
  gpu: string;
  ram: string;
  storage: string;
  featured: boolean;
  status: ProductStatus;
  badge: string;
  badge_color: string;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price: string;
  total: string;
  product?: Product | null;
}

export interface OrderUser {
  id: number;
  name: string;
  email: string;
}

export interface ShippingAddress {
  firstName?: string;
  first_name?: string;
  lastName?: string;
  last_name?: string;
  address?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  postal_code?: string;
  phone?: string;
  [key: string]: unknown;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number | null;
  user?: OrderUser | null;
  email: string | null;
  phone: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  subtotal: string;
  tax: string;
  total: string;
  shipping_address: ShippingAddress;
  notes: string | null;
  items: OrderItem[];
  created_at: string;
}

export type ImportJobStatus =
  | "pending"
  | "crawling_links"
  | "scraping_products"
  | "downloading_images"
  | "completed"
  | "failed";

export interface ImportJob {
  id: number;
  source_category_url: string;
  local_category_id: number | null;
  local_category?: { id: number; name: string } | null;
  status: ImportJobStatus;
  total_found: number;
  processed_count: number;
  failed_count: number;
  error_logs: unknown;
  created_at: string;
  updated_at: string;
}

export type ImportLogStatus = "pending" | "scraping" | "downloading" | "success" | "failed";

export interface ImportLog {
  id: number;
  import_job_id: number;
  product_url: string | null;
  status: ImportLogStatus;
  message: string | null;
  data: Record<string, unknown> | null;
  created_at: string;
}

export interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  statusCounts: Record<OrderStatus, number>;
  recentOrders: Order[];
  partial: boolean;
}
