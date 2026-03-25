import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, MapPin, Settings, LogOut, ChevronRight,
  Plus, Trash2, CheckCircle2, Clock, Truck, AlertCircle, Edit2, Star
} from 'lucide-react';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { AddressForm } from '../components/address/AddressForm';

// ─── Status helpers ────────────────────────────────────────────────────────
const statusConfig: Record<string, { label: string; cls: string }> = {
  pending:    { label: 'Pending',    cls: 'bg-amber-500/10   text-amber-500   border-amber-500/20'   },
  processing: { label: 'Processing', cls: 'bg-blue-500/10    text-blue-500    border-blue-500/20'    },
  completed:  { label: 'Completed',  cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
  cancelled:  { label: 'Cancelled',  cls: 'bg-red-500/10     text-red-500     border-red-500/20'     },
  shipping:   { label: 'Shipped',    cls: 'bg-purple-500/10  text-purple-500  border-purple-500/20'  },
  delivered:  { label: 'Delivered',  cls: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
};

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status] ?? { label: status, cls: 'bg-bg-primary text-text-muted border-border-subtle' };
  return (
    <span className={`inline-flex items-center text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

// ─── Main Dashboard shell ──────────────────────────────────────────────────
export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const sidebarLinks = [
    { name: 'Overview',  path: '/dashboard',           icon: LayoutDashboard },
    { name: 'My Orders', path: '/dashboard/orders',    icon: Package },
    { name: 'Addresses', path: '/dashboard/addresses', icon: MapPin },
    { name: 'Settings',  path: '/profile',             icon: Settings },
  ];

  const isActive = (path: string) =>
    path === '/dashboard'
      ? location.pathname === '/dashboard'
      : location.pathname.startsWith(path);

  return (
    <div className="min-h-screen bg-bg-primary pt-4 lg:pt-10 pb-24 lg:pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* ── Mobile: User card + horizontal pill tabs ── */}
          <div className="lg:hidden space-y-3">
            <div className="flex items-center gap-3 p-4 bg-bg-surface border border-border-subtle rounded-2xl">
              <div className="h-11 w-11 rounded-full bg-emerald-500 flex items-center justify-center text-white font-black text-lg uppercase flex-shrink-0">
                {user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-text-primary text-sm truncate">{user?.name}</h2>
                <p className="text-[10px] text-text-muted truncate">{user?.email}</p>
              </div>
              <button onClick={() => { logout(); navigate('/'); }}
                className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                <LogOut className="h-4 w-4" />
              </button>
            </div>

            <div className="flex overflow-x-auto no-scrollbar gap-2 pb-0.5">
              {sidebarLinks.map(link => (
                <Link key={link.path} to={link.path}
                  className={`flex-none flex items-center gap-1.5 px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    isActive(link.path)
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-bg-surface text-text-muted border border-border-subtle'
                  }`}>
                  <link.icon className="h-3.5 w-3.5" />
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Desktop Sidebar ── */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-28 space-y-6">
              <div className="flex items-center gap-3 p-4 bg-bg-surface border border-border-subtle rounded-2xl">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-black text-xl uppercase">
                  {user?.name?.[0]}
                </div>
                <div className="min-w-0">
                  <h2 className="font-bold text-text-primary text-sm truncate">{user?.name}</h2>
                  <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Member</p>
                </div>
              </div>

              <nav className="space-y-1">
                {sidebarLinks.map(link => (
                  <Link key={link.path} to={link.path}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all group ${
                      isActive(link.path)
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20'
                        : 'text-text-muted hover:bg-bg-surface border border-transparent hover:border-border-subtle'
                    }`}>
                    <div className="flex items-center gap-3">
                      <link.icon className={`h-4 w-4 ${isActive(link.path) ? 'text-white' : 'group-hover:text-emerald-500'}`} />
                      <span className="text-[13px] font-bold uppercase tracking-wider">{link.name}</span>
                    </div>
                    {!isActive(link.path) && <ChevronRight className="h-3 w-3 opacity-0 group-hover:opacity-40 transition-opacity" />}
                  </Link>
                ))}

                <button onClick={() => { logout(); navigate('/'); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/10 transition-all mt-2 group">
                  <LogOut className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  <span className="text-[13px] font-bold uppercase tracking-wider">Logout</span>
                </button>
              </nav>
            </div>
          </aside>

          {/* ── Content Area ── */}
          <main className="flex-1 min-w-0">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="orders" element={<Orders />} />
              <Route path="addresses" element={<Addresses />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}

// ─── Overview ─────────────────────────────────────────────────────────────
function Overview() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalSpent = orders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const recentOrders = orders.slice(0, 3);

  return (
    <div className="space-y-6 lg:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header>
        <h1 className="text-xl lg:text-3xl font-black text-text-primary tracking-tight leading-none mb-1">
          Hey, <span className="text-emerald-500">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="text-text-muted text-xs lg:text-sm">Here's what's happening with your account.</p>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Orders',    value: loading ? '–' : orders.length.toString(),            sub: 'All time',       accent: false },
          { label: 'Spent',     value: loading ? '–' : `AED ${totalSpent.toFixed(0)}`,      sub: 'Total value',    accent: true  },
          { label: 'Pending',   value: loading ? '–' : orders.filter(o => o.status === 'pending').length.toString(), sub: 'Awaiting',   accent: false },
        ].map(s => (
          <div key={s.label} className="bg-bg-surface border border-border-subtle rounded-xl p-3 lg:p-5 overflow-hidden relative">
            <div className="text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50 mb-1">{s.label}</div>
            <div className={`text-lg lg:text-2xl font-black leading-tight truncate ${s.accent ? 'text-emerald-500' : 'text-text-primary'}`}>
              {s.value}
            </div>
            <div className="text-[9px] text-text-muted opacity-40 font-bold mt-0.5 uppercase tracking-wider">{s.sub}</div>
            <div className={`absolute bottom-0 left-0 right-0 h-0.5 ${s.accent ? 'bg-emerald-500' : 'bg-border-subtle'}`} />
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-black text-text-primary uppercase tracking-tight">Recent Orders</h3>
          <Link to="/dashboard/orders" className="text-[10px] font-bold text-emerald-500 hover:underline flex items-center gap-1">
            View All <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-[72px] bg-bg-surface border border-border-subtle rounded-xl animate-pulse" />)}
          </div>
        ) : recentOrders.length > 0 ? (
          <div className="space-y-2">
            {recentOrders.map(order => (
              <div key={order.id} className="flex items-center gap-3 p-3 lg:p-4 bg-bg-surface border border-border-subtle rounded-xl hover:border-emerald-500/30 transition-all group">
                <div className="h-9 w-9 lg:h-10 lg:w-10 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center flex-shrink-0 group-hover:border-emerald-500/30 transition-colors">
                  <Package className="h-4 w-4 text-text-muted group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-text-primary">{order.order_number || `#${order.id}`}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[10px] text-text-muted mt-0.5">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <span className="text-xs font-black text-text-primary flex-shrink-0">AED {parseFloat(order.total).toFixed(2)}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center border border-dashed border-border-subtle rounded-xl bg-bg-surface/50">
            <Package className="h-8 w-8 text-text-muted/20 mx-auto mb-2" />
            <p className="text-xs text-text-muted font-bold uppercase tracking-widest opacity-60">No orders yet</p>
            <Button asChild variant="outline" className="mt-4 h-9 px-6 rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5 text-xs font-bold">
              <Link to="/">Start Shopping</Link>
            </Button>
          </div>
        )}
      </section>
    </div>
  );
}

// ─── Orders ────────────────────────────────────────────────────────────────
function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    api.get('/orders')
      .then(({ data }) => setOrders(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = orders.filter(o => {
    if (filter === 'active') return ['pending', 'processing', 'shipping'].includes(o.status);
    if (filter === 'completed') return ['completed', 'delivered', 'cancelled'].includes(o.status);
    return true;
  });

  const timeline = (status: string) => [
    { label: 'Confirmed',  icon: CheckCircle2, done: true },
    { label: 'Processing', icon: Clock,         done: !['pending'].includes(status) },
    { label: 'Shipped',    icon: Truck,         done: ['shipping', 'delivered', 'completed'].includes(status) },
    { label: 'Delivered',  icon: Package,       done: ['delivered', 'completed'].includes(status) },
  ];

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">My Orders</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
        <div className="flex gap-1 p-1 bg-bg-surface border border-border-subtle rounded-xl">
          {(['all', 'active', 'completed'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f ? 'bg-emerald-500 text-white shadow' : 'text-text-muted hover:text-text-primary'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Orders */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-28 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
        </div>
      ) : filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden transition-all hover:border-emerald-500/20">

              {/* Order main row */}
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full text-left p-4 lg:p-5 flex items-center gap-3 lg:gap-4"
              >
                <div className="h-10 w-10 lg:h-12 lg:w-12 rounded-xl bg-bg-primary border border-border-subtle flex items-center justify-center flex-shrink-0">
                  <Package className="h-5 w-5 text-text-muted" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span className="text-sm font-black text-text-primary">{order.order_number || `Order #${order.id}`}</span>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="text-[10px] text-text-muted">
                    {order.items?.length ?? 0} item{(order.items?.length ?? 0) !== 1 ? 's' : ''} · {new Date(order.created_at).toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>

                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-[10px] text-text-muted uppercase font-bold">Total</p>
                    <p className="text-sm font-black text-text-primary">AED {parseFloat(order.total).toFixed(2)}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-text-muted transition-transform duration-200 ${expanded === order.id ? 'rotate-90' : ''}`} />
                </div>
              </button>

              {/* Timeline strip */}
              <div className="px-4 lg:px-5 pb-3 flex items-center gap-3 overflow-x-auto no-scrollbar">
                {timeline(order.status).map((step, i, arr) => (
                  <div key={i} className="flex items-center gap-1.5 shrink-0">
                    <step.icon className={`h-3 w-3 ${step.done ? 'text-emerald-500' : 'text-border-subtle'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wide ${step.done ? 'text-text-muted' : 'text-border-subtle'}`}>{step.label}</span>
                    {i < arr.length - 1 && (
                      <div className={`w-4 lg:w-6 h-px mx-1 ${step.done && arr[i+1].done ? 'bg-emerald-500' : 'bg-border-subtle'}`} />
                    )}
                  </div>
                ))}
              </div>

              {/* Expanded detail: items + shipping */}
              {expanded === order.id && (
                <div className="border-t border-border-subtle/50 p-4 lg:p-5 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  {/* Items list */}
                  {order.items && order.items.length > 0 && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60 mb-3">Items Ordered</p>
                      <div className="space-y-2">
                        {order.items.map((item: any) => (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-bg-primary/60 rounded-lg">
                            <div className="h-9 w-9 rounded-lg border border-border-subtle bg-bg-surface flex items-center justify-center overflow-hidden flex-shrink-0">
                              {item.product?.primary_image_url || item.product?.images?.[0]
                                ? <img src={item.product?.primary_image_url || item.product?.images?.[0]} alt={item.product?.name} className="h-full w-full object-cover" />
                                : <Package className="h-4 w-4 text-text-muted/40" />
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold text-text-primary truncate">{item.product?.name ?? 'Product'}</p>
                              <p className="text-[10px] text-text-muted">Qty: {item.quantity} × AED {parseFloat(item.price).toFixed(2)}</p>
                            </div>
                            <p className="text-xs font-black text-text-primary flex-shrink-0">AED {parseFloat(item.total).toFixed(2)}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Totals */}
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border-subtle/40">
                    <div className="text-center">
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider opacity-60">Subtotal</p>
                      <p className="text-xs font-black text-text-primary">AED {parseFloat(order.subtotal).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider opacity-60">VAT 5%</p>
                      <p className="text-xs font-black text-text-primary">AED {parseFloat(order.tax).toFixed(2)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] text-text-muted font-bold uppercase tracking-wider opacity-60">Total</p>
                      <p className="text-xs font-black text-emerald-500">AED {parseFloat(order.total).toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Shipping address if present */}
                  {order.shipping_address && (
                    <div className="p-3 bg-bg-primary/60 rounded-lg">
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60 mb-1.5">Delivery Address</p>
                      <p className="text-xs font-bold text-text-primary">
                        {order.shipping_address.firstName || order.shipping_address.first_name} {order.shipping_address.lastName || order.shipping_address.last_name}
                      </p>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {order.shipping_address.address || order.shipping_address.address_line1}, {order.shipping_address.city}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center border border-dashed border-border-subtle rounded-2xl bg-bg-surface/40">
          <AlertCircle className="h-10 w-10 text-text-muted/20 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">No {filter !== 'all' ? filter : ''} orders</h3>
          <p className="text-xs text-text-muted mt-1.5">
            {filter === 'all' ? 'Your order history will appear here.' : `You have no ${filter} orders right now.`}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Addresses ─────────────────────────────────────────────────────────────
function Addresses() {
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<any>(null);

  const fetch = () => {
    setLoading(true);
    api.get('/addresses')
      .then(({ data }) => setAddresses(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(fetch, []);

  const deleteAddr = (id: number) => {
    api.delete(`/addresses/${id}`)
      .then(() => { toast.success('Address removed'); fetch(); })
      .catch(() => toast.error('Failed to remove address'));
  };

  const makeDefault = (id: number) => {
    api.post(`/addresses/${id}/default`)
      .then(() => { toast.success('Default address updated'); fetch(); })
      .catch(() => toast.error('Could not update default'));
  };

  const handleSubmit = (data: any) => {
    const req = editing
      ? api.put(`/addresses/${editing.id}`, data)
      : api.post('/addresses', data);

    req.then(() => {
      toast.success(editing ? 'Address updated' : 'Address added');
      setShowForm(false);
      setEditing(null);
      fetch();
    }).catch(() => toast.error('Something went wrong'));
  };

  const typeIcon = (type: string) => {
    if (type === 'office') return '🏢';
    if (type === 'other')  return '📍';
    return '🏠';
  };

  if (showForm) {
    return (
      <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center gap-3">
          <button onClick={() => { setShowForm(false); setEditing(null); }}
            className="h-9 w-9 rounded-xl border border-border-subtle bg-bg-surface flex items-center justify-center text-text-muted hover:text-text-primary transition-colors">
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
          <div>
            <h1 className="text-lg lg:text-2xl font-black text-text-primary tracking-tight">
              {editing ? 'Edit Address' : 'New Address'}
            </h1>
            <p className="text-[11px] text-text-muted">Fill in your delivery details below.</p>
          </div>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-2xl p-4 lg:p-7 max-w-2xl">
          <AddressForm
            initialData={editing}
            onSubmit={handleSubmit}
            onCancel={() => { setShowForm(false); setEditing(null); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl lg:text-2xl font-black text-text-primary tracking-tight">Addresses</h1>
          <p className="text-[11px] text-text-muted mt-0.5">{addresses.length} saved location{addresses.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true); }}
          className="h-9 lg:h-10 px-4 lg:px-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold text-xs flex items-center gap-2">
          <Plus className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Add Address</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2].map(i => <div key={i} className="h-44 bg-bg-surface border border-border-subtle rounded-2xl animate-pulse" />)}
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:gap-4">
          {addresses.map(addr => (
            <div key={addr.id}
              className={`relative bg-bg-surface border rounded-2xl p-4 lg:p-5 flex flex-col transition-all ${
                addr.is_default ? 'border-emerald-500 ring-1 ring-emerald-500/30' : 'border-border-subtle hover:border-emerald-500/20'
              }`}>

              {/* Default badge */}
              {addr.is_default && (
                <div className="absolute top-3 right-3 flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  <Star className="h-2.5 w-2.5 fill-current" />
                  Default
                </div>
              )}

              {/* Type + Name */}
              <div className="flex items-start gap-2.5 mb-3">
                <span className="text-2xl leading-none mt-0.5">{typeIcon(addr.type)}</span>
                <div className="flex-1 min-w-0 pr-14">
                  <h4 className="font-bold text-text-primary text-sm leading-tight">
                    {addr.first_name} {addr.last_name}
                  </h4>
                  <span className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-50">{addr.type}</span>
                </div>
              </div>

              {/* Address lines */}
              <div className="flex-1 space-y-0.5 mb-4">
                <p className="text-xs text-text-primary/80 font-medium">{addr.address_line1}</p>
                {addr.address_line2 && <p className="text-xs text-text-muted">{addr.address_line2}</p>}
                <p className="text-[11px] text-text-muted font-bold">
                  {[addr.city, addr.state, addr.postal_code].filter(Boolean).join(', ')}
                </p>
                {addr.country && (
                  <p className="text-[10px] text-emerald-500/80 font-black uppercase tracking-wider">{addr.country}</p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between border-t border-border-subtle/30 pt-3">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(addr); setShowForm(true); }}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-text-muted hover:text-emerald-500 hover:bg-emerald-500/5 transition-colors">
                    <Edit2 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={() => deleteAddr(addr.id)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-text-muted hover:text-red-500 hover:bg-red-500/5 transition-colors">
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>

                {!addr.is_default && (
                  <button
                    onClick={() => makeDefault(addr.id)}
                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all">
                    Set Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 lg:py-20 text-center border border-dashed border-border-subtle rounded-2xl bg-bg-surface/40">
          <MapPin className="h-10 w-10 text-text-muted/15 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-text-primary uppercase tracking-tight">No Addresses Saved</h3>
          <p className="text-xs text-text-muted mt-1.5 mb-5">Add a delivery address for faster checkout.</p>
          <Button onClick={() => setShowForm(true)}
            className="h-10 px-7 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 font-bold text-xs">
            Add First Address
          </Button>
        </div>
      )}
    </div>
  );
}
