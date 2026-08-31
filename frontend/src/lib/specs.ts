import type { Product } from "@/features/products/types";

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
  return product.specs ? Object.entries(product.specs) : [];
}
