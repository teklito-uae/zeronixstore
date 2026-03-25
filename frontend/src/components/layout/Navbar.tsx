import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Search, Sun, Moon, ChevronDown, LogOut, Settings, Package, MapPin, LayoutDashboard } from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';
import Avatar from "boring-avatars";
import { SearchOverlay } from '../search/SearchOverlay';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function Navbar() {
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const location = useLocation();
  const isProductPage = location.pathname.startsWith('/products/');
  const isCheckoutPage = location.pathname === '/checkout';
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`sticky top-0 z-50 w-full transition-all duration-300 flex flex-col ${(isProductPage || isCheckoutPage) ? 'hidden lg:flex border-b border-border-subtle' : 'flex'
      } ${isScrolled
        ? 'bg-bg-primary/95 backdrop-blur-md shadow-sm border-b border-border-subtle'
        : 'bg-bg-primary'
      }`}>
      {/* Mobile Top Row: Logo & Cart - Hidden when scrolled OR on Product Page mobile */}
      {!isScrolled && !isProductPage && (
        <div className="lg:hidden flex items-center justify-between px-6 py-3 border-b border-border-subtle/50 animate-in fade-in slide-in-from-top-2 duration-300">
          <Link to="/" className="flex items-center group">
            <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-5 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 text-text-muted hover:text-emerald-500 transition-all"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 text-text-muted hover:text-emerald-500 transition-all"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/cart" className="relative p-2 text-text-muted hover:text-emerald-500 transition-all">
              <ShoppingBag className="h-5 w-5" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border border-bg-primary">
                  {cartItemsCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      )}

      {/* Desktop Top Row: Logo, Search, Actions */}
      <div className="max-w-[1440px] mx-auto px-6 w-full hidden lg:flex items-center justify-between py-4 gap-8">
        {/* Brand */}
        <Link to="/" className="flex items-center group shrink-0">
          <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-6 w-auto object-contain" />
        </Link>

        {/* Desktop Search - Wide */}
        <SearchOverlay mode="desktop" />

        {/* Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-bg-surface text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

          <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-bg-surface text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all">
            <ShoppingBag className="h-5 w-5" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/40 border-2 border-bg-primary">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <div className="flex items-center gap-2 group cursor-pointer lg:hover:opacity-80 transition-opacity">
                  <button className="flex items-center justify-center overflow-hidden h-10 w-10 rounded-xl bg-bg-surface border border-border-subtle group-hover:border-emerald-500/50 transition-all shadow-sm active:scale-95">
                    <Avatar
                      size={40}
                      name={user?.name}
                      variant="beam"
                      colors={["#10b981", "#34d399", "#059669", "#064e3b", "#6ee7b7"]}
                    />
                  </button>
                  <ChevronDown className="h-3.5 w-3.5 text-text-muted group-hover:text-emerald-500 transition-colors hidden lg:block" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                className="w-64 mt-2 rounded-xl border-none bg-bg-surface shadow-[0_20px_50px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.6)] p-2 animate-in fade-in zoom-in-95 duration-200" 
                align="end"
              >
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-bold text-text-primary">{user?.name}</span>
                    <span className="text-[10px] text-text-muted font-medium truncate">{user?.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border-subtle/50 my-1 mx-2" />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors">
                    <LayoutDashboard className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Dashboard</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors">
                    <Package className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">My Orders</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/dashboard/addresses" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors">
                    <MapPin className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Addresses</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-500/10 hover:text-emerald-500 focus:bg-emerald-500/10 focus:text-emerald-500 transition-colors">
                    <Settings className="h-4 w-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border-subtle/50 my-1 mx-2" />
                <DropdownMenuItem 
                  onClick={() => logout()}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer hover:bg-red-500/10 hover:text-red-500 focus:bg-red-500/10 focus:text-red-500 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link to="/login" className="flex items-center justify-center h-10 w-10 rounded-xl bg-bg-surface border border-border-subtle text-text-primary hover:border-emerald-500/50 hover:text-emerald-500 transition-colors shadow-sm">
              <User className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>

      {/* Bottom Row: Mega Menu - Hidden on Product Page mobile */}
      <div className={`border-t border-border-subtle/50 bg-bg-surface/50 relative ${isProductPage ? 'hidden lg:block' : ''}`}>
        <div className="max-w-[1440px] mx-auto px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar">

            {/* Dynamic Main Categories */}
            {categories.slice(0, 7).map((mainCategory: any) => (
              <div key={mainCategory.id} className="relative group">
                <Link
                  to={`/category/${mainCategory.slug}`}
                  className="flex items-center gap-1 text-[13px] font-bold text-text-primary hover:text-emerald-500 transition-colors py-3.5 px-3 tracking-wider whitespace-nowrap border-b-2 border-transparent group-hover:border-emerald-500 uppercase"
                >
                  {mainCategory.name}
                  {mainCategory.children && mainCategory.children.length > 0 && (
                    <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity hidden lg:block" />
                  )}
                </Link>

                {/* Full-Width Mega Menu Panel */}
                {mainCategory.children && mainCategory.children.length > 0 && (
                  <div className="fixed left-0 right-0 top-auto bg-bg-surface border-b border-border-subtle shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="max-w-[1440px] mx-auto px-8 py-6">
                      <div className={`grid gap-8 ${mainCategory.children.length <= 2 ? 'grid-cols-2' :
                        mainCategory.children.length <= 3 ? 'grid-cols-3' :
                          mainCategory.children.length <= 4 ? 'grid-cols-4' :
                            'grid-cols-5'
                        }`}>
                        {mainCategory.children.map((subCategory: any) => (
                          <div key={subCategory.id} className="space-y-3">
                            <Link
                              to={`/category/${mainCategory.slug}/${subCategory.slug}`}
                              className="font-bold text-sm text-text-primary hover:text-emerald-500 transition-colors border-b border-emerald-500/20 pb-2 block"
                            >
                              {subCategory.name}
                            </Link>

                            {/* Sub-Sub Categories */}
                            {subCategory.children && subCategory.children.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {subCategory.children.map((subSub: any) => (
                                  <Link
                                    key={subSub.id}
                                    to={`/category/${mainCategory.slug}/${subCategory.slug}/${subSub.slug}`}
                                    className="text-[13px] text-text-muted hover:text-emerald-500 transition-colors font-medium flex items-center gap-2 group/link"
                                  >
                                    <span className="h-1 w-1 rounded-full bg-border-subtle group-hover/link:bg-emerald-500 transition-colors flex-shrink-0"></span>
                                    {subSub.name}
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* "New Releases" Clean Button */}
            <Link to="/deals" className="text-[13px] font-bold text-text-muted hover:text-emerald-500 py-3.5 transition-colors uppercase tracking-wide ml-auto whitespace-nowrap flex items-center gap-1.5 focus:outline-none px-2 lg:flex hidden">
              New Releases
              <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Search Full-Screen Overlay */}
      <SearchOverlay mode="mobile" isOpen={isMobileSearchOpen} onClose={() => setIsMobileSearchOpen(false)} />
    </nav>
  );
}
