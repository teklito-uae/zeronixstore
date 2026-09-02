import { useState, type MouseEvent } from "react";
import { Heart, ShoppingCart, Star, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { getSpecEntries } from "@/lib/specs";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
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
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(product.primary_image_url) && !imageFailed;

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  function handleWishlist(e: MouseEvent) {
    e.preventDefault();
    toggle(product);
    if (wishlisted) {
      toast("Removed from wishlist", { description: product.name });
    } else {
      toast.success("Added to wishlist", { description: product.name });
    }
  }

  function handleAddToCart(e: MouseEvent) {
    e.preventDefault();
    const variant = product.variants[0] ?? null;
    addItem({
      productId: product.id,
      variantId: variant?.id ?? null,
      slug: product.slug,
      name: product.name,
      variantName: variant?.name ?? null,
      image: product.primary_image_url,
      categorySlug: product.category.slug,
      unitPrice: Number.parseFloat(variant ? variant.price : (product.sale_price ?? product.price)),
      maxQuantity: variant ? variant.stock : 10,
    });
    toast.success("Added to cart", { description: product.name });
  }

  return (
    <Link
      to={`/products/${product.slug}`}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-[transform,box-shadow,border-color] hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg active:scale-[0.98]"
    >
      <div
        className={cn(
          "relative flex aspect-square items-center justify-center overflow-hidden",
          showImage ? "bg-white" : accent.bg,
        )}
      >
        {showImage ? (
          <img
            src={product.primary_image_url!}
            alt={product.name}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-contain p-3 transition-transform duration-300 ease-out group-hover:scale-[1.06] sm:p-4"
          />
        ) : (
          <div
            aria-hidden
            className={cn("absolute inset-0 opacity-[0.08]", accent.fg)}
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
            }}
          />
        )}
        {product.badge && (
          <Badge
            className={cn(
              "absolute left-1.5 top-1.5 border-none px-1.5 py-0.5 text-[10px] font-medium sm:left-2 sm:top-2 sm:px-2 sm:text-[11px]",
              product.badge_color && badgeVariantByColor[product.badge_color],
            )}
          >
            {product.badge}
          </Badge>
        )}
        <button
          type="button"
          aria-label="Toggle wishlist"
          onClick={handleWishlist}
          className={cn(
            "absolute right-1.5 top-1.5 flex size-6 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:text-primary sm:right-2 sm:top-2 sm:size-8",
            wishlisted ? "text-primary" : "text-foreground/70",
          )}
        >
          <Heart className={cn("size-3 sm:size-4", wishlisted && "fill-primary")} />
        </button>
        {!showImage && (
          <CategoryIcon
            slug={product.category.slug}
            className={cn("relative size-10 sm:size-16", accent.fg, "opacity-70")}
            strokeWidth={1.25}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-2 sm:gap-1.5 sm:p-3">
        <div className="flex items-center justify-between gap-2">
          {product.brand && (
            <span className="truncate text-[10px] font-medium uppercase tracking-wide text-muted-foreground sm:text-xs">
              {product.brand.name}
            </span>
          )}
          {product.rating && (
            <span className="hidden shrink-0 items-center gap-0.5 text-xs text-muted-foreground sm:flex">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {product.rating.average.toFixed(1)}
              <span className="text-muted-foreground/70">({product.rating.count})</span>
            </span>
          )}
        </div>
        <h3 className="line-clamp-2 text-xs font-medium leading-snug text-foreground sm:text-sm">
          {product.name}
        </h3>

        {specChips.length > 0 && (
          <div className="hidden flex-wrap gap-1 sm:flex">
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

        <div className="mt-auto flex flex-col gap-1.5 pt-1.5 sm:gap-2 sm:pt-2">
          {product.deliveryEstimate && (
            <span className="hidden items-center gap-1 text-[11px] text-muted-foreground sm:flex">
              <Truck className="size-3" />
              {product.deliveryEstimate}
            </span>
          )}
          <div className="flex items-end justify-between gap-0.5 sm:gap-1">
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-xs font-semibold text-foreground sm:text-base">
                {formatPrice(onSale ? product.sale_price! : product.price)}
              </span>
              {onSale && (
                <span className="truncate text-[10px] text-muted-foreground line-through sm:text-xs">
                  {formatPrice(product.price)}
                </span>
              )}
            </div>
            <Button
              size="icon"
              variant="secondary"
              aria-label="Add to cart"
              className="size-6 shrink-0 sm:size-9"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="size-3 sm:size-4" />
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-border">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="flex flex-col gap-2 p-3">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="mt-2 h-5 w-20" />
      </div>
    </div>
  );
}
