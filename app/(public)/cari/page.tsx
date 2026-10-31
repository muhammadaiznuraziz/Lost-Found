import type { Metadata } from "next";
import Link from "next/link";
import {
  Search,
  PackageSearch,
  SearchX,
  Plus,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Pagination } from "@/components/reports/pagination";
import { ReportCard } from "@/components/reports/report-card";
import { getPublicReports } from "@/lib/data/reports";
import { getCategories } from "@/lib/data/reference";

export const metadata: Metadata = {
  title: "Cari Barang",
  description: "Telusuri laporan barang hilang dan temuan di kampus.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function single(params: SearchParams, key: string) {
  const value = params[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const values = {
    q: single(params, "q"),
    type: single(params, "type"),
    category: single(params, "category"),
    location: single(params, "location"),
    from: single(params, "from"),
    to: single(params, "to"),
  };

  const pageParam = Number.parseInt(single(params, "page") ?? "1", 10);
  const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

  const categoryId = Number.parseInt(values.category ?? "", 10);
  const locationId = Number.parseInt(values.location ?? "", 10);

  const [result, categories] = await Promise.all([
    getPublicReports({
      q: values.q,
      type:
        values.type === "FOUND"
          ? "FOUND"
          : values.type === "LOST"
            ? "LOST"
            : undefined,
      categoryId: Number.isFinite(categoryId) ? categoryId : undefined,
      locationId: Number.isFinite(locationId) ? locationId : undefined,
      dateFrom: values.from,
      dateTo: values.to,
      page,
    }),
    getCategories(),
  ]);

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      <div className="mx-auto w-full max-w-7xl px-4 pb-6 sm:px-6 md:pb-10 lg:px-8">
        {/* 2. FLOATING PILL SEARCH BAR (RESPONSIVE WIDTH) */}
        <form
          action="/cari"
          className="mt-6 flex w-full items-center rounded-full border border-line bg-surface px-4 py-3 shadow-sm transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20"
        >
          <Search className="h-5 w-5 shrink-0 text-muted" />
          <input
            type="text"
            name="q"
            defaultValue={values.q ?? ""}
            placeholder="Cari KTM, kunci motor, earphone, dompet..."
            className="ml-2.5 w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
          />
          {values.type && (
            <input type="hidden" name="type" value={values.type} />
          )}
          {values.category && (
            <input type="hidden" name="category" value={values.category} />
          )}
        </form>

        {/* 3. FILTER CHIPS (SCROLL ON MOBILE, WRAP ON DESKTOP) */}
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1.5 sm:flex-wrap sm:overflow-visible sm:pb-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {/* Type Filter Chips */}
          <Link
            href="/cari"
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              !values.type && !values.category
                ? "bg-brand text-on-brand shadow-sm"
                : "border border-line bg-surface text-ink-soft shadow-2xs hover:bg-surface-2 hover:text-ink"
            }`}
          >
            Semua
          </Link>
          <Link
            href={`/cari?type=FOUND${values.q ? `&q=${encodeURIComponent(values.q)}` : ""}`}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              values.type === "FOUND"
                ? "bg-brand text-on-brand shadow-sm"
                : "border border-line bg-surface text-ink-soft shadow-2xs hover:bg-surface-2 hover:text-ink"
            }`}
          >
            Barang Temuan
          </Link>
          <Link
            href={`/cari?type=LOST${values.q ? `&q=${encodeURIComponent(values.q)}` : ""}`}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
              values.type === "LOST"
                ? "bg-brand text-on-brand shadow-sm"
                : "border border-line bg-surface text-ink-soft shadow-2xs hover:bg-surface-2 hover:text-ink"
            }`}
          >
            Barang Hilang
          </Link>

          {/* Dynamic Category Chips */}
          {categories.map((cat) => {
            const isSelected = values.category === String(cat.id);
            return (
              <Link
                key={cat.id}
                href={`/cari?category=${cat.id}${values.q ? `&q=${encodeURIComponent(values.q)}` : ""}`}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-brand text-on-brand shadow-sm"
                    : "border border-line bg-surface text-ink-soft shadow-2xs hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {cat.name}
              </Link>
            );
          })}
        </div>

        {/* RESULT COUNTER */}
        <div className="mt-6 flex items-center justify-between px-1 text-xs font-semibold text-muted sm:text-sm">
          <span>
            <strong className="text-ink">{result.total}</strong> laporan
            ditemukan
          </span>
          {result.totalPages > 1 && (
            <span>
              Hal. {result.page} dari {result.totalPages}
            </span>
          )}
        </div>

        {/* 4. CARD GRID — konsisten dengan style ReportCard (gambar + Detail pill) */}
        {result.items.length > 0 ? (
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {result.items.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <EmptyState
            className="mt-6 rounded-3xl border border-line bg-surface p-8 shadow-2xs"
            icon={result.total === 0 && values.q ? SearchX : PackageSearch}
            title={
              values.q
                ? "Belum ada laporan yang cocok"
                : "Belum ada laporan yang tayang"
            }
            description={
              values.q
                ? "Coba kata kunci lain atau buat laporan baru agar barangmu lebih mudah ditemukan."
                : "Laporan baru akan langsung tampil di sini setelah diverifikasi."
            }
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link
                  href="/cari"
                  className={buttonVariants({
                    variant: "secondary",
                    size: "sm",
                  })}
                >
                  Reset
                </Link>
                <Link
                  href="/laporkan"
                  className={buttonVariants({ size: "sm" })}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Buat Laporan
                </Link>
              </div>
            }
          />
        )}

        {/* 5. PAGINATION */}
        <div className="mt-8">
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            basePath="/cari"
            params={{
              q: values.q,
              type: values.type,
              category: values.category,
              location: values.location,
              from: values.from,
              to: values.to,
            }}
          />
        </div>
      </div>
    </div>
  );
}
