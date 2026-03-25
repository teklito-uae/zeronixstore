import { Skeleton } from "../skeleton";

export function ProductCardSkeleton() {
  return (
    <div className="group relative bg-bg-surface rounded-xl overflow-hidden flex flex-col h-full border border-border-subtle p-0">
      {/* Image Block */}
      <Skeleton className="h-[160px] md:h-[200px] w-full rounded-none border-b border-border-subtle/50" />
      
      {/* Details Container */}
      <div className="p-4 md:p-5 flex flex-col flex-grow gap-4 relative">
        {/* Title Lines */}
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-3/4 rounded" />
        </div>

        {/* Price & Rating Row (Approx constraints) */}
        <div className="mt-auto flex flex-col gap-3">
          <Skeleton className="h-6 w-24 rounded" />
          <Skeleton className="h-5 w-14 rounded" />
        </div>
        
        {/* Floating Circular Add to Cart Button */}
        <div className="absolute bottom-4 right-4">
          <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
        </div>
      </div>
    </div>
  );
}
