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
  sectionRef?: React.Ref<HTMLElement>;
}

export function ProductCarousel({
  title,
  description,
  products,
  viewAllHref,
  loading,
  tone = "default",
  sectionRef,
}: ProductCarouselProps) {
  const isDeal = tone === "deal";

  return (
    <section
      ref={sectionRef}
      className={cn(
        "relative py-6 sm:py-10",
        isDeal && "border-y border-orange-100 bg-gradient-to-b from-orange-50 via-amber-50/40 to-transparent",
      )}
    >
      <Carousel opts={{ align: "start" }} className="relative mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            {isDeal && (
              <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-orange-600">
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

        <CarouselContent className="-ml-3 sm:-ml-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CarouselItem key={i} className="basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 md:basis-1/4 lg:basis-1/6">
                  <ProductCardSkeleton />
                </CarouselItem>
              ))
            : products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-1/2 pl-3 sm:basis-1/3 sm:pl-4 md:basis-1/4 lg:basis-1/6"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
