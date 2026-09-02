import { useRef, useState, type ReactNode } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { mockCategories } from "@/features/products/mock-data";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";

interface CategoriesSheetProps {
  trigger: ReactNode;
}

// Matches the sheet's own [data-side=left] modifier so this actually overrides the base
// w-3/4 / sm:max-w-sm from ui/sheet.tsx (a plain w-72 loses to the more specific attribute
// selector and silently gets ignored).
const SHEET_WIDTH = "data-[side=left]:w-72 data-[side=left]:sm:max-w-72";
const CLOSE_DELAY_MS = 150;

export function CategoriesSheet({ trigger }: CategoriesSheetProps) {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [expandedSlug, setExpandedSlug] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function openFlyout(slug: string) {
    window.clearTimeout(closeTimer.current);
    setActiveSlug(slug);
  }

  function scheduleCloseFlyout() {
    closeTimer.current = window.setTimeout(() => setActiveSlug(null), CLOSE_DELAY_MS);
  }

  function cancelCloseFlyout() {
    window.clearTimeout(closeTimer.current);
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setActiveSlug(null);
      setExpandedSlug(null);
    }
  }

  function closeSheet() {
    setOpen(false);
  }

  const activeCategory = mockCategories.find((c) => c.slug === activeSlug);
  const activeAccent = activeCategory ? getCategoryAccent(activeCategory.slug) : null;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        side="left"
        className={cn(SHEET_WIDTH, "gap-0 p-0")}
        onMouseLeave={scheduleCloseFlyout}
      >
        <SheetHeader className="flex-row items-center gap-3 border-b border-border">
          <Link to="/" onClick={closeSheet} className="shrink-0">
            <img src="/zeronix-logo.webp" alt="Zeronix" className="h-5 w-auto" />
          </Link>
          <SheetTitle className="text-sm font-semibold text-foreground">
            Shop by Category
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Categories" className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-3 py-2">
          {mockCategories.map((cat) => {
            const accent = getCategoryAccent(cat.slug);
            const hasChildren = Boolean(cat.children?.length);
            const isExpanded = expandedSlug === cat.slug;
            const isActive = activeSlug === cat.slug;

            return (
              <div
                key={cat.id}
                onMouseEnter={() => hasChildren && openFlyout(cat.slug)}
                onFocus={() => hasChildren && openFlyout(cat.slug)}
              >
                <div
                  className={cn(
                    "flex items-center rounded-lg transition-colors",
                    isActive && "bg-muted",
                  )}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    onClick={closeSheet}
                    className="flex flex-1 items-center gap-3 py-2 pl-1.5 text-sm font-medium text-foreground"
                  >
                    <span
                      className={cn(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg",
                        accent.bg,
                      )}
                    >
                      <CategoryIcon slug={cat.slug} className={cn("size-4.5", accent.fg)} strokeWidth={1.75} />
                    </span>
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">{cat.total_products_count}</span>
                  </Link>

                  {hasChildren && (
                    <>
                      <ChevronRight className="mr-2 hidden size-4 shrink-0 text-muted-foreground sm:block" />
                      <button
                        type="button"
                        aria-label={isExpanded ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                        aria-expanded={isExpanded}
                        onClick={() => setExpandedSlug(isExpanded ? null : cat.slug)}
                        className="flex size-9 shrink-0 items-center justify-center text-muted-foreground sm:hidden"
                      >
                        <ChevronDown
                          className={cn("size-4 transition-transform duration-200", isExpanded && "rotate-180")}
                        />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile: tap to expand inline (no hover on touch) */}
                <AnimatePresence initial={false}>
                  {isExpanded && cat.children && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden sm:hidden"
                    >
                      <div className="flex flex-col gap-0.5 py-1 pl-[3.25rem] pr-2">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
                            onClick={closeSheet}
                            className="rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            {child.name}
                          </Link>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          <Link
            to="/deals"
            onClick={closeSheet}
            className="mt-1 rounded-lg py-2.5 pl-1.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Deals
          </Link>
        </nav>

        {/* Desktop / pointer devices: hover a category to reveal its subcategories */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              key={activeCategory.slug}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              onMouseEnter={cancelCloseFlyout}
              onMouseLeave={scheduleCloseFlyout}
              className={cn(
                "fixed inset-y-0 left-72 z-50 hidden w-72 flex-col overflow-y-auto border-r border-border bg-popover shadow-xl sm:flex",
              )}
            >
              <div className="border-b border-border p-4">
                <Link to={`/category/${activeCategory.slug}`} onClick={closeSheet} className="flex items-center gap-3">
                  <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", activeAccent?.bg)}>
                    <CategoryIcon slug={activeCategory.slug} className={cn("size-4.5", activeAccent?.fg)} strokeWidth={1.75} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{activeCategory.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {activeCategory.total_products_count} products
                    </span>
                  </span>
                </Link>
              </div>
              <div className="flex flex-col gap-0.5 p-2">
                {activeCategory.children?.map((child) => (
                  <Link
                    key={child.id}
                    to={`/category/${child.slug}`}
                    onClick={closeSheet}
                    className="flex items-center justify-between gap-3 rounded-md px-3 py-2.5 text-sm text-foreground hover:bg-muted"
                  >
                    <span className="flex items-center gap-3">
                      <CategoryIcon slug={child.slug} className="size-4 text-muted-foreground" strokeWidth={1.75} />
                      {child.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{child.total_products_count}</span>
                  </Link>
                ))}
                <Link
                  to={`/category/${activeCategory.slug}`}
                  onClick={closeSheet}
                  className="mt-1 rounded-md px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/10"
                >
                  Shop all {activeCategory.name}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
}
