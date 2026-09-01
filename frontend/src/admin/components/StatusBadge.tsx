import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type {
  BlogPostStatus,
  ImportJobStatus,
  ImportLogStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
} from "@/admin/types";

const orderStatusStyles: Record<OrderStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  processing: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const paymentStatusStyles: Record<PaymentStatus, string> = {
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  paid: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
  refunded: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const productStatusStyles: Record<ProductStatus, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const blogPostStatusStyles: Record<BlogPostStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  draft: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const importJobStatusStyles: Record<ImportJobStatus, string> = {
  pending: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  crawling_links: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  scraping_products: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  downloading_images: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  completed: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
};

const importLogStatusStyles: Record<ImportLogStatus, string> = {
  pending: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
  scraping: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  downloading: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  failed: "bg-red-500/10 text-red-600 dark:text-red-400",
};

function StatusBadgeBase({ label, className }: { label: string; className: string }) {
  return (
    <Badge variant="outline" className={cn("border-transparent capitalize", className)}>
      {label}
    </Badge>
  );
}

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  return <StatusBadgeBase label={status} className={orderStatusStyles[status]} />;
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  return <StatusBadgeBase label={status} className={paymentStatusStyles[status]} />;
}

export function ProductStatusBadge({ status }: { status: ProductStatus }) {
  return <StatusBadgeBase label={status} className={productStatusStyles[status]} />;
}

export function BlogPostStatusBadge({ status }: { status: BlogPostStatus }) {
  return <StatusBadgeBase label={status} className={blogPostStatusStyles[status]} />;
}

export function ImportJobStatusBadge({ status }: { status: ImportJobStatus }) {
  return (
    <StatusBadgeBase
      label={status.replace(/_/g, " ")}
      className={importJobStatusStyles[status]}
    />
  );
}

export function ImportLogStatusBadge({ status }: { status: ImportLogStatus }) {
  return <StatusBadgeBase label={status} className={importLogStatusStyles[status]} />;
}
