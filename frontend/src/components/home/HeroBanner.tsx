import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { cn } from "@/lib/utils";
import { heroSlides } from "@/features/products/hero-slides";

// Pure image slider — each slide is a full banner graphic with its own copy
// and CTA baked in, so there's nothing to overlay here. Swap the `image`
// path per slide in hero-slides.ts to point at new campaign banners.
export function HeroBanner() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [
    Autoplay({ delay: 5500, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
      emblaApi.off("reInit", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi]);
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  return (
    <section className="py-6 sm:py-10">
      <div className="relative mx-auto max-w-7xl px-4">
        <div className="overflow-hidden rounded-lg" ref={emblaRef}>
          <div className="flex">
            {heroSlides.map((slide) => (
              <div key={slide.id} className="min-w-0 flex-[0_0_100%]">
                <img
                  src={slide.image}
                  alt=""
                  className="aspect-[3419/887] w-full object-cover"
                  loading="eager"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Arrows */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={scrollPrev}
          className="absolute inset-y-0 left-6 hidden w-11 items-center justify-center sm:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white/80 backdrop-blur transition-colors hover:text-white">
            <ChevronLeft className="size-5" />
          </span>
        </button>
        <button
          type="button"
          aria-label="Next slide"
          onClick={scrollNext}
          className="absolute inset-y-0 right-6 hidden w-11 items-center justify-center sm:flex"
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-black/25 text-white/80 backdrop-blur transition-colors hover:text-white">
            <ChevronRight className="size-5" />
          </span>
        </button>

        {/* Dots — dark backdrop so they read on banners of any brightness */}
        <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-2 sm:bottom-5">
          <div className="flex items-center gap-2 rounded-full bg-black/25 px-2.5 py-1.5 backdrop-blur">
            {heroSlides.map((slide, i) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === selectedIndex}
                onClick={() => scrollTo(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/70 hover:bg-white/90",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
