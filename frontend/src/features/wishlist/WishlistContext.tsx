import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Product } from "@/features/products/types";

interface WishlistContextValue {
  items: Product[];
  isWishlisted: (id: number) => boolean;
  toggle: (product: Product) => void;
  remove: (id: number) => void;
}

const WishlistContext = createContext<WishlistContextValue | null>(null);
const STORAGE_KEY = "zeronix_wishlist";

function readStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Product[]>(() => readStorage());

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  function isWishlisted(id: number) {
    return items.some((i) => i.id === id);
  }

  function toggle(product: Product) {
    setItems((prev) =>
      prev.some((i) => i.id === product.id) ? prev.filter((i) => i.id !== product.id) : [...prev, product],
    );
  }

  function remove(id: number) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <WishlistContext.Provider value={{ items, isWishlisted, toggle, remove }}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within a WishlistProvider");
  return ctx;
}
