export interface HeroSlide {
  id: string;
  image: string;
}

/**
 * Homepage hero slider. Each slide is a self-contained banner graphic (copy,
 * CTA and all baked into the image itself) — the slider renders nothing on
 * top of it. Add/replace entries here as new campaign banners come in.
 *
 * The slider is sized to a 1700x650 aspect ratio to match these brand
 * banners exactly (their logos/badges sit right at the edges, so any crop
 * would cut into them) — keep new banners at that same ratio where possible.
 */
export const heroSlides: HeroSlide[] = [
  { id: "slide-1", image: "/hero/backtoschool-zeronix-offer.webp" },
  { id: "slide-2", image: "/hero/HeroBanner_IdeaPad_1700x650px.jpg" },
  { id: "slide-3", image: "/hero/HeroBanner_LenovoYoga_1700x650px.jpg" },
  { id: "slide-4", image: "/hero/backtoschool-zeronix-offer.webp" },
];
