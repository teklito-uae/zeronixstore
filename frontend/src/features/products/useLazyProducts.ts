import { useEffect, useState } from "react";
import { useInView } from "@/lib/useInView";
import { fetchProducts } from "./api";
import type { Product } from "./types";

interface LazyProductsOptions {
  /** Omit for an unfiltered fetch (used by the deals section). */
  category?: string;
  perPage?: number;
  /** Client-side filter applied after fetch, e.g. deals (sale_price !== null). */
  filter?: (product: Product) => boolean;
  limit?: number;
}

/**
 * Fetches this carousel's products only once the section scrolls near the
 * viewport, rather than every homepage section firing its request on mount.
 * Spreads network load out over the scroll instead of a burst of parallel
 * requests competing for the (weak, dev-server) connection pool at once.
 */
export function useLazyProducts({ category, perPage = 16, filter, limit }: LazyProductsOptions) {
  const { ref, inView } = useInView<HTMLElement>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inView) return;
    let cancelled = false;

    fetchProducts({ category, perPage })
      .then((res) => {
        if (cancelled) return;
        const data = filter ? res.data.filter(filter) : res.data;
        setProducts(limit ? data.slice(0, limit) : data);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
    // Intentionally only re-runs on inView — category/perPage/filter/limit
    // are fixed per call site for the lifetime of each carousel instance.
  }, [inView]);

  return { ref, products, loading };
}
