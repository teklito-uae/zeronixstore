import { useEffect, useState } from "react";
import { Loader2, Search, SearchX, TrendingUp, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { searchProductSuggestions } from "@/features/products/api";
import type { ProductSuggestion } from "@/features/products/types";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

const trendingSearches = [
  "Gaming Laptop",
  "RTX 4070 Graphics Card",
  "4K Monitor",
  "Mechanical Keyboard",
  "NVMe SSD",
  "Gaming Headset",
];

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebouncedValue(query.trim(), 300);
  const navigate = useNavigate();

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    let ignore = false;
    setLoading(true);
    searchProductSuggestions(debouncedQuery, 6)
      .then((data) => {
        if (!ignore) setResults(data);
      })
      .catch(() => {
        if (!ignore) setResults([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [debouncedQuery]);

  function handleOpenChange(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setQuery("");
      setResults([]);
    }
  }

  function goToResults(term: string) {
    const q = term.trim();
    if (!q) return;
    navigate(`/search?q=${encodeURIComponent(q)}`);
    handleOpenChange(false);
  }

  function goToProduct(slug: string) {
    navigate(`/products/${slug}`);
    handleOpenChange(false);
  }

  const trimmed = query.trim();
  const showIdle = trimmed.length === 0;
  const showTooShort = trimmed.length === 1;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="top-[8%] flex max-h-[80vh] max-w-[calc(100%-2rem)] translate-y-0 flex-col gap-0 overflow-hidden p-0 sm:top-[10%] sm:max-w-lg"
      >
        <DialogTitle className="sr-only">Search products</DialogTitle>
        <DialogDescription className="sr-only">
          Search the Zeronix catalog by product name, brand, or category.
        </DialogDescription>

        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            goToResults(query);
          }}
          className="flex shrink-0 items-center gap-2 border-b border-border px-4 py-3"
        >
          <Search className="size-4.5 shrink-0 text-muted-foreground" />
          <input
            type="search"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search laptops, GPUs, monitors..."
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" />}
          {query && !loading && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => setQuery("")}
              className="flex size-6 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
        </form>

        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {showIdle && (
            <div className="p-2">
              <div className="mb-2 flex items-center gap-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <TrendingUp className="size-3.5" />
                Trending searches
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {trendingSearches.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => goToResults(term)}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent hover:text-primary"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {showTooShort && (
            <p className="px-3 py-8 text-center text-sm text-muted-foreground">Keep typing to search…</p>
          )}

          {!showIdle && !showTooShort && loading && (
            <div className="flex flex-col gap-1 p-1">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 rounded-lg p-2">
                  <div className="size-11 shrink-0 animate-pulse rounded-lg bg-muted" />
                  <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {!showIdle && !showTooShort && !loading && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <SearchX className="size-7 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground">No results for &ldquo;{trimmed}&rdquo;</p>
              <p className="text-xs text-muted-foreground">Try a different spelling or a more general term.</p>
            </div>
          )}

          {!showIdle && !showTooShort && !loading && results.length > 0 && (
            <div className="flex flex-col gap-0.5 p-1">
              {results.map((product) => {
                const accent = getCategoryAccent(product.category?.slug ?? "");
                const onSale = product.sale_price !== null;
                return (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => goToProduct(product.slug)}
                    className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-muted"
                  >
                    <span
                      className={cn(
                        "flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                        product.primary_image_url ? "bg-white ring-1 ring-border" : accent.bg,
                      )}
                    >
                      {product.primary_image_url ? (
                        <img
                          src={product.primary_image_url}
                          alt=""
                          className="h-full w-full object-contain p-1"
                        />
                      ) : (
                        <CategoryIcon
                          slug={product.category?.slug ?? ""}
                          className={cn("size-5", accent.fg)}
                          strokeWidth={1.5}
                        />
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">{product.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {product.brand?.name ?? product.category?.name}
                      </span>
                    </span>
                    <span className="flex shrink-0 flex-col items-end">
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(onSale ? product.sale_price! : product.price)}
                      </span>
                      {onSale && (
                        <span className="text-[11px] text-muted-foreground line-through">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {!showIdle && !showTooShort && results.length > 0 && (
          <button
            type="button"
            onClick={() => goToResults(query)}
            className="shrink-0 border-t border-border px-4 py-3 text-center text-sm font-medium text-primary hover:bg-accent"
          >
            View all results for &ldquo;{trimmed}&rdquo;
          </button>
        )}
      </DialogContent>
    </Dialog>
  );
}
