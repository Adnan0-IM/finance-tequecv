import type { paginationType } from "@/types/admin";
import type { SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type PaginationProps = {
  limit: number;
  setLimit: React.Dispatch<SetStateAction<number>> | ((limit: number) => void);
  pagination: paginationType | undefined;
  page: number;
  setPage: React.Dispatch<SetStateAction<number>> | ((page: number) => void);
  isFetching: boolean;
  totalUsers?: number;
  showingUsers?: number;
};

const Pagination = ({
  limit,
  setLimit,
  page,
  setPage,
  pagination,
  isFetching,
  totalUsers,
  showingUsers,
}: PaginationProps) => {
  const totalPages = Math.max(1, pagination?.pages || 1);
  const currentPage = Math.min(Math.max(1, page || 1), totalPages);

  const getVisiblePages = (current: number, total: number, max = 5) => {
    const count = Math.min(max, total);
    const half = Math.floor(count / 2);

    const start = Math.max(1, Math.min(current - half, total - count + 1));
    const end = Math.min(total, start + count - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <span className="text-sm hidden sm:block">Rows per page</span>
        <Select
          value={String(limit)}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="w-20 bg-brand-primary text-white font-medium text-base">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {totalUsers !== undefined && showingUsers !== undefined && (
        <div className="text-sm hidden sm:block text-muted-foreground">
          Showing {showingUsers > 0 ? showingUsers : 0} of {totalUsers} users
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="text-sm hidden sm:block text-muted-foreground">
          {pagination ? `Page ${currentPage} of ${totalPages}` : null}
        </div>
        <Button
          variant="outline"
          disabled={currentPage <= 1 || isFetching}
          onClick={() => setPage(Math.max(1, currentPage - 1))}
        >
          Previous
        </Button>
        <div className="flex items-center gap-1">
          {getVisiblePages(currentPage, totalPages).map((p) => (
            <Button
              key={p}
              variant={p === currentPage ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
        </div>
        <Button
          variant="outline"
          disabled={!pagination || currentPage >= totalPages || isFetching}
          onClick={() => setPage(currentPage + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
};

export default Pagination;
