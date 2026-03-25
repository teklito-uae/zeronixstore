import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { api } from '../../lib/api';
import { HorizontalProductCard } from './HorizontalProductCard';
import { HorizontalProductCardSkeleton } from '../ui/skeletons/HorizontalProductCardSkeleton';

export function RecommendedProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        setLoading(true);
        const res = await api.get('/products');
        const allProducts = res.data.data || [];
        const randomized = [...allProducts].sort(() => Math.random() - 0.5).slice(0, 9);
        setProducts(randomized);
      } catch (err) {
        console.error("Failed to fetch recommended products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  if (loading) {
    return (
      <section className="py-4 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        <div className="flex items-center justify-between mb-5">
          <div className="h-6 w-48 bg-bg-surface border border-border-subtle/50 rounded animate-pulse" />
        </div>
        <div className="block lg:hidden">
           <HorizontalProductCardSkeleton />
        </div>
        <div className="hidden lg:grid lg:grid-cols-3 gap-5">
          {[1, 2, 3].map(i => <HorizontalProductCardSkeleton key={i} />)}
        </div>
      </section>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="py-4 lg:py-8 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
      {/* Header — Clean, no broken nav buttons */}
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">
          Recommended For You
        </h2>
      </div>

      {/* Mobile: Swiper (1 card at a time) */}
      <div className="block lg:hidden">
        <Swiper spaceBetween={16} slidesPerView={1} className="!pb-4">
          {products.map((product) => (
            <SwiperSlide key={`mobile-${product.id}`}>
              <HorizontalProductCard
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                image={product.primary_image_url || product.images?.[0]}
                category={product.category?.name || "Gaming Gear"}
                rating={4 + Math.random()}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Desktop: 3-col Grid */}
      <div className="hidden lg:grid lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <HorizontalProductCard
            key={product.id}
            name={product.name}
            slug={product.slug}
            price={product.price}
            sale_price={product.sale_price}
            image={product.primary_image_url || product.images?.[0]}
            category={product.category?.name || "Gaming Gear"}
            rating={4 + Math.random()}
          />
        ))}
      </div>
    </section>
  );
}
