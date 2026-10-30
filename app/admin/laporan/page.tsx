import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Input } from "@/components/ui/field";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminReports } from "@/lib/data/admin";
import { REPORT_STATUS_ORDER } from "@/lib/constants";
import { formatDate, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Manajemen Laporan",
};

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu",
  NEEDS_REVISION: "Perlu Perbaikan",
  ACTIVE: "Aktif",
  REJECTED: "Ditolak",
  CLOSED: "Ditutup",
};

export default async function AdminReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; q?: string; message?: string; error?: string }>;
}) {
  const query = await searchParams;
  const status = REPORT_STATUS_ORDER.includes(
    query.status as (typeof REPORT_STATUS_ORDER)[number],
  )
    ? query.status
    : undefined;
  const type = ["LOST", "FOUND"].includes(query.type ?? "")
    ? query.type
    : undefined;
  const reports = await getAdminReports({ status, type, q: query.q });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Manajemen laporan"
        description="Verifikasi laporan baru, tinjau perbaikan, dan pantau status tayang."
      />

      {query.message ? <Alert tone="success">{query.message}</Alert> : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/laporan"
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            !status
              ? "border-brand bg-brand text-white"
              : "border-line bg-surface text-ink-soft hover:border-brand/40",
          )}
        >
          Semua
        </Link>
        {REPORT_STATUS_ORDER.map((value) => (
          <Link
            key={value}
            href={`/admin/laporan?status=${value}${type ? `&type=${type}` : ""}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              status === value
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-soft hover:border-brand/40",
            )}
          >
            {statusLabels[value]}
          </Link>
        ))}
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/laporan">
        {status ? <input type="hidden" name="status" value={status} /> : null}
        {type ? <input type="hidden" name="type" value={type} /> : null}
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
            aria-hidden
          />
          <Input
            name="q"
            defaultValue={query.q ?? ""}
            placeholder="Cari nama barang atau nomor laporan"
            className="pl-9"
          />
        </div>
        <button
          type="submit"
          className="rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-sm font-semibold text-ink-soft hover:bg-surface-2"
        >
          Cari
        </button>
      </form>

      {reports.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="hidden grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.9fr] gap-3 border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
            <span>Barang</span>
            <span>Jenis</span>
            <span>Status</span>
            <span>Pelapor</span>
            <span>Dibuat</span>
          </div>
          <ul className="divide-y divide-line">
            {reports.map((report) => (
              <li key={report.id}>
                <Link
                  href={`/admin/laporan/${report.id}`}
                  className="grid gap-2 px-5 py-3.5 transition-colors hover:bg-surface-2 md:grid-cols-[1.6fr_0.7fr_0.7fr_0.9fr_0.9fr] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {report.item_name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {report.report_number} ·{" "}
                      {report.campus_locations?.name ?? "Lokasi tidak diketahui"}
                    </p>
                  </div>
                  <span className="text-xs font-medium text-ink-soft">
                    {report.report_type === "LOST" ? "Hilang" : "Temuan"}
                  </span>
                  <span>
                    <StatusBadge kind="report" status={report.report_status} />
                  </span>
                  <span className="truncate text-xs text-ink-soft">
                    {report.profiles?.full_name ?? "Pengguna"}
                  </span>
                  <span className="text-xs text-muted">
                    {formatDateTime(report.created_at)}
                    <span className="hidden md:inline">
                      {" "}
                      · {formatDate(report.date_occurred)}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={FileText}
          title="Tidak ada laporan"
          description="Belum ada laporan yang cocok dengan filter ini."
        />
      )}
    </div>
  );
}
