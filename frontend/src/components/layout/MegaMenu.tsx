import { useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import { mockBrands, mockCategories } from "@/features/products/mock-data";
import { getCategoryAccent } from "@/lib/category-accents";
import { getCategory3DIcon } from "@/lib/category-3d-icons";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

const OPEN_DELAY_MS = 60;
const CLOSE_DELAY_MS = 150;

export function MegaMenu() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function scheduleOpen(slug: string) {
    window.clearTimeout(closeTimer.current);
    openTimer.current = window.setTimeout(() => setOpenSlug(slug), OPEN_DELAY_MS);
  }

  function scheduleClose() {
    window.clearTimeout(openTimer.current);
    closeTimer.current = window.setTimeout(() => setOpenSlug(null), CLOSE_DELAY_MS);
  }

  function cancelClose() {
    window.clearTimeout(closeTimer.current);
  }

  const activeCategory = mockCategories.find((c) => c.slug === openSlug);
  const accent = activeCategory ? getCategoryAccent(activeCategory.slug) : null;
  const activeIcon3d = activeCategory ? getCategory3DIcon(activeCategory.slug) : null;

  return (
    <nav aria-label="Product categories" className="hidden lg:block" onMouseLeave={scheduleClose}>
      <ul className="flex items-center gap-1">
        {mockCategories.map((cat) => (
          <li key={cat.id} onMouseEnter={() => scheduleOpen(cat.slug)} onFocus={() => scheduleOpen(cat.slug)}>
            <Link
              to={`/category/${cat.slug}`}
              className={cn(
                "flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted",
                openSlug === cat.slug && "bg-muted text-primary",
              )}
            >
              {cat.name}
              <ChevronDown
                className={cn(
                  "size-3.5 text-muted-foreground transition-transform duration-200",
                  openSlug === cat.slug && "rotate-180 text-primary",
                )}
              />
            </Link>
          </li>
        ))}
        <li>
          <Link
            to="/deals"
            className="rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            Deals
          </Link>
        </li>
      </ul>

      <AnimatePresence>
        {activeCategory && (
          <motion.div
            key={activeCategory.slug}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            className="absolute inset-x-0 top-full border-b border-border bg-popover shadow-lg"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto] gap-10 px-4 py-6">
              <div>
                <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Shop {activeCategory.name}
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {activeCategory.children?.map((child) => (
                    <Link
                      key={child.id}
                      to={`/category/${child.slug}`}
                      className="flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted"
                    >
                      <span
                        className={cn(
                          "flex size-9 shrink-0 items-center justify-center rounded-lg",
                          accent?.bg,
                        )}
                      >
                        {activeIcon3d ? (
                          <img src={activeIcon3d} alt="" className="size-6 object-contain" />
                        ) : (
                          <CategoryIcon
                            slug={activeCategory.slug}
                            className={cn("size-4.5", accent?.fg)}
                            strokeWidth={1.75}
                          />
                        )}
                      </span>
                      <span>
                        <span className="block text-sm font-medium text-foreground">
                          {child.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {child.total_products_count} products
                        </span>
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              <div className="w-56 border-l border-border pl-8">
                <span className="mb-3 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Popular Brands
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {mockBrands.map((b) => (
                    <Link
                      key={b.id}
                      to={`/brand/${b.slug}`}
                      className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                    >
                      {b.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
