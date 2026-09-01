export interface HeroSlide {
  id: string;
  image: string;
}

/**
 * Homepage hero slider. Each slide is a self-contained banner graphic (copy,
 * CTA and all baked into the image itself) — the slider renders nothing on
 * top of it. Add/replace entries here as new campaign banners come in.
 */
export const heroSlides: HeroSlide[] = [
  { id: "slide-1", image: "/hero/Lenovo-Banner.jpg" },
  { id: "slide-2", image: "/hero/Lenove-T.I-Hero-Banner.webp" },
  { id: "slide-3", image: "/hero/HeroBanner_LenovoYoga_1700x650px.jpg" },
];
