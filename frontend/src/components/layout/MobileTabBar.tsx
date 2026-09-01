import { Heart, LayoutGrid, House, ShoppingCart, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";

export function MobileTabBar() {
  const { pathname } = useLocation();
  const { totalCount: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();

  const linkClass = (active: boolean) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[11px] font-medium",
      active ? "text-primary" : "text-muted-foreground",
    );

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-backdrop-filter:bg-background/80 lg:hidden"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-stretch px-1">
        <Link to="/" className={linkClass(pathname === "/")}>
          <House className="size-5" />
          Home
        </Link>

        <CategoriesSheet
          trigger={
            <button type="button" className={linkClass(pathname.startsWith("/category"))}>
              <LayoutGrid className="size-5" />
              Categories
            </button>
          }
        />

        <Link to="/wishlist" className={cn(linkClass(pathname === "/wishlist"), "relative")}>
          <span className="relative">
            <Heart className="size-5" />
            {wishlistItems.length > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                {wishlistItems.length}
              </span>
            )}
          </span>
          Wishlist
        </Link>

        <Link to="/cart" className={cn(linkClass(pathname === "/cart"), "relative")}>
          <span className="relative">
            <ShoppingCart className="size-5" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </Link>

        <Link to="/account" className={linkClass(pathname === "/account")}>
          <User className="size-5" />
          Account
        </Link>
      </div>
    </nav>
  );
}
