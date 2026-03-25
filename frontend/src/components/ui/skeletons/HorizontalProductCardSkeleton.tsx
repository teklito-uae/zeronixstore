import { Skeleton } from "../skeleton";

export function HorizontalProductCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 bg-bg-surface border border-border-subtle rounded-xl w-full">
      {/* Image Placeholder */}
      <Skeleton className="shrink-0 w-24 h-24 md:w-28 md:h-28 rounded-lg" />

      {/* Details Stack */}
      <div className="flex-1 min-w-0 flex flex-col justify-center gap-2.5 py-1">
        {/* Stars */}
        <Skeleton className="h-3 w-16 rounded" />
        
        {/* Title Row */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-2/3 rounded" />
          </div>
          {/* Price */}
          <Skeleton className="h-4 w-12 rounded shrink-0" />
        </div>

        {/* Category */}
        <Skeleton className="h-3 w-20 rounded mt-1" />
      </div>
    </div>
  );
}
