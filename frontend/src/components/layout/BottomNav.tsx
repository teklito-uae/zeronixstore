import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User, LayoutGrid } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useAuthStore } from '../../store/auth';

export function BottomNav() {
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);
  const { isAuthenticated } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const profileLink = isAuthenticated ? '/dashboard' : '/login';
  const profileActive = isActive('/dashboard') || isActive('/profile');

  const tabs = [
    { label: 'Home', icon: Home, path: '/', active: location.pathname === '/' },
    { label: 'Shop', icon: LayoutGrid, path: '/category', active: location.pathname.startsWith('/category') },
    { label: 'Cart', icon: ShoppingBag, path: '/cart', active: isActive('/cart'), badge: cartItemsCount },
    { label: 'Wishlist', icon: Heart, path: '/wishlist', active: isActive('/wishlist'), badge: wishlistItemsCount },
    { label: isAuthenticated ? 'Account' : 'Login', icon: User, path: profileLink, active: profileActive },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
      <div className="relative bg-bg-surface/95 backdrop-blur-md border-t border-border-subtle">
        <div className="flex items-end justify-around px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 ${
                tab.active ? 'text-accent-primary' : 'text-text-muted'
              }`}
            >
              <div className="relative">
                <tab.icon
                  className={`h-[22px] w-[22px] ${
                    tab.active ? 'stroke-[2.5px]' : 'stroke-[1.5px]'
                  } ${tab.label === 'Wishlist' && tab.active ? 'fill-accent-primary/20' : ''}`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 h-[16px] min-w-[16px] px-0.5 bg-emerald-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center border-2 border-bg-surface shadow-sm">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1 tracking-wide">{tab.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
