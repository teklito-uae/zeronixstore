import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface BrandItem {
  name: string;
  slug: string;
}

// Text-only, no logo assets to source/host — bold names read as clean at
// marquee speed and never break if a brand's mark changes.
const brandNames = [
  "Lenovo", "ASUS", "HP", "Samsung", "Acer", "Apple", "Dell", "Intel",
  "AMD", "MSI", "LG", "NVIDIA", "Razer", "Corsair", "SteelSeries", "HyperX",
  "NZXT", "Synology", "Sony", "Huawei", "Xiaomi", "Seagate", "Redragon", "Oppo",
];

const brands: BrandItem[] = brandNames.map((name) => ({
  name,
  slug: name.toLowerCase().replace(/\s+/g, "-"),
}));

const mid = Math.ceil(brands.length / 2);
const rowA = brands.slice(0, mid);
const rowB = brands.slice(mid);

function MarqueeRow({ items, reverse, duration }: { items: BrandItem[]; reverse?: boolean; duration: number }) {
  // Item list rendered twice back-to-back — translating the track exactly
  // -50% loops seamlessly no matter how wide the content ends up being.
  const track = [...items, ...items];

  return (
    <div className="group/row overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div
        className={cn(
          "flex w-max items-center gap-2 [animation-duration:var(--marquee-d)] [animation-iteration-count:infinite] [animation-name:brand-marquee] [animation-timing-function:linear] group-hover/row:[animation-play-state:paused] motion-reduce:[animation-play-state:paused] sm:gap-2.5",
          reverse && "[animation-direction:reverse]",
        )}
        style={{ ["--marquee-d" as string]: `${duration}s` }}
      >
        {track.map((b, i) => (
          <Link
            key={`${b.slug}-${i}`}
            to={`/brand/${b.slug}`}
            className="shrink-0 whitespace-nowrap rounded-full border border-border bg-muted/40 px-4 py-1.5 text-sm font-bold tracking-tight text-foreground transition-colors hover:border-primary/30 hover:bg-accent hover:text-primary sm:px-5 sm:py-2 sm:text-base"
          >
            {b.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function BrandsShowcase() {
  return (
    <section className="border-y border-border bg-background py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-3 text-base font-semibold text-foreground sm:mb-5 sm:text-xl">Shop By Brand</h2>
        <div className="flex flex-col gap-2 sm:gap-2.5">
          <MarqueeRow items={rowA} duration={26} />
          <MarqueeRow items={rowB} duration={30} reverse />
        </div>
      </div>
    </section>
  );
}
