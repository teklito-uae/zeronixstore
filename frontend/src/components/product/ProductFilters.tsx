import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/format";
import type { Brand } from "@/features/products/types";

interface ProductFiltersProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandsChange: (slugs: string[]) => void;
  priceRange: { min: number; max: number } | null;
  priceMin: number | null;
  priceMax: number | null;
  onPriceChange: (min: number | null, max: number | null) => void;
  onReset: () => void;
  activeFilterCount: number;
}

export function ProductFilters({
  brands,
  selectedBrands,
  onBrandsChange,
  priceRange,
  priceMin,
  priceMax,
  onPriceChange,
  onReset,
  activeFilterCount,
}: ProductFiltersProps) {
  const [minInput, setMinInput] = useState(priceMin != null ? String(priceMin) : "");
  const [maxInput, setMaxInput] = useState(priceMax != null ? String(priceMax) : "");

  useEffect(() => {
    setMinInput(priceMin != null ? String(priceMin) : "");
    setMaxInput(priceMax != null ? String(priceMax) : "");
  }, [priceMin, priceMax]);

  function toggleBrand(slug: string) {
    onBrandsChange(
      selectedBrands.includes(slug) ? selectedBrands.filter((s) => s !== slug) : [...selectedBrands, slug],
    );
  }

  function applyPrice() {
    const min = minInput.trim() === "" ? null : Number(minInput);
    const max = maxInput.trim() === "" ? null : Number(maxInput);
    onPriceChange(Number.isNaN(min!) ? null : min, Number.isNaN(max!) ? null : max);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Filters</h2>
        {activeFilterCount > 0 && (
          <Button variant="link" size="sm" className="h-auto p-0 text-xs" onClick={onReset}>
            Clear all
          </Button>
        )}
      </div>

      {brands.length > 0 && (
        <>
          <div className="flex flex-col gap-2.5">
            <span className="text-sm font-medium text-foreground">Brand</span>
            <div className="flex max-h-56 flex-col gap-2 overflow-y-auto pr-1">
              {brands.map((brand) => (
                <label key={brand.slug} className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.slug)}
                    onChange={() => toggleBrand(brand.slug)}
                    className="size-3.5 rounded border-border accent-primary"
                  />
                  {brand.name}
                </label>
              ))}
            </div>
          </div>
          <Separator />
        </>
      )}

      {priceRange && (
        <div className="flex flex-col gap-2.5">
          <span className="text-sm font-medium text-foreground">Price (AED)</span>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              placeholder={String(Math.floor(priceRange.min))}
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="h-8 text-sm"
            />
            <span className="text-muted-foreground">–</span>
            <Input
              type="number"
              inputMode="numeric"
              placeholder={String(Math.ceil(priceRange.max))}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              onBlur={applyPrice}
              onKeyDown={(e) => e.key === "Enter" && applyPrice()}
              className="h-8 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {formatPrice(priceRange.min)} – {formatPrice(priceRange.max)} available
          </span>
        </div>
      )}
    </div>
  );
}
