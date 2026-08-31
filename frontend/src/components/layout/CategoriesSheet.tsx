import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";

interface CategoriesSheetProps {
  trigger: ReactNode;
}

export function CategoriesSheet({ trigger }: CategoriesSheetProps) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="left" className="w-72 overflow-y-auto">
        <SheetHeader>
          <SheetTitle>
            <Link to="/">
              <img src="/zeronix-logo.webp" alt="Zeronix" className="h-5 w-auto" />
            </Link>
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-0.5 px-4 pb-4">
          {mockCategories.map((cat) => {
            const isOpen = openSlug === cat.slug;
            const hasChildren = Boolean(cat.children?.length);
            return (
              <div key={cat.id}>
                <div className="flex items-center">
                  <Link
                    to={`/category/${cat.slug}`}
                    className="flex-1 rounded-md px-2 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
                  >
                    {cat.name}
                  </Link>
                  {hasChildren && (
                    <button
                      type="button"
                      aria-label={isOpen ? `Collapse ${cat.name}` : `Expand ${cat.name}`}
                      aria-expanded={isOpen}
                      onClick={() => setOpenSlug(isOpen ? null : cat.slug)}
                      className="flex size-9 shrink-0 items-center justify-center text-muted-foreground"
                    >
                      <ChevronDown
                        className={cn("size-4 transition-transform duration-200", isOpen && "rotate-180")}
                      />
                    </button>
                  )}
                </div>
                <AnimatePresence initial={false}>
                  {isOpen && cat.children && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-0.5 py-1 pl-4">
                        {cat.children.map((child) => (
                          <Link
                            key={child.id}
                            to={`/category/${child.slug}`}
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
            className="mt-1 rounded-md px-2 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Deals
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
