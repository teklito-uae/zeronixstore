import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2, Loader2, CreditCard, ChevronLeft, ChevronRight,
  ShieldCheck, ShoppingBag, Truck, MapPin, Plus, Package
} from 'lucide-react';
import { useCartStore } from '../store/cart';
import { useAuthStore } from '../store/auth';
import { api } from '../lib/api';

// ─── Types ──────────────────────────────────────────────────────
type ShippingMethod = 'standard' | 'express';

interface AddressData {
  first_name: string; last_name: string;
  address_line1: string; address_line2: string;
  city: string; state: string;
  postal_code: string; country: string;
  type: 'home' | 'office' | 'other';
}

const EMIRATES = ['Dubai','Abu Dhabi','Sharjah','Ajman','Umm Al Quwain','Ras Al Khaimah','Fujairah'];

const typeIcon = (type: string) =>
  type === 'office' ? '🏢' : type === 'other' ? '📍' : '🏠';

// ─── Inline New-Address Form (no save button — submit is handled by checkout) ──
function InlineAddressFields({
  data, onChange, errors,
}: {
  data: AddressData;
  onChange: (key: keyof AddressData, val: string) => void;
  errors: Partial<Record<keyof AddressData, string>>;
}) {
  const cls = (f: keyof AddressData) =>
    `flex h-11 w-full rounded-xl border bg-bg-primary px-4 text-sm text-text-primary placeholder:text-text-muted/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all ${
      errors[f] ? 'border-red-500/50 focus:border-red-500/50' : 'border-border-subtle focus:border-emerald-500/50'
    }`;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">First Name *</label>
          <input value={data.first_name} onChange={e => onChange('first_name', e.target.value)} className={cls('first_name')} placeholder="John" />
          {errors.first_name && <p className="text-[10px] text-red-400 mt-1">{errors.first_name}</p>}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Last Name *</label>
          <input value={data.last_name} onChange={e => onChange('last_name', e.target.value)} className={cls('last_name')} placeholder="Doe" />
          {errors.last_name && <p className="text-[10px] text-red-400 mt-1">{errors.last_name}</p>}
        </div>
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Address Line 1 *</label>
        <input value={data.address_line1} onChange={e => onChange('address_line1', e.target.value)} className={cls('address_line1')} placeholder="Street / Villa / Building" />
        {errors.address_line1 && <p className="text-[10px] text-red-400 mt-1">{errors.address_line1}</p>}
      </div>
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Address Line 2 (Optional)</label>
        <input value={data.address_line2} onChange={e => onChange('address_line2', e.target.value)} className={cls('address_line2')} placeholder="Floor, apartment, landmark" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">City *</label>
          <input value={data.city} onChange={e => onChange('city', e.target.value)} className={cls('city')} placeholder="Dubai" />
          {errors.city && <p className="text-[10px] text-red-400 mt-1">{errors.city}</p>}
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Emirate</label>
          <select value={data.state} onChange={e => onChange('state', e.target.value)} className={cls('state')}>
            {EMIRATES.map(e => <option key={e}>{e}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Postal Code</label>
          <input value={data.postal_code} onChange={e => onChange('postal_code', e.target.value)} className={cls('postal_code')} placeholder="00000" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-1">Country</label>
          <input value="United Arab Emirates" disabled className={`${cls('country')} opacity-50 cursor-not-allowed`} />
        </div>
      </div>
      {/* Type selector */}
      <div>
        <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted opacity-60 block mb-2">Address Type</label>
        <div className="grid grid-cols-3 gap-2">
          {(['home','office','other'] as const).map(t => (
            <button key={t} type="button" onClick={() => onChange('type', t)}
              className={`h-10 rounded-xl border font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                data.type === t ? 'bg-emerald-500 border-emerald-500 text-white shadow' : 'border-border-subtle text-text-muted hover:border-emerald-500/30'
              }`}>
              <span>{typeIcon(t)}</span> {t}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Checkout Component ─────────────────────────────────────
export default function Checkout() {
  const { items, getSummary, clearCart } = useCartStore();
  const navigate = useNavigate();
  const { subtotal, tax, total } = getSummary();
  const { user, isAuthenticated } = useAuthStore();

  const [step, setStep] = useState(1); // 1=Address, 2=Payment, 3=Review
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState<any>(null);

  // Address
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [isNewAddress, setIsNewAddress] = useState(false);
  const [newAddr, setNewAddr] = useState<AddressData>({
    first_name: '', last_name: '', address_line1: '', address_line2: '',
    city: '', state: 'Dubai', postal_code: '', country: 'United Arab Emirates', type: 'home',
  });
  const [addrErrors, setAddrErrors] = useState<Partial<Record<keyof AddressData, string>>>({});

  // Shipping
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('standard');
  const shippingCost = shippingMethod === 'express' ? 25 : 0;
  const grandTotal = total + shippingCost;

  useEffect(() => { window.scrollTo(0, 0); }, [step]);

  useEffect(() => {
    if (isAuthenticated) {
      api.get('/addresses').then(({ data }) => {
        const addrs = Array.isArray(data) ? data : [];
        setSavedAddresses(addrs);
        // Auto-select default
        const def = addrs.find((a: any) => a.is_default);
        if (def) setSelectedAddressId(def.id);
        // If no saved addresses, show new form
        if (addrs.length === 0) setIsNewAddress(true);
      }).catch(() => setIsNewAddress(true));
    } else {
      setIsNewAddress(true);
    }
  }, [isAuthenticated]);

  if (items.length === 0 && !isSuccess) {
    navigate('/cart');
    return null;
  }

  // ── Helpers ──
  const updateNewAddr = (k: keyof AddressData, v: string) => {
    setNewAddr(p => ({ ...p, [k]: v }));
    if (addrErrors[k]) setAddrErrors(p => { const n = { ...p }; delete n[k]; return n; });
  };

  const validateAddress = (): boolean => {
    if (isNewAddress) {
      const errs: Partial<Record<keyof AddressData, string>> = {};
      if (!newAddr.first_name) errs.first_name = 'Required';
      if (!newAddr.last_name) errs.last_name = 'Required';
      if (!newAddr.address_line1) errs.address_line1 = 'Required';
      if (!newAddr.city) errs.city = 'Required';
      setAddrErrors(errs);
      return Object.keys(errs).length === 0;
    }
    return !!selectedAddressId;
  };

  const getShippingAddress = () => {
    if (isNewAddress) return newAddr;
    const addr = savedAddresses.find(a => a.id === selectedAddressId);
    if (!addr) return newAddr;
    return {
      first_name: addr.first_name, last_name: addr.last_name,
      address_line1: addr.address_line1, address_line2: addr.address_line2 || '',
      city: addr.city, state: addr.state, postal_code: addr.postal_code,
      country: addr.country || 'United Arab Emirates', type: addr.type,
    };
  };

  const handleNext = () => {
    if (step === 1) {
      if (!validateAddress()) return;
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError('');
    try {
      const shipping = getShippingAddress();
      const { data } = await api.post('/orders', {
        items: items.map(item => ({ product_id: item.id, variant_id: item.variant_id ?? null, quantity: item.quantity })),
        shipping_address: shipping,
        payment_method: 'credit_card',
        notes: '',
      });
      setOrderData(data);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──
  if (isSuccess) {
    const addr = getShippingAddress();
    return (
      <div className="py-12 md:py-20 px-4 max-w-4xl mx-auto min-h-screen">
        <div className="flex flex-col items-center text-center mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="w-40 h-40 md:w-52 md:h-52 mb-6 flex items-center justify-center relative">
            {/* Background glow pulse */}
            <div className="absolute inset-0 bg-emerald-500/10 rounded-full animate-ping duration-[3000ms] scale-75" />
            <div className="absolute inset-4 bg-emerald-500/20 rounded-full animate-pulse" />
            
            {/* Success icon with pop-in animation */}
            <div className="relative bg-emerald-500 rounded-full p-8 md:p-12 shadow-[0_20px_50px_rgba(16,185,129,0.3)] animate-in zoom-in-50 duration-500 curve-bounce">
              <CheckCircle2 className="w-16 h-16 md:w-24 md:h-24 text-white stroke-[3px]" />
            </div>
          </div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tight mb-3 text-text-primary">Order Confirmed!</h1>
          <p className="text-text-muted text-xs md:text-sm uppercase tracking-[0.2em] font-bold opacity-60 mb-1">
            Order: <span className="text-emerald-500">{orderData?.order_number || `#${orderData?.id}`}</span>
          </p>
          <p className="text-text-muted text-xs md:text-sm max-w-md">
            A confirmation has been sent to <span className="font-bold text-text-primary">{user?.email}</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-in fade-in duration-1000 delay-300">
          <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 md:p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60 mb-5">Order Receipt</h3>
            <div className="space-y-3 mb-5">
              {orderData?.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between items-center py-2 border-b border-border-subtle/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-bg-primary border border-border-subtle flex items-center justify-center">
                      <Package className="h-4 w-4 text-text-muted/40" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-text-primary line-clamp-1">{item.product?.name}</p>
                      <p className="text-[10px] text-text-muted">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-xs font-black text-text-primary">AED {parseFloat(item.total).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2 pt-4 border-t border-dashed border-border-subtle">
              <div className="flex justify-between text-xs text-text-muted"><span>Subtotal</span><span className="font-bold text-text-primary">AED {parseFloat(orderData?.subtotal || 0).toFixed(2)}</span></div>
              <div className="flex justify-between text-xs text-text-muted"><span>VAT</span><span className="font-bold text-text-primary">AED {parseFloat(orderData?.tax || 0).toFixed(2)}</span></div>
              <div className="flex justify-between pt-3 border-t border-border-subtle">
                <span className="text-sm font-black text-text-primary">Total</span>
                <span className="text-xl font-black text-emerald-500">AED {parseFloat(orderData?.total || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl p-5 md:p-6">
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted opacity-60 mb-4 flex items-center gap-2">
                <Truck className="h-3 w-3 text-emerald-500" /> Delivery Address
              </h3>
              <p className="font-bold text-text-primary text-sm">{addr.first_name} {addr.last_name}</p>
              <p className="text-xs text-text-muted mt-1">{addr.address_line1}</p>
              <p className="text-xs text-text-muted">{addr.city}, {addr.state}</p>
              <p className="text-[10px] font-bold text-emerald-500 mt-1">3–5 Business Days</p>
            </div>

            <div className="flex flex-col gap-2">
              <Link to="/dashboard/orders"
                className="h-12 flex items-center justify-center gap-2 bg-emerald-500 text-white font-bold text-xs rounded-xl uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 active:scale-95 transition-all">
                Track My Order <ChevronRight className="h-4 w-4" />
              </Link>
              <Link to="/"
                className="h-12 flex items-center justify-center border border-border-subtle bg-bg-surface text-text-primary font-bold text-xs rounded-xl uppercase tracking-wider hover:bg-bg-primary active:scale-95 transition-all">
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout layout ──
  const stepLabels = ['Delivery', 'Payment', 'Review'];

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Mobile header */}
      <div className="lg:hidden sticky top-0 z-50 bg-bg-primary border-b border-border-subtle flex items-center px-4 py-3 gap-3">
        <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)}
          className="h-9 w-9 flex items-center justify-center border border-border-subtle bg-bg-surface rounded-xl text-text-muted">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="flex-1">
          <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">Step {step} of 3</p>
          <p className="text-sm font-black text-text-primary">{stepLabels[step - 1]}</p>
        </div>
        {/* Mini step dots */}
        <div className="flex gap-1.5">
          {[1,2,3].map(s => (
            <div key={s} className={`h-1.5 rounded-full transition-all ${s === step ? 'w-5 bg-emerald-500' : s < step ? 'w-1.5 bg-emerald-500/40' : 'w-1.5 bg-border-subtle'}`} />
          ))}
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 lg:px-8 py-6 lg:py-10">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* ── Left: Form Steps ── */}
          <div className="flex-1 min-w-0 space-y-5">
            {/* Desktop step indicator */}
            <div className="hidden lg:flex items-center gap-0 mb-8">
              {stepLabels.map((label, i) => {
                const s = i + 1;
                return (
                  <div key={s} className="flex items-center gap-0 flex-1 last:flex-none">
                    <div className="flex items-center gap-2.5">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border-2 text-xs font-black transition-all ${
                        s === step ? 'bg-emerald-500 border-emerald-500 text-white' :
                        s < step ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500' : 'border-border-subtle text-text-muted'
                      }`}>
                        {s < step ? <CheckCircle2 className="h-4 w-4" /> : s}
                      </div>
                      <span className={`text-xs font-bold uppercase tracking-wider ${s <= step ? 'text-text-primary' : 'text-text-muted opacity-40'}`}>{label}</span>
                    </div>
                    {s < 3 && <div className={`flex-1 h-px mx-4 ${s < step ? 'bg-emerald-500' : 'bg-border-subtle opacity-30'}`} />}
                  </div>
                );
              })}
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-xl text-sm">{error}</div>
            )}

            {/* ── Step 1: Delivery ── */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
                {/* If user has saved addresses: show tabs */}
                {savedAddresses.length > 0 && (
                  <div className="flex rounded-xl border border-border-subtle bg-bg-surface p-1 gap-1">
                    <button type="button" onClick={() => { setIsNewAddress(false); }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${!isNewAddress ? 'bg-emerald-500 text-white shadow' : 'text-text-muted hover:text-text-primary'}`}>
                      Saved Addresses
                    </button>
                    <button type="button" onClick={() => { setIsNewAddress(true); setSelectedAddressId(null); }}
                      className={`flex-1 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${isNewAddress ? 'bg-emerald-500 text-white shadow' : 'text-text-muted hover:text-text-primary'}`}>
                      <span className="flex items-center justify-center gap-1.5"><Plus className="h-3 w-3" /> New Address</span>
                    </button>
                  </div>
                )}

                {/* Saved address cards */}
                {!isNewAddress && savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {savedAddresses.map(addr => (
                      <button key={addr.id} type="button"
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`relative text-left p-4 rounded-xl border transition-all ${
                          selectedAddressId === addr.id ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' : 'border-border-subtle bg-bg-surface hover:border-emerald-500/30'
                        }`}>
                        {/* Radio */}
                        <div className={`absolute top-3.5 right-3.5 h-4.5 w-4.5 rounded-full border-2 flex items-center justify-center transition-all ${
                          selectedAddressId === addr.id ? 'border-emerald-500 bg-emerald-500' : 'border-border-subtle'
                        }`}>
                          {selectedAddressId === addr.id && <div className="h-2 w-2 rounded-full bg-white" />}
                        </div>

                        {addr.is_default && (
                          <span className="inline-block text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full mb-2">
                            Default
                          </span>
                        )}
                        <p className="text-xs font-black text-text-primary pr-6">
                          <span className="mr-1.5">{typeIcon(addr.type)}</span>
                          {addr.first_name} {addr.last_name}
                        </p>
                        <p className="text-[11px] text-text-muted mt-1 leading-relaxed">{addr.address_line1}</p>
                        <p className="text-[10px] text-text-muted font-bold mt-0.5 opacity-60">{addr.city}, {addr.state}</p>
                      </button>
                    ))}
                  </div>
                )}

                {/* New address inline form (no external save button) */}
                {isNewAddress && (
                  <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 lg:p-6">
                    <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border-subtle/50">
                      <MapPin className="h-4 w-4 text-emerald-500" />
                      <h2 className="text-sm font-bold text-text-primary">Delivery Details</h2>
                    </div>
                    <InlineAddressFields data={newAddr} onChange={updateNewAddr} errors={addrErrors} />
                  </div>
                )}

                {/* Shipping method (only when address chosen) */}
                {(selectedAddressId || isNewAddress) && (
                  <div className="bg-bg-surface border border-border-subtle rounded-xl p-4 lg:p-5">
                    <h2 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-2">
                      <Truck className="h-4 w-4 text-emerald-500" /> Shipping Method
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {[
                        { id: 'standard', label: 'Standard', sub: '3–5 Business Days', price: 'Free' },
                        { id: 'express',  label: 'Express',  sub: '1–2 Business Days', price: 'AED 25.00' },
                      ].map(m => (
                        <button key={m.id} type="button" onClick={() => setShippingMethod(m.id as ShippingMethod)}
                          className={`p-4 rounded-xl border text-left transition-all ${
                            shippingMethod === m.id ? 'border-emerald-500 bg-emerald-500/5 ring-1 ring-emerald-500' : 'border-border-subtle hover:border-emerald-500/30'
                          }`}>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-bold text-text-primary">{m.label}</span>
                            <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center ${shippingMethod === m.id ? 'border-emerald-500 bg-emerald-500' : 'border-border-subtle'}`}>
                              {shippingMethod === m.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <p className="text-[11px] text-text-muted">{m.sub}</p>
                          <p className={`text-sm font-black mt-1 ${m.price === 'Free' ? 'text-emerald-500' : 'text-text-primary'}`}>{m.price}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Step 2: Payment ── */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 lg:p-7">
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border-subtle">
                    <CreditCard className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-bold text-text-primary">Payment Method</h2>
                  </div>
                  <div className="space-y-3">
                    <div className="p-4 lg:p-5 border-2 border-emerald-500 bg-emerald-500/5 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-bg-primary border border-emerald-500/20 flex items-center justify-center">
                          <CreditCard className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-text-primary">Credit / Debit Card</p>
                          <p className="text-[10px] text-text-muted opacity-60 uppercase tracking-wider font-bold">Secure & Encrypted</p>
                        </div>
                      </div>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="p-4 lg:p-5 border border-border-subtle bg-bg-primary/40 rounded-xl flex items-center gap-3 opacity-40 grayscale">
                      <div className="h-11 w-11 rounded-xl bg-bg-surface border border-border-subtle flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-text-muted" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Crypto Pay</p>
                        <p className="text-[10px] text-text-muted uppercase tracking-wider font-bold">Coming Soon</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── Step 3: Review ── */}
            {step === 3 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-400">
                <div className="bg-bg-surface border border-border-subtle rounded-xl p-5 lg:p-7">
                  <div className="flex items-center gap-2 mb-5 pb-4 border-b border-border-subtle">
                    <ShieldCheck className="h-4 w-4 text-emerald-500" />
                    <h2 className="text-sm font-bold text-text-primary">Review Your Order</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60 mb-2">Delivery Address</p>
                      <div className="p-3 bg-bg-primary/60 rounded-xl border border-border-subtle">
                        {(() => { const a = getShippingAddress(); return (
                          <>
                            <p className="text-xs font-bold text-text-primary">{a.first_name} {a.last_name}</p>
                            <p className="text-[11px] text-text-muted mt-0.5">{a.address_line1}</p>
                            <p className="text-[11px] text-text-muted">{a.city}, {a.state}</p>
                          </>
                        );})()}
                      </div>
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-text-muted opacity-60 mb-2">Payment</p>
                      <div className="p-3 bg-bg-primary/60 rounded-xl border border-border-subtle">
                        <p className="text-xs font-bold text-text-primary">Credit / Debit Card</p>
                        <p className="text-[10px] text-emerald-500 font-bold mt-0.5 uppercase tracking-wider">Encrypted</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Desktop back button */}
            {step > 1 && (
              <button onClick={() => setStep(step - 1)}
                className="hidden lg:flex items-center gap-2 text-xs text-text-muted hover:text-text-primary font-bold uppercase tracking-wider transition-colors mt-2">
                <ChevronLeft className="h-4 w-4" /> Back to {stepLabels[step - 2]}
              </button>
            )}
          </div>

          {/* ── Right: Order Summary ── */}
          <div className="w-full lg:w-[360px] shrink-0">
            <div className="bg-bg-surface border border-border-subtle rounded-2xl overflow-hidden sticky top-20 lg:top-24">
              <div className="h-1 bg-emerald-500 w-full" />
              <div className="p-5 lg:p-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted opacity-60 mb-4">Order Summary</h2>

                {/* Items */}
                <ul className="space-y-3 mb-4 max-h-48 overflow-y-auto no-scrollbar">
                  {items.map(item => (
                    <li key={item.id} className="flex gap-3">
                      <div className="h-12 w-12 rounded-lg bg-bg-primary border border-border-subtle flex-shrink-0 flex items-center justify-center p-1.5 overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" /> : <Package className="h-5 w-5 text-text-muted/30" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-text-primary line-clamp-1">{item.name}</p>
                        <p className="text-[10px] text-text-muted mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-xs font-black text-text-primary flex-shrink-0">AED {(item.price * item.quantity).toFixed(2)}</p>
                    </li>
                  ))}
                </ul>

                <div className="space-y-2 py-4 border-t border-dashed border-border-subtle">
                  <div className="flex justify-between text-xs text-text-muted"><span>Subtotal</span><span className="font-bold text-text-primary">AED {subtotal.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-text-muted"><span>Shipping</span><span className={`font-bold ${shippingCost === 0 ? 'text-emerald-500' : 'text-text-primary'}`}>{shippingCost === 0 ? 'Free' : `AED ${shippingCost.toFixed(2)}`}</span></div>
                  <div className="flex justify-between text-xs text-text-muted"><span>VAT (5%)</span><span className="font-bold text-text-primary">AED {tax.toFixed(2)}</span></div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-border-subtle mb-5">
                  <span className="text-sm font-black text-text-primary uppercase tracking-wider">Total</span>
                  <span className="text-2xl font-black text-emerald-500">AED {grandTotal.toFixed(2)}</span>
                </div>

                {/* CTA Button */}
                {step < 3 ? (
                  <button onClick={handleNext}
                    className="w-full h-13 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all">
                    {step === 1 ? 'Continue to Payment' : 'Review Order'}
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button onClick={handlePlaceOrder} disabled={isSubmitting}
                    className="w-full h-13 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed">
                    {isSubmitting ?  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</> : <><ShieldCheck className="h-4 w-4" /> Place Order</>}
                  </button>
                )}

                <p className="text-[9px] text-center text-text-muted font-bold uppercase tracking-[0.2em] mt-4 opacity-30">Secure end-to-end processing</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
