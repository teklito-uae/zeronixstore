import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ProductSort } from "@/features/products/api";

const options: { value: ProductSort; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

interface ProductSortSelectProps {
  value: ProductSort;
  onChange: (value: ProductSort) => void;
}

export function ProductSortSelect({ value, onChange }: ProductSortSelectProps) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as ProductSort)}>
      <SelectTrigger size="sm" className="w-[160px]">
        <span className="text-muted-foreground">Sort:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
