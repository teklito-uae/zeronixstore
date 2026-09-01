import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface CartItem {
  key: string;
  productId: number;
  variantId: number | null;
  slug: string;
  name: string;
  variantName: string | null;
  image: string | null;
  categorySlug: string;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalCount: number;
  subtotal: number;
  addItem: (item: Omit<CartItem, "quantity" | "key"> & { quantity?: number }) => void;
  updateQuantity: (key: string, quantity: number) => void;
  removeItem: (key: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "zeronix_cart";

function readStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function addItem(input: Omit<CartItem, "quantity" | "key"> & { quantity?: number }) {
    const key = `${input.productId}:${input.variantId ?? "base"}`;
    const quantity = input.quantity ?? 1;
    const cap = input.maxQuantity || 10;

    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) => (i.key === key ? { ...i, quantity: Math.min(i.quantity + quantity, cap) } : i));
      }
      return [...prev, { ...input, key, quantity: Math.min(quantity, cap) }];
    });
  }

  function updateQuantity(key: string, quantity: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.key === key ? { ...i, quantity: Math.max(0, Math.min(quantity, i.maxQuantity || 10)) } : i))
        .filter((i) => i.quantity > 0),
    );
  }

  function removeItem(key: string) {
    setItems((prev) => prev.filter((i) => i.key !== key));
  }

  function clear() {
    setItems([]);
  }

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0), [items]);

  return (
    <CartContext.Provider value={{ items, totalCount, subtotal, addItem, updateQuantity, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
