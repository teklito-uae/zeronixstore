import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryAccent } from "@/lib/category-accents";
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

        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:[mask-image:none] md:grid-cols-6 lg:grid-cols-12">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-auto" />
              ))
            : categories.map((cat) => {
                const accent = getCategoryAccent(cat.slug);
                return (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/60 sm:w-auto"
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center rounded-full ring-1 ring-inset transition-transform duration-200 group-hover:scale-110",
                        accent.bg,
                        accent.ring,
                      )}
                    >
                      <CategoryIcon slug={cat.slug} className={cn("size-5", accent.fg)} strokeWidth={1.75} />
                    </span>
                    <span className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                      {cat.name}
                    </span>
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}
