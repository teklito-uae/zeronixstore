export interface HeroSlide {
  id: string;
  image: string;
}

/**
 * Homepage hero slider. Each slide is a self-contained banner graphic (copy,
 * CTA and all baked into the image itself) — the slider renders nothing on
 * top of it. Add/replace entries here as new campaign banners come in; all
 * four currently point at the same back-to-school banner as a placeholder.
 */
export const heroSlides: HeroSlide[] = [
  { id: "slide-1", image: "/hero/backtoschool-zeronix-offer.webp" },
  { id: "slide-2", image: "/hero/backtoschool-zeronix-offer.webp" },
  { id: "slide-3", image: "/hero/backtoschool-zeronix-offer.webp" },
  { id: "slide-4", image: "/hero/backtoschool-zeronix-offer.webp" },
];
