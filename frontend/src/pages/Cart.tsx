import { Link } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, Package } from 'lucide-react';
import { useCartStore } from '../store/cart';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export default function Cart() {
  const { items, removeItem, updateQuantity, getSummary } = useCartStore();
  const { subtotal, tax, total } = getSummary();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-20">
        <div className="text-center space-y-6 max-w-sm">
          <div className="h-20 w-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
            <ShoppingBag className="h-9 w-9 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-black text-text-primary tracking-tight mb-2">Your Cart is Empty</h2>
            <p className="text-sm text-text-muted">Add some high-performance components to get started.</p>
          </div>
          <Link to="/"
            className="inline-flex items-center gap-2 h-12 px-8 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/25 hover:bg-emerald-600 transition-all active:scale-95">
            Start Shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* ── Mobile Layout: stacked items + sticky footer ── */}
      <div className="lg:hidden">
        {/* Breadcrumbs + Header */}
        <div className="px-4 pt-2 pb-3 border-b border-border-subtle">
          <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} />
          <h1 className="text-xl font-black text-text-primary tracking-tight">Cart</h1>
          <p className="text-xs text-text-muted mt-0.5">{items.length} item{items.length !== 1 ? 's' : ''}</p>
        </div>

        {/* Items */}
        <div className="px-4 py-3 space-y-3 pb-48">
          {items.map(item => (
            <div key={item.id} className="flex gap-3 p-3 bg-bg-surface border border-border-subtle rounded-2xl">
              {/* Image */}
              <div className="h-18 w-18 min-w-[72px] h-[72px] bg-bg-primary border border-border-subtle rounded-xl overflow-hidden flex items-center justify-center p-1.5 flex-shrink-0">
                {item.image
                  ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
                  : <Package className="h-7 w-7 text-text-muted/30" />
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.id}`}
                  className="text-xs font-bold text-text-primary hover:text-emerald-500 transition-colors line-clamp-2 leading-tight">
                  {item.name}
                </Link>
                <p className="text-[10px] text-emerald-500 font-bold mt-0.5">AED {item.price.toFixed(2)} / unit</p>

                <div className="flex items-center justify-between mt-2">
                  {/* Qty stepper */}
                  <div className="flex items-center bg-bg-primary border border-border-subtle rounded-lg overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      className="h-7 w-7 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-xs font-black text-text-primary">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="h-7 w-7 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-text-primary">AED {(item.price * item.quantity).toFixed(2)}</span>
                    <button onClick={() => removeItem(item.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-text-muted hover:text-red-500 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sticky Footer Summary — sits above bottom nav */}
        <div className="fixed bottom-[72px] left-0 right-0 z-40 bg-bg-surface border-t border-border-subtle px-4 pt-3 pb-4 shadow-[0_-4px_24px_rgba(0,0,0,0.1)]">
          <div className="space-y-1.5 mb-3">
            <div className="flex justify-between text-xs text-text-muted">
              <span>Subtotal</span>
              <span className="font-bold text-text-primary">AED {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>VAT (5%)</span>
              <span className="font-bold text-text-primary">AED {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>Shipping</span>
              <span className="font-bold text-emerald-500">Free</span>
            </div>
          </div>
          <div className="flex flex-row items-center justify-between gap-3 pt-1">
            <div className="flex flex-col shrink-0">
              <span className="text-[10px] text-text-muted font-bold tracking-wider uppercase mb-0.5">Total</span>
              <span className="text-xl font-black text-emerald-500 whitespace-nowrap">AED {total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="flex-1 max-w-[180px]">
              <button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-[13px] uppercase tracking-wide flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all">
                Checkout <ArrowRight className="h-4 w-4" />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* ── Desktop Layout ── */}
      <div className="hidden lg:block max-w-[1440px] mx-auto px-6 lg:px-8 py-8">
        <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Cart' }]} className="mb-4" />
        <h1 className="text-2xl font-black text-text-primary tracking-tight mb-8">
          Shopping Cart <span className="text-text-muted font-bold text-base ml-2">({items.length} items)</span>
        </h1>

        <div className="flex gap-12">
          {/* Items list */}
          <div className="flex-1 space-y-4">
            {items.map(item => (
              <div key={item.id} className="flex gap-5 p-5 bg-bg-surface border border-border-subtle rounded-2xl hover:border-emerald-500/20 transition-all group">
                <div className="h-24 w-24 shrink-0 bg-bg-primary border border-border-subtle rounded-xl flex items-center justify-center p-3 overflow-hidden group-hover:border-emerald-500/20 transition-colors">
                  {item.image
                    ? <img src={item.image} alt={item.name} className="max-h-full w-auto object-contain" />
                    : <Package className="h-8 w-8 text-text-muted/30" />
                  }
                </div>

                <div className="flex flex-1 flex-col justify-between py-0.5">
                  <div className="flex items-start justify-between gap-4">
                    <Link to={`/products/${item.id}`}
                      className="text-sm font-bold text-text-primary hover:text-emerald-500 transition-colors line-clamp-2">
                      {item.name}
                    </Link>
                    <span className="text-sm font-black text-text-primary flex-shrink-0">
                      AED {(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-text-muted">AED {item.price.toFixed(2)} / unit</p>

                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-border-subtle rounded-xl overflow-hidden bg-bg-primary">
                      <button onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="h-9 w-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors">
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-black text-text-primary">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="h-9 w-9 flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-bg-surface transition-colors">
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <button onClick={() => removeItem(item.id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-text-muted hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary sidebar */}
          <div className="w-80 shrink-0">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-6 sticky top-28 space-y-6 overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Order Summary</h2>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Subtotal</span>
                  <span className="font-bold text-text-primary">AED {subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">VAT (5%)</span>
                  <span className="font-bold text-text-primary">AED {tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Shipping</span>
                  <span className="font-bold text-emerald-500">Free</span>
                </div>
              </div>

              <div className="pt-4 border-t border-dashed border-border-subtle flex justify-between items-center">
                <span className="text-sm font-black text-text-primary uppercase tracking-wider">Total</span>
                <span className="text-2xl font-black text-emerald-500">AED {total.toFixed(2)}</span>
              </div>

              <Link to="/checkout">
                <button className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all">
                  Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </Link>

              <Link to="/" className="block text-center text-xs font-bold text-text-muted hover:text-emerald-500 transition-colors">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
