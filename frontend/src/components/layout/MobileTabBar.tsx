import type { ReactNode } from "react";
import { Heart, LayoutGrid, House, ShoppingCart, User, type LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/CartContext";
import { useWishlist } from "@/features/wishlist/WishlistContext";
import { useHideOnScroll } from "@/hooks/use-hide-on-scroll";

const tabButtonClass = "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5";

function TabIcon({ icon: Icon, active, badge }: { icon: LucideIcon; active: boolean; badge?: number }) {
  return (
    <span className="relative flex size-8 items-center justify-center">
      {active && <span className="absolute inset-0 rounded-full bg-primary/10" />}
      <Icon
        className={cn("relative size-5 transition-colors", active ? "text-primary" : "text-muted-foreground")}
        strokeWidth={active ? 2.1 : 1.75}
      />
      {Boolean(badge) && (
        <span className="absolute right-0.5 top-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary text-[9px] font-semibold text-primary-foreground ring-2 ring-background">
          {badge! > 9 ? "9+" : badge}
        </span>
      )}
    </span>
  );
}

function TabLabel({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <span className={cn("text-[10px] font-medium transition-colors", active ? "text-primary" : "text-muted-foreground")}>
      {children}
    </span>
  );
}

export function MobileTabBar() {
  const { pathname } = useLocation();
  const { totalCount: cartCount } = useCart();
  const { items: wishlistItems } = useWishlist();
  const hidden = useHideOnScroll();

  // Product detail has its own fixed buy bar at the bottom on mobile — stacking
  // the tab bar on top of it would eat the screen twice over, so skip it here.
  if (pathname.startsWith("/products/")) return null;

  return (
    <nav
      aria-label="Primary"
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out lg:hidden",
        hidden && "translate-y-[calc(100%+1.5rem)]",
      )}
    >
      <div className="mx-auto flex h-14 max-w-md items-stretch justify-between rounded-2xl border border-border/60 bg-background/95 px-1 shadow-[0_10px_30px_-8px_rgba(15,23,42,0.28)] backdrop-blur-lg supports-backdrop-filter:bg-background/80">
        <Link to="/" className={tabButtonClass}>
          <TabIcon icon={House} active={pathname === "/"} />
          <TabLabel active={pathname === "/"}>Home</TabLabel>
        </Link>

        <CategoriesSheet
          trigger={
            <button type="button" className={tabButtonClass}>
              <TabIcon icon={LayoutGrid} active={pathname.startsWith("/category")} />
              <TabLabel active={pathname.startsWith("/category")}>Categories</TabLabel>
            </button>
          }
        />

        <Link to="/wishlist" className={tabButtonClass}>
          <TabIcon icon={Heart} active={pathname === "/wishlist"} badge={wishlistItems.length} />
          <TabLabel active={pathname === "/wishlist"}>Wishlist</TabLabel>
        </Link>

        <Link to="/cart" className={tabButtonClass}>
          <TabIcon icon={ShoppingCart} active={pathname === "/cart"} badge={cartCount} />
          <TabLabel active={pathname === "/cart"}>Cart</TabLabel>
        </Link>

        <Link to="/account" className={tabButtonClass}>
          <TabIcon icon={User} active={pathname === "/account"} />
          <TabLabel active={pathname === "/account"}>Account</TabLabel>
        </Link>
      </div>
    </nav>
  );
}
