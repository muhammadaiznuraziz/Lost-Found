import type { Metadata } from "next";
import Link from "next/link";
import { PackageOpen, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/auth";
import { getUserReports } from "@/lib/data/reports";
import { formatDate } from "@/lib/utils";
import { REPORT_STATUS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Laporan Saya",
};

const TABS = [
  { value: "", label: "Semua" },
  { value: "PENDING", label: "Menunggu" },
  { value: "ACTIVE", label: "Aktif" },
  { value: "NEEDS_REVISION", label: "Perbaikan" },
  { value: "CLOSED", label: "Ditutup" },
  { value: "REJECTED", label: "Ditolak" },
] as const;

export default async function MyReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await requireUser("/dashboard/laporan");
  const params = await searchParams;
  const status = params.status ?? "";

  const reports = await getUserReports(session.authUser.id);
  const filtered = status
    ? reports.filter((report) => report.report_status === status)
    : reports;

  const counts = reports.reduce<Record<string, number>>((acc, report) => {
    acc[report.report_status] = (acc[report.report_status] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Laporan saya"
        title="Daftar laporan"
        description="Pantau status verifikasi dan kelola laporan yang kamu buat."
        action={
          <Link href="/laporkan" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" aria-hidden />
            Laporan baru
          </Link>
        }
      />

      <div className="flex gap-1 overflow-x-auto rounded-[var(--radius-control)] border border-line bg-surface p-1">
        {TABS.map((tab) => {
          const active = status === tab.value;
          const count = tab.value ? (counts[tab.value] ?? 0) : reports.length;

          return (
            <Link
              key={tab.value || "all"}
              href={
                tab.value
                  ? `/dashboard/laporan?status=${tab.value}`
                  : "/dashboard/laporan"
              }
              className={`shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-brand-soft text-brand-strong"
                  : "text-ink-soft hover:bg-surface-2 hover:text-ink"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 text-xs opacity-70">{count}</span>
            </Link>
          );
        })}
      </div>

      {filtered.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-line">
            {filtered.map((report) => {
              const displayStatus =
                report.item_report_status?.[0]?.display_status;

              return (
                <li key={report.id}>
                  <Link
                    href={`/dashboard/laporan/${report.id}`}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-ink">
                          {report.item_name}
                        </p>
                        <StatusBadge kind="type" status={report.report_type} />
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {report.report_number} ·{" "}
                        {report.categories?.name ?? "Tanpa kategori"} ·{" "}
                        {formatDate(report.date_occurred)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge
                        kind="item"
                        status={displayStatus ?? report.report_status}
                      />
                      <span className="text-xs text-muted">
                        {REPORT_STATUS[report.report_status]?.label ?? ""}
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title={
            status ? "Tidak ada laporan pada status ini" : "Belum ada laporan"
          }
          description={
            status
              ? "Coba pilih status lain atau buat laporan baru."
              : "Laporan yang kamu buat akan muncul di sini."
          }
          action={
            <Link href="/laporkan" className={buttonVariants({ size: "sm" })}>
              Buat laporan
            </Link>
          }
        />
      )}
    </div>
  );
}
