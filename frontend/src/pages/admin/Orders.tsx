import { useEffect, useState } from 'react';
import { api } from '../../lib/api';

export default function AdminOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/admin/orders');
      setOrders(data.data);
    } catch (error) {
      console.error('Failed to fetch admin orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      await api.put(`/admin/orders/${id}`, { status: newStatus });
      setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
    } catch (error) {
      console.error('Failed to update order status', error);
      alert('Failed to update status');
    }
  };

  if (isLoading) return <div className="py-12 text-center text-text-muted">Loading orders view...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-display font-bold tracking-tight text-text-primary">Orders Management</h1>
      </div>

      <div className="bg-bg-surface border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-text-muted uppercase bg-bg-primary/50 tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Total</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {orders.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-text-muted">No orders found.</td></tr>
              ) : orders.map((order: any) => (
                <tr key={order.id} className="hover:bg-bg-primary/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-text-primary">#{order.id}</td>
                  <td className="px-6 py-4 text-text-muted">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-text-primary">{order.user?.name || 'Guest'}</td>
                  <td className="px-6 py-4 font-medium text-accent-primary">AED {parseFloat(order.total).toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      order.status === 'completed' ? 'bg-green-500/15 text-green-400' : 
                      order.status === 'processing' ? 'bg-blue-500/15 text-blue-400' : 
                      order.status === 'cancelled' ? 'bg-red-500/15 text-red-400' :
                      'bg-yellow-500/15 text-yellow-400'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <select 
                      value={order.status} 
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      className="bg-bg-primary border border-border-subtle text-text-primary text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-accent-primary/50 transition-colors"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
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
