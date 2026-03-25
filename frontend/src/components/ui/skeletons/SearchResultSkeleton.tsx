import { Skeleton } from '../skeleton';

export function SearchResultSkeleton() {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <Skeleton className="h-12 w-12 rounded-xl shrink-0" />
      <div className="flex-1 min-w-0 space-y-2">
        <Skeleton className="h-3.5 w-3/4 rounded" />
        <Skeleton className="h-3 w-1/3 rounded" />
      </div>
      <Skeleton className="h-4 w-16 rounded shrink-0" />
    </div>
  );
}
