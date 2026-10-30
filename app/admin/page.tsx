import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  FileText,
  Flag,
  Handshake,
  KeyRound,
  PackageOpen,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  getAdminClaims,
  getAdminFlags,
  getAdminReports,
  getAdminStats,
} from "@/lib/data/admin";
import { formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Admin Overview",
};

export default async function AdminOverviewPage() {
  const [stats, pendingReports, pendingClaims, flags] = await Promise.all([
    getAdminStats(),
    getAdminReports({ status: "PENDING" }),
    getAdminClaims({ status: "PENDING" }),
    getAdminFlags(),
  ]);

  const openFlags = flags.filter((item) => item.flag.flag_status === "OPEN");

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Admin"
        title="Ringkasan operasional"
        description="Pantau antrian verifikasi laporan, klaim, dan penyerahan barang."
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Total laporan"
          value={stats.totalReports}
          icon={FileText}
          hint="Seluruh laporan di sistem"
        />
        <StatCard
          label="Menunggu verifikasi"
          value={stats.pendingReports}
          icon={Clock}
          tone="accent"
          hint="Laporan baru atau perlu perbaikan"
        />
        <StatCard
          label="Barang temuan aktif"
          value={stats.activeFound}
          icon={PackageOpen}
          hint="Tayang dan dapat diklaim"
        />
        <StatCard
          label="Klaim diproses"
          value={stats.pendingClaims}
          icon={KeyRound}
          tone="info"
          hint="Menunggu atau sedang diperiksa"
        />
        <StatCard
          label="Penyerahan selesai"
          value={stats.completedHandovers}
          icon={Handshake}
          hint="Barang sudah kembali ke pemilik"
        />
        <StatCard
          label="Flag terbuka"
          value={stats.openFlags}
          icon={Flag}
          tone="danger"
          hint="Laporan yang dilaporkan mencurigakan"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">
              Antrian verifikasi laporan
            </h2>
            <Link
              href="/admin/laporan?status=PENDING"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Semua
            </Link>
          </div>
          {pendingReports.length > 0 ? (
            <ul className="divide-y divide-line">
              {pendingReports.slice(0, 5).map((report) => (
                <li key={report.id}>
                  <Link
                    href={`/admin/laporan/${report.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {report.item_name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {report.report_number} ·{" "}
                        {formatRelative(report.created_at)}
                      </p>
                    </div>
                    <StatusBadge
                      kind="report"
                      status={report.report_status}
                    />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Tidak ada laporan menunggu verifikasi.
            </p>
          )}
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-sm font-semibold text-ink">
              Klaim menunggu verifikasi
            </h2>
            <Link
              href="/admin/klaim?status=PENDING"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Semua
            </Link>
          </div>
          {pendingClaims.length > 0 ? (
            <ul className="divide-y divide-line">
              {pendingClaims.slice(0, 5).map(({ claim, report, claimant }) => (
                <li key={claim.id}>
                  <Link
                    href={`/admin/klaim/${claim.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {report?.item_name ?? claim.claim_number}
                      </p>
                      <p className="mt-0.5 text-xs text-muted">
                        {claimant?.full_name ?? "Pengguna"} ·{" "}
                        {formatRelative(claim.created_at)}
                      </p>
                    </div>
                    <StatusBadge kind="claim" status={claim.claim_status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Tidak ada klaim menunggu verifikasi.
            </p>
          )}
        </section>
      </div>

      <section className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold text-ink">
            Laporan mencurigakan
          </h2>
          <Link
            href="/admin/mencurigakan"
            className="inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
          >
            Tinjau
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
        {openFlags.length > 0 ? (
          <ul className="divide-y divide-line">
            {openFlags.slice(0, 5).map(({ flag, report, reporter }) => (
              <li
                key={flag.id}
                className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">
                    {report?.item_name ?? "Laporan"}
                  </p>
                  <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                    {flag.reason}
                  </p>
                </div>
                <p className="text-xs text-muted">
                  {reporter?.full_name ?? "Pengguna"} ·{" "}
                  {formatRelative(flag.created_at)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="px-5 py-8">
            <EmptyState
              icon={Flag}
              title="Tidak ada flag terbuka"
              description="Semua laporan yang dilaporkan sudah ditinjau."
              className="border-0 bg-transparent py-0"
            />
          </div>
        )}
      </section>
    </div>
  );
}
