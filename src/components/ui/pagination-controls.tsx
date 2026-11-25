"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";

type PageNumber = number | "ellipsis";

export function pageNumbers(current: number, total: number): PageNumber[] {
  if (total <= 1) return [1];
  if (total <= 5) return Array.from({ length: total }, (_, index) => index + 1);
  if (current <= 3) return [1, 2, 3, 4, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 3, total - 2, total - 1, total];
  return [1, "ellipsis", current - 1, current, current + 1, "ellipsis", total];
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  label = "Pages",
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  label?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label={label} className="mt-8 flex flex-wrap items-center justify-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Go to previous page"
        className="gap-1 rounded-full px-3"
      >
        <CaretLeft aria-hidden className="size-4" />
        <span className="hidden sm:inline">Previous</span>
      </Button>

      <div className="flex items-center gap-1" aria-label="Page numbers">
        {pageNumbers(currentPage, totalPages).map((page, index) =>
          page === "ellipsis" ? (
            <span key={`ellipsis-${index}`} aria-hidden className="px-1 text-muted-foreground">
              …
            </span>
          ) : (
            <Button
              key={page}
              type="button"
              variant={page === currentPage ? "default" : "outline"}
              size="sm"
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Go to page ${page}`}
              onClick={() => onPageChange(page)}
              className="size-9 rounded-full p-0"
            >
              {page}
            </Button>
          )
        )}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Go to next page"
        className="gap-1 rounded-full px-3"
      >
        <span className="hidden sm:inline">Next</span>
        <CaretRight aria-hidden className="size-4" />
      </Button>
    </nav>
  );
}
