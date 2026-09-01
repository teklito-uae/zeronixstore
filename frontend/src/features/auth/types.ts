export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface Address {
  id: number;
  first_name: string;
  last_name: string;
  address_line1: string;
  address_line2: string | null;
  city: string;
  state: string;
  postal_code: string;
  type: "home" | "office" | "other";
  is_default: boolean;
}

export interface OrderItem {
  id: number;
  product_id: number;
  variant_id: number | null;
  quantity: number;
  price: string;
  total: string;
  product: { id: number; name: string; slug: string; primary_image_url: string | null } | null;
  variant: { id: number; name: string } | null;
}

export type OrderStatus = "pending" | "processing" | "completed" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  subtotal: string;
  tax: string;
  total: string;
  created_at: string;
  items: OrderItem[];
}
