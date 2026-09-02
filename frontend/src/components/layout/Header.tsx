import { useState } from "react";
import { Heart, Search, ShoppingCart, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNav } from "@/components/layout/MobileNav";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

export function Header() {
  const { totalCount: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const hideTopBar = useHideOnScroll();
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40">
      {/* Mobile: one compact bar — logo + search trigger, nothing else. Categories,
          wishlist, cart and account all live in the bottom tab bar instead. */}
      <div className="flex h-14 items-center gap-2 border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden">
        <Link to="/" className="shrink-0">
          <img src="/zeronix-logo.webp" alt="Zeronix" className="h-5 w-auto" />
        </Link>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Search"
          className="rounded-full"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-5" />
        </Button>
      </div>

      {/* Desktop / tablet: announcement-adjacent full nav with mega menu */}
      <div className="hidden lg:block">
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
              <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
                <Link to="/" className="shrink-0">
                  <img src="/zeronix-logo.webp" alt="Zeronix" className="h-5 w-auto" />
                </Link>

                <button
                  type="button"
                  onClick={() => setSearchOpen(true)}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm text-muted-foreground shadow-xs transition-colors hover:border-ring/50"
                >
                  <Search className="size-4 shrink-0" />
                  <span className="truncate">Search laptops, GPUs, monitors...</span>
                </button>

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
      </div>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </header>
  );
}
