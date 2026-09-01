import { BrandsShowcase } from "@/components/home/BrandsShowcase";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { FAQSection } from "@/components/home/FAQSection";
import { HeroBanner } from "@/components/home/HeroBanner";
import { Newsletter } from "@/components/home/Newsletter";
import { PopularSearches } from "@/components/home/PopularSearches";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { StatsBar } from "@/components/home/StatsBar";
import { useHomeCatalog } from "@/features/products/useHomeCatalog";
import { useLazyProducts } from "@/features/products/useLazyProducts";

export default function Home() {
  const { loading, homeCategories } = useHomeCatalog();

  const deals = useLazyProducts({ perPage: 30, filter: (p) => p.sale_price !== null, limit: 10 });
  const laptops = useLazyProducts({ category: "laptops", perPage: 16 });
  const monitors = useLazyProducts({ category: "monitors", perPage: 16 });
  const components = useLazyProducts({ category: "components", perPage: 16 });
  const storage = useLazyProducts({ category: "storage", perPage: 16 });
  const accessories = useLazyProducts({ category: "accessories", perPage: 16 });

  return (
    <>
      <HeroBanner />
      <CategoryStrip categories={homeCategories} loading={loading} />
      <ProductCarousel
        title="Today's Deals"
        products={deals.products}
        viewAllHref="/deals"
        tone="deal"
        loading={deals.loading}
        sectionRef={deals.ref}
      />
      <ProductCarousel
        title="Gaming Laptops"
        description="From everyday gaming to flagship RTX rigs"
        products={laptops.products}
        viewAllHref="/category/laptops"
        loading={laptops.loading}
        sectionRef={laptops.ref}
      />
      <ProductCarousel
        title="Top Monitors"
        description="Straight from our latest UAE stock feed"
        products={monitors.products}
        viewAllHref="/category/monitors"
        loading={monitors.loading}
        sectionRef={monitors.ref}
      />
      <BrandsShowcase />
      <StatsBar />
      <ProductCarousel
        title="Graphics Cards & Components"
        description="Upgrade parts for your next build"
        products={components.products}
        viewAllHref="/category/graphics-cards"
        loading={components.loading}
        sectionRef={components.ref}
      />
      <ProductCarousel
        title="Storage & Memory"
        description="NVMe SSDs and RAM kits, ready to ship"
        products={storage.products}
        viewAllHref="/category/storage"
        loading={storage.loading}
        sectionRef={storage.ref}
      />
      <ProductCarousel
        title="Accessories & Peripherals"
        description="Keyboards, mice, headsets and streaming gear"
        products={accessories.products}
        viewAllHref="/category/accessories"
        loading={accessories.loading}
        sectionRef={accessories.ref}
      />
      <FAQSection />
      <PopularSearches />
      <Newsletter />
    </>
  );
}
