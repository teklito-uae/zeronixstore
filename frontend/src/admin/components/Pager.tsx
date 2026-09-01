import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PagerProps {
  currentPage: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

export function Pager({ currentPage, lastPage, onPageChange }: PagerProps) {
  if (lastPage <= 1) return null;

  const pages = new Set<number>([1, lastPage, currentPage, currentPage - 1, currentPage + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            aria-disabled={currentPage <= 1}
            className={currentPage <= 1 ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage > 1) onPageChange(currentPage - 1);
            }}
          />
        </PaginationItem>
        {sorted.map((page, idx) => {
          const prev = sorted[idx - 1];
          const showEllipsis = prev !== undefined && page - prev > 1;
          return (
            <span key={page} className="flex items-center">
              {showEllipsis && <span className="px-2 text-sm text-muted-foreground">…</span>}
              <PaginationItem>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(page);
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            </span>
          );
        })}
        <PaginationItem>
          <PaginationNext
            href="#"
            aria-disabled={currentPage >= lastPage}
            className={currentPage >= lastPage ? "pointer-events-none opacity-50" : undefined}
            onClick={(e) => {
              e.preventDefault();
              if (currentPage < lastPage) onPageChange(currentPage + 1);
            }}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
