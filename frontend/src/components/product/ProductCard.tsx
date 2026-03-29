import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Plus } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { toast } from 'sonner';

interface ProductCardProps {
  id?: number;
  name: string;
  slug?: string;
  price: string | number;
  sale_price?: string | number;
  description?: string;
  image?: string;
  rating?: number;
  badge?: string;
  badgeColor?: string;
  isNew?: boolean;
  stock_status?: 'in_stock' | 'out_of_stock';
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  sale_price,
  image,
  rating = 4.5,
  badge,
  badgeColor = "bg-accent-primary",
  isNew = false,
  stock_status = 'in_stock',
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlistItem = useWishlistStore((state) => state.toggleItem);
  const isInWishlist = useWishlistStore((state) => state.isInWishlist(id || 0));

  const displayPrice = sale_price ? sale_price : price;
  const originalPrice = sale_price ? price : null;
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');
  const isOutOfStock = stock_status === 'out_of_stock';
  const salePercent = originalPrice
    ? Math.round(((Number(originalPrice) - Number(displayPrice)) / Number(originalPrice)) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    const itemPrice = sale_price ? Number(sale_price) : Number(price);
    addItem({
      id: id || Math.floor(Math.random() * 100000),
      name,
      price: itemPrice,
      quantity: 1,
      image: image || '',
    });
    toast.success(`${name} added to cart`);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlistItem({
      id: id || 0,
      name,
      slug: productSlug,
      price: Number(sale_price || price),
      image: image || '',
    });
    toast.success(isInWishlist ? `Removed from wishlist` : `Added to wishlist`);
  };

  return (
    <Link
      to={`/products/${productSlug}`}
      className={`group relative bg-bg-surface rounded-xl overflow-hidden hover:shadow-premium hover:border-accent-primary/50 transition-all duration-400 flex flex-col h-full border border-border-subtle ${
        isOutOfStock ? 'opacity-50 pointer-events-auto' : ''
      }`}
    >
      {/* Top-left badges */}
      <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 flex flex-col gap-1.5">
        {isNew && (
          <span className="bg-emerald-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm">
            NEW
          </span>
        )}
        {salePercent > 0 && !isOutOfStock && (
          <span className="bg-red-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm">
            -{salePercent}%
          </span>
        )}
        {badge && !isNew && salePercent <= 0 && (
          <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm" style={{ backgroundColor: badgeColor || '#10b981' }}>
            {badge}
          </span>
        )}
      </div>

      {/* Top-right: Quick Add + Wishlist */}
      <div className="absolute top-2.5 right-2.5 md:top-3 md:right-3 z-10 flex flex-col gap-1.5">
        {/* Wishlist heart */}
        <button
          onClick={handleToggleWishlist}
          className={`h-7 w-7 md:h-8 md:w-8 rounded-full flex items-center justify-center transition-all shadow-sm border ${
            isInWishlist
              ? 'bg-red-500 border-red-500 text-white'
              : 'bg-bg-surface/80 backdrop-blur-sm border-border-subtle text-text-muted hover:text-red-500 hover:border-red-500/30 opacity-0 md:group-hover:opacity-100 opacity-100 md:opacity-0'
          }`}
          aria-label="Toggle wishlist"
        >
          <Heart className={`h-3.5 w-3.5 ${isInWishlist ? 'fill-white' : ''}`} />
        </button>

        {/* Quick add button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-bg-surface/80 backdrop-blur-sm border border-border-subtle text-text-muted hover:bg-emerald-500 hover:text-white hover:border-emerald-500 flex items-center justify-center transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
            aria-label="Quick add to cart"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Image Container */}
      <div className="relative h-[160px] md:h-[200px] overflow-hidden bg-white dark:bg-[#0a0f1e] flex items-center justify-center p-4 md:p-6 transition-all duration-500 group-hover:bg-bg-primary dark:group-hover:bg-[#0c1525]">
        <img
          src={image || "/placeholder-product.svg"}
          alt={name}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Details Section */}
      <div className="p-3 md:p-4 flex flex-col flex-grow gap-1 relative bg-bg-primary">

        {/* Discount Badge inline */}
        {originalPrice && !isOutOfStock && (
          <div className="mb-1">
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm inline-block">
              {salePercent}% OFF
            </span>
          </div>
        )}

        {/* Title */}
        <h3 className="text-[11px] md:text-sm font-semibold leading-snug line-clamp-2 text-text-primary group-hover:text-accent-primary transition-colors duration-300">
          {name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1.5 mt-0.5 mb-2">
          <div className="flex items-center text-[#eab308]">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-[11px] md:text-[13px] leading-none">
                {i < Math.floor(rating) ? '★' : '☆'}
              </span>
            ))}
          </div>
          <span className="text-[10px] md:text-xs text-text-muted">({rating.toFixed(1)})</span>
        </div>

        {/* Price / Out of Stock */}
        <div className="mt-auto pt-2">
          {isOutOfStock ? (
            <span className="text-sm font-bold text-text-muted">Out of Stock</span>
          ) : (
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] md:text-[11px] font-normal text-text-primary">AED</span>
                <span className="text-base md:text-xl font-bold font-display text-text-primary tracking-tight">
                  {Number(displayPrice).toFixed(2)}
                </span>
              </div>
              {originalPrice && (
                <span className="text-[10px] md:text-xs text-text-muted/60 line-through">
                  AED {Number(originalPrice).toFixed(2)}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Floating Add to Cart Button */}
        {!isOutOfStock && (
          <button
            onClick={handleAddToCart}
            className="absolute bottom-3 right-3 md:bottom-4 md:right-4 h-8 w-8 md:h-9 md:w-9 bg-accent-primary hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.5)] transition-all active:scale-95 z-20"
            aria-label="Add to cart"
          >
            <ShoppingCart className="h-4 w-4 md:h-[18px] md:w-[18px]" />
          </button>
        )}
      </div>
    </Link>
  );
}
