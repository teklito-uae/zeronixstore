import { useState, type FormEvent } from "react";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

export function Header() {
  const { totalCount: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const hideTopBar = useHideOnScroll();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <header className="sticky top-0 z-40">
      <AnimatePresence initial={false}>
        {!hideTopBar && (
          <motion.div
            key="topbar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
          >
            <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:gap-4">
              <Link to="/" className="shrink-0">
                <img src="/zeronix-logo.webp" alt="Zeronix" className="h-4.5 w-auto sm:h-5" />
              </Link>

              <form role="search" onSubmit={handleSearch} className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search laptops, GPUs, monitors..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-9"
                />
              </form>

              <div className="flex shrink-0 items-center gap-1 sm:gap-2">
                <Button variant="ghost" size="icon" aria-label="Wishlist" className="relative" asChild>
                  <Link to="/wishlist">
                    <Heart className="size-5" />
                    {wishlistItems.length > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        {wishlistItems.length}
                      </span>
                    )}
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" aria-label="Account" asChild>
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
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative bg-nav">
        <div className="mx-auto flex h-11 max-w-7xl items-center gap-1 px-2 sm:px-4">
          <MobileNav />
          <div className="mx-1 h-5 w-px shrink-0 bg-nav-foreground/25" />
          <MegaMenu />
        </div>
      </div>
    </header>
  );
}
