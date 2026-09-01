import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import {
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Heart,
  Minus,
  Package,
  Plus,
  RotateCcw,
  Share2,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
} from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { fetchProducts } from "@/features/products/api";
import { useProduct } from "@/features/products/useProduct";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { discountPercent, formatPrice } from "@/lib/format";
import { getSpecEntries, getSpecHighlights } from "@/lib/specs";
import { findMatchingVariant, getVariantAttributeOptions } from "@/lib/variants";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

const trustPoints = [
  { icon: ShieldCheck, label: "1-year warranty", detail: "On every order, no exceptions" },
  { icon: RotateCcw, label: "Easy returns", detail: "7-day return window" },
];

function estimatedDelivery() {
  const from = new Date();
  from.setDate(from.getDate() + 1);
  const to = new Date();
  to.setDate(to.getDate() + 3);
  const fmt = (d: Date) => d.toLocaleDateString("en-AE", { weekday: "short", day: "numeric", month: "short" });
  return `${fmt(from)} – ${fmt(to)}`;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { product, loading, notFound } = useProduct(slug);

  if (loading) return <ProductDetailSkeleton />;
  if (notFound || !product) return <ProductNotFound />;

  return <ProductDetailView product={product} />;
}

function ProductDetailView({ product }: { product: Product }) {
  const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
    product.variants[0]?.attributes ?? {},
  );
  const [quantity, setQuantity] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  const { addItem } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const wishlisted = isWishlisted(product.id);

  const attributeOptions = useMemo(() => getVariantAttributeOptions(product.variants), [product.variants]);
  const activeVariant = useMemo(
    () => findMatchingVariant(product.variants, selectedAttrs),
    [product.variants, selectedAttrs],
  );

  const hasVariants = product.variants.length > 0;
  const stock = activeVariant?.stock ?? 0;
  const inStock = hasVariants ? stock > 0 : true;
  const lowStock = hasVariants && inStock && stock <= 5;
  const displayPrice = activeVariant ? activeVariant.price : (product.sale_price ?? product.price);
  const strikePrice = !activeVariant && product.sale_price ? product.price : null;
  const onSale = strikePrice !== null;
  const installment = (Number.parseFloat(displayPrice) / 4).toFixed(0);

  const highlights = useMemo(() => getSpecEntries(product).slice(0, 4), [product]);

  useEffect(() => {
    setSelectedAttrs(product.variants[0]?.attributes ?? {});
    setQuantity(1);
  }, [product.id]);

  useEffect(() => {
    document.title = product.meta_title?.trim() || `${product.name} | Zeronix`;
    const description =
      product.meta_description?.trim() || product.description?.slice(0, 160) || `${product.name} — available now at Zeronix UAE.`;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.setAttribute("name", "description");
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", description);
  }, [product]);

  useEffect(() => {
    let cancelled = false;
    setRelatedLoading(true);
    fetchProducts({ category: product.category.slug, perPage: 12 })
      .then((res) => {
        if (cancelled) return;
        setRelated(res.data.filter((p) => p.id !== product.id).slice(0, 10));
        setRelatedLoading(false);
      })
      .catch(() => {
        if (!cancelled) setRelatedLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [product.id, product.category.slug]);

  const specEntries = getSpecEntries(product);
  const maxQuantity = hasVariants ? Math.min(stock, 10) : 10;

  function handleAddToCart() {
    if (!inStock) return;
    addItem({
      productId: product.id,
      variantId: activeVariant?.id ?? null,
      slug: product.slug,
      name: product.name,
      variantName: activeVariant?.name ?? null,
      image: product.primary_image_url,
      categorySlug: product.category.slug,
      unitPrice: Number.parseFloat(displayPrice),
      maxQuantity: hasVariants ? stock : 10,
      quantity,
    });
    toast.success("Added to cart", {
      description: `${quantity} × ${product.name}${activeVariant ? ` (${activeVariant.name})` : ""}`,
    });
  }

  function handleWishlist() {
    toggle(product);
    toast(wishlisted ? "Removed from wishlist" : "Added to wishlist", { description: product.name });
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: product.name, url }).catch(() => {});
      return;
    }
    navigator.clipboard.writeText(url).then(() => toast.success("Link copied to clipboard"));
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-5 sm:pb-12 sm:pt-8">
      <Breadcrumb className="mb-5">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to={`/category/${product.category.slug}`}>{product.category.name}</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="line-clamp-1">{product.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-10">
        <ProductGallery
          images={product.primary_image_url ? [product.primary_image_url, ...product.images_gallery_urls.filter((u) => u !== product.primary_image_url)] : product.images_gallery_urls}
          name={product.name}
          categorySlug={product.category.slug}
          badge={product.badge}
          badgeColor={product.badge_color}
        />

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              {product.brand ? (
                <Link
                  to={`/brand/${product.brand.slug}`}
                  className="flex w-fit items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                >
                  {product.brand.logo && <img src={product.brand.logo} alt="" className="h-4 w-auto object-contain" />}
                  {product.brand.name}
                </Link>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-1">
                <Button type="button" variant="ghost" size="icon-sm" aria-label="Share product" onClick={handleShare}>
                  <Share2 className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Toggle wishlist"
                  onClick={handleWishlist}
                >
                  <Heart className={cn("size-4", wishlisted && "fill-primary text-primary")} />
                </Button>
              </div>
            </div>

            <h1 className="text-xl font-semibold leading-snug text-foreground sm:text-2xl">{product.name}</h1>

            <div className="flex flex-wrap items-center gap-3">
              {product.rating ? (
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Star className="size-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{product.rating.average.toFixed(1)}</span>
                  <span>({product.rating.count} reviews)</span>
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No reviews yet</span>
              )}
              {activeVariant?.sku && (
                <span className="text-xs text-muted-foreground">SKU: {activeVariant.sku}</span>
              )}
            </div>

            {highlights.length > 0 && (
              <ul className="mt-1 grid grid-cols-1 gap-x-4 gap-y-1 sm:grid-cols-2">
                {highlights.map(([key, value]) => (
                  <li key={key} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-3.5 shrink-0 text-primary" />
                    <span className="text-foreground">{key}:</span> {value}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5 lg:sticky lg:top-20">
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-end gap-2.5">
                <span className="text-3xl font-semibold text-foreground">{formatPrice(displayPrice)}</span>
                {strikePrice && (
                  <span className="text-base text-muted-foreground line-through">{formatPrice(strikePrice)}</span>
                )}
                {onSale && (
                  <Badge className="border-none bg-red-600 text-white">
                    -{discountPercent(product.price, product.sale_price!)}%
                  </Badge>
                )}
              </div>
              <span className="text-xs text-muted-foreground">Inclusive of VAT</span>
              <span className="text-xs text-muted-foreground">
                or 4 payments of <span className="font-medium text-foreground">{formatPrice(installment)}</span> with{" "}
                <span className="font-medium text-foreground">tabby</span>
              </span>
              <span className={cn("mt-1 flex items-center gap-1.5 text-sm font-medium", inStock ? (lowStock ? "text-amber-600" : "text-emerald-600") : "text-destructive")}>
                {inStock && <Check className="size-4" />}
                {!inStock ? "Out of stock" : lowStock ? `Only ${stock} left in stock` : "In stock, ready to ship"}
              </span>
            </div>

            {Object.keys(attributeOptions).length > 0 && (
              <div className="flex flex-col gap-3">
                {Object.entries(attributeOptions).map(([attrKey, values]) => (
                  <div key={attrKey} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-foreground">{attrKey}</span>
                    <div className="flex flex-wrap gap-2">
                      {values.map((value) => {
                        const isSelected = selectedAttrs[attrKey] === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => setSelectedAttrs((prev) => ({ ...prev, [attrKey]: value }))}
                            className={cn(
                              "rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors",
                              isSelected
                                ? "border-primary bg-accent text-primary"
                                : "border-border text-foreground hover:border-foreground/30",
                            )}
                          >
                            {value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <div className="flex w-fit items-center rounded-lg border border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                >
                  <Minus className="size-3.5" />
                </Button>
                <span className="w-10 text-center text-sm font-medium tabular-nums">{quantity}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  aria-label="Increase quantity"
                  disabled={hasVariants && quantity >= maxQuantity}
                  onClick={() => setQuantity((q) => Math.min(maxQuantity || 10, q + 1))}
                >
                  <Plus className="size-3.5" />
                </Button>
              </div>

              <Button size="lg" className="hidden flex-1 sm:flex" disabled={!inStock} onClick={handleAddToCart}>
                <ShoppingCart className="size-4" />
                Add to cart
              </Button>
            </div>

            <Separator />

            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Truck className="size-4 shrink-0 text-primary" />
                <span className="text-foreground">Free UAE delivery</span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3.5" />
                  {estimatedDelivery()}
                </span>
              </div>
              {trustPoints.map(({ icon: Icon, label, detail }) => (
                <div key={label} className="flex items-center gap-2.5 text-sm">
                  <Icon className="size-4 shrink-0 text-primary" />
                  <span className="text-foreground">{label}</span>
                  <span className="text-muted-foreground">— {detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 sm:mt-16">
        <Tabs defaultValue="description">
          <TabsList variant="line" className="w-full justify-start border-b border-border">
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="specs" disabled={specEntries.length === 0}>
              Specifications
            </TabsTrigger>
            <TabsTrigger value="reviews">Ratings & Reviews</TabsTrigger>
          </TabsList>
          <TabsContent value="description" className="pt-5">
            {product.description ? (
              <p className="max-w-3xl whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">No description available for this product yet.</p>
            )}
          </TabsContent>
          <TabsContent value="specs" className="pt-5">
            {specEntries.length > 0 && (
              <dl className="grid max-w-3xl grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {specEntries.map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between gap-4 border-b border-border pb-2">
                    <dt className="text-sm text-muted-foreground">{key}</dt>
                    <dd className="text-sm font-medium text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </TabsContent>
          <TabsContent value="reviews" className="pt-5">
            {product.rating ? (
              <div className="flex items-center gap-4">
                <span className="text-4xl font-semibold text-foreground">{product.rating.average.toFixed(1)}</span>
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "size-4",
                          i < Math.round(product.rating!.average) ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30",
                        )}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">Based on {product.rating.count} reviews</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed border-border p-6">
                <p className="text-sm text-muted-foreground">
                  This product has no reviews yet. Be the first to share your experience.
                </p>
                <Button variant="outline" size="sm" onClick={() => toast("Reviews are coming soon")}>
                  Write a review
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {(relatedLoading || related.length > 0) && (
        <section className="mt-12 sm:mt-16">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">You may also like</h2>
            <Link
              to={`/category/${product.category.slug}`}
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              View all
              <ChevronRight className="size-3.5" />
            </Link>
          </div>
          <Carousel opts={{ align: "start" }}>
            <CarouselContent className="-ml-4">
              {relatedLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <CarouselItem key={i} className="basis-1/3 pl-4 sm:basis-1/4 lg:basis-1/5">
                      <ProductCardSkeleton />
                    </CarouselItem>
                  ))
                : related.map((item) => (
                    <CarouselItem key={item.id} className="basis-1/3 pl-4 sm:basis-1/4 lg:basis-1/5">
                      <ProductCard product={item} />
                    </CarouselItem>
                  ))}
            </CarouselContent>
          </Carousel>
        </section>
      )}

      <div className="fixed inset-x-0 bottom-16 z-30 flex items-center gap-3 border-t border-border bg-background/95 p-3 backdrop-blur supports-backdrop-filter:bg-background/80 sm:hidden">
        <div className="flex flex-col">
          <span className="text-base font-semibold text-foreground">{formatPrice(displayPrice)}</span>
          {strikePrice && <span className="text-xs text-muted-foreground line-through">{formatPrice(strikePrice)}</span>}
        </div>
        <Button variant="outline" size="icon-lg" aria-label="Toggle wishlist" onClick={handleWishlist}>
          <Heart className={cn("size-4", wishlisted && "fill-primary text-primary")} />
        </Button>
        <Button size="lg" className="flex-1" disabled={!inStock} onClick={handleAddToCart}>
          <ShoppingCart className="size-4" />
          Add to cart
        </Button>
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-5 h-4 w-64" />
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Skeleton className="aspect-square w-full rounded-xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-40" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function ProductNotFound() {
  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
        <Package className="size-6" strokeWidth={1.5} />
      </span>
      <h1 className="text-2xl font-semibold text-foreground">Product not found</h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        This product may have been removed or is no longer available.
      </p>
      <Button asChild>
        <Link to="/">Back to Home</Link>
      </Button>
    </div>
  );
}
