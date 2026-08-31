import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CategoriesSheet } from "@/components/layout/CategoriesSheet";

export function MobileNav() {
  return (
    <CategoriesSheet
      trigger={
        <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
          <Menu className="size-5" />
        </Button>
      }
    />
  );
}
