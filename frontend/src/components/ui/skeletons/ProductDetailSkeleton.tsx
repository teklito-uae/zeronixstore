import { Skeleton } from "../skeleton";

export function ProductDetailSkeleton() {
  return (
    <div className="py-8 px-4 md:px-6 max-w-[1440px] mx-auto min-h-screen relative">
      {/* Mobile Header Spacer */}
      <div className="h-16 md:hidden" />

      {/* Breadcrumb skeleton */}
      <div className="hidden md:flex gap-2 mb-8">
        <Skeleton className="h-4 w-12 rounded" />
        <span className="text-text-muted/30">/</span>
        <Skeleton className="h-4 w-20 rounded" />
        <span className="text-text-muted/30">/</span>
        <Skeleton className="h-4 w-40 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
        {/* Images Gallery */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Desktop Thumbnails */}
          <div className="hidden md:flex flex-col gap-4 w-24 shrink-0">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="aspect-square w-full rounded-[12px] border-2 border-border-subtle/30" />
            ))}
          </div>
          
          {/* Main Image */}
          <div className="flex-1 flex flex-col gap-0 md:gap-4 relative">
            <Skeleton className="w-full aspect-[4/3] sm:aspect-square md:rounded-[24px]" />
            <div className="flex justify-center gap-1.5 mt-2 md:mt-6">
              <Skeleton className="h-1 w-8 rounded-full" />
              <Skeleton className="h-1 w-4 rounded-full" />
              <Skeleton className="h-1 w-4 rounded-full" />
            </div>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-col pt-2 md:pt-0">
          <Skeleton className="h-6 w-24 rounded-full mb-4" />
          <Skeleton className="h-8 md:h-10 w-3/4 mb-2 rounded" />
          <Skeleton className="h-8 md:h-10 w-1/2 mb-4 rounded" />
          
          <div className="pb-4 border-b border-border-subtle mb-6">
             <Skeleton className="h-8 w-32 rounded" />
          </div>

          <Skeleton className="h-40 w-full rounded-[16px] mb-8" />
          
          <div className="space-y-4">
             <Skeleton className="h-6 w-3/4 rounded" />
             <Skeleton className="h-6 w-1/2 rounded" />
             <Skeleton className="h-6 w-5/6 rounded" />
             <Skeleton className="h-6 w-2/3 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
