import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/products/types";

interface CategoryStripProps {
  categories: Category[];
  loading?: boolean;
}

// Each top-level category gets its own icon color so the row reads as a set
// of distinct departments at a glance, not a wall of identical icons.
const accentBySlug: Record<string, string> = {
  laptops: "text-blue-600",
  desktops: "text-violet-600",
  components: "text-amber-600",
  monitors: "text-cyan-600",
  accessories: "text-rose-600",
  networking: "text-teal-600",
  "printers-scanners": "text-slate-600",
  "gaming-chairs-desks": "text-orange-600",
};

const itemClasses = "flex shrink-0 snap-start flex-col items-center gap-2 px-5 py-1 text-center sm:flex-1 sm:px-4";

export function CategoryStrip({ categories, loading }: CategoryStripProps) {
  return (
    <section className="mt-8 pb-6 sm:mt-12 sm:pb-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory divide-x divide-border overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:mx-0 sm:snap-none sm:overflow-visible sm:px-0 sm:[mask-image:none]">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={itemClasses}>
                  <Skeleton className="size-9 rounded-md" />
                  <Skeleton className="h-3.5 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ))
            : categories.map((cat) => (
                <Link key={cat.id} to={`/category/${cat.slug}`} className={cn(itemClasses, "transition-opacity hover:opacity-70")}>
                  <CategoryIcon
                    slug={cat.slug}
                    className={cn("size-9", accentBySlug[cat.slug] ?? "text-foreground")}
                    strokeWidth={1.75}
                  />
                  <span className="line-clamp-2 min-h-9 max-w-[6.5rem] text-sm leading-tight font-semibold text-foreground">
                    {cat.name}
                  </span>
                  <span className="text-xs font-medium text-blue-500">
                    {cat.total_products_count.toLocaleString()} items
                  </span>
                </Link>
              ))}
          {!loading && (
            <Link to="/search" className={cn(itemClasses, "justify-center transition-opacity hover:opacity-70")}>
              <MoreHorizontal className="size-9 text-violet-400" strokeWidth={1.75} />
              <span className="text-sm font-semibold text-foreground">More</span>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
