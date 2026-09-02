import { Outlet, useLocation } from "react-router-dom";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { MobileTabBar } from "@/components/layout/MobileTabBar";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export function Layout() {
  const { pathname } = useLocation();
  // Product detail hides the mobile tab bar in favor of its own fixed buy bar,
  // so it doesn't need this padding reserved — keeping it would leave a dead
  // gap between the page's content and the footer.
  const reserveTabBarSpace = !pathname.startsWith("/products/");

  return (
    <div className="flex min-h-screen flex-col">
      <AnnouncementBar />
      <Header />
      <main className={cn("flex-1 lg:pb-0", reserveTabBarSpace && "pb-24")}>
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar />
      <Toaster
        position="bottom-right"
        duration={2500}
        offset={{ bottom: 24, right: 24 }}
        mobileOffset={{ bottom: 140, right: 16 }}
      />
    </div>
  );
}
