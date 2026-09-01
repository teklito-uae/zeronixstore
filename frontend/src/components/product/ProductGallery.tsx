import { type MouseEvent, useState } from "react";
import { ZoomIn } from "lucide-react";
import { getCategoryAccent } from "@/lib/category-accents";
import { CategoryIcon } from "@/lib/category-icons";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const badgeVariantByColor: Record<string, string> = {
  emerald: "bg-primary text-primary-foreground",
  blue: "bg-blue-600 text-white",
  red: "bg-red-600 text-white",
};

interface ProductGalleryProps {
  images: string[];
  name: string;
  categorySlug: string;
  badge: string | null;
  badgeColor: string | null;
}

export function ProductGallery({ images, name, categorySlug, badge, badgeColor }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState<{ transformOrigin: string } | null>(null);
  const accent = getCategoryAccent(categorySlug);
  const hasImages = images.length > 0;

  function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  }

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div
        className={cn(
          "group relative flex aspect-square flex-1 items-center justify-center overflow-hidden rounded-xl border border-border",
          accent.bg,
        )}
        onMouseMove={hasImages ? handleMouseMove : undefined}
        onMouseLeave={() => setZoomStyle(null)}
      >
        {!hasImages && (
          <div
            aria-hidden
            className={cn("absolute inset-0 opacity-[0.08]", accent.fg)}
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, currentColor 0, currentColor 1px, transparent 1px, transparent 14px)",
            }}
          />
        )}
        {badge && (
          <Badge
            className={cn(
              "absolute left-3 top-3 z-10 border-none px-2.5 py-1 text-xs font-medium",
              badgeColor && badgeVariantByColor[badgeColor],
            )}
          >
            {badge}
          </Badge>
        )}
        {hasImages ? (
          <>
            <img
              key={images[activeIndex]}
              src={images[activeIndex]}
              alt={name}
              className={cn(
                "relative size-full object-contain p-6 transition-transform duration-200 ease-out",
                zoomStyle ? "scale-[2] cursor-zoom-out" : "cursor-zoom-in group-hover:scale-[1.03]",
              )}
              style={zoomStyle ?? undefined}
            />
            <span className="pointer-events-none absolute bottom-3 right-3 hidden items-center gap-1 rounded-full bg-background/80 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur sm:flex">
              <ZoomIn className="size-3" />
              Hover to zoom
            </span>
          </>
        ) : (
          <CategoryIcon slug={categorySlug} className={cn("relative size-24 sm:size-32", accent.fg, "opacity-70")} strokeWidth={1} />
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto no-scrollbar lg:w-20 lg:flex-none lg:flex-col lg:overflow-x-visible lg:overflow-y-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`View image ${i + 1}`}
              aria-current={i === activeIndex}
              className={cn(
                "flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-card transition-colors sm:size-20",
                i === activeIndex ? "border-primary ring-1 ring-primary" : "border-border hover:border-foreground/30",
              )}
            >
              <img src={src} alt="" className="size-full object-contain p-1.5" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
