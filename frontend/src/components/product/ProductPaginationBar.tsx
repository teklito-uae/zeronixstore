import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface ProductPaginationBarProps {
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
}

/** Prev/Next plus a compact window of page numbers around the current page, with ellipses for the rest. */
export function ProductPaginationBar({ page, lastPage, onPageChange }: ProductPaginationBarProps) {
  if (lastPage <= 1) return null;

  const pages = new Set<number>([1, lastPage, page, page - 1, page + 1].filter((p) => p >= 1 && p <= lastPage));
  const sorted = [...pages].sort((a, b) => a - b);

  function go(e: MouseEvent, target: number) {
    e.preventDefault();
    onPageChange(target);
  }

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" aria-disabled={page <= 1} onClick={(e) => page > 1 && go(e, page - 1)} />
        </PaginationItem>
        {sorted.map((p, i) => (
          <PaginationItem key={p}>
            {i > 0 && sorted[i - 1] !== p - 1 && <PaginationEllipsis />}
            <PaginationLink href="#" isActive={p === page} onClick={(e) => go(e, p)}>
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext href="#" aria-disabled={page >= lastPage} onClick={(e) => page < lastPage && go(e, page + 1)} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
