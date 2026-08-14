import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  label: string;
  nextLabel: string;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  page: number;
  pageSize: number;
  pageSizeLabel: string;
  previousLabel: string;
  total: number;
}

export function Pagination({
  label,
  nextLabel,
  onPageChange,
  onPageSizeChange,
  page,
  pageSize,
  pageSizeLabel,
  previousLabel,
  total,
}: PaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, pageCount);

  return (
    <div className="flex flex-col gap-3 border-t px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {label
          .replace("{{page}}", String(currentPage))
          .replace("{{pages}}", String(pageCount))
          .replace("{{total}}", String(total))}
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          {pageSizeLabel}
          <select
            aria-label={pageSizeLabel}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onChange={(event) => onPageSizeChange(Number(event.target.value))}
            value={pageSize}
          >
            {[10, 20, 50, 100].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
        <Button
          aria-label={previousLabel}
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <Button
          aria-label={nextLabel}
          disabled={currentPage >= pageCount}
          onClick={() => onPageChange(currentPage + 1)}
          size="icon"
          type="button"
          variant="outline"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
