import { Link } from "react-router-dom";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { useCart } from "@/features/cart/CartContext";

export default function Cart() {
  const { items, subtotal, updateQuantity, removeItem } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
          <ShoppingBag className="size-6" strokeWidth={1.5} />
        </span>
        <h1 className="text-2xl font-semibold text-foreground">Your cart is empty</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          Browse the store and add laptops, components or accessories to get started.
        </p>
        <Button asChild>
          <Link to="/">Continue shopping</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:py-10">
      <h1 className="mb-6 text-xl font-semibold text-foreground sm:text-2xl">Shopping Cart ({items.length})</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <ul className="flex flex-col divide-y divide-border rounded-xl border border-border">
          {items.map((item) => {
            const accent = getCategoryAccent(item.categorySlug);
            return (
              <li key={item.key} className="flex gap-3 p-4 sm:gap-4">
                <Link
                  to={`/products/${item.slug}`}
                  className={cn("relative flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-lg sm:size-24", accent.bg)}
                >
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="size-full object-contain p-1.5" />
                  ) : (
                    <CategoryIcon slug={item.categorySlug} className={cn("size-8 sm:size-10", accent.fg)} strokeWidth={1.25} />
                  )}
                </Link>

                <div className="flex flex-1 flex-col justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.slug}`} className="line-clamp-2 text-sm font-medium text-foreground hover:text-primary sm:text-base">
                      {item.name}
                    </Link>
                    {item.variantName && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.variantName}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center rounded-lg border border-border">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Decrease quantity"
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      >
                        <Minus className="size-3.5" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium tabular-nums">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Increase quantity"
                        disabled={item.quantity >= item.maxQuantity}
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      >
                        <Plus className="size-3.5" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-foreground sm:text-base">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="Remove item"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removeItem(item.key)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="h-fit rounded-xl border border-border bg-card p-5 lg:sticky lg:top-20">
          <h2 className="text-base font-semibold text-foreground">Order Summary</h2>
          <Separator className="my-4" />
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span className="text-foreground">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Delivery</span>
              <span className="text-emerald-600">Free</span>
            </div>
            <span className="text-xs text-muted-foreground">Inclusive of VAT</span>
          </div>
          <Separator className="my-4" />
          <div className="mb-4 flex justify-between text-base font-semibold text-foreground">
            <span>Total</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <Button size="lg" className="w-full" asChild>
            <Link to="/checkout">Proceed to Checkout</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
