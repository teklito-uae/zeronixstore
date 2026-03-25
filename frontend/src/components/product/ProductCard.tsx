import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '../../store/cart';
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
  isNew = false
}: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const displayPrice = sale_price ? sale_price : price;
  const originalPrice = sale_price ? price : null;
  // Fallback to manual slugification if slug prop is missing (for safety)
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return (
    <Link
      to={`/products/${productSlug}`}
      className="group relative bg-bg-surface rounded-xl overflow-hidden hover:shadow-premium hover:border-accent-primary/50 transition-all duration-400 flex flex-col h-full border border-border-subtle"
    >
      {/* Badges */}
      <div className="absolute top-2.5 left-2.5 md:top-3 md:left-3 z-10 flex flex-col gap-1.5">
        {badge && (
          <span className="text-[9px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm" style={{ backgroundColor: badgeColor || '#10b981' }}>
            {badge}
          </span>
        )}
        {isNew && (
          <span className="bg-red-600 border border-red-500 text-[9px] font-bold text-white px-2 py-0.5 rounded-md shadow-sm">
            NEW
          </span>
        )}
      </div>

      {/* Image Container — White in light mode, dark in dark mode */}
      <div className="relative h-[160px] md:h-[200px] overflow-hidden bg-white dark:bg-[#0a0f1e] flex items-center justify-center p-4 md:p-6 transition-all duration-500 group-hover:bg-bg-primary dark:group-hover:bg-[#0c1525]">
        <img
          src={image || "/placeholder-product.svg"}
          alt={name}
          className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
        />
      </div>

      {/* Details Section */}
      <div className="p-3 md:p-4 flex flex-col flex-grow gap-1 relative bg-bg-primary">

        {/* Discount Badge */}
        {originalPrice && (
          <div className="mb-1">
            <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm inline-block">
              {Math.round(((Number(originalPrice) - Number(displayPrice)) / Number(originalPrice)) * 100)}% OFF
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

        {/* Space to push prices to bottom */}
        <div className="mt-auto pt-2">
          {/* Prices Row */}
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
        </div>

        {/* Floating Circular Add to Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const itemPrice = sale_price ? Number(sale_price) : Number(price);
            addItem({
              id: id || Math.floor(Math.random() * 100000),
              name,
              price: itemPrice,
              quantity: 1,
              image: image || '',
            });
            toast.success(`${name} added to cart`);
          }}
          className="absolute bottom-3 right-3 md:bottom-4 md:right-4 h-8 w-8 md:h-9 md:w-9 bg-accent-primary hover:bg-emerald-600 rounded-full flex items-center justify-center text-white shadow-[0_4px_12px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_16px_rgba(16,185,129,0.5)] transition-all active:scale-95 z-20"
          aria-label="Add to cart"
        >
          <ShoppingCart className="h-4 w-4 md:h-[18px] md:w-[18px]" />
        </button>

      </div>
    </Link>
  );
}
