import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Heart, ShoppingBag, User } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useAuthStore } from '../../store/auth';

export function BottomNav() {
  const location = useLocation();
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const { isAuthenticated } = useAuthStore();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50 && currentScrollY > lastScrollY) {
        setIsVisible(false);
      } else {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const profileLink = isAuthenticated ? '/dashboard' : '/login';
  const profileActive = isActive('/dashboard') || isActive('/profile');

  return (
    <div className={`lg:hidden fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.33,1,0.68,1)] ${
      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
    }`}>
      {/* Bottom bar background */}
      <div className="relative bg-bg-surface border-t border-border-subtle">
        {/* Safe area padding for notched phones */}
        <div className="flex items-end justify-around px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
          
          {/* Home */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 ${
              location.pathname === '/' ? 'text-accent-primary' : 'text-text-muted'
            }`}
          >
            <Home className={`h-[22px] w-[22px] ${location.pathname === '/' ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-wide">Home</span>
          </Link>

          {/* Favorite */}
          <Link
            to="/wishlist"
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 ${
              isActive('/wishlist') ? 'text-accent-primary' : 'text-text-muted'
            }`}
          >
            <Heart className={`h-[22px] w-[22px] ${isActive('/wishlist') ? 'stroke-[2.5px] fill-accent-primary/20' : 'stroke-[1.5px]'}`} />
            <span className="text-[10px] font-semibold mt-1 tracking-wide">Favorite</span>
          </Link>


          {/* Cart */}
          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 relative ${
              isActive('/cart') ? 'text-accent-primary' : 'text-text-muted'
            }`}
          >
            <div className="relative">
              <ShoppingBag className={`h-[22px] w-[22px] ${isActive('/cart') ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-2 bg-accent-primary text-white text-[8px] font-bold h-4 w-4 rounded-full flex items-center justify-center">
                  {cartItemsCount}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold mt-1 tracking-wide">Cart</span>
          </Link>

          {/* Profile / Account */}
          <Link
            to={profileLink}
            className={`flex flex-col items-center justify-center py-2 px-3 min-w-[60px] transition-colors duration-200 ${
              profileActive ? 'text-accent-primary' : 'text-text-muted'
            }`}
          >
            <div className={`h-[24px] w-[24px] rounded-full overflow-hidden border-2 transition-colors ${
              profileActive ? 'border-accent-primary' : 'border-border-subtle'
            }`}>
              <User className={`h-full w-full p-0.5 ${profileActive ? 'stroke-[2px]' : 'stroke-[1.5px]'}`} />
            </div>
            <span className="text-[10px] font-semibold mt-1 tracking-wide">{isAuthenticated ? 'Account' : 'Login'}</span>
          </Link>

        </div>
      </div>
    </div>
  );
}
