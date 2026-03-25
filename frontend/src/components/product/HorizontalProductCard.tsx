import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

interface HorizontalProductCardProps {
  id?: number;
  name: string;
  slug?: string;
  price: string | number;
  sale_price?: string | number;
  image?: string;
  category?: string;
  rating?: number;
}

export function HorizontalProductCard({
  name,
  slug,
  price,
  sale_price,
  image,
  category,
  rating = 5,
}: HorizontalProductCardProps) {
  const displayPrice = sale_price ? sale_price : price;
  const productSlug = slug || name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

  return (
    <Link
      to={`/products/${productSlug}`}
      className="group relative flex items-center gap-4 p-4 bg-bg-surface hover:bg-bg-primary border border-border-subtle rounded-xl transition-all duration-300 hover:shadow-premium hover:border-accent-primary/30"
    >
      {/* Product Image */}
      <div className="shrink-0 w-24 h-24 md:w-28 md:h-28 bg-white dark:bg-[#0a0f1e] rounded-lg overflow-hidden flex items-center justify-center p-2 group-hover:scale-105 transition-transform duration-500">
        <img
          src={image || "/placeholder-product.svg"}
          alt={name}
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Details */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Stars Rating */}
        <div className="flex items-center gap-0.5 mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-[#eab308] text-[#eab308]' : 'text-text-muted/30'}`}
            />
          ))}
          <span className="text-[10px] text-text-muted ml-1">(0)</span>
        </div>

        {/* Title and Price Row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-xs md:text-sm font-semibold text-text-primary line-clamp-2 leading-tight group-hover:text-accent-primary transition-colors">
            {name}
          </h3>
          <span className="text-xs md:text-sm font-bold text-text-primary shrink-0">
            AED {displayPrice}
          </span>
        </div>

        {/* Category */}
        <p className="text-[10px] md:text-xs text-text-muted font-medium truncate">
          {category || "Uncategorized"}
        </p>
      </div>
    </Link>
  );
}
