import { useEffect, useState } from 'react';
import { api } from '../../lib/api';
import { ShoppingCart, Package, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    recentOrders: [] as any[]
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          api.get('/admin/orders'),
          api.get('/admin/products')
        ]);
        
        const orders = ordersRes.data.data || [];
        const revenue = orders.reduce((sum: number, order: any) => sum + parseFloat(order.total), 0);
        
        setStats({
          totalOrders: ordersRes.data.meta?.total || orders.length,
          totalRevenue: revenue,
          totalProducts: productsRes.data.meta?.total || productsRes.data.data?.length || 0,
          recentOrders: orders.slice(0, 5)
        });
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  if (isLoading) return (
    <div className="animate-pulse space-y-8">
      <div className="h-8 bg-bg-surface rounded-lg w-1/4"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg-surface rounded-lg"></div>)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-primary">Dashboard Overview</h1>
        <p className="text-text-muted text-sm mt-2">Welcome back to the Zeronix admin control panel.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center space-x-4">
          <div className="p-3 bg-accent-primary/10 text-accent-primary rounded-lg">
            <DollarSign className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Revenue</p>
            <h3 className="text-2xl font-display font-bold text-text-primary mt-0.5">AED {stats.totalRevenue.toFixed(2)}</h3>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center space-x-4">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <ShoppingCart className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-display font-bold text-text-primary mt-0.5">{stats.totalOrders}</h3>
          </div>
        </div>
        <div className="bg-bg-surface border border-border-subtle rounded-lg p-6 flex items-center space-x-4">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <Package className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Products</p>
            <h3 className="text-2xl font-display font-bold text-text-primary mt-0.5">{stats.totalProducts}</h3>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-border-subtle flex items-center justify-between">
            <h2 className="font-display font-semibold text-base text-text-primary">Recent Orders</h2>
            <TrendingUp className="h-5 w-5 text-text-muted" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-bg-primary/50 tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Order ID</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Total</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-text-muted">No recent orders</td></tr>
              ) : stats.recentOrders.map((order: any) => (
                <tr key={order.id} className="border-b border-border-subtle hover:bg-bg-primary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">#{order.id}</td>
                  <td className="px-6 py-4 text-text-primary">{order.user?.name || 'Guest'}</td>
                  <td className="px-6 py-4 text-text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 font-semibold text-accent-primary">AED {parseFloat(order.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-green-500/15 text-green-400' : 
                      order.status === 'pending' ? 'bg-yellow-500/15 text-yellow-400' : 
                      'bg-bg-primary text-text-muted'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
