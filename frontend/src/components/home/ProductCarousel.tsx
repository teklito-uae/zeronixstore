import { ArrowRight, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";
import type { Product } from "@/features/products/types";

interface ProductCarouselProps {
  title: string;
  description?: string;
  products: Product[];
  viewAllHref?: string;
  loading?: boolean;
  tone?: "default" | "deal";
}

export function ProductCarousel({
  title,
  description,
  products,
  viewAllHref,
  loading,
  tone = "default",
}: ProductCarouselProps) {
  const isDeal = tone === "deal";

  return (
    <section className={cn("relative py-8 sm:py-14", isDeal && "dark bg-background text-foreground")}>
      {isDeal && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-primary/10"
          style={{ maskImage: "radial-gradient(60% 80% at 15% 0%, black, transparent)" }}
        />
      )}
      <Carousel opts={{ align: "start" }} className="relative mx-auto max-w-7xl px-4">
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            {isDeal && (
              <span className="mb-1 inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                <Flame className="size-3.5" />
                Limited time
              </span>
            )}
            <h2 className="text-xl font-semibold text-foreground sm:text-2xl">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {viewAllHref && (
              <Button variant="ghost" size="sm" asChild>
                <Link to={viewAllHref}>
                  View all
                  <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            )}
            <div className="hidden items-center gap-1.5 sm:flex">
              <CarouselPrevious className="static size-8 translate-x-0 translate-y-0" />
              <CarouselNext className="static size-8 translate-x-0 translate-y-0" />
            </div>
          </div>
        </div>

        <CarouselContent className="-ml-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <CarouselItem key={i} className="basis-[68%] pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4">
                  <ProductCardSkeleton />
                </CarouselItem>
              ))
            : products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-[68%] pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
