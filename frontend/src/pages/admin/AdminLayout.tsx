import { Outlet, Link, useLocation } from 'react-router-dom';
import { Package, ShoppingCart, Users, LayoutDashboard, LogOut, Search, Tags } from 'lucide-react';
import { useAuthStore } from '../../store/auth';

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { name: 'Products', href: '/admin/products', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Tags },
    { name: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Scraper', href: '/admin/scraper', icon: Search },
    { name: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex min-h-screen bg-bg-primary">
      {/* Sidebar */}
      <div className="w-64 bg-bg-surface border-r border-border-subtle flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <span className="font-display font-bold text-lg text-accent-primary tracking-tight">Zeronix Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/admin' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-accent-primary/10 text-accent-primary' 
                    : 'text-text-muted hover:bg-bg-primary hover:text-text-primary'
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-border-subtle">
          <button 
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-left rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden h-16 bg-bg-surface border-b border-border-subtle flex items-center px-4 justify-between">
            <span className="font-display font-bold text-lg text-accent-primary tracking-tight">Zeronix Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
