import { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import { api } from '../lib/api';
import { ProductCard } from '../components/product/ProductCard';
import {
  Zap, SlidersHorizontal, ChevronRight, X,
  Laptop, Monitor, Cpu, MousePointer2, Printer, HardDrive,
  Gamepad2, Headphones, Keyboard, Speaker, PackageSearch,
  ChevronDown, ChevronLeft
} from 'lucide-react';
import { Slider } from '../components/ui/slider';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from "../components/ui/sheet";
import { Button } from '../components/ui/button';
import { ProductCardSkeleton } from '../components/ui/skeletons/ProductCardSkeleton';

const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('laptop')) return Laptop;
  if (n.includes('monitor') || n.includes('screen')) return Monitor;
  if (n.includes('processor') || n.includes('cpu') || n.includes('component')) return Cpu;
  if (n.includes('printer') || n.includes('scanner') || n.includes('ink')) return Printer;
  if (n.includes('storage') || n.includes('drive') || n.includes('ssd')) return HardDrive;
  if (n.includes('gaming') || n.includes('console')) return Gamepad2;
  if (n.includes('audio') || n.includes('headphone')) return Headphones;
  if (n.includes('keyboard')) return Keyboard;
  if (n.includes('mouse')) return MousePointer2;
  if (n.includes('speaker')) return Speaker;
  return Zap;
};

export default function CategoryPage() {
  const params = useParams();
  const location = useLocation();
  const path = params["*"] || '';
  const slug = path.split('/').filter(Boolean).pop();
  const searchQuery = new URLSearchParams(location.search).get('search') || '';

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
  const [availableBrands, setAvailableBrands] = useState<any[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 10000 });
  const [selectedPrice, setSelectedPrice] = useState<[number, number]>([0, 10000]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [showSortMenu, setShowSortMenu] = useState(false);

  // Fetch Full Categories Tree
  useEffect(() => {
    api.get('/categories')
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
    api.get(`/products/brands?category=${slug}`)
       .then(({ data }) => setAvailableBrands(data))
       .catch(console.error);

    api.get(`/products/price-range?category=${slug}`)
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

      api.get(url)
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
  const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="space-y-8">
      {/* Category Tree */}
      <div>
        <h4 className="font-black text-[10px] text-text-muted uppercase tracking-[0.2em] mb-4 opacity-50">Explore</h4>
        <div className="space-y-3">
          {categoryPath[0] && (
            <div className="space-y-1.5">
              <Link to={`/category/${categoryPath[0].slug}`}
                className={`text-xs font-bold flex items-center justify-between transition-colors uppercase tracking-wider ${categoryPath[0].slug === slug ? 'text-emerald-500' : 'text-text-primary hover:text-emerald-500'}`}>
                <span>{categoryPath[0].name}</span>
                <span className="text-[10px] opacity-30">({categoryPath[0].total_products_count || 0})</span>
              </Link>
              <div className="pl-3 border-l-2 border-border-subtle/40 space-y-1.5 pt-0.5">
                {(categoryPath[0].children || []).map((child: any) => {
                  const isActive = child.slug === slug || categoryPath.some(p => p.id === child.id);
                  return (
                    <div key={child.id} className="space-y-1.5">
                      <Link to={`/category/${child.slug}`}
                        className={`text-xs flex items-center justify-between transition-colors ${isActive ? 'font-bold text-emerald-500' : 'text-text-muted hover:text-text-primary'}`}>
                        <span>{child.name}</span>
                        <span className="text-[10px] opacity-30">({child.total_products_count || 0})</span>
                      </Link>
                      {isActive && child.children?.length > 0 && (
                        <div className="pl-3 space-y-1.5 border-l border-border-subtle/30">
                          {child.children.map((sub: any) => (
                            <Link key={sub.id} to={`/category/${sub.slug}`}
                              className={`text-[11px] flex items-center justify-between transition-colors ${sub.slug === slug ? 'font-bold text-emerald-500' : 'text-text-muted hover:text-text-primary'}`}>
                              <span>{sub.name}</span>
                              <span className="text-[10px] opacity-30">({sub.total_products_count || 0})</span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-black text-[10px] text-text-muted uppercase tracking-[0.2em] opacity-50">Price Range</h4>
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
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-2.5">
              <span className="text-[9px] text-text-muted block uppercase font-bold tracking-widest opacity-50">From</span>
              <span className="text-xs font-bold text-text-primary">AED {Math.round(selectedPrice[0])}</span>
            </div>
            <div className="bg-bg-surface border border-border-subtle rounded-xl p-2.5">
              <span className="text-[9px] text-text-muted block uppercase font-bold tracking-widest opacity-50">To</span>
              <span className="text-xs font-bold text-text-primary">AED {Math.round(selectedPrice[1])}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brands */}
      <div>
        <h4 className="font-black text-[10px] text-text-muted uppercase tracking-[0.2em] mb-4 opacity-50">Brands</h4>
        {availableBrands.length > 0 ? (
          <div className="space-y-0.5 max-h-60 overflow-y-auto no-scrollbar">
            {availableBrands.map((brand: any) => {
              const isChecked = selectedBrands.includes(brand.slug);
              return (
                <label key={brand.id} className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-bg-surface transition-colors">
                  <input type="checkbox" checked={isChecked} onChange={() => toggleBrand(brand.slug)}
                    className="w-3.5 h-3.5 rounded border-border-subtle text-emerald-500 focus:ring-emerald-500/20" />
                  <span className={`text-xs transition-colors ${isChecked ? 'text-emerald-500 font-bold' : 'text-text-primary'}`}>
                    {brand.name}
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-text-muted opacity-50">No brands found</p>
        )}
      </div>

      {/* Actions */}
      <div className="pt-5 border-t border-border-subtle/50 flex flex-col gap-2">
        <Button variant="ghost" size="sm" className="w-full text-xs font-bold rounded-xl h-10 text-text-muted" onClick={resetFilters}>Reset All</Button>
        {isMobile && (
          <Button size="sm" className="w-full text-xs font-bold rounded-xl h-11 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
            onClick={() => setShowFilters(false)}>Show Results</Button>
        )}
      </div>
    </div>
  );

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

      {/* ─── Mobile: Subcategory Chips + Info ─── */}
      <div className="lg:hidden sticky top-0 z-40 bg-bg-primary">
        {/* Subcategory horizontal scroller (no gap from navbar) */}
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

      {/* ─── Desktop: Breadcrumbs + Subcategory Cards ─── */}
      <div className="hidden lg:block bg-bg-primary border-b border-border-subtle/50">
        <div className="max-w-[1440px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-1.5">
              <Link to="/" className="text-[11px] font-bold text-text-muted hover:text-emerald-500 transition-colors uppercase tracking-widest">Home</Link>
              <ChevronRight className="h-3 w-3 text-text-muted/40" />
              {categoryPath.map((cat, idx) => {
                const isLast = idx === categoryPath.length - 1 && !searchQuery;
                return (
                  <div key={cat.id} className="flex items-center gap-1.5">
                    <Link to={`/category/${cat.slug}`}
                      className={`text-[11px] font-bold tracking-widest transition-colors uppercase ${isLast ? 'text-text-primary' : 'text-text-muted hover:text-emerald-500'}`}>
                      {cat.name}
                    </Link>
                    {(!isLast || searchQuery) && <ChevronRight className="h-3 w-3 text-text-muted/50" />}
                  </div>
                );
              })}
              {searchQuery && (
                <span className="text-[11px] font-bold tracking-widest transition-colors uppercase text-text-primary">
                  Search: "{searchQuery}"
                </span>
              )}
            </nav>
            <span className="text-xs font-bold text-text-muted"><span className="text-text-primary">{totalProducts}</span> products</span>
          </div>
        </div>

        {/* Desktop Subcategory Cards */}
        {swiperItems.length > 0 && (
          <div className="max-w-[1440px] mx-auto px-6 pb-5">
            <Swiper spaceBetween={10} slidesPerView="auto" className="!py-1">
              {swiperItems.map(item => {
                const isActive = item.slug === slug;
                const Icon = getCategoryIcon(item.name);
                return (
                  <SwiperSlide key={item.id} className="!w-auto">
                    <Link to={`/category/${item.slug}`}
                      className={`flex flex-col items-center gap-2.5 p-3 rounded-xl border transition-all w-24 ${
                        isActive
                          ? 'bg-emerald-500/5 border-emerald-500 shadow-sm'
                          : 'bg-bg-surface border-border-subtle hover:border-emerald-500/40'
                      }`}>
                      <div className={`aspect-square w-full rounded-lg flex items-center justify-center transition-all ${
                        isActive ? 'bg-emerald-500 text-white shadow-md' : 'bg-bg-primary text-text-muted'
                      }`}>
                        {item.image_url
                          ? <img src={item.image_url} alt={item.name} className={`h-full w-full object-contain p-2 ${isActive ? 'invert' : 'opacity-80'}`} />
                          : <Icon className="h-5 w-5 stroke-[1.5px]" />}
                      </div>
                      <span className={`font-bold text-[9px] text-center line-clamp-2 uppercase tracking-wider ${isActive ? 'text-emerald-500' : 'text-text-primary'}`}>
                        {item.name}
                      </span>
                    </Link>
                  </SwiperSlide>
                );
              })}
            </Swiper>
          </div>
        )}
      </div>

      {/* ─── Main Body ─── */}
      <div className="max-w-[1440px] mx-auto px-4 lg:px-6 pt-4 lg:pt-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">

          {/* Desktop Filters Sidebar */}
          <div className="lg:w-64 flex-shrink-0 hidden lg:block">
            <div className="sticky top-24 pr-3">
              <div className="flex items-center gap-2 pb-4 mb-6 border-b border-border-subtle/50">
                <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
                <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-text-primary">Filters</h3>
              </div>
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

      {/* ─── Mobile Filter Sheet (no floating button — triggered from header filter chip) ─── */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="left" className="w-[85vw] sm:w-[380px] h-full border-r-0 p-0 bg-bg-surface overflow-hidden z-[100]">
          <SheetHeader className="px-5 pt-5 pb-3 border-b border-border-subtle">
            <SheetTitle className="text-sm font-black flex items-center gap-2 tracking-tight">
              <SlidersHorizontal className="h-3.5 w-3.5 text-emerald-500" />
              Filters
            </SheetTitle>
          </SheetHeader>
          <div className="p-5 overflow-y-auto h-[calc(100vh-64px)] no-scrollbar">
            <FilterContent isMobile={true} />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
