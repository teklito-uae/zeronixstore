import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { BottomNav } from './BottomNav';
import { AIAssistant } from '../assistant/AIAssistant';
import { Toaster } from 'sonner';
import { useThemeStore } from '../../store/theme';

export function Layout() {
  const { theme } = useThemeStore();
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  const isCartPage = location.pathname === '/cart';
  const isNoBottomNavPage = location.pathname.startsWith('/category') || location.pathname.startsWith('/products/') || location.pathname === '/cart' || location.pathname === '/checkout';

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
  }, [theme]);

  return (
    <div className="flex flex-col min-h-screen bg-bg-primary text-text-primary transition-colors duration-500">
      {/* Global Announcement Marquee - hidden on auth pages */}
      {!isAuthPage && (
        <div className="bg-emerald-600 overflow-hidden py-2 hidden lg:block">
          <div className="animate-marquee whitespace-nowrap text-white text-[10px] font-bold uppercase tracking-[0.2em]">
            {[1,2,3,4,5].map(i => (
               <span key={i} className="mx-12">
                 ⚡ New High Performance GPUs in Stock — Limited Availability
                 <span className="mx-4 font-normal opacity-50">|</span>
                 🚀 Free Express Delivery on orders over $1000 — 24/7 Support Active
               </span>
            ))}
          </div>
        </div>
      )}

      {!isAuthPage && <Navbar />}

      <main className={`flex-1 w-full max-w-[1440px] mx-auto ${isAuthPage ? '' : 'pb-20 lg:pb-0'}`}>
        <Outlet />
      </main>

      {!isAuthPage && (isCartPage ? <div className="hidden lg:block"><Footer /></div> : <Footer />)}
      {!isAuthPage && !isNoBottomNavPage && <BottomNav />}
      <AIAssistant />
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
}
