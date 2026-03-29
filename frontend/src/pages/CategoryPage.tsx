import { useState, useEffect } from 'react';
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom';
import { ProductCard } from '../components/product/ProductCard';
import { useApiCache } from '../store/apiCache';
import {
  SlidersHorizontal, ChevronRight, X,
  PackageSearch, ChevronDown, ChevronLeft, Search
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "../components/ui/sheet";
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import { ProductCardSkeleton } from '../components/ui/skeletons/ProductCardSkeleton';
import { Breadcrumbs } from '../components/layout/Breadcrumbs';

export default function CategoryPage() {
  const params = useParams();
  const location = useLocation();
  const path = params["*"] || '';
  const slug = path.split('/').filter(Boolean).pop();
  const searchQuery = new URLSearchParams(location.search).get('search') || '';
  const navigate = useNavigate();

  const [categoriesTree, setCategoriesTree] = useState<any[]>([]);
  const [currentCategory, setCurrentCategory] = useState<any>(null);
  const [categoryPath, setCategoryPath] = useState<any[]>([]);
  const [swiperItems, setSwiperItems] = useState<any[]>([]);

  const [products, setProducts] = useState<any[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filters State
  const [showFilters, setShowFilters] = useState(false);
  const [showBrandSheet, setShowBrandSheet] = useState(false);
  const [showPriceSheet, setShowPriceSheet] = useState(false);
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedPrice, setSelectedPrice] = useState<[number, number]>([0, 10000]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [filterInStock, setFilterInStock] = useState(false);
  const [filterOnSale, setFilterOnSale] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const fetchWithCache = useApiCache((state) => state.fetchWithCache);

  // Fetch Full Categories Tree
  useEffect(() => {
    fetchWithCache('/categories')
       .then(({ data }) => setCategoriesTree(data))
       .catch(console.error);
  }, []);

  // Determine current category, path & swiper items based on slug
  useEffect(() => {
    if (!slug || !categoriesTree.length) return;

    let found: any = null;
    let pathArr: any[] = [];
    let itemsArr: any[] = [];

    const searchTree = (nodes: any[], currentPath: any[] = []): boolean => {
      for (const node of nodes) {
        const newPath = [...currentPath, node];
        if (node.slug === slug) {
          found = node;
          pathArr = newPath;
          if (node.children && node.children.length > 0) {
            itemsArr = node.children;
          } else if (currentPath.length > 0) {
            const parent = currentPath[currentPath.length - 1];
            itemsArr = parent.children || [];
          }
          return true;
        }
        if (node.children && node.children.length > 0) {
          if (searchTree(node.children, newPath)) return true;
        }
      }
      return false;
    };

    searchTree(categoriesTree);

    setCurrentCategory(found);
    setCategoryPath(pathArr);
    setSwiperItems(itemsArr);
    setCurrentPage(1); // reset page when category changes
  }, [slug, categoriesTree]);

  // Fetch brands & price range for this category
  useEffect(() => {
    if (!slug) return;
    fetchWithCache(`/products/brands?category=${slug}`)
       .then(({ data }) => setAvailableBrands(data))
       .catch(console.error);

    fetchWithCache(`/products/price-range?category=${slug}`)
       .then(({ data }) => {
         setPriceRange(data);
         if (isFirstLoad) {
           setSelectedPrice([data.min, data.max]);
           setIsFirstLoad(false);
         }
       })
       .catch(console.error);
  }, [slug]);

  const toggleBrand = (brandSlug: string) => {
    setCurrentPage(1);
    setSelectedBrands(prev =>
      prev.includes(brandSlug) ? prev.filter(s => s !== brandSlug) : [...prev, brandSlug]
    );
  };

  const handlePriceChange = (values: number[]) => {
    setSelectedPrice([values[0], values[1]]);
    setCurrentPage(1);
  };

  // Fetch Products
  useEffect(() => {
    const targetSlug = slug || '';

    const timer = setTimeout(() => {
      setIsLoadingProducts(true);
      let url = `/products?page=${currentPage}&per_page=24`;

      if (targetSlug) url += `&category=${targetSlug}`;
      if (searchQuery) url += `&search=${encodeURIComponent(searchQuery)}`;

      if (selectedBrands.length > 0) url += `&brand=${selectedBrands.join(',')}`;
      if (selectedPrice[0] > priceRange.min) url += `&price_min=${selectedPrice[0]}`;
      if (selectedPrice[1] < priceRange.max) url += `&price_max=${selectedPrice[1]}`;

      fetchWithCache(url)
         .then(({ data }) => {
           setProducts(data.data);
           setCurrentPage(data.current_page);
           setLastPage(data.last_page);
           setTotalProducts(data.total || data.data.length);
           window.scrollTo({ top: 0, behavior: 'smooth' });
         })
         .catch(console.error)
         .finally(() => setIsLoadingProducts(false));
    }, 400);

    return () => clearTimeout(timer);
  }, [slug, currentPage, selectedBrands, selectedPrice, searchQuery]);

  const resetFilters = () => {
    setSelectedBrands([]);
    setSelectedPrice([priceRange.min, priceRange.max]);
    setCurrentPage(1);
  };

  // ── Loading / Not Found states ──
  if (!currentCategory && !searchQuery) {
    if (categoriesTree.length === 0) {
      return (
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-3 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
            <p className="text-text-muted text-xs font-medium">Loading collection…</p>
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center px-6 text-center">
        <div className="w-16 h-16 bg-bg-surface rounded-full flex items-center justify-center mb-5 border border-border-subtle">
          <X className="w-8 h-8 text-text-muted/20" />
        </div>
        <h1 className="text-xl font-black text-text-primary mb-2">Category Not Found</h1>
        <p className="text-sm text-text-muted mb-6 max-w-xs">The category you're looking for might have been moved or renamed.</p>
        <Button asChild variant="outline" className="rounded-xl px-6 h-11"><Link to="/">Return Home</Link></Button>
      </div>
    );
  }

  const hasActiveFilters = selectedBrands.length > 0 || selectedPrice[0] > priceRange.min || selectedPrice[1] < priceRange.max;

  // ── Filter Panel Content ──
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => {
    const [localQuery, setLocalQuery] = useState(searchQuery);

    const handleSearchSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      // If we are searching, we usually search across the entire catalog and let the backend filter
      // Navigate to the current category or all products with the new query
      if (localQuery.trim()) {
        navigate(`/category${slug ? `/${slug}` : ''}?search=${encodeURIComponent(localQuery.trim())}`);
      } else {
        navigate(`/category${slug ? `/${slug}` : ''}`);
      }
      if (isMobile) setShowFilters(false);
    };

    return (
      <div className="flex flex-col h-[calc(100vh-200px)]">
        <Accordion type="multiple" defaultValue={["search", "subcategory", "manufacturer", "price"]} className="w-full flex-1 overflow-y-auto no-scrollbar pr-2">
          
          {/* Search Accordion Item */}
          <AccordionItem value="search" className="border-b border-border-subtle">
            <AccordionTrigger className="text-sm font-bold text-text-primary hover:no-underline py-4">Search</AccordionTrigger>
            <AccordionContent className="pb-4">
              <form onSubmit={handleSearchSubmit} className="relative">
                <Input 
                  placeholder="" 
                  className="pl-3 pr-10 bg-bg-primary h-10 border-border-subtle rounded-md text-sm shadow-none focus-visible:ring-1 focus-visible:ring-emerald-500" 
                  value={localQuery} 
                  onChange={(e) => setLocalQuery(e.target.value)} 
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-emerald-500">
                  <Search className="w-4 h-4" />
                </button>
              </form>
            </AccordionContent>
          </AccordionItem>
          
          {/* SubCategory Accordion Item */}
          {swiperItems.length > 0 && (
            <AccordionItem value="subcategory" className="border-b border-border-subtle">
              <AccordionTrigger className="text-sm font-bold text-text-primary hover:no-underline py-4">SubCategory</AccordionTrigger>
              <AccordionContent className="pb-4">
                <div className="space-y-2.5 pt-1">
                  {swiperItems.map(item => {
                    const isActive = item.slug === slug;
                    return (
                      <div key={item.id} className="flex items-center gap-3 group cursor-pointer" onClick={(e) => { e.preventDefault(); navigate(`/category/${item.slug}`); if(isMobile) setShowFilters(false); }}>
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isActive ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border-subtle bg-bg-surface group-hover:border-emerald-500/50'}`}>
                          {isActive && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <span className={`text-sm flex-1 flex items-center justify-between transition-colors ${isActive ? 'text-emerald-500 font-bold' : 'text-text-muted group-hover:text-text-primary'}`}>
                          {item.name}
                          <span className="text-xs opacity-50">({item.total_products_count || 0})</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Manufacturer Accordion Item */}
          <AccordionItem value="manufacturer" className="border-b border-border-subtle">
            <AccordionTrigger className="text-sm font-bold text-text-primary hover:no-underline py-4">Manufacturer</AccordionTrigger>
            <AccordionContent className="pb-4">
              {availableBrands.length > 0 ? (
                <div className="space-y-2.5 pt-1 max-h-60 overflow-y-auto no-scrollbar">
                  {availableBrands.map((brand: any) => {
                    const isChecked = selectedBrands.includes(brand.slug);
                    return (
                      <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-border-subtle bg-bg-surface group-hover:border-emerald-500/50'}`}>
                          {isChecked && <div className="w-2 h-2 bg-white rounded-sm" />}
                        </div>
                        <input type="checkbox" checked={isChecked} onChange={() => toggleBrand(brand.slug)} className="hidden" />
                        <span className={`text-sm flex-1 flex items-center justify-between transition-colors ${isChecked ? 'text-emerald-500 font-bold' : 'text-text-muted group-hover:text-text-primary'}`}>
                          {brand.name}
                          <span className="text-xs opacity-50">({brand.products_count || 0})</span>
                        </span>
                      </label>
                    );
                  })}
                </div>
              ) : (
                <p className="text-[11px] text-text-muted opacity-50">No brands found</p>
              )}
            </AccordionContent>
          </AccordionItem>

          {/* Price Accordion Item */}
          <AccordionItem value="price" className="border-b-0">
            <AccordionTrigger className="text-sm font-bold text-text-primary hover:no-underline py-4">Price</AccordionTrigger>
            <AccordionContent className="pb-4">
              <div className="flex items-center gap-2 mb-6 mt-1">
                <div className="flex-1 bg-bg-primary border border-border-subtle rounded flex items-center px-2 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500 transition-shadow">
                   <span className="text-text-muted text-[10px] mr-1">$</span>
                   <input type="number" value={Math.round(selectedPrice[0])} className="w-full bg-transparent text-xs font-bold outline-none text-text-primary h-6" onChange={(e) => handlePriceChange([Number(e.target.value), selectedPrice[1]])}/>
                </div>
                <span className="text-text-muted text-xs">to</span>
                <div className="flex-1 bg-bg-primary border border-border-subtle rounded flex items-center px-2 py-1.5 focus-within:ring-1 focus-within:ring-emerald-500 transition-shadow">
                   <span className="text-text-muted text-[10px] mr-1">$</span>
                   <input type="number" value={Math.round(selectedPrice[1])} className="w-full bg-transparent text-xs font-bold outline-none text-text-primary h-6" onChange={(e) => handlePriceChange([selectedPrice[0], Number(e.target.value)])}/>
                </div>
              </div>
              <div className="px-1.5">
                <Slider
                  min={priceRange.min} max={priceRange.max} step={1}
                  value={[selectedPrice[0], selectedPrice[1]]}
                  onValueChange={handlePriceChange}
                  className="mb-8"
                />
              </div>
            </AccordionContent>
          </AccordionItem>

        </Accordion>
        
        {/* Actions - Reset All Button */}
        <div className="pt-4 border-t border-border-subtle/50 mt-auto bg-bg-primary">
          <Button 
            className="w-full bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-bold text-xs h-11 tracking-wider rounded-md" 
            onClick={() => { resetFilters(); setLocalQuery(''); if (isMobile) setShowFilters(false); }}
          >
            RESET ALL
          </Button>
        </div>
      </div>
    );
  };

  // ── Sort Options ──
  const sortOptions = [
    { value: 'default', label: 'Default' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
  ];

  // ── Render ──
  return (
    <div className="min-h-screen bg-bg-primary pb-20 lg:pb-10 relative">

      {/* ─── Mobile: Subcategory Chips + Filter Chips + Info ─── */}
      <div className="lg:hidden sticky top-[53px] z-40 bg-bg-primary">
        {/* Subcategory horizontal scroller */}
        {swiperItems.length > 0 && (
          <div className="border-b border-border-subtle/50 px-3 py-2.5 relative">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth">
              {swiperItems.map(item => {
                const isActive = item.slug === slug;
                return (
                  <Link key={item.id} to={`/category/${item.slug}`}
                    className={`px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/20'
                        : 'bg-bg-surface border border-border-subtle text-text-primary'
                    }`}>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Mobile Filter Chips Row */}
        <div className="border-b border-border-subtle/30 px-3 py-2">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => { resetFilters(); setFilterInStock(false); setFilterOnSale(false); }}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                !hasActiveFilters && !filterInStock && !filterOnSale
                  ? 'bg-emerald-500 text-white'
                  : 'bg-bg-surface border border-border-subtle text-text-muted'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowBrandSheet(true)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedBrands.length > 0
                  ? 'bg-emerald-500 text-white'
                  : 'bg-bg-surface border border-border-subtle text-text-muted'
              }`}
            >
              Brand {selectedBrands.length > 0 && `(${selectedBrands.length})`} <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => setShowPriceSheet(true)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex items-center gap-1 ${
                selectedPrice[0] > priceRange.min || selectedPrice[1] < priceRange.max
                  ? 'bg-emerald-500 text-white'
                  : 'bg-bg-surface border border-border-subtle text-text-muted'
              }`}
            >
              Price <ChevronDown className="h-3 w-3" />
            </button>
            <button
              onClick={() => setFilterInStock(!filterInStock)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                filterInStock
                  ? 'bg-emerald-500 text-white'
                  : 'bg-bg-surface border border-border-subtle text-text-muted'
              }`}
            >
              In Stock
            </button>
            <button
              onClick={() => setFilterOnSale(!filterOnSale)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                filterOnSale
                  ? 'bg-emerald-500 text-white'
                  : 'bg-bg-surface border border-border-subtle text-text-muted'
              }`}
            >
              On Sale
            </button>
            <button
              onClick={() => setShowFilters(true)}
              className="px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap bg-bg-surface border border-border-subtle text-text-muted flex items-center gap-1"
            >
              <SlidersHorizontal className="h-3 w-3" /> More
            </button>
          </div>
        </div>

        {/* Result count + sort */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-border-subtle/30">
          <span className="text-[11px] text-text-muted">
            <span className="font-bold text-text-primary">{totalProducts}</span> products
          </span>
          <div className="relative">
            <button onClick={() => setShowSortMenu(!showSortMenu)}
              className="text-[11px] font-bold text-emerald-500 flex items-center gap-1">
              Sort <ChevronDown className="h-3 w-3" />
            </button>
            {showSortMenu && (
              <div className="absolute right-0 top-full mt-1 bg-bg-surface border border-border-subtle rounded-xl shadow-lg p-1.5 z-50 w-44">
                {sortOptions.map(opt => (
                  <button key={opt.value}
                    onClick={() => { setSortBy(opt.value); setShowSortMenu(false); }}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                      sortBy === opt.value ? 'text-emerald-500 font-bold bg-emerald-500/10' : 'text-text-muted hover:text-text-primary hover:bg-bg-primary'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Desktop: Breadcrumbs ─── */}
      <div className="hidden lg:block bg-bg-primary border-b border-border-subtle/50">
        <div className="max-w-[1440px] mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              items={[
                { label: 'Home', href: '/' },
                ...categoryPath.map((cat: any, idx: number) => ({
                  label: cat.name,
                  href: idx < categoryPath.length - 1 || searchQuery ? `/category/${cat.slug}` : undefined,
                })),
                ...(searchQuery ? [{ label: `Search: "${searchQuery}"` }] : []),
              ]}
            />
            <span className="text-xs font-bold text-text-muted"><span className="text-text-primary">{totalProducts}</span> products</span>
          </div>
        </div>
      </div>

      {/* ─── Main Body ─── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Desktop Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 pr-3">
              <FilterContent />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-h-[400px]">

            {/* Active chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-4 pb-3 border-b border-border-subtle/50">
                {selectedBrands.map(brandSlug => {
                  const brand = availableBrands.find(b => b.slug === brandSlug);
                  return (
                    <span key={brandSlug}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-subtle bg-bg-surface text-[10px] text-text-muted cursor-pointer hover:text-text-primary transition-colors"
                      onClick={() => toggleBrand(brandSlug)}>
                      {brand?.name} <X className="h-3 w-3 hover:text-red-500" />
                    </span>
                  );
                })}
                {(selectedPrice[0] > priceRange.min || selectedPrice[1] < priceRange.max) && (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border-subtle bg-bg-surface text-[10px] text-text-muted">
                    AED {selectedPrice[0]} - {selectedPrice[1]}
                    <X className="h-3 w-3 cursor-pointer hover:text-red-500" onClick={() => setSelectedPrice([priceRange.min, priceRange.max])} />
                  </span>
                )}
                <button onClick={resetFilters} className="text-[10px] text-emerald-500 font-bold ml-1">Clear All</button>
              </div>
            )}

            {/* Desktop section title */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <h2 className="text-lg font-black text-text-primary uppercase tracking-tight flex items-center gap-2">
                {currentCategory?.name || (searchQuery ? `Search Results for "${searchQuery}"` : 'Products')}
                <span className="h-1 w-5 bg-emerald-500 rounded-full" />
              </h2>
            </div>

            {/* Products / Skeleton / Empty */}
            {isLoadingProducts ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-5">
                {products.map(product => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    slug={product.slug}
                    price={product.price}
                    sale_price={product.sale_price}
                    image={product.primary_image_url}
                    badge={product.badge}
                    badgeColor={product.badge_color}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center px-6">
                <PackageSearch className="h-10 w-10 text-text-muted/15 mb-4" />
                <h3 className="text-base font-bold text-text-primary mb-1">No products found</h3>
                <p className="text-xs text-text-muted max-w-xs mb-6">We couldn't find items matching your filters.</p>
                <Button variant="outline" className="rounded-xl h-10 px-5 text-xs font-bold" onClick={resetFilters}>Clear Filters</Button>
              </div>
            )}

            {/* Pagination */}
            {!isLoadingProducts && lastPage > 1 && (
              <div className="mt-10 flex justify-center">
                <div className="flex items-center gap-1 bg-bg-surface p-1 rounded-xl border border-border-subtle shadow-sm">
                  <Button variant="ghost" size="icon" disabled={currentPage === 1} className="rounded-lg h-9 w-9 disabled:opacity-20"
                    onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); }}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  {/* Page numbers */}
                  {Array.from({ length: lastPage }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 1)
                    .map((p, idx, arr) => {
                      const prev = arr[idx - 1];
                      const showEllipsis = prev && p - prev > 1;
                      return (
                        <span key={p} className="contents">
                          {showEllipsis && <span className="text-text-muted/30 text-xs px-1">…</span>}
                          <button
                            onClick={() => setCurrentPage(p)}
                            className={`h-9 w-9 rounded-lg text-xs font-bold transition-all ${
                              p === currentPage ? 'bg-emerald-500 text-white' : 'text-text-muted hover:text-text-primary hover:bg-bg-primary'
                            }`}>
                            {p}
                          </button>
                        </span>
                      );
                    })}

                  <Button variant="ghost" size="icon" disabled={currentPage === lastPage} className="rounded-lg h-9 w-9 text-emerald-500 disabled:opacity-20"
                    onClick={() => { setCurrentPage(p => Math.min(lastPage, p + 1)); }}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Mobile Filter Sheet — Full filters (bottom) ─── */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl border-t p-0 bg-bg-surface overflow-hidden z-[100]">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border-subtle">
            <SheetTitle className="text-sm font-black flex items-center gap-2 tracking-tight">
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
              All Filters
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto h-[calc(85vh-64px)] no-scrollbar">
            <FilterContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Mobile Brand Sheet (bottom) ─── */}
      <Sheet open={showBrandSheet} onOpenChange={setShowBrandSheet}>
        <SheetContent side="bottom" className="h-[60vh] rounded-t-2xl border-t p-0 bg-bg-surface overflow-hidden z-[100]">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border-subtle">
            <SheetTitle className="text-sm font-black tracking-tight">Filter by Brand</SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto h-[calc(60vh-120px)] no-scrollbar">
            {availableBrands.length > 0 ? (
              <div className="space-y-0.5">
                {availableBrands.map((brand: any) => {
                  const isChecked = selectedBrands.includes(brand.slug);
                  return (
                    <label key={brand.id} className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer hover:bg-bg-primary transition-colors">
                      <input type="checkbox" checked={isChecked} onChange={() => toggleBrand(brand.slug)}
                        className="w-4 h-4 rounded border-border-subtle text-emerald-500 focus:ring-emerald-500/20" />
                      <span className={`text-sm transition-colors ${isChecked ? 'text-emerald-500 font-bold' : 'text-text-primary'}`}>
                        {brand.name}
                      </span>
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-text-muted">No brands found</p>
            )}
          </div>
          <div className="px-5 py-3 border-t border-border-subtle">
            <Button size="sm" className="w-full text-xs font-bold rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowBrandSheet(false)}>Apply</Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* ─── Mobile Price Sheet (bottom) ─── */}
      <Sheet open={showPriceSheet} onOpenChange={setShowPriceSheet}>
        <SheetContent side="bottom" className="h-[50vh] rounded-t-2xl border-t p-0 bg-bg-surface overflow-hidden z-[100]">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border-subtle">
            <SheetTitle className="text-sm font-black tracking-tight">Filter by Price</SheetTitle>
          </SheetHeader>
          <div className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-text-muted">Price Range</span>
              <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                AED {Math.round(selectedPrice[0])} - {Math.round(selectedPrice[1])}
              </span>
            </div>
            <div className="px-1">
              <Slider
                min={priceRange.min} max={priceRange.max} step={1}
                value={[selectedPrice[0], selectedPrice[1]]}
                onValueChange={handlePriceChange}
                className="mb-6"
              />
              <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-bg-primary border border-border-subtle rounded-xl p-3">
                  <span className="text-[9px] text-text-muted block uppercase font-bold tracking-widest opacity-50">From</span>
                  <span className="text-sm font-bold text-text-primary">AED {Math.round(selectedPrice[0])}</span>
                </div>
                <div className="bg-bg-primary border border-border-subtle rounded-xl p-3">
                  <span className="text-[9px] text-text-muted block uppercase font-bold tracking-widest opacity-50">To</span>
                  <span className="text-sm font-bold text-text-primary">AED {Math.round(selectedPrice[1])}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="px-5 py-3 border-t border-border-subtle">
            <Button size="sm" className="w-full text-xs font-bold rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white"
              onClick={() => setShowPriceSheet(false)}>Apply</Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
