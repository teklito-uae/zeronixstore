import { BrandStrip } from "@/components/home/BrandStrip";
import { CategoryStrip } from "@/components/home/CategoryStrip";
import { HeroBanner } from "@/components/home/HeroBanner";
import { Newsletter } from "@/components/home/Newsletter";
import { ProductCarousel } from "@/components/home/ProductCarousel";
import { StatsBar } from "@/components/home/StatsBar";
import {
  dealProducts,
  mockBrands,
  mockCategories,
  productsByCategory,
} from "@/features/products/mock-data";

export default function Home() {
  return (
    <>
      <HeroBanner />
      <CategoryStrip categories={mockCategories} />
      <ProductCarousel
        title="Today's Deals"
        products={dealProducts}
        viewAllHref="/deals"
        tone="deal"
      />
      <ProductCarousel
        title="Gaming Laptops"
        description="From everyday gaming to flagship RTX rigs"
        products={productsByCategory("laptops")}
        viewAllHref="/category/laptops"
      />
      <ProductCarousel
        title="Top Monitors"
        description="Straight from our latest UAE stock feed"
        products={productsByCategory("monitors")}
        viewAllHref="/category/monitors"
      />
      <BrandStrip brands={mockBrands} />
      <StatsBar />
      <ProductCarousel
        title="Graphics Cards & Components"
        description="Upgrade parts for your next build"
        products={[...productsByCategory("graphics-cards"), ...productsByCategory("processors")]}
        viewAllHref="/category/graphics-cards"
      />
      <Newsletter />
    </>
  );
}
