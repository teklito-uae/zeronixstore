import { useState } from "react";
import { ArrowRight, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/format";
import { getSpecEntries } from "@/lib/specs";
import { cn } from "@/lib/utils";
import { mockProducts } from "@/features/products/mock-data";

function bySlug(slug: string) {
  const product = mockProducts.find((p) => p.slug === slug);
  if (!product) throw new Error(`Unknown hero spotlight product: ${slug}`);
  return product;
}

// Tab-driven hero: picking a category swaps the copy AND the spotlighted product.
// No autoplay, no dots, no arrows — the visitor drives it, not a timer.
const heroTabs = [
  {
    key: "laptops",
    label: "Laptops",
    eyebrow: "RTX 40-Series in stock",
    accentWord: "compromise.",
    copy: "Gaming laptops configured, tested and delivered across the UAE. This week: up to 12% off flagship builds.",
    href: "/category/laptops",
    product: bySlug("lenovo-legion-pro-7i"),
  },
  {
    key: "desktops",
    label: "Desktops",
    eyebrow: "Build your rig",
    accentWord: "limits.",
    copy: "Prebuilt towers or a spec sheet of your own — configured and delivered across the UAE.",
    href: "/category/desktops",
    product: bySlug("asus-rog-strix-g16ch"),
  },
  {
    key: "monitors",
    label: "Monitors",
    eyebrow: "Display sale",
    accentWord: "blur.",
    copy: "4K, ultrawide and 240Hz panels — this week's monitor lineup is discounted up to 42%.",
    href: "/category/monitors",
    product: bySlug("dell-u2725qe-ultrasharp-27"),
  },
  {
    key: "components",
    label: "Components",
    eyebrow: "New arrival",
    accentWord: "lag.",
    copy: "The latest NVIDIA graphics cards are in stock now, ready to ship across the UAE.",
    href: "/category/graphics-cards",
    product: bySlug("nvidia-rtx-4080-super"),
  },
];

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);
  const tab = heroTabs[activeIndex];
  const product = tab.product;
  const onSale = product.sale_price !== null;
  const specRows = getSpecEntries(product).slice(0, 4);

  return (
    <section className="dark relative overflow-hidden bg-background text-foreground clip-angle-b pb-12 pt-6 sm:pb-24 sm:pt-14">
      {/* Oversized angular mark, echoing the logo, as background texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 size-[420px] rotate-12 bg-primary/10"
        style={{ clipPath: "polygon(30% 0, 100% 0, 100% 70%, 70% 100%, 0 100%, 0 30%)" }}
      />

      <div className="relative mx-auto max-w-7xl px-4">
        <div
          role="tablist"
          aria-label="Featured category"
          className="no-scrollbar mb-6 flex w-fit max-w-full gap-1 overflow-x-auto rounded-full border border-border bg-card/60 p-1 backdrop-blur sm:mb-8"
        >
          {heroTabs.map((t, i) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={i === activeIndex}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "rounded-full px-4 py-1.5 text-xs font-semibold transition-colors sm:text-sm",
                i === activeIndex
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div
          key={tab.key}
          className="grid grid-cols-1 items-center gap-10 duration-300 animate-in fade-in slide-in-from-bottom-2 lg:grid-cols-[1.1fr_0.9fr] lg:gap-6"
        >
          <div className="flex flex-col gap-5">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
              <Zap className="size-3.5" />
              {tab.eyebrow}
            </span>
            <h1 className="max-w-xl text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Serious hardware.
              <br />
              <span className="text-primary">Zero {tab.accentWord}</span>
            </h1>
            <p className="max-w-md text-sm text-muted-foreground sm:text-base">{tab.copy}</p>
            <div className="flex flex-wrap gap-3">
              <Button size="lg" asChild>
                <Link to={tab.href}>
                  Shop {tab.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/category/desktops">Build Your PC</Link>
              </Button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-border bg-card p-5 shadow-2xl shadow-black/20 sm:p-6">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {product.brand?.name} · Spotlight
                </span>
                <h2 className="mt-1 text-lg font-semibold text-foreground">{product.name}</h2>
              </div>
              {product.badge && (
                <span className="shrink-0 rounded-full bg-destructive/15 px-2.5 py-1 text-xs font-semibold text-destructive">
                  {product.badge}
                </span>
              )}
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 border-y border-border py-4">
              {specRows.map(([label, value]) => (
                <div key={label} className="flex items-baseline gap-2">
                  <span className="size-1 shrink-0 rotate-45 bg-primary" aria-hidden />
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="ml-auto truncate text-xs font-medium text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-4 flex items-end justify-between">
              <div>
                <div className="text-2xl font-semibold text-foreground">
                  {formatPrice(onSale ? product.sale_price! : product.price)}
                </div>
                {onSale && (
                  <div className="text-sm text-muted-foreground line-through">
                    {formatPrice(product.price)}
                  </div>
                )}
              </div>
              <Button asChild>
                <Link to={`/products/${product.slug}`}>
                  View Product
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
