import type { Product } from "@/features/products/types";

// The `specs` column is typed as Record<string, string> but scraped imports don't always
// honor that shape at runtime — e.g. HP/laptop imports store specs.highlights as a string[]
// and specs.full_specs as an array (often empty). Rendering those values directly as JSX
// children silently mashes array items together with no separator, so every value is
// normalized through here instead of trusted as a plain string.
type SpecValue = string | number | string[] | Record<string, unknown> | null | undefined;

function stringifySpecValue(value: SpecValue): string | null {
  if (value == null) return null;
  if (typeof value === "string") return value.trim() || null;
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const strings = value.filter((v): v is string => typeof v === "string" && v.trim() !== "");
    return strings.length > 0 ? strings.join(", ") : null;
  }
  return null;
}

function toTitleCase(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** CPU/GPU/RAM/Storage for PCs, falling back to the generic `specs` bag for everything else. */
export function getSpecEntries(product: Product): [string, string][] {
  if (product.cpu || product.gpu) {
    return (
      [
        ["CPU", product.cpu],
        ["GPU", product.gpu],
        ["RAM", product.ram],
        ["Storage", product.storage],
      ] as [string, string | null][]
    ).filter((entry): entry is [string, string] => Boolean(entry[1]));
  }
  if (!product.specs) return [];

  const entries: [string, string][] = [];
  for (const [key, value] of Object.entries(product.specs as Record<string, SpecValue>)) {
    if (key === "highlights") continue; // shown separately, see getSpecHighlights
    const display = stringifySpecValue(value);
    if (display) entries.push([toTitleCase(key), display]);
  }
  return entries;
}

/** Scraped imports sometimes carry a ready-made bullet list at specs.highlights instead of flat key/value pairs. */
export function getSpecHighlights(product: Product): string[] {
  const raw = (product.specs as Record<string, SpecValue> | null)?.highlights;
  if (!Array.isArray(raw)) return [];
  return raw.filter((v): v is string => typeof v === "string" && v.trim() !== "");
}
