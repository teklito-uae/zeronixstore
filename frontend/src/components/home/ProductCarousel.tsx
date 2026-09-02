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
        <div className="mb-3 flex items-end justify-between gap-3 sm:mb-5 sm:gap-4">
          <div>
            {isDeal && (
              <span className="mb-1 inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-orange-600 sm:px-3 sm:py-1 sm:text-xs">
                <Flame className="size-3" />
                Limited time
              </span>
            )}
            <h2 className="text-base font-semibold text-foreground sm:text-2xl">{title}</h2>
            {description && <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">{description}</p>}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {viewAllHref && (
              <Button variant="ghost" size="sm" asChild className="h-7 px-2 text-xs sm:h-9 sm:px-3 sm:text-sm">
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

        <CarouselContent className="-ml-2 sm:-ml-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <CarouselItem key={i} className="basis-1/3 pl-2 sm:basis-1/4 sm:pl-4 md:basis-1/5 lg:basis-1/6">
                  <ProductCardSkeleton />
                </CarouselItem>
              ))
            : products.map((product) => (
                <CarouselItem
                  key={product.id}
                  className="basis-1/3 pl-2 sm:basis-1/4 sm:pl-4 md:basis-1/5 lg:basis-1/6"
                >
                  <ProductCard product={product} />
                </CarouselItem>
              ))}
        </CarouselContent>
      </Carousel>
    </section>
  );
}
