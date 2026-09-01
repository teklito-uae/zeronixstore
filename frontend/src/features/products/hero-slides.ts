export interface HeroSlide {
  id: string;
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

/**
 * Homepage hero slider. `image` is a placeholder — swap it for the real
 * brand campaign photo (same path, or update the string) with no other
 * code changes needed. Recommended source size: 1920x960, dark/moody so
 * white overlay text stays legible; the gradient scrim compensates for
 * lighter images.
 */
export const heroSlides: HeroSlide[] = [
  {
    id: "laptops",
    eyebrow: "RTX 40-Series in stock",
    title: "Serious hardware.",
    highlight: "Zero compromise.",
    description:
      "Gaming laptops configured, tested and delivered across the UAE. This week: up to 12% off flagship builds.",
    image: "/hero/slide-laptops.svg",
    ctaLabel: "Shop Laptops",
    ctaHref: "/category/laptops",
    secondaryCtaLabel: "Build Your PC",
    secondaryCtaHref: "/category/desktops",
  },
  {
    id: "desktops",
    eyebrow: "Build your rig",
    title: "Serious hardware.",
    highlight: "Zero limits.",
    description: "Prebuilt towers or a spec sheet of your own — configured and delivered across the UAE.",
    image: "/hero/slide-desktops.svg",
    ctaLabel: "Shop Desktops",
    ctaHref: "/category/desktops",
    secondaryCtaLabel: "Compare Builds",
    secondaryCtaHref: "/category/gaming-pcs",
  },
  {
    id: "components",
    eyebrow: "New arrival",
    title: "Serious hardware.",
    highlight: "Zero lag.",
    description: "The latest NVIDIA graphics cards are in stock now, ready to ship across the UAE.",
    image: "/hero/slide-components.svg",
    ctaLabel: "Shop Components",
    ctaHref: "/category/graphics-cards",
    secondaryCtaLabel: "Shop Processors",
    secondaryCtaHref: "/category/processors",
  },
  {
    id: "monitors",
    eyebrow: "Display sale",
    title: "Serious hardware.",
    highlight: "Zero blur.",
    description: "4K, ultrawide and 240Hz panels — this week's monitor lineup is discounted up to 42%.",
    image: "/hero/slide-monitors.svg",
    ctaLabel: "Shop Monitors",
    ctaHref: "/category/monitors",
    secondaryCtaLabel: "4K & Ultrawide",
    secondaryCtaHref: "/category/4k-ultrawide-monitors",
  },
];
