const aedFormatter = new Intl.NumberFormat("en-AE", {
  style: "currency",
  currency: "AED",
  currencyDisplay: "code",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

/** Formats a decimal-string price (as returned by the Laravel API) as AED, e.g. "AED 4,299". */
export function formatPrice(price: string | number): string {
  const value = typeof price === "string" ? Number.parseFloat(price) : price;
  return aedFormatter.format(value);
}

export function discountPercent(price: string, salePrice: string): number {
  const original = Number.parseFloat(price);
  const sale = Number.parseFloat(salePrice);
  if (!original || sale >= original) return 0;
  return Math.round(((original - sale) / original) * 100);
}
