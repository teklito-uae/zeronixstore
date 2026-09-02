import { Link } from "react-router-dom";
import { MoreHorizontal } from "lucide-react";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import type { Category } from "@/features/products/types";

interface CategoryStripProps {
  categories: Category[];
  loading?: boolean;
}

// Mobile: fixed 2-row grid that flows into columns so it scrolls horizontally
// instead of wrapping into many tall rows. Desktop: same minimal chip, spread
// across one evenly-spaced row (display swaps grid -> flex at sm:).
const itemClasses =
  "flex w-[4.5rem] shrink-0 snap-start flex-col items-center gap-1.5 text-center sm:w-auto sm:flex-1";

function CategoryChip({ slug }: { slug: string }) {
  const accent = getCategoryAccent(slug);
  return (
    <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full sm:size-12", accent.bg)}>
      <CategoryIcon slug={slug} className={cn("size-5", accent.fg)} strokeWidth={1.5} />
    </span>
  );
}

export function CategoryStrip({ categories, loading }: CategoryStripProps) {
  return (
    <section className="mt-5 pb-4 sm:mt-8 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="no-scrollbar -mx-4 grid auto-cols-[4.5rem] grid-flow-col grid-rows-2 gap-x-3 gap-y-2.5 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_calc(100%-28px),transparent)] sm:mx-0 sm:flex sm:items-start sm:gap-x-2 sm:gap-y-0 sm:overflow-visible sm:px-0 sm:[mask-image:none]"
        >
          {loading
            ? Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className={itemClasses}>
                  <Skeleton className="size-11 shrink-0 rounded-full sm:size-12" />
                  <Skeleton className="h-2.5 w-10" />
                </div>
              ))
            : categories.map((cat) => (
                <Link
                  key={cat.id}
                  to={`/category/${cat.slug}`}
                  className={cn(itemClasses, "transition-opacity hover:opacity-70")}
                >
                  <CategoryChip slug={cat.slug} />
                  <span className="line-clamp-1 w-full text-[11px] font-medium leading-tight text-foreground sm:text-xs">
                    {cat.name}
                  </span>
                </Link>
              ))}
          {!loading && (
            <CategoriesSheet
              trigger={
                <button type="button" className={cn(itemClasses, "transition-opacity hover:opacity-70")}>
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-muted sm:size-12">
                    <MoreHorizontal className="size-5 text-muted-foreground" strokeWidth={1.5} />
                  </span>
                  <span className="text-[11px] font-medium leading-tight text-foreground sm:text-xs">More</span>
                </button>
              }
            />
          )}
        </div>
      </div>
    </section>
  );
}
