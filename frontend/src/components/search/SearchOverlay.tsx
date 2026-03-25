import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, ArrowLeft, PackageSearch, Clock, ArrowRight } from 'lucide-react';
import { api } from '../../lib/api';
import { SearchResultSkeleton } from '../ui/skeletons/SearchResultSkeleton';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  price: string;
  sale_price: string | null;
  primary_image_url: string | null;
  category: { name: string; slug: string } | null;
  brand: { name: string } | null;
}

const RECENT_SEARCHES_KEY = 'zeronix_recent_searches';
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  try {
    return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
  } catch { return []; }
}

function addRecentSearch(term: string) {
  const recent = getRecentSearches().filter(s => s !== term);
  recent.unshift(term);
  localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, MAX_RECENT)));
}

function clearRecentSearches() {
  localStorage.removeItem(RECENT_SEARCHES_KEY);
}

interface SearchOverlayProps {
  mode: 'desktop' | 'mobile';
  isOpen?: boolean;
  onClose?: () => void;
}

export function SearchOverlay({ mode, isOpen: externalOpen, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const navigate = useNavigate();

  const isOpen = mode === 'mobile' ? !!externalOpen : isFocused || query.length > 0;

  // Load recent searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
    }
  }, [isOpen]);

  // Auto-focus mobile input
  useEffect(() => {
    if (mode === 'mobile' && externalOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [mode, externalOpen]);

  const handleClose = useCallback(() => {
    setQuery('');
    setResults([]);
    setHasSearched(false);
    setIsFocused(false);
    onClose?.();
  }, [onClose]);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.get(`/products/search?q=${encodeURIComponent(query.trim())}&limit=8`);
        setResults(data);
        setHasSearched(true);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setHasSearched(true);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  // Close on ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isOpen) document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (mode !== 'desktop') return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mode]);

  const handleSelectResult = (slug: string) => {
    if (query.trim()) addRecentSearch(query.trim());
    handleClose();
    navigate(`/products/${slug}`);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim().length < 2) return;
    addRecentSearch(query.trim());
    handleClose();
    navigate(`/category?search=${encodeURIComponent(query.trim())}`);
  };

  const handleRecentClick = (term: string) => {
    setQuery(term);
  };

  const handleClearRecent = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  const showDropdown = isOpen && (query.length > 0 || recentSearches.length > 0);

  // ──────────────────────────────────────────────────────
  // MOBILE: Full-screen overlay
  // ──────────────────────────────────────────────────────
  if (mode === 'mobile') {
    if (!externalOpen) return null;

    return (
      <div className="fixed inset-0 z-[200] bg-bg-primary flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle bg-bg-surface/50">
          <button onClick={handleClose} className="p-2 -ml-2 text-text-muted hover:text-text-primary transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <form onSubmit={handleSubmit} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full h-10 bg-bg-primary border border-border-subtle rounded-xl pl-10 pr-10 text-sm focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/10 transition-all outline-none text-text-primary placeholder:text-text-muted"
            />
            {query && (
              <button type="button" onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary">
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Recent searches (no query) */}
          {!query && recentSearches.length > 0 && (
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Recent Searches</span>
                <button onClick={handleClearRecent} className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Clear</button>
              </div>
              {recentSearches.map(term => (
                <button key={term} onClick={() => handleRecentClick(term)} className="flex items-center gap-3 w-full px-3 py-2.5 text-left hover:bg-bg-surface rounded-xl transition-colors group">
                  <Clock className="h-3.5 w-3.5 text-text-muted/50" />
                  <span className="text-sm text-text-primary group-hover:text-emerald-500 transition-colors">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="divide-y divide-border-subtle/30">
              {[1, 2, 3, 4].map(i => <SearchResultSkeleton key={i} />)}
            </div>
          )}

          {/* Results */}
          {!isLoading && hasSearched && results.length > 0 && (
            <>
              <div className="divide-y divide-border-subtle/30">
                {results.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectResult(product.slug)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-bg-surface/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-xl bg-bg-surface border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center p-1">
                      <img src={product.primary_image_url || '/placeholder-product.svg'} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary line-clamp-1">{product.name}</p>
                      <p className="text-[11px] text-text-muted">{product.category?.name || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">AED {product.sale_price || product.price}</p>
                      {product.sale_price && (
                        <p className="text-[10px] text-text-muted line-through">AED {product.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={handleSubmit} className="flex items-center justify-center gap-2 w-full py-3 text-emerald-500 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/5 transition-colors border-t border-border-subtle">
                View all results <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {/* Empty state */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <PackageSearch className="h-12 w-12 text-text-muted/20 mb-4" />
              <p className="text-sm font-semibold text-text-primary mb-1">No products found</p>
              <p className="text-xs text-text-muted">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────────────────────────────────
  // DESKTOP: Inline input with dropdown
  // ──────────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="flex-1 max-w-3xl relative">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search high-end gear..."
          className="w-full h-11 bg-bg-surface border border-border-subtle rounded-full pl-12 pr-10 text-sm focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-text-primary placeholder:text-text-muted"
        />
        {query && (
          <button type="button" onClick={() => { setQuery(''); inputRef.current?.focus(); }} className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-bg-surface border border-border-subtle rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_60px_rgba(0,0,0,0.5)] overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 max-h-[480px] overflow-y-auto">
          
          {/* Recent searches (no query) */}
          {!query && recentSearches.length > 0 && (
            <div className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">Recent Searches</span>
                <button onClick={handleClearRecent} className="text-[11px] font-bold uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Clear</button>
              </div>
              {recentSearches.map(term => (
                <button key={term} onClick={() => handleRecentClick(term)} className="flex items-center gap-3 w-full px-3 py-2 text-left hover:bg-bg-primary rounded-xl transition-colors group">
                  <Clock className="h-3.5 w-3.5 text-text-muted/50" />
                  <span className="text-sm text-text-primary group-hover:text-emerald-500 transition-colors">{term}</span>
                </button>
              ))}
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && query && (
            <div className="divide-y divide-border-subtle/30">
              {[1, 2, 3, 4].map(i => <SearchResultSkeleton key={i} />)}
            </div>
          )}

          {/* Results */}
          {!isLoading && hasSearched && results.length > 0 && (
            <>
              <div className="divide-y divide-border-subtle/30">
                {results.map(product => (
                  <button
                    key={product.id}
                    onClick={() => handleSelectResult(product.slug)}
                    className="flex items-center gap-3 px-4 py-3 w-full text-left hover:bg-bg-primary/50 transition-colors group"
                  >
                    <div className="h-12 w-12 rounded-xl bg-white dark:bg-[#0a0f1e] border border-border-subtle overflow-hidden shrink-0 flex items-center justify-center p-1 group-hover:scale-105 transition-transform">
                      <img src={product.primary_image_url || '/placeholder-product.svg'} alt="" className="h-full w-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-emerald-500 transition-colors">{product.name}</p>
                      <p className="text-[11px] text-text-muted">{product.brand?.name && `${product.brand.name} · `}{product.category?.name || 'Uncategorized'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">AED {product.sale_price || product.price}</p>
                      {product.sale_price && (
                        <p className="text-[10px] text-text-muted line-through">AED {product.price}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button onClick={handleSubmit} className="flex items-center justify-center gap-2 w-full py-3.5 text-emerald-500 text-xs font-bold uppercase tracking-widest hover:bg-emerald-500/5 transition-colors border-t border-border-subtle">
                View all results for "{query}" <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </>
          )}

          {/* Empty state */}
          {!isLoading && hasSearched && results.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <PackageSearch className="h-10 w-10 text-text-muted/20 mb-3" />
              <p className="text-sm font-semibold text-text-primary mb-1">No products found</p>
              <p className="text-xs text-text-muted">Try a different search term for "<span className="text-text-primary font-medium">{query}</span>"</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
