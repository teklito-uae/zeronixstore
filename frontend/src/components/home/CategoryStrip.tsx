import { Link } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { CategoryIcon } from "@/lib/category-icons";
import type { Category } from "@/features/products/types";

interface CategoryStripProps {
  categories: Category[];
  loading?: boolean;
}

export function CategoryStrip({ categories, loading }: CategoryStripProps) {
  return (
    <section className="pb-8 sm:pb-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:mx-0 sm:grid sm:snap-none sm:grid-cols-6 sm:gap-3 sm:overflow-visible sm:px-0 sm:[mask-image:none] md:grid-cols-8 lg:grid-cols-11">
          {loading
            ? Array.from({ length: 11 }).map((_, i) => (
                <Skeleton key={i} className="h-24 w-24 shrink-0 rounded-xl sm:h-28 sm:w-auto" />
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className="group flex w-24 shrink-0 snap-start flex-col items-center gap-2 rounded-xl border border-transparent p-3 text-center transition-colors hover:border-border hover:bg-muted/60 sm:w-auto"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform duration-200 group-hover:scale-110">
                    <CategoryIcon slug={cat.slug} className="size-5" strokeWidth={2} />
                  </span>
                  <span className="line-clamp-2 text-xs font-medium leading-tight text-foreground">
                    {cat.name}
                  </span>
                </Link>
              ))}
        </div>
      </div>
    </section>
  );
}
