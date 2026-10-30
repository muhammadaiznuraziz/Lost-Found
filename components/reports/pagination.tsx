import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  function href(target: number) {
    const search = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) search.set(key, value);
    });
    if (target > 1) search.set("page", String(target));
    const query = search.toString();
    return query ? `${basePath}?${query}` : basePath;
  }

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1);
  const visible = pages.filter(
    (item) =>
      item === 1 ||
      item === totalPages ||
      Math.abs(item - page) <= 1,
  );

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex flex-wrap items-center justify-center gap-1.5"
    >
      <Link
        href={href(Math.max(1, page - 1))}
        aria-disabled={page <= 1}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-[var(--radius-control)] border border-line-strong px-3 text-sm font-medium",
          page <= 1
            ? "pointer-events-none opacity-40"
            : "bg-surface text-ink hover:bg-surface-2",
        )}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
        Sebelumnya
      </Link>

      {visible.map((item, index) => {
        const previous = visible[index - 1];
        const gap = previous && item - previous > 1;

        return (
          <span key={item} className="flex items-center gap-1.5">
            {gap ? <span className="px-1 text-sm text-muted">…</span> : null}
            <Link
              href={href(item)}
              aria-current={item === page ? "page" : undefined}
              className={cn(
                "inline-flex h-9 min-w-9 items-center justify-center rounded-[var(--radius-control)] px-2 text-sm font-medium",
                item === page
                  ? "bg-brand text-on-brand"
                  : "border border-line-strong bg-surface text-ink hover:bg-surface-2",
              )}
            >
              {item}
            </Link>
          </span>
        );
      })}

      <Link
        href={href(Math.min(totalPages, page + 1))}
        aria-disabled={page >= totalPages}
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-[var(--radius-control)] border border-line-strong px-3 text-sm font-medium",
          page >= totalPages
            ? "pointer-events-none opacity-40"
            : "bg-surface text-ink hover:bg-surface-2",
        )}
      >
        Berikutnya
        <ChevronRight className="h-4 w-4" aria-hidden />
      </Link>
    </nav>
  );
}
