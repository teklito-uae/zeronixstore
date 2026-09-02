import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetFooter, SheetTitle } from "@/components/ui/sheet";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ProductFilters } from "@/components/product/ProductFilters";
import { ProductSortSelect } from "@/components/product/ProductSortSelect";
import { ProductPaginationBar } from "@/components/product/ProductPaginationBar";
import { fetchCategories } from "@/features/products/api";
import { useProductListing } from "@/features/products/useProductListing";
import type { Category as CategoryType } from "@/features/products/types";

function findCategory(tree: CategoryType[], slug: string): CategoryType | null {
  for (const cat of tree) {
    if (cat.slug === slug) return cat;
    if (cat.children?.length) {
      const found = findCategory(cat.children, slug);
      if (found) return found;
    }
  }
  return null;
}

export default function Category() {
  const { slug = "" } = useParams<{ slug: string }>();
  const [category, setCategory] = useState<CategoryType | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const gridTopRef = useRef<HTMLDivElement>(null);
  const isFirstPageRender = useRef(true);

  const listing = useProductListing({ category: slug, perPage: 24 });

  // Scroll the grid back into view on page change so paging doesn't leave the
  // user staring at the same scroll position with all-new products below the fold.
  useEffect(() => {
    if (isFirstPageRender.current) {
      isFirstPageRender.current = false;
      return;
    }
    gridTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [listing.page]);

  useEffect(() => {
    let cancelled = false;
    fetchCategories().then((tree) => {
      if (!cancelled) setCategory(findCategory(tree, slug));
    });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const title = category?.name ?? slug.replace(/-/g, " ");

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
            <BreadcrumbPage className="capitalize">{title}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold capitalize text-foreground sm:text-2xl">{title}</h1>
          {category?.description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{category.description}</p>}
        </div>
        {listing.meta && <span className="text-sm text-muted-foreground">{listing.meta.total} products</span>}
      </div>

      {category?.children && category.children.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link key={child.slug} to={`/category/${child.slug}`}>
              <Badge variant="outline" className="cursor-pointer px-3 py-1 hover:bg-muted">
                {child.name}
              </Badge>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
        <aside className="hidden lg:block lg:sticky lg:top-20 lg:h-fit lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pb-4">
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

        <div ref={gridTopRef} className="flex min-w-0 scroll-mt-20 flex-col gap-5">
          <div className="flex items-center justify-end gap-3">
            <ProductSortSelect value={listing.sort} onChange={listing.setSort} />
          </div>

          {listing.loading ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : listing.products.length === 0 ? (
            <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border py-16 text-center">
              <p className="text-sm font-medium text-foreground">No products match these filters</p>
              <p className="text-sm text-muted-foreground">Try clearing filters or check back soon.</p>
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

      {/* Floating filter trigger — mobile/tablet only, sits above the tab bar. */}
      <div className="fixed inset-x-0 bottom-[88px] z-30 flex justify-center px-4 lg:hidden">
        <Button
          size="lg"
          className="gap-2 rounded-full px-5 shadow-lg shadow-black/15"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="size-4" />
          Filters
          {listing.activeFilterCount > 0 && (
            <Badge className="ml-0.5 size-5 border-none bg-primary-foreground/20 p-0 text-[11px] text-primary-foreground">
              {listing.activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
        <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 rounded-t-2xl p-0">
          <SheetTitle className="sr-only">Filters</SheetTitle>
          <div className="mx-auto mt-2.5 h-1.5 w-10 shrink-0 rounded-full bg-border" />
          <div className="min-h-0 flex-1 overflow-y-auto p-4 pt-3">
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
          <SheetFooter className="shrink-0 border-t border-border bg-background p-4">
            <Button className="w-full" onClick={() => setFiltersOpen(false)}>
              Show {listing.meta?.total ?? ""} results
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
