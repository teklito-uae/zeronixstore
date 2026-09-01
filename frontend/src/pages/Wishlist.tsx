import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/product/ProductCard";
import { useWishlist } from "@/features/wishlist/WishlistContext";

export default function Wishlist() {
  const { items } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <Heart className="size-6" strokeWidth={1.5} />
        </span>
        <h1 className="text-2xl font-semibold text-foreground">Your wishlist is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Tap the heart icon on any product to save it here for later.
        </p>
        <Button asChild>
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-foreground sm:text-2xl">Wishlist ({items.length})</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {items.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
