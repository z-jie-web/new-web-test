import Link from 'next/link';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1 mt-10"
    >
      {currentPage > 1 ? (
        <Link
          href={`${basePath}?page=${currentPage - 1}`}
          className="px-3 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
        >
          Prev
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm rounded-md border border-border opacity-40 cursor-not-allowed">
          Prev
        </span>
      )}

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) =>
        p === currentPage ? (
          <span
            key={p}
            className="min-w-[2.25rem] px-2 py-2 text-sm rounded-md border border-primary bg-primary text-primary-foreground font-medium text-center"
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={p === 1 ? basePath : `${basePath}?page=${p}`}
            className="min-w-[2.25rem] px-2 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors text-center"
          >
            {p}
          </Link>
        )
      )}

      {currentPage < totalPages ? (
        <Link
          href={`${basePath}?page=${currentPage + 1}`}
          className="px-3 py-2 text-sm rounded-md border border-border hover:bg-accent transition-colors"
        >
          Next
        </Link>
      ) : (
        <span className="px-3 py-2 text-sm rounded-md border border-border opacity-40 cursor-not-allowed">
          Next
        </span>
      )}
    </nav>
  );
}
