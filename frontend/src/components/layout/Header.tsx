import { useState, type FormEvent } from "react";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";

export function Header() {
  const { totalCount: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <MobileNav />

        <Link to="/" className="shrink-0">
          <img src="/zeronix-logo.webp" alt="Zeronix" className="h-4.5 w-auto sm:h-5" />
        </Link>

        <MegaMenu />

        <form role="search" onSubmit={handleSearch} className="relative hidden flex-1 max-w-sm md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search laptops, GPUs, monitors..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" aria-label="Search" asChild>
            <Link to="/search">
              <Search className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative hidden lg:inline-flex" asChild>
            <Link to="/wishlist">
              <Heart className="size-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Account" className="hidden lg:inline-flex" asChild>
            <Link to="/account">
              <User className="size-5" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" aria-label="Cart" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="size-5" />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
