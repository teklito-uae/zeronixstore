import { useEffect, useState } from "react";
import { fetchProduct, ProductNotFoundError } from "./api";
import type { Product } from "./types";

interface ProductState {
  product: Product | null;
  loading: boolean;
  notFound: boolean;
}

export function useProduct(slug: string | undefined) {
  const [state, setState] = useState<ProductState>({ product: null, loading: true, notFound: false });

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setState({ product: null, loading: true, notFound: false });

    fetchProduct(slug)
      .then((product) => {
        if (cancelled) return;
        setState({ product, loading: false, notFound: false });
      })
      .catch((err) => {
        if (cancelled) return;
        setState({ product: null, loading: false, notFound: err instanceof ProductNotFoundError });
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  return state;
}
