import type { Variant } from "@/features/products/types";

/** Unique values seen per attribute key across all variants, e.g. { Color: ["Black", "Silver"], RAM: ["16GB", "32GB"] }. */
export function getVariantAttributeOptions(variants: Variant[]): Record<string, string[]> {
  const seen: Record<string, string[]> = {};
  for (const variant of variants) {
    if (!variant.attributes) continue;
    for (const [key, value] of Object.entries(variant.attributes)) {
      if (!seen[key]) seen[key] = [];
      if (!seen[key].includes(value)) seen[key].push(value);
    }
  }
  return seen;
}

export function findMatchingVariant(
  variants: Variant[],
  selected: Record<string, string>,
): Variant | undefined {
  if (variants.length === 0) return undefined;
  // Most seeded products only have a single attributeless "Standard" variant —
  // there's nothing to match against, so just use it rather than falling
  // through to "no variant found" (which reads as false "out of stock").
  if (Object.keys(selected).length === 0) return variants[0];

  return (
    variants.find(
      (variant) =>
        variant.attributes && Object.entries(selected).every(([key, value]) => variant.attributes![key] === value),
    ) ?? variants[0]
  );
}
