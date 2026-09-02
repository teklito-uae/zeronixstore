import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";

export function MobileNav() {
  return (
    <CategoriesSheet
      trigger={
        <Button
          variant="ghost"
          aria-label="Browse all categories"
          className="shrink-0 px-2 text-nav-foreground hover:bg-nav-foreground/15 hover:text-nav-foreground aria-expanded:bg-nav-foreground/20 aria-expanded:text-nav-foreground"
        >
          <Menu className="size-5" />
          <span className="hidden sm:inline">Categories</span>
        </Button>
      }
    />
  );
}
