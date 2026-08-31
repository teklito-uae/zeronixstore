import type { Brand } from "@/features/products/types";

interface BrandStripProps {
  brands: Brand[];
}

export function BrandStrip({ brands }: BrandStripProps) {
  return (
    <section className="border-y border-border bg-muted/40 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4">
        <p className="mb-5 text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Trusted brands we carry
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {brands.map((b) => (
            <span
              key={b.id}
              className="text-lg font-semibold tracking-tight text-muted-foreground/70 transition-colors hover:text-foreground"
            >
              {b.name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
