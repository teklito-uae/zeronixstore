import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag, User, Search, Sun, Moon, ChevronDown, LogOut, Settings,
  Package, MapPin, LayoutDashboard, Heart, Menu, X,
  Wifi, Laptop, Gamepad2, Camera, Music, Tag, Percent,
  Store, Phone, Truck, MessageCircle
} from 'lucide-react';
import { useCartStore } from '../../store/cart';
import { useWishlistStore } from '../../store/wishlist';
import { useThemeStore } from '../../store/theme';
import { useAuthStore } from '../../store/auth';
import { api } from '../../lib/api';
import Avatar from "boring-avatars";
import { SearchOverlay } from '../search/SearchOverlay';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "../ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

// Icon mapping for category chips in the hamburger drawer
const getCategoryChipIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('network') || n.includes('wifi')) return Wifi;
  if (n.includes('laptop') || n.includes('computer')) return Laptop;
  if (n.includes('gaming') || n.includes('game')) return Gamepad2;
  if (n.includes('camera') || n.includes('photo')) return Camera;
  if (n.includes('audio') || n.includes('hi-fi') || n.includes('speaker')) return Music;
  if (n.includes('promo') || n.includes('deal')) return Percent;
  return Tag;
};

// Badge component with pulse animation
function CountBadge({ count, prevCountRef }: { count: number; prevCountRef: React.MutableRefObject<number> }) {
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (count > prevCountRef.current && count > 0) {
      setPulse(true);
      const timeout = setTimeout(() => setPulse(false), 400);
      return () => clearTimeout(timeout);
    }
    prevCountRef.current = count;
  }, [count, prevCountRef]);

  // Update ref after render
  useEffect(() => {
    prevCountRef.current = count;
  });

  if (count <= 0) return null;

  return (
    <span className={`absolute -top-1 -right-1 h-[18px] min-w-[18px] px-0.5 bg-emerald-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-bg-primary shadow-lg shadow-emerald-500/30 ${pulse ? 'animate-badge-pulse' : ''}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

export function Navbar() {
  const cartItemsCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Refs for tracking previous counts for badge pulse
  const prevCartCount = useRef(cartItemsCount);
  const prevWishlistCount = useRef(wishlistItemsCount);

  useEffect(() => {
    api.get('/categories').then(({ data }) => setCategories(data)).catch(console.error);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  if (isAuthPage) return null;

  return (
    <>
      <nav className={`sticky top-0 z-50 w-full transition-all duration-300 flex flex-col ${
        isScrolled
          ? 'bg-bg-primary/95 backdrop-blur-md shadow-sm border-b border-border-subtle'
          : 'bg-bg-primary'
      }`}>

        {/* ═══════════════════════════════════════════════════ */}
        {/*  MOBILE HEADER — Always visible, all routes       */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border-subtle/50">
          {/* Left: Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-5 w-auto object-contain" />
          </Link>

          {/* Right: Search, Wishlist, Cart, Hamburger */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => setIsMobileSearchOpen(true)}
              className="p-2 text-text-muted hover:text-emerald-500 transition-all"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link to="/wishlist" className="relative p-2 text-text-muted hover:text-emerald-500 transition-all">
              <Heart className="h-5 w-5" />
              <CountBadge count={wishlistItemsCount} prevCountRef={prevWishlistCount} />
            </Link>

            <Link to="/cart" className="relative p-2 text-text-muted hover:text-emerald-500 transition-all">
              <ShoppingBag className="h-5 w-5" />
              <CountBadge count={cartItemsCount} prevCountRef={prevCartCount} />
            </Link>

            <button
              onClick={() => setIsDrawerOpen(true)}
              className="p-2 text-text-muted hover:text-emerald-500 transition-all"
              aria-label="Menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════ */}
        {/*  DESKTOP TOP ROW — Logo, Search (~50%), Actions   */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="max-w-[1440px] mx-auto px-6 w-full hidden lg:flex items-center justify-between py-4 gap-8">
          {/* Brand */}
          <Link to="/" className="flex items-center group shrink-0">
            <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-6 w-auto object-contain" />
          </Link>

          {/* Desktop Search — Wide ~50% */}
          <SearchOverlay mode="desktop" />

          {/* Actions */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl hover:bg-bg-surface text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            <Link to="/wishlist" className="relative p-2.5 rounded-xl hover:bg-bg-surface text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all">
              <Heart className="h-5 w-5" />
              <CountBadge count={wishlistItemsCount} prevCountRef={prevWishlistCount} />
            </Link>

            <Link to="/cart" className="relative p-2.5 rounded-xl hover:bg-bg-surface text-text-muted hover:text-emerald-500 border border-transparent hover:border-border-subtle transition-all">
              <ShoppingBag className="h-5 w-5" />
              <CountBadge count={cartItemsCount} prevCountRef={prevCartCount} />
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

        {/* ═══════════════════════════════════════════════════ */}
        {/*  DESKTOP CATEGORY NAV BAR — Second row             */}
        {/* ═══════════════════════════════════════════════════ */}
        <div className="border-t border-border-subtle/50 bg-bg-surface/50 relative hidden lg:block">
          <div className="max-w-[1440px] mx-auto px-6 w-full flex items-center justify-between">
            <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar">
              {/* Home link */}
              <Link
                to="/"
                className={`flex items-center gap-1 text-[13px] font-bold text-text-primary hover:text-emerald-500 transition-colors py-3.5 px-3 tracking-wider whitespace-nowrap border-b-2 uppercase ${
                  location.pathname === '/' ? 'border-emerald-500 text-emerald-500' : 'border-transparent'
                }`}
              >
                Home
              </Link>

              {/* Dynamic Main Categories */}
              {categories.slice(0, 7).map((mainCategory: any) => (
                <div key={mainCategory.id} className="relative group">
                  <Link
                    to={`/category/${mainCategory.slug}`}
                    className={`flex items-center gap-1 text-[13px] font-bold text-text-primary hover:text-emerald-500 transition-colors py-3.5 px-3 tracking-wider whitespace-nowrap border-b-2 uppercase ${
                      location.pathname.includes(`/category/${mainCategory.slug}`)
                        ? 'border-emerald-500 text-emerald-500'
                        : 'border-transparent group-hover:border-emerald-500'
                    }`}
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

              {/* Promotions & Outlet */}
              <Link to="/deals" className="text-[13px] font-bold text-text-muted hover:text-emerald-500 py-3.5 transition-colors uppercase tracking-wide ml-auto whitespace-nowrap flex items-center gap-1.5 focus:outline-none px-2">
                Promotions
                <span className="flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Search Full-Screen Overlay */}
        <SearchOverlay mode="mobile" isOpen={isMobileSearchOpen} onClose={() => setIsMobileSearchOpen(false)} />
      </nav>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  HAMBURGER DRAWER (Mobile)                         */}
      {/* ═══════════════════════════════════════════════════ */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent side="right" className="w-[85vw] sm:w-[380px] h-full border-l-0 p-0 bg-bg-primary overflow-hidden z-[200]">
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-border-subtle">
            <SheetTitle className="flex items-center justify-between">
              <img src="/zeronix-zero-logo.webp" alt="Zeronix" className="h-5 w-auto object-contain" />
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-2 text-text-muted hover:text-text-primary transition-colors -mr-2"
              >
                <X className="h-5 w-5" />
              </button>
            </SheetTitle>
          </SheetHeader>

          <div className="overflow-y-auto h-[calc(100vh-80px)] no-scrollbar">
            {/* TOP ZONE: Shop by Category */}
            <div className="px-5 pt-5 pb-6">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 block">
                Shop by Category
              </span>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat: any) => {
                  const Icon = getCategoryChipIcon(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      to={`/category/${cat.slug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-border-subtle bg-bg-surface hover:border-emerald-500/50 hover:bg-emerald-500/5 text-text-primary hover:text-emerald-500 transition-all text-xs font-semibold"
                    >
                      <Icon className="h-3.5 w-3.5 opacity-60" />
                      {cat.name}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border-subtle mx-5" />

            {/* BOTTOM ZONE: Support & Info */}
            <div className="px-5 pt-5 pb-8">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-4 block">
                Support & Info
              </span>
              <div className="flex flex-col gap-1">
                {[
                  { label: 'Our Stores', icon: Store, href: '#' },
                  { label: 'Contact Us', icon: Phone, href: '#' },
                  { label: 'Delivery & Returns', icon: Truck, href: '#' },
                  { label: 'WhatsApp Support', icon: MessageCircle, href: 'https://wa.me/971500000000' },
                ].map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all font-medium"
                  >
                    <link.icon className="h-4 w-4 opacity-50" />
                    {link.label}
                  </a>
                ))}
              </div>

              {/* Theme toggle in drawer */}
              <div className="mt-6 pt-4 border-t border-border-subtle/50">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all font-medium w-full"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4 opacity-50" /> : <Moon className="h-4 w-4 opacity-50" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </button>
              </div>

              {/* Account link in drawer */}
              {isAuthenticated ? (
                <div className="mt-2">
                  <Link
                    to="/dashboard"
                    onClick={() => setIsDrawerOpen(false)}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-text-muted hover:text-text-primary hover:bg-bg-surface transition-all font-medium"
                  >
                    <User className="h-4 w-4 opacity-50" />
                    My Account
                  </Link>
                  <button
                    onClick={() => { logout(); setIsDrawerOpen(false); }}
                    className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm text-red-500 hover:bg-red-500/10 transition-all font-medium w-full text-left"
                  >
                    <LogOut className="h-4 w-4 opacity-50" />
                    Logout
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setIsDrawerOpen(false)}
                  className="mt-4 flex items-center justify-center gap-2 w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all"
                >
                  <User className="h-4 w-4" />
                  Sign In / Register
                </Link>
              )}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
