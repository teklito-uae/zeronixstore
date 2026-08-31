import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryAccent } from "@/lib/category-accents";
import { getCategory3DIcon } from "@/lib/category-3d-icons";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/products/types";

interface CategoryStripProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoryStrip({ categories, loading }: CategoryStripProps) {
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">Shop by Category</h2>
        </div>
      </div>

      <div className="no-scrollbar mx-auto flex max-w-7xl snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:[mask-image:none]">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-40 shrink-0 clip-notch sm:w-48" />
            ))
          : categories.map((cat) => {
              const accent = getCategoryAccent(cat.slug);
              const icon3d = getCategory3DIcon(cat.slug);
              return (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={cn(
                    "group relative flex h-56 w-40 shrink-0 snap-start flex-col justify-between p-4 clip-notch ring-1 ring-inset transition-transform hover:-translate-y-1 active:scale-[0.97] sm:w-48",
                    accent.bg,
                    accent.ring,
                  )}
                >
                  <ArrowUpRight
                    className={cn(
                      "size-4 self-end opacity-0 transition-opacity group-hover:opacity-100",
                      accent.fg,
                    )}
                  />
                  {icon3d ? (
                    <img
                      src={icon3d}
                      alt=""
                      className="size-16 self-center object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <CategoryIcon slug={cat.slug} className={cn("size-9", accent.fg)} strokeWidth={1.5} />
                  )}
                  <div>
                    <span className="block text-sm font-semibold text-foreground">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.total_products_count} products
                    </span>
                  </div>
                </Link>
              );
            })}
      </div>
    </section>
  );
}
