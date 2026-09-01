import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight, Zap } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { heroSlides } from "@/features/products/hero-slides";

// Autoplaying image slider — each slide is a full-bleed brand/campaign image with a
// text + CTA overlay. Swap frontend/src/features/products/hero-slides.ts to point at
// real brand photography; the slider itself doesn't change.
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
    <section className="dark relative overflow-hidden bg-background">
      <div className="relative h-[440px] sm:h-[520px] lg:h-[600px]" ref={emblaRef}>
        <div className="flex h-full">
          {heroSlides.map((slide) => (
            <div key={slide.id} className="relative h-full min-w-0 flex-[0_0_100%]">
              <img
                src={slide.image}
                alt=""
                aria-hidden
                className="absolute inset-0 size-full object-cover"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-black/10" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

              <div className="relative mx-auto flex h-full max-w-7xl items-center px-4">
                <div className="flex max-w-xl flex-col gap-5">
                  <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-foreground/90 ring-1 ring-inset ring-primary/40">
                    <Zap className="size-3.5 text-primary" />
                    {slide.eyebrow}
                  </span>
                  <h1 className="text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-6xl">
                    {slide.title}
                    <br />
                    <span className="text-primary">{slide.highlight}</span>
                  </h1>
                  <p className="max-w-md text-sm text-white/80 sm:text-base">{slide.description}</p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" asChild>
                      <Link to={slide.ctaHref}>
                        {slide.ctaLabel}
                        <ArrowRight className="size-4" />
                      </Link>
                    </Button>
                    {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white"
                        asChild
                      >
                        <Link to={slide.secondaryCtaHref}>{slide.secondaryCtaLabel}</Link>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={scrollPrev}
        className="absolute inset-y-0 left-2 hidden w-11 items-center justify-center text-white/70 transition-colors hover:text-white sm:flex"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur">
          <ChevronLeft className="size-5" />
        </span>
      </button>
      <button
        type="button"
        aria-label="Next slide"
        onClick={scrollNext}
        className="absolute inset-y-0 right-2 hidden w-11 items-center justify-center text-white/70 transition-colors hover:text-white sm:flex"
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-black/25 backdrop-blur">
          <ChevronRight className="size-5" />
        </span>
      </button>

      {/* Dots */}
      <div className="absolute inset-x-0 bottom-5 flex items-center justify-center gap-2">
        {heroSlides.map((slide, i) => (
          <button
            key={slide.id}
            type="button"
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === selectedIndex}
            onClick={() => scrollTo(i)}
            className={cn(
              "h-1.5 rounded-full transition-all",
              i === selectedIndex ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/60",
            )}
          />
        ))}
      </div>
    </section>
  );
}
