import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { getSpecEntries } from "@/lib/specs";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

const badgeVariantByColor: Record<string, string> = {
  emerald: "bg-primary text-primary-foreground",
  blue: "bg-blue-600 text-white",
  red: "bg-red-600 text-white",
};

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const onSale = product.sale_price !== null;
  const accent = getCategoryAccent(product.category.slug);
  const specChips = getSpecEntries(product)
    .slice(0, 2)
    .map(([, value]) => value);

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[transform,box-shadow] hover:shadow-md active:scale-[0.98]"
    >
      <div className={cn("relative flex aspect-square items-center justify-center", accent.bg)}>
        <div
          aria-hidden
          className={cn("absolute inset-0 opacity-[0.08]", accent.fg)}
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
          }}
        />
        {product.badge && (
          <Badge
            className={cn(
              "absolute left-2 top-2 border-none px-2 py-0.5 text-[11px] font-medium",
              product.badge_color && badgeVariantByColor[product.badge_color],
            )}
          >
            {product.badge}
          </Badge>
        )}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => e.preventDefault()}
          className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground/70 backdrop-blur transition-colors hover:text-primary"
        >
          <Heart className="size-4" />
        </button>
        <CategoryIcon
          slug={product.category.slug}
          className={cn("relative size-16", accent.fg, "opacity-70")}
          strokeWidth={1.25}
        />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-center justify-between gap-2">
          {product.brand && (
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {product.brand.name}
            </span>
          )}
          {product.rating && (
            <span className="flex shrink-0 items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating.average.toFixed(1)}
              <span className="text-muted-foreground/70">({product.rating.count})</span>
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-sm font-medium leading-snug text-foreground">
          {product.name}
        </h3>

        {specChips.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {specChips.map((spec) => (
              <span
                key={spec}
                title={spec}
                className="max-w-full truncate rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground"
              >
                {spec}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          {product.deliveryEstimate && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Truck className="size-3" />
              {product.deliveryEstimate}
            </span>
          )}
          <div className="flex items-end justify-between">
            <div className="flex flex-col">
              <span className="text-base font-semibold text-foreground">
                {formatPrice(onSale ? product.sale_price! : product.price)}
              </span>
              {onSale && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Add to cart"
              className="size-9 shrink-0"
              onClick={(e) => e.preventDefault()}
            >
              <ShoppingCart className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border border-border">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-5 w-20" />
      </div>
    </div>
  );
}
