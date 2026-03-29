import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useInView } from 'react-intersection-observer';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';

import {
  ArrowRight,
  Cpu,
  Laptop,
  Gamepad2,
  Headphones,
  ShieldCheck,
  Truck,
  ArrowUpRight,
  Clock,
  Monitor,
  Wifi,
  HardDrive
} from 'lucide-react';


import { ProductCard } from '../components/product/ProductCard';
import { ProductCardSkeleton } from '../components/ui/skeletons/ProductCardSkeleton';
import { RecommendedProducts } from '../components/product/RecommendedProducts';
import { STORAGE_URL } from '../lib/api';
import { useApiCache } from '../store/apiCache';

const CATEGORIES = [
  { name: 'Tablet', slug: 'tablets', icon: Laptop, image: '' },
  { name: 'Smartphone', slug: 'smartphones', icon: Cpu, image: '' },
  { name: 'Game Console', slug: 'gaming', icon: Gamepad2, image: '' },
  { name: 'Camera', slug: 'cameras', icon: Monitor, image: '' },
  { name: 'Smartwatch', slug: 'wearables', icon: Clock, image: '' },
  { name: 'Drone & Flycam', slug: 'drones', icon: Wifi, image: '' },
  { name: 'Audio', slug: 'audio', icon: Headphones, image: '' },
  { name: 'Computer', slug: 'computers', icon: HardDrive, image: '' },
];

const BANNERS = [
  {
    image: `${STORAGE_URL}/banner/amplimart-mosque-desktop.webp`,
    title: 'Premium Mosque Audio Systems',
    subtitle: 'From expert procurement to flawless installation',
    buttonText: 'Shop Now',
    buttonLink: '/products?category=audio'
  },
  { image: `${STORAGE_URL}/banner/202403210019792.jpg` },
  { image: `${STORAGE_URL}/banner/202406270020830.jpg` },
  { image: `${STORAGE_URL}/banner/202411270027244.jpg` },
  { image: `${STORAGE_URL}/banner/202508080076992.jpg` },
  { image: `${STORAGE_URL}/banner/202508210078461.jpg` },
];


// Reusable Carousel Component
const ProductCarousel = ({ children }: { children: React.ReactNode }) => (
  <Swiper
    spaceBetween={16}
    slidesPerView={2}
    breakpoints={{
      640: { slidesPerView: 2.5, spaceBetween: 24 },
      1024: { slidesPerView: 4, spaceBetween: 24 },
      1440: { slidesPerView: 5, spaceBetween: 32 },
    }}
    className="!pb-12"
  >
    {Array.isArray(children) ? children.map((child, i) => (
      <SwiperSlide key={i} className="!h-auto flex">{child}</SwiperSlide>
    )) : <SwiperSlide className="!h-auto flex">{children}</SwiperSlide>}
  </Swiper>
);

const ProductCarouselSkeleton = () => (
  <ProductCarousel>
    {[1, 2, 3, 4, 5].map((i) => (
      <ProductCardSkeleton key={i} />
    ))}
  </ProductCarousel>
);

export default function Home() {
  const [timeLeft, setTimeLeft] = useState({ hours: 12, minutes: 45, seconds: 30 });
  const [deals, setDeals] = useState<any[]>([]);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [caseProducts, setCaseProducts] = useState<any[]>([]);
  const [coolingProducts, setCoolingProducts] = useState<any[]>([]);
  const [psuProducts, setPsuProducts] = useState<any[]>([]);

  const [dealsLoading, setDealsLoading] = useState(false);
  const [arrivalsLoading, setArrivalsLoading] = useState(false);
  const [casesLoading, setCasesLoading] = useState(false);
  const [coolingLoading, setCoolingLoading] = useState(false);
  const [psuLoading, setPsuLoading] = useState(false);
  
  const fetchWithCache = useApiCache(state => state.fetchWithCache);

  const { ref: dealsRef, inView: dealsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: arrivalsRef, inView: arrivalsInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: casesRef, inView: casesInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: coolingRef, inView: coolingInView } = useInView({ triggerOnce: true, threshold: 0.1 });
  const { ref: psuRef, inView: psuInView } = useInView({ triggerOnce: true, threshold: 0.1 });

  // Fetch Deals only when scrolled into view
  useEffect(() => {
    if (dealsInView && deals.length === 0) {
      setDealsLoading(true);
      fetchWithCache('/products')
        .then(res => setDeals(res.data.data.slice(0, 8)))
        .catch(err => console.error("Failed to fetch deals:", err))
        .finally(() => setDealsLoading(false));
    }
  }, [dealsInView]);

  // Fetch Arrivals when deals or arrivals section is near view
  useEffect(() => {
    if ((dealsInView || arrivalsInView) && newArrivals.length === 0) {
      setArrivalsLoading(true);
      fetchWithCache('/products?page=2')
        .then(res => {
          if (!res.data.data || res.data.data.length === 0) {
            return fetchWithCache('/products');
          }
          return res;
        })
        .then(res => {
          const data = res.data.data || [];
          setNewArrivals(data.slice(0, 8));
        })
        .catch(err => console.error("Failed to fetch arrivals:", err))
        .finally(() => setArrivalsLoading(false));
    }
  }, [dealsInView, arrivalsInView, newArrivals.length]);

  // Fetch Cases
  useEffect(() => {
    if (casesInView && caseProducts.length === 0) {
      setCasesLoading(true);
      fetchWithCache('/products?category=computer-cases')
        .then(res => setCaseProducts(res.data.data.slice(0, 8)))
        .catch(err => console.error("Failed to fetch cases:", err))
        .finally(() => setCasesLoading(false));
    }
  }, [casesInView]);

  // Fetch Cooling
  useEffect(() => {
    if (coolingInView && coolingProducts.length === 0) {
      setCoolingLoading(true);
      fetchWithCache('/products?category=cooling')
        .then(res => setCoolingProducts(res.data.data.slice(0, 8)))
        .catch(err => console.error("Failed to fetch cooling:", err))
        .finally(() => setCoolingLoading(false));
    }
  }, [coolingInView]);

  // Fetch PSU
  useEffect(() => {
    if (psuInView && psuProducts.length === 0) {
      setPsuLoading(true);
      fetchWithCache('/products?category=power-supplies')
        .then(res => setPsuProducts(res.data.data.slice(0, 8)))
        .catch(err => console.error("Failed to fetch PSUs:", err))
        .finally(() => setPsuLoading(false));
    }
  }, [psuInView]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) seconds--;
        else if (minutes > 0) { minutes--; seconds = 59; }
        else if (hours > 0) { hours--; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (n: number) => n.toString().padStart(2, '0');

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Zeronix UAE",
    "url": window.location.origin,
    "logo": `${window.location.origin}/vite.svg`,
    "description": "Premium computer components, gaming gear, and mosque audio solutions in the UAE.",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+971-50-000-0000",
      "contactType": "customer service"
    }
  };

  return (
    <div className="flex flex-col pb-24 bg-bg-primary">
      <Helmet>
        <title>Zeronix UAE — Premium PC Components & Gaming Gear</title>
        <meta name="description" content="Shop the best CPUs, GPUs, RAM, gaming laptops, and Mosque Audio Systems at Zeronix UAE." />
        <script type="application/ld+json">
          {JSON.stringify(orgSchema)}
        </script>
      </Helmet>

      {/* 3. Hero Section */}
      {/* Mobile: Swiper with peek of next slide */}
      <section className="w-full lg:hidden !py-0 px-4">
        <Swiper
          modules={[Autoplay]}
          spaceBetween={10}
          slidesPerView={1.12}
          autoplay={{ delay: 5000 }}
          className="h-[180px]"
        >
          {BANNERS.map((banner, idx) => (
            <SwiperSlide key={idx}>
              <div className="relative w-full h-full bg-bg-surface rounded-xl overflow-hidden">
                <img
                  src={banner.image}
                  alt={banner.title || `Banner ${idx + 1}`}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {banner.title && (
                  <div className="absolute inset-0 flex flex-col justify-center px-6 bg-gradient-to-r from-black/80 to-transparent">
                    <h2 className="text-xl font-bold font-display text-white mb-1.5 leading-[1.1] max-w-[80%]">{banner.title}</h2>
                    <p className="text-white/90 text-xs mb-3 font-medium max-w-[80%]">{banner.subtitle}</p>
                    <Link to={banner.buttonLink!} className="w-max bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold px-4 py-2 rounded transition-colors uppercase tracking-wider relative z-10">
                      {banner.buttonText}
                    </Link>
                  </div>
                )}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      {/* Desktop: Static 75/25 Grid */}
      <section className="hidden lg:block py-8 px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-5 h-[420px]">
          {/* Main Hero — 75% (3 cols) - Now a Swiper */}
          <div className="col-span-3 relative rounded-2xl overflow-hidden shadow-premium group cursor-pointer">
            <Swiper
              modules={[Autoplay, Pagination]}
              spaceBetween={0}
              slidesPerView={1}
              autoplay={{ delay: 6000, disableOnInteraction: false }}
              pagination={{ clickable: true }}
              className="h-full w-full hero-pagination"
            >
              {BANNERS.map((banner, idx) => (
                <SwiperSlide key={idx}>
                  <div className="relative w-full h-full bg-bg-surface flex items-center">
                    <img
                      src={banner.image}
                      alt={banner.title || `Banner ${idx + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {banner.title && (
                      <div className="absolute inset-0 flex flex-col justify-center px-10 md:px-14 bg-gradient-to-r from-black/80 via-black/40 to-transparent">
                        <div className="max-w-xl relative z-10">
                          <h2 className="text-3xl md:text-5xl font-black font-display text-white mb-3 md:mb-5 leading-[1.1]">{banner.title}</h2>
                          <p className="text-white/90 text-sm md:text-lg mb-6 md:mb-8 font-medium">{banner.subtitle}</p>
                          <Link to={banner.buttonLink!} className="w-max bg-emerald-600 hover:bg-emerald-500 text-white text-xs md:text-sm font-bold px-7 py-3.5 rounded-lg transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:-translate-y-0.5 inline-block">
                            {banner.buttonText}
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Custom styles for pagination dots */}
            <style dangerouslySetInnerHTML={{
              __html: `
              .hero-pagination .swiper-pagination-bullet { background: white; opacity: 0.3; }
              .hero-pagination .swiper-pagination-bullet-active { background: white; opacity: 1; width: 24px; border-radius: 4px; }
            `}} />
          </div>

          {/* Right Column — 25% (1 col), 2 stacked cards */}
          <div className="col-span-1 flex flex-col gap-5">
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-bg-surface shadow-premium group cursor-pointer" >
              <img
                src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=400"
                alt="High-Airflow Premium PC Case - Lian Li O11 Series UAE"
                className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity"
              />
              <div className="relative z-10 h-full flex flex-col justify-end p-5 space-y-1">
                <span className="text-emerald-500 font-bold uppercase tracking-[0.15em] text-[9px]">Premium</span>
                <h3 className="text-sm font-bold font-display">Lian Li O11 Series</h3>
                <p className="text-text-muted text-[10px]">Airflow perfection</p>
              </div>
            </div>
            <div className="flex-1 relative rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-900 to-emerald-700 text-white shadow-premium group cursor-pointer">
              <div className="relative z-10 h-full flex flex-col justify-end p-5 space-y-1">
                <span className="text-emerald-300 font-bold uppercase tracking-[0.15em] text-[9px]">New</span>
                <h3 className="text-sm font-bold font-display">HyperX Cloud Alpha</h3>
                <p className="text-emerald-100/50 text-[10px]">300h wireless audio</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Categories — Card Style */}
      <section className="py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto no-scrollbar lg:grid lg:grid-cols-8 gap-4 lg:gap-5 pb-2 lg:pb-0">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.slug}`}
              className="flex-none w-[calc((100%-48px)/5)] lg:w-auto flex flex-col items-center gap-2.5 group"
            >
              <div className="w-full aspect-square rounded-2xl bg-bg-surface border border-border-subtle flex items-center justify-center p-4 group-hover:border-accent-primary/40 group-hover:shadow-premium transition-all duration-300 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <cat.icon className="w-10 h-10 text-text-muted/40 group-hover:text-accent-primary transition-colors duration-300" />
                )}
              </div>
              <span className="text-[10px] lg:text-xs font-semibold text-text-primary uppercase text-center leading-tight transition-colors">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. Deals of the Day (Lazy Loaded) */}
      <section ref={dealsRef} className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Deals of the Day</h2>
          <div className="flex items-center gap-1.5 bg-accent-primary/10 text-accent-primary px-2.5 py-1 rounded-full text-[9px] font-bold border border-accent-primary/20">
            <Clock className="h-3 w-3" />
            <span>Ends in {formatTime(timeLeft.hours)}:{formatTime(timeLeft.minutes)}:{formatTime(timeLeft.seconds)}</span>
          </div>
        </div>

        {dealsLoading || deals.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {deals.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                description={product.description}
                image={product.primary_image_url || product.images?.[0]}
                rating={4.8}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 5.5 Bento Promo Grid */}
      <section className="py-4 lg:py-10 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full">
        {/* Compact 2-col on mobile, 4-col on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6 auto-rows-[160px] lg:auto-rows-[280px]">

          {/* Card 1: Purple - Headphone (1x1) */}
          <Link to="/products?category=audio" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#a855f7] col-span-1 lg:col-span-1 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&q=80&w=400" alt="Premium Gaming Headphones in UAE" className="absolute -top-4 -right-4 w-[85%] h-auto object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-2 border border-red-500/50">Enjoy</span>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm font-bold leading-tight">With</span>
                <h3 className="text-white text-2xl font-bold font-display leading-none tracking-tight mb-3">HEADPHONE</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors">Browse</span>
            </div>
          </Link>

          {/* Card 2: Yellow - Smart Watch (1x1) */}
          <Link to="/products?category=wearables" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#eab308] col-span-1 lg:col-span-1 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&q=80&w=400" alt="Latest Smartwatch Deals UAE" className="absolute -top-6 -right-6 w-[90%] h-auto object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-2xl mix-blend-multiply" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-2 border border-red-500/50">New</span>
              <div className="flex flex-col">
                <span className="text-white/90 text-sm font-bold leading-tight">Smart</span>
                <h3 className="text-white text-2xl font-bold font-display leading-none tracking-tight mb-3">WATCH</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors">Browse</span>
            </div>
          </Link>

          {/* Card 3: Cyan - Laptop (2x1) */}
          <Link to="/products?category=laptops" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#0ea5e9] col-span-1 md:col-span-2 lg:col-span-2 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&q=80&w=800" alt="High-Performance Smart Laptops for Productivity" className="absolute top-1/2 -translate-y-1/2 -right-12 w-[70%] h-auto object-contain group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_20px_20px_rgba(0,0,0,0.3)]" />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-3 border border-red-500/50">Productivity</span>
              <div className="flex flex-col">
                <span className="text-white/90 text-lg font-bold font-display leading-none mb-1">Smart</span>
                <h3 className="text-white text-4xl font-bold font-display leading-none tracking-tight mb-4">LAPTOP</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors">Browse</span>
            </div>
          </Link>

          {/* Bottom Row */}

          {/* Card 4: Dark - Console (2x1) */}
          <Link to="/products?category=gaming" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#171717] col-span-1 md:col-span-2 lg:col-span-2 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?auto=format&fit=crop&q=80&w=800" alt="Next-Gen Gaming Consoles UAE" className="absolute top-1/2 -translate-y-1/2 -right-8 w-[60%] h-auto object-contain group-hover:-translate-y-1/2 group-hover:scale-105 transition-transform duration-700 drop-shadow-[0_20px_20px_rgba(0,0,0,0.8)]" />
            <div className="absolute inset-0 p-6 lg:p-8 flex flex-col justify-center">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-3 border border-red-500/50">Play</span>
              <div className="flex flex-col">
                <span className="text-white/90 text-lg font-bold font-display leading-none mb-1">Gaming</span>
                <h3 className="text-white text-4xl font-bold font-display leading-none tracking-tight mb-4">CONSOLE</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors">Browse</span>
            </div>
          </Link>

          {/* Card 5: Green - Oculus (1x1) */}
          <Link to="/products?category=gaming" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#16a34a] col-span-1 lg:col-span-1 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-300/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&q=80&w=400" alt="Virtual Reality Gaming VR Headsets Oculus Dubai" className="absolute -bottom-4 right-0 w-[95%] h-auto object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-2xl" />
            <div className="absolute inset-0 p-6 flex flex-col justify-start">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-2 border border-red-500/50">Play</span>
              <div className="flex flex-col mb-3">
                <span className="text-white/90 text-sm font-bold font-display leading-tight">Game</span>
                <h3 className="text-white text-2xl font-bold font-display leading-none tracking-tight">OCULUS</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors shadow-sm">Browse</span>
            </div>
          </Link>

          {/* Card 6: Blue - Speaker (1x1) */}
          <Link to="/products?category=audio" className="relative rounded-[20px] overflow-hidden group shadow-sm block bg-[#2563eb] col-span-1 lg:col-span-1 border border-border-subtle/50 transition-transform duration-500 hover:-translate-y-1">
            <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-400/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <img src="https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&q=80&w=400" alt="Smart Home Amazon Speakers UAE" className="absolute -bottom-4 -right-2 w-[90%] h-auto object-contain transition-transform duration-700 group-hover:scale-105 drop-shadow-[0_20px_20px_rgba(0,0,0,0.5)] mix-blend-multiply" />
            <div className="absolute inset-0 p-6 flex flex-col justify-start">
              <span className="bg-red-600 text-white text-[9px] font-bold uppercase px-2 py-0.5 rounded shadow-sm w-max mb-2 border border-red-500/50">New</span>
              <div className="flex flex-col mb-3">
                <span className="text-white/90 text-sm font-bold font-display leading-tight">Amazon</span>
                <h3 className="text-white text-2xl font-bold font-display leading-none tracking-tight">SPEAKER</h3>
              </div>
              <span className="bg-white text-black text-[10px] font-bold px-4 py-1.5 rounded w-max hover:bg-gray-100 transition-colors shadow-sm">Browse</span>
            </div>
          </Link>

        </div>
      </section>


      {/* 5.8 Signature Enclosures (Cases) */}
      <section ref={casesRef} className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-bg-primary space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Signature Enclosures</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Premium PC cases for the perfect build.</p>
          </div>
          <Link to="/category/computer-cases" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
            View PC Cases <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {casesLoading || caseProducts.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {caseProducts.map((product) => (
              <ProductCard
                key={`case-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                image={product.primary_image_url || product.images?.[0]}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 5.9 Thermal Solutions (Cooling) */}
      <section ref={coolingRef} className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-bg-primary space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Thermal Solutions</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Keep your performance cool and stable.</p>
          </div>
          <Link to="/category/cooling" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
            View PC Cooling <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {coolingLoading || coolingProducts.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {coolingProducts.map((product) => (
              <ProductCard
                key={`cool-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                image={product.primary_image_url || product.images?.[0]}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 5.95 Reliable Power (PSU) */}
      <section ref={psuRef} className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-bg-primary space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Reliable Power</h2>
            <p className="text-[10px] text-text-muted mt-0.5">High-efficiency power supplies for every build.</p>
          </div>
          <Link to="/category/power-supplies" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
            Shop Power Supplies <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {psuLoading || psuProducts.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {psuProducts.map((product) => (
              <ProductCard
                key={`psu-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                image={product.primary_image_url || product.images?.[0]}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      <section className="py-8 md:py-16 px-4 sm:px-6 lg:px-8 max-w-[1440px] mx-auto w-full border-t border-border-subtle bg-bg-primary">
        <div className="text-center mb-8 md:mb-16 space-y-2 md:space-y-4">
          <h2 className="text-xl md:text-4xl font-bold font-display tracking-tight text-text-primary">Trusted Brands</h2>
          <p className="text-text-muted text-xs md:text-base max-w-2xl mx-auto">Powering rigs with industry-leading components.</p>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border border-border-subtle rounded-lg overflow-hidden bg-bg-surface">
          {['Intel', 'AMD', 'Nvidia', 'ASUS', 'MSI', 'Corsair', 'Gigabyte', 'Razer', 'Logitech', 'NZXT', 'Lian Li', 'HyperX', 'Samsung', 'WD', 'Seagate'].map((brand, i) => (
            <div key={i} className={`flex items-center justify-center p-5 md:p-8 hover:bg-accent-primary/5 transition-colors cursor-default border-border-subtle ${i % 5 !== 4 ? 'lg:border-r' : ''} ${i % 3 !== 2 ? 'border-r lg:border-r-0' : ''} ${i < 12 ? 'border-b' : ''}`}>
              <span className="font-bold text-xs md:text-base tracking-widest uppercase text-text-primary/50 hover:text-accent-primary transition-colors">{brand}</span>
            </div>
          ))}
        </div>
      </section>



      {/* 6.5 Secondary Category Carousel (Lazy Loaded) */}
      <section ref={arrivalsRef} className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">Top Rated Components</h2>
        </div>

        {arrivalsLoading || newArrivals.length === 0 ? (
          <div className="h-64 flex items-center justify-center">
            <div className="h-8 w-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
          </div>
        ) : (
          <ProductCarousel>
            {newArrivals.slice().reverse().map((product) => (
              <ProductCard
                key={`top-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                description={product.description}
                image={product.primary_image_url || product.images?.[0]}
                rating={5.0}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 7. New Arrivals (Lazy Loaded) */}
      <section className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-text-muted">New Arrivals</h2>
          <Link to="/products" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Shop New Components</Link>
        </div>

        {arrivalsLoading || newArrivals.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {newArrivals.map((product) => (
              <ProductCard
                key={`new-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                description={product.description}
                image={product.primary_image_url || product.images?.[0]}
                rating={4.9}
                isNew={true}
                badge={product.badge}
                badgeColor={product.badge_color}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 7.1 Specialized Categories */}
      <section className="py-4 lg:py-8 px-4 sm:px-6 lg:px-8 space-y-4 lg:space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Shop Audio Solutions</h2>
          <Link to="/products" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest">Shop Audio Systems</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-5">
          {[
            { name: 'Acoustic', image: `${STORAGE_URL}/categories/amplimart-categories---acoustic.webp`, link: '/products?category=acoustic', lazy: true },
            { name: 'Amplifiers', image: `${STORAGE_URL}/categories/amplimart-categories---amplifiers.webp`, link: '/products?category=amplifiers', lazy: true },
            { name: 'Projectors', image: `${STORAGE_URL}/categories/amplimart-categories---projectors.avif`, link: '/products?category=projectors', lazy: true },
            { name: 'Screens', image: `${STORAGE_URL}/categories/amplimart-categories---screens.avif`, link: '/products?category=screens', lazy: true },
            { name: 'Speakers', image: `${STORAGE_URL}/categories/amplimart-categories---speakers.avif`, link: '/products?category=speakers', lazy: true },
          ].map((cat) => (
            <Link key={cat.name} to={cat.link} className="group flex flex-col items-center bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden shadow-sm hover:shadow-md">
              <div className="w-full aspect-[4/3] p-4 lg:p-6 flex items-center justify-center bg-bg-primary/30 group-hover:bg-bg-primary/50 transition-colors">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="w-full py-3 lg:py-4 px-4 text-center border-t border-border-subtle/50 bg-bg-surface group-hover:bg-accent-primary/5 transition-colors">
                <span className="text-xs lg:text-sm font-bold font-display text-text-primary group-hover:text-accent-primary transition-colors">{cat.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 7.5 Featured: Gaming Zone */}
      <section className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-bg-primary space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Gaming Zone</h2>
            <p className="text-[10px] text-text-muted mt-0.5">High-performance gear for ultimate immersion.</p>
          </div>
          <Link to="/category/gaming-zone" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
            Shop Gaming Gear <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {arrivalsLoading || newArrivals.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {/* Simulated Gaming Products (Reusing array for layout) */}
            {newArrivals.slice(0, 5).reverse().map((product) => (
              <div key={`gaming-${product.id}`} className="ring-1 ring-accent-primary/20 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] transition-shadow">
                <ProductCard
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  sale_price={product.sale_price}
                  image={product.primary_image_url || product.images?.[0]}
                  badge={product.badge}
                  badgeColor={product.badge_color}
                />
              </div>
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 7.6 Featured: Accessories & Peripherals */}
      <section className="py-4 lg:py-6 px-4 sm:px-6 lg:px-8 bg-bg-primary space-y-3 lg:space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base lg:text-xl font-black text-text-primary tracking-tight">Accessories & Peripherals</h2>
            <p className="text-[10px] text-text-muted mt-0.5">Complete your setup with premium accessories.</p>
          </div>
          <Link to="/category/accessories-peripherals" className="text-[10px] font-bold text-accent-primary uppercase tracking-widest flex items-center gap-1">
            Shop Peripherals <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {arrivalsLoading || newArrivals.length === 0 ? (
          <ProductCarouselSkeleton />
        ) : (
          <ProductCarousel>
            {/* Simulated Accessories Products (Reusing array for layout) */}
            {newArrivals.slice(2, 7).map((product) => (
              <ProductCard
                key={`acc-${product.id}`}
                id={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                sale_price={product.sale_price}
                image={product.primary_image_url || product.images?.[0]}
              />
            ))}
          </ProductCarousel>
        )}
      </section>

      {/* 8. Trust Markers */}
      <section className="px-4 sm:px-6 lg:px-8 py-0 bg-bg-surface border-y border-border-subtle">
        <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-border-subtle">
          {[
            { icon: Truck, title: "UAE Express", desc: "Same day delivery available" },
            { icon: ShieldCheck, title: "Authentic Only", desc: "No grey market components" },
            { icon: ArrowUpRight, title: "30-Day Change", desc: "Hassle-free returns & swaps" },
            { icon: Headphones, title: "Tech Support", desc: "Expert guidance 24/7" },
          ].map((item, i) => (
            <div key={i} className="p-5 md:p-10 flex flex-col items-center text-center space-y-2 md:space-y-3 hover:bg-bg-primary transition-colors cursor-default group">
              <item.icon className="h-5 w-5 md:h-7 md:w-7 text-accent-primary group-hover:scale-110 transition-transform" />
              <h3 className="text-[10px] md:text-xs font-bold uppercase tracking-wider">{item.title}</h3>
              <p className="text-[9px] md:text-[10px] text-text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5.7 Recommended For You (NEW) */}
      <RecommendedProducts />


      {/* Popular Search — SEO Chip Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-8 lg:py-10 bg-bg-primary border-t border-border-subtle/50">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-4 lg:mb-5">
            <div>
              <h2 className="text-sm lg:text-base font-black text-text-primary tracking-tight">Popular Searches</h2>
              <p className="text-[10px] text-text-muted mt-0.5">Trending products and brands in UAE</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              'Lenovo Laptops UAE', 'TP-Link Supplier Sharjah', 'Gaming PC Dubai',
              'RTX 4090 Price UAE', 'Dell Laptop UAE', 'HP Laptop Dubai',
              'Logitech Mouse UAE', 'SSD 1TB Price UAE', 'Best Gaming Chair UAE',
              'Mechanical Keyboard Dubai', 'Webcam for Work UAE', 'Monitor 144Hz UAE',
              'Intel Core i9 UAE', 'AMD Ryzen 9 Dubai', 'PS5 Price UAE',
              'Xbox Series X UAE', 'Apple MacBook UAE', 'ASUS ROG Laptop',
              'Corsair RAM 32GB', 'UPS for PC UAE', 'External Hard Drive UAE',
              'Router for Home UAE', 'USB Hub Type-C', 'Laptop Under 2000 AED',
            ].map((kw) => (
              <Link
                key={kw}
                to={`/products?q=${encodeURIComponent(kw)}`}
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-border-subtle bg-bg-surface text-[10px] lg:text-xs font-medium text-text-muted hover:border-emerald-500/40 hover:text-emerald-500 hover:bg-emerald-500/5 transition-all"
              >
                {kw}
              </Link>
            ))}
          </div>
        </div>
      </section>


    </div>
  );
}

