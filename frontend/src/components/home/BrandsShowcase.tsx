import { Link } from "react-router-dom";

interface BrandLogo {
  name: string;
  slug: string;
}

// Curated, not DB-driven — the real imported Brand rows include scrape
// artifacts ("Microless", "Generic") and long-tail accessory brands with no
// available logo asset, which would look broken in a logo wall. This list is
// real, recognizable brands with a real logo file in public/brands/
// (sourced from Simple Icons, CC0-licensed, downloaded to public/brands/).
const brands: BrandLogo[] = [
  { name: "Lenovo", slug: "lenovo" },
  { name: "ASUS", slug: "asus" },
  { name: "HP", slug: "hp" },
  { name: "Samsung", slug: "samsung" },
  { name: "Acer", slug: "acer" },
  { name: "Apple", slug: "apple" },
  { name: "Dell", slug: "dell" },
  { name: "Intel", slug: "intel" },
  { name: "AMD", slug: "amd" },
  { name: "MSI", slug: "msi" },
  { name: "LG", slug: "lg" },
  { name: "NVIDIA", slug: "nvidia" },
  { name: "Razer", slug: "razer" },
  { name: "Corsair", slug: "corsair" },
  { name: "SteelSeries", slug: "steelseries" },
  { name: "HyperX", slug: "hyperx" },
  { name: "NZXT", slug: "nzxt" },
  { name: "Synology", slug: "synology" },
  { name: "Sony", slug: "sony" },
  { name: "Huawei", slug: "huawei" },
  { name: "Xiaomi", slug: "xiaomi" },
  { name: "Seagate", slug: "seagate" },
  { name: "Redragon", slug: "redragon" },
  { name: "Oppo", slug: "oppo" },
];

export function BrandsShowcase() {
  return (
    <section className="border-y border-border bg-background py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mb-8 text-center text-xl font-semibold text-foreground sm:text-2xl">
          Shop By Brands
        </h2>
        <div className="grid grid-cols-3 gap-x-6 gap-y-8 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
          {brands.map((b) => (
            <Link
              key={b.slug}
              to={`/brand/${b.slug}`}
              aria-label={b.name}
              className="flex h-12 items-center justify-center p-2 opacity-90 transition-opacity hover:opacity-100 sm:h-14"
            >
              <img
                src={`/brands/${b.slug}.svg`}
                alt={b.name}
                className="h-full max-h-9 w-auto max-w-[140px] object-contain sm:max-h-11"
                loading="lazy"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
