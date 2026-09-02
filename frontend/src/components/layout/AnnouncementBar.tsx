import { Truck } from "lucide-react";

export function AnnouncementBar() {
  return (
    <div className="hidden bg-foreground text-background lg:block">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-xs font-medium sm:text-sm">
        <Truck className="size-3.5 shrink-0" />
        <span>Free delivery across the UAE on orders over AED 200</span>
      </div>
    </div>
  );
}
