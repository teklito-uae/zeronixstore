import { TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";

// Internal-linking / keyword-coverage block: product x brand x UAE-location
// combinations shoppers (and LLM search crawlers) actually type. Doesn't
// need to be exhaustive — it needs real anchor text pointing at real pages
// so crawlers can associate this catalog with these terms.
const popularSearches: { label: string; href: string }[] = [
  { label: "Gaming Laptop Dubai", href: "/category/gaming-laptops" },
  { label: "Gaming PC Abu Dhabi", href: "/category/gaming-pcs" },
  { label: "RTX 4070 Graphics Card UAE", href: "/category/graphics-cards" },
  { label: "ASUS ROG Laptop Dubai", href: "/brand/asus" },
  { label: "MSI Gaming Laptop UAE", href: "/brand/msi" },
  { label: "4K Monitor Dubai", href: "/category/4k-ultrawide-monitors" },
  { label: "Mechanical Keyboard UAE", href: "/category/keyboards-mice" },
  { label: "Gaming Headset Abu Dhabi", href: "/category/headsets" },
  { label: "NVMe SSD UAE", href: "/category/storage" },
  { label: "Intel Core i9 Processor Dubai", href: "/category/processors" },
  { label: "Business Laptop Sharjah", href: "/category/business-laptops" },
  { label: "Dell Monitor UAE", href: "/brand/dell" },
  { label: "Razer Keyboard Dubai", href: "/brand/razer" },
  { label: "Corsair RAM UAE", href: "/brand/corsair" },
  { label: "Logitech Mouse Dubai", href: "/brand/logitech" },
  { label: "Custom PC Build UAE", href: "/category/gaming-pcs" },
  { label: "Best Gaming Laptop UAE", href: "/category/gaming-laptops" },
  { label: "Ultrawide Monitor UAE", href: "/category/4k-ultrawide-monitors" },
  { label: "Webcam for Streaming Dubai", href: "/category/webcams-streaming" },
  { label: "Laptop Deals Dubai", href: "/deals" },
  { label: "2 in 1 Laptop UAE", href: "/category/2-in-1-laptops" },
  { label: "Mini PC Abu Dhabi", href: "/category/mini-pcs" },
  { label: "HP Laptop UAE", href: "/brand/hp" },
  { label: "Lenovo Legion Dubai", href: "/brand/lenovo" },
];

export function PopularSearches() {
  return (
    <section className="py-8 sm:py-14">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-5 flex items-center gap-2">
          <TrendingUp className="size-4 text-primary" strokeWidth={1.75} />
          <h2 className="text-sm font-semibold text-foreground sm:text-base">Popular Searches</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularSearches.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
