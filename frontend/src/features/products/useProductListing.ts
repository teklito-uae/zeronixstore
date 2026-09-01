import { useEffect, useState } from "react";
import { fetchBrands, fetchPriceRange, fetchProducts, type ProductSort } from "./api";
import type { Brand, Product } from "./types";

interface UseProductListingOptions {
  /** Category slug to filter by (Category page). Omit for a pure search listing. */
  category?: string;
  /** Free-text search term (Search page). Omit for a pure category listing. */
  search?: string;
  perPage?: number;
}

interface Meta {
  current_page: number;
  last_page: number;
  total: number;
}

/**
 * Drives a filterable/sortable/paginated product grid. Category and Search pages
 * share this instead of duplicating fetch + filter-state wiring, since both are
 * "list products matching X, with brand/price filters and sort" underneath.
 */
export function useProductListing({ category, search, perPage = 24 }: UseProductListingOptions) {
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRange, setPriceRange] = useState<{ min: number; max: number } | null>(null);

  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState<number | null>(null);
  const [priceMax, setPriceMax] = useState<number | null>(null);
  const [sort, setSort] = useState<ProductSort>("featured");
  const [page, setPage] = useState(1);

  // Reset filters and reload facets whenever the scope (category/search) changes.
  useEffect(() => {
    setSelectedBrands([]);
    setPriceMin(null);
    setPriceMax(null);
    setSort("featured");
    setPage(1);

    let cancelled = false;
    Promise.all([fetchBrands(category).catch(() => []), fetchPriceRange(category).catch(() => null)]).then(
      ([brandList, range]) => {
        if (cancelled) return;
        setBrands(brandList);
        setPriceRange(range);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [category, search]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetchProducts({
      category,
      search,
      brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
      priceMin: priceMin ?? undefined,
      priceMax: priceMax ?? undefined,
      sort,
      perPage,
      page,
    })
      .then((res) => {
        if (cancelled) return;
        setProducts(res.data);
        setMeta(res.meta ?? null);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [category, search, selectedBrands, priceMin, priceMax, sort, page, perPage]);

  function resetFilters() {
    setSelectedBrands([]);
    setPriceMin(null);
    setPriceMax(null);
    setPage(1);
  }

  const activeFilterCount = selectedBrands.length + (priceMin != null ? 1 : 0) + (priceMax != null ? 1 : 0);

  return {
    products,
    meta,
    loading,
    brands,
    priceRange,
    selectedBrands,
    setSelectedBrands: (brands: string[]) => {
      setSelectedBrands(brands);
      setPage(1);
    },
    priceMin,
    priceMax,
    setPriceRange: (min: number | null, max: number | null) => {
      setPriceMin(min);
      setPriceMax(max);
      setPage(1);
    },
    sort,
    setSort: (s: ProductSort) => {
      setSort(s);
      setPage(1);
    },
    page,
    setPage,
    resetFilters,
    activeFilterCount,
  };
}
