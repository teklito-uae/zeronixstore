import { useEffect, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Search as SearchIcon, SearchX, SlidersHorizontal } from "lucide-react";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSortSelect } from "@/components/product/ProductSortSelect";
import { ProductPaginationBar } from "@/components/product/ProductPaginationBar";
import { useProductListing } from "@/features/products/useProductListing";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q")?.trim() ?? "";
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [inputValue, setInputValue] = useState(query);

  const listing = useProductListing({ search: query, perPage: 24 });

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = inputValue.trim();
    if (q) setSearchParams({ q });
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-8">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/">Home</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <form role="search" onSubmit={handleSubmit} className="relative mb-6 max-w-xl md:hidden">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search laptops, GPUs, monitors..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="pl-9"
        />
      </form>

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-foreground sm:text-2xl">
            {query ? (
              <>
                Results for <span className="text-primary">&ldquo;{query}&rdquo;</span>
              </>
            ) : (
              "Search"
            )}
          </h1>
        </div>
        {listing.meta && !listing.loading && (
          <span className="text-sm text-muted-foreground">{listing.meta.total} results</span>
        )}
      </div>

      {!query ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
          <SearchX className="size-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm font-medium text-foreground">Type something to search</p>
          <p className="text-sm text-muted-foreground">Try a product name, brand, or category.</p>
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          <aside className="hidden lg:block">
            <ProductFilters
              brands={listing.brands}
              selectedBrands={listing.selectedBrands}
              onBrandsChange={listing.setSelectedBrands}
              priceRange={listing.priceRange}
              priceMin={listing.priceMin}
              priceMax={listing.priceMax}
              onPriceChange={listing.setPriceRange}
              onReset={listing.resetFilters}
              activeFilterCount={listing.activeFilterCount}
            />
          </aside>

          <div className="flex min-w-0 flex-col gap-5">
            <div className="flex items-center justify-between gap-3">
              <Button variant="outline" size="sm" className="lg:hidden" onClick={() => setFiltersOpen(true)}>
                <SlidersHorizontal className="size-3.5" />
                Filters
                {listing.activeFilterCount > 0 && (
                  <Badge className="ml-1 size-4 border-none p-0 text-[10px]">{listing.activeFilterCount}</Badge>
                )}
              </Button>
              <div className="ml-auto">
                <ProductSortSelect value={listing.sort} onChange={listing.setSort} />
              </div>
            </div>

            {listing.loading ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : listing.products.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
                <SearchX className="size-8 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">No results for &ldquo;{query}&rdquo;</p>
                <p className="text-sm text-muted-foreground">Try a different spelling or a more general term.</p>
                {listing.activeFilterCount > 0 && (
                  <Button variant="outline" size="sm" className="mt-2" onClick={listing.resetFilters}>
                    Clear filters
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                {listing.products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {listing.meta && (
              <div className="mt-4">
                <ProductPaginationBar page={listing.page} lastPage={listing.meta.last_page} onPageChange={listing.setPage} />
              </div>
            )}
          </div>
        </div>
      )}

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="left" className="overflow-y-auto p-0">
          <SheetHeader className="border-b border-border">
            <SheetTitle>Filters</SheetTitle>
          </SheetHeader>
          <div className="p-4">
            <ProductFilters
              brands={listing.brands}
              selectedBrands={listing.selectedBrands}
              onBrandsChange={listing.setSelectedBrands}
              priceRange={listing.priceRange}
              priceMin={listing.priceMin}
              priceMax={listing.priceMax}
              onPriceChange={listing.setPriceRange}
              onReset={listing.resetFilters}
              activeFilterCount={listing.activeFilterCount}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
