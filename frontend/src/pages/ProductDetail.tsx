import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Check, ShieldCheck, Truck, ChevronLeft, Heart, Share2 } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useCartStore } from '../store/cart';
import { Swiper, SwiperSlide } from 'swiper/react';
import { ProductCard } from '../components/product/ProductCard';
import { ProductDetailSkeleton } from '../components/ui/skeletons/ProductDetailSkeleton';
import { useApiCache } from '../store/apiCache';
import { toast } from 'sonner';

interface ProductDetail {
  id: number;
  name: string;
  slug: string;
  brand: { id: number; name: string; slug: string } | null;
  description: string;
  price: string;
  sale_price: string | null;
  images: string[] | null;
  primary_image_url: string | null;
  images_gallery_urls: string[];
  specs: Record<string, any> | null;
  category: { name: string; slug: string };
  variants: any[];
  badge?: string;
  badge_color?: string;
}

export default function ProductDetail() {
  const { slug } = useParams();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);
  const addItem = useCartStore((state) => state.addItem);
  const fetchWithCache = useApiCache((state) => state.fetchWithCache);
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchProductAndRelated = async () => {
      try {
        setIsLoading(true);
        const { data } = await fetchWithCache(`/products/${slug}`);
        setProduct(data);
        
        // Fetch related products from same category
        if (data?.category?.slug) {
           const relatedData = await fetchWithCache(`/products?category=${data.category.slug}`);
           // Filter out the current product from the related list
           const filteredRelated = relatedData.data.data.filter((p: any) => p.id !== data.id);
           setRelatedProducts(filteredRelated);
        }
        
      } catch (error) {
        console.error('Failed to fetch product detail', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProductAndRelated();
  }, [slug]);

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <>
        <div className="py-24 text-center text-text-primary">
          Product not found. <Link to="/" className="text-emerald-500 hover:underline">Go back to home</Link>.
        </div>
      </>
    );
  }

  const currentPrice = product.sale_price || product.price;
  const hasDiscount = !!product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price);

  const displayImages = product.images_gallery_urls || [];

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      price: parseFloat(currentPrice),
      quantity: quantity,
      image: displayImages[0] || '',
      variant_id: product.variants?.[0]?.id 
    });
    toast.success(`${product.name} added to cart!`);
  };

  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": displayImages[0] || '',
    "description": product.description.replace(/<[^>]+>/g, ''),
    "brand": {
      "@type": "Brand",
      "name": product.brand?.name || "Zeronix"
    },
    "category": product.category?.name || "Computer Components",
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "AED",
      "price": currentPrice,
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "Zeronix UAE"
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{product.name} | Zeronix UAE</title>
        <meta name="description" content={`Buy ${product.name} at the best price in UAE. ${product.description.replace(/<[^>]+>/g, '').slice(0, 100)}...`} />
        <script type="application/ld+json">
          {JSON.stringify(productSchema)}
        </script>
      </Helmet>
      <div className="py-8 px-4 md:px-6 max-w-[1440px] mx-auto min-h-screen relative">
        {/* Mobile Header (Refined Wireframe Style - Fixed to Top) */}
        <div className="md:hidden fixed top-0 left-0 right-0 z-[100] bg-bg-primary border-b border-border-subtle/50 shadow-sm flex items-center justify-between px-6 py-4 transition-all duration-300">
           <button 
             onClick={() => navigate(-1)} 
             className="w-10 h-10 flex items-center justify-center bg-bg-surface border border-border-subtle rounded-full text-text-primary hover:bg-bg-primary transition-all active:scale-95"
           >
             <ChevronLeft className="w-5 h-5" />
           </button>
           
           <h1 className="text-sm font-bold tracking-tight text-text-primary truncate max-w-[180px]">{product?.name || 'Product Detail'}</h1>
           
           <button className="w-10 h-10 flex items-center justify-center bg-bg-surface border border-border-subtle rounded-full text-text-primary hover:bg-bg-primary transition-all active:scale-95">
             <Share2 className="w-4 h-4" />
           </button>
        </div>

        {/* Spacer for Mobile Fixed Header */}
        <div className="h-16 md:hidden" />

        {/* Breadcrumb (Hidden on Mobile) */}
        <nav className="hidden md:flex text-[10px] md:text-xs font-bold uppercase tracking-widest text-text-muted mb-8">
          <ol className="flex items-center space-x-2">
            <li><Link to="/" className="hover:text-emerald-500 transition-colors">Home</Link></li>
            <li><span>/</span></li>
            <li><Link to={`/category/${product.category.slug}`} className="hover:text-emerald-500 transition-colors">{product.category.name}</Link></li>
            <li><span>/</span></li>
            <li className="text-text-primary truncate max-w-[150px] md:max-w-xs">{product.name}</li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {/* Images Gallery */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Desktop Vertical Thumbnails */}
            <div className={`hidden md:flex flex-col gap-4 overflow-y-auto no-scrollbar max-h-[600px] w-24 shrink-0 ${displayImages.length > 0 ? 'block' : 'hidden'}`}>
                {displayImages.map((img, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setSelectedImage(idx)}
                    className={`relative aspect-square w-full rounded-[12px] overflow-hidden border-2 flex-shrink-0 transition-all bg-bg-surface ${selectedImage === idx ? 'border-emerald-500 shadow-md translate-x-1' : 'border-border-subtle opacity-70 hover:opacity-100'}`}
                  >
                    <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>

            <div className="flex-1 flex flex-col gap-0 md:gap-4 relative">
              {/* Mobile Swiper Gallery */}
              <div className="md:hidden w-full -mx-4 px-4 relative">
                <Swiper
                  spaceBetween={10}
                  onSlideChange={(swiper) => setSelectedImage(swiper.activeIndex)}
                  className="w-full aspect-[4/3] sm:aspect-square"
                >
                  {displayImages.map((img, idx) => (
                    <SwiperSlide key={idx} className="flex items-center justify-center p-4">
                      <img 
                        src={img} 
                        alt={`${product.name} ${idx + 1}`} 
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {product.badge && (
                  <span 
                    className="absolute top-4 left-8 z-20 text-white text-[10px] font-bold tracking-widest px-3 py-1 rounded-full shadow-lg pointer-events-none"
                    style={{ backgroundColor: product.badge_color || '#10b981' }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Desktop Static Image */}
              <div className="hidden md:flex aspect-square items-center justify-center relative p-8 group rounded-[24px] bg-bg-surface/30">
                {displayImages.length > 0 && (
                  <img 
                    src={displayImages[selectedImage]} 
                    alt={product.name} 
                    className="object-contain w-full h-full transition-transform duration-700 group-hover:scale-105" 
                  />
                )}
                {product.badge && (
                  <span 
                    className="absolute top-6 left-6 text-white text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-full shadow-xl pointer-events-none z-10"
                    style={{ backgroundColor: product.badge_color || '#10b981' }}
                  >
                    {product.badge}
                  </span>
                )}
              </div>

              {/* Image Indicators (Wireframe Dots) - Centered and lower margin */}
              <div className="flex justify-center gap-1.5 mt-2 md:mt-6 mb-2">
                {displayImages.map((_, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`h-1 rounded-full transition-all duration-500 ${selectedImage === idx ? 'w-8 bg-emerald-500' : 'w-4 bg-border-subtle/30'}`}
                  />
                ))}
              </div>
              
              {/* Image Counter (Wireframe Style) */}
              <div className="absolute top-4 right-4 bg-bg-surface/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-border-subtle/50 text-[9px] font-bold text-text-primary shadow-sm md:hidden z-10">
                {selectedImage + 1} / {displayImages.length}
              </div>
            </div>
          </div>

          {/* Product Info */}
            <div className="flex flex-col pt-2 md:pt-0">
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 bg-emerald-500/10 px-3 py-1 rounded-full">{product.brand?.name || 'Generic'}</span>
            </div>
            <div className="flex items-start justify-between gap-4 mt-4 mb-4">
              <h1 className="text-xl md:text-3xl font-bold tracking-tight text-text-primary leading-tight">
                {product.name}
              </h1>
              <button className="p-2.5 rounded-full border border-border-subtle bg-bg-surface text-text-muted hover:text-red-500 hover:border-red-500/20 transition-all active:scale-90 shadow-sm shrink-0">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-1 mb-3 md:mb-6 pb-4 md:pb-6 border-b border-border-subtle">
              <div className="flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
                  AED {hasDiscount ? product.sale_price : product.price}
                </span>
                {hasDiscount && (
                  <span className="bg-red-500/10 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {Math.round((1 - parseFloat(product.sale_price!) / parseFloat(product.price)) * 100)}% OFF
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-sm text-text-muted line-through opacity-60">
                   AED {product.price}
                </span>
              )}
            </div>

            {/* Variant Section (Wireframe "Type" style) - Desktop Only for now or hidden on mobile card */}
            <div className="hidden md:block mb-8 p-6 rounded-[16px] bg-bg-surface border border-border-subtle hover:shadow-premium transition-shadow">
              <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="flex items-center border border-border-subtle rounded-full bg-bg-primary h-12 w-full sm:w-auto">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-5 h-full text-text-muted hover:text-text-primary transition-colors flex items-center justify-center font-bold"
                  >-</button>
                  <div className="px-2 h-full font-bold w-12 flex items-center justify-center border-x border-border-subtle text-text-primary">{quantity}</div>
                  <button 
                    onClick={() => setQuantity(q => q + 1)}
                    className="px-5 h-full text-text-muted hover:text-text-primary transition-colors flex items-center justify-center font-bold"
                  >+</button>
                </div>
                
                <button 
                  onClick={handleAddToCart}
                  className="flex-1 w-full sm:w-auto h-12 bg-emerald-500 text-white font-bold tracking-widest text-[11px] uppercase rounded-full hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Add to Cart — AED {hasDiscount ? (parseFloat(product.sale_price!) * quantity).toFixed(2) : (parseFloat(product.price) * quantity).toFixed(2)}
                </button>
              </div>
            
              <div className="flex flex-wrap gap-4 md:gap-6 mt-6 text-xs md:text-sm text-text-muted border-t border-border-subtle pt-6">
                <div className="flex items-center gap-2 font-medium">
                  <Check className="w-4 h-4 text-emerald-500" /> In Stock
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <Truck className="w-4 h-4 text-emerald-500" /> Free Shipping
                </div>
                <div className="flex items-center gap-2 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> 1 Year Warranty
                </div>
              </div>
            </div>

            {/* Mobile Selection Placeholders (Wireframe "Type" section) */}
            <div className="md:hidden space-y-4 mb-6 mt-1">
               {product.variants && product.variants.length > 0 && (
                 <div>
                    <h3 className="text-sm font-bold text-text-primary mb-3">Model / Type</h3>
                    <div className="flex flex-wrap gap-2">
                       {product.variants.map((v, i) => (
                         <button key={i} className="px-5 py-2.5 rounded-xl border border-border-subtle bg-bg-surface text-xs font-bold text-text-muted hover:border-emerald-500 hover:text-emerald-500 transition-all">
                           {v.name || 'Regular'}
                         </button>
                       ))}
                    </div>
                 </div>
               )}
            </div>

            {/* Specifications (Wireframe Table Style) */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="mt-4 pt-4 border-t border-border-subtle">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary opacity-60 mb-4">Technical Specifications</h3>
                <div className="overflow-hidden rounded-xl border border-border-subtle shadow-sm bg-bg-surface">
                  <table className="w-full border-collapse text-[12px] md:text-sm">
                    <tbody className="divide-y divide-border-subtle">
                      {Object.entries(product.specs).map(([key, value]) => (
                        <tr key={key} className="hover:bg-bg-primary/50 transition-colors">
                          <td className="py-2.5 px-4 text-text-muted font-bold w-1/3 bg-bg-primary/20 capitalize tracking-tight group-hover:text-emerald-500 transition-colors">{key.replace(/_/g, ' ')}</td>
                          <td className="py-2.5 px-4 text-text-primary font-bold">{(value as string)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Overview Section (Wireframe Style) */}
        <div className="mt-8 pt-8 border-t border-border-subtle">
           <h2 className="text-base font-bold mb-4 text-text-primary tracking-tight uppercase tracking-wider opacity-60">Product Description</h2>
           <div className="relative">
               <div 
                  className={`text-text-muted text-[13px] md:text-sm leading-relaxed max-w-4xl overflow-hidden transition-all duration-500 html-content-wrapper prose prose-sm prose-emerald dark:prose-invert italic font-medium ${!isDescExpanded ? 'max-h-24' : 'max-h-[5000px]'}`}
                  dangerouslySetInnerHTML={{ __html: product.description }}
               />
              {!isDescExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-bg-primary to-transparent" />
              )}
           </div>
           <button 
             onClick={() => setIsDescExpanded(!isDescExpanded)}
             className="mt-3 text-sm font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
           >
             {isDescExpanded ? 'Read Less' : 'Read more'}
           </button>
        </div>

        {/* Sticky Mobile Actions (Wireframe Style) */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-bg-primary/95 backdrop-blur-xl border-t border-border-subtle/50 z-[110] flex gap-3" style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 16px), 16px)' }}>
           <button 
             onClick={handleAddToCart}
             className="flex-1 h-14 bg-bg-surface border-2 border-emerald-500 text-emerald-500 font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-emerald-50/10 transition-all flex items-center justify-center gap-2"
           >
             <ShoppingCart className="w-4 h-4" />
             Add to Cart
           </button>
           <button 
             onClick={() => { handleAddToCart(); navigate('/checkout'); }}
             className="flex-1 h-14 bg-emerald-500 text-white font-bold uppercase tracking-widest text-[11px] rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/25 flex items-center justify-center"
           >
             Buy Now
           </button>
        </div>

        {/* Related Products Carousel */}
        {relatedProducts.length > 0 && (
          <div className="mt-10 pt-8 border-t border-border-subtle">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl md:text-2xl font-display font-bold text-text-primary tracking-tight">Related Components</h2>
             </div>
             
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
               {relatedProducts.map((relatedProd) => (
                 <SwiperSlide key={relatedProd.id} className="h-auto">
                    <ProductCard 
                       id={relatedProd.id}
                       name={relatedProd.name}
                       slug={relatedProd.slug}
                       price={relatedProd.price}
                       sale_price={relatedProd.sale_price}
                       description={relatedProd.description}
                       image={relatedProd.primary_image_url || relatedProd.images?.[0]}
                       rating={4.8} 
                       badge={relatedProd.badge}
                       badgeColor={relatedProd.badge_color}
                    />
                 </SwiperSlide>
               ))}
             </Swiper>
          </div>
        )}
      </div>
    </>
  );
}
