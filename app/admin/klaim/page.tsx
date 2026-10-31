import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound, Search, ArrowRight, User, Package } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminClaims } from "@/lib/data/admin";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Manajemen Klaim | Admin Portal",
};

const claimStatuses = [
  { value: "PENDING", label: "Menunggu" },
  { value: "IN_REVIEW", label: "Diperiksa" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
] as const;

export default async function AdminClaimsPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    q?: string;
    message?: string;
    error?: string;
  }>;
}) {
  const query = await searchParams;
  const status = claimStatuses.some((item) => item.value === query.status)
    ? query.status
    : undefined;
  const claims = await getAdminClaims({ status, q: query.q });

  return (
    <div className="page-shell max-w-7xl mx-auto px-4 pb-12 sm:pb-16 space-y-6">
      {/* Header Section */}
      <PageHeader
        eyebrow="PANEL ADMIN"
        title="Manajemen Klaim Kepemilikan"
        description="Periksa dokumen bukti kepemilikan, proses persetujuan klaim, dan koordinasikan jadwal penyerahan barang."
      />

      {/* Alert Notifications */}
      {query.message && (
        <Alert tone="success" className="rounded-xl">
          {query.message}
        </Alert>
      )}
      {query.error && (
        <Alert tone="danger" className="rounded-xl">
          {query.error}
        </Alert>
      )}

      {/* Control Bar: Filter Tabs & Search Bar */}
      <div className="space-y-4">
        {/* Horizontal Scrollable Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          <Link
            href="/admin/klaim"
            className={cn(
              "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-sm",
              !status
                ? "border-brand bg-brand text-white shadow-brand/20"
                : "border-line/70 bg-surface text-ink-soft hover:border-line hover:bg-surface-hover hover:text-ink",
            )}
          >
            Semua Status
          </Link>
          {claimStatuses.map((item) => (
            <Link
              key={item.value}
              href={`/admin/klaim?status=${item.value}${
                query.q ? `&q=${encodeURIComponent(query.q)}` : ""
              }`}
              className={cn(
                "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all shadow-sm",
                status === item.value
                  ? "border-brand bg-brand text-white shadow-brand/20"
                  : "border-line/70 bg-surface text-ink-soft hover:border-line hover:bg-surface-hover hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Search Form */}
        <form
          className="flex items-center gap-2"
          action="/admin/klaim"
          method="GET"
        >
          {status && <input type="hidden" name="status" value={status} />}
          <div className="relative flex-1 max-w-md">
            <Search
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            />
            <Input
              name="q"
              defaultValue={query.q ?? ""}
              placeholder="Cari nomor klaim atau nama pengklaim..."
              className="pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border-line/80 bg-surface shadow-sm focus:border-accent"
            />
          </div>
          <button
            type="submit"
            className="rounded-xl border border-line bg-surface px-4 py-2 text-xs sm:text-sm font-semibold text-ink shadow-sm transition-all hover:bg-surface-hover active:scale-95"
          >
            Cari
          </button>
        </form>
      </div>

      {/* Main Data View */}
      {claims.length > 0 ? (
        <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          {/* Desktop Table Header */}
          <div className="hidden grid-cols-[1.1fr_1.3fr_1.1fr_0.9fr_1fr_auto] gap-4 border-b border-line bg-surface-2/60 px-6 py-3 text-xs font-bold uppercase tracking-wider text-muted lg:grid">
            <span>Nomor Klaim</span>
            <span>Barang Terkait</span>
            <span>Pengklaim</span>
            <span>Status</span>
            <span>Waktu Pengajuan</span>
            <span className="sr-only">Aksi</span>
          </div>

          {/* Table / Card List */}
          <ul className="divide-y divide-line/60">
            {claims.map(({ claim, report, claimant }) => (
              <li
                key={claim.id}
                className="group transition-colors hover:bg-surface-2/40"
              >
                <Link
                  href={`/admin/klaim/${claim.id}`}
                  className="block p-4 sm:p-5 lg:grid lg:grid-cols-[1.1fr_1.3fr_1.1fr_0.9fr_1fr_auto] lg:items-center lg:gap-4 lg:px-6"
                >
                  {/* Mobile Row 1 / Desktop Col 1: Claim ID & Status */}
                  <div className="flex items-center justify-between lg:block">
                    <span className="text-sm font-bold text-ink group-hover:text-brand transition-colors">
                      {claim.claim_number}
                    </span>
                    <div className="lg:hidden">
                      <StatusBadge kind="claim" status={claim.claim_status} />
                    </div>
                  </div>

                  {/* Item Details */}
                  <div className="mt-2.5 lg:mt-0 min-w-0">
                    <p className="truncate text-xs sm:text-sm font-semibold text-ink flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5 text-accent shrink-0 lg:hidden" />
                      {report?.item_name ?? "Barang Tidak Ditemukan"}
                    </p>
                    <p className="text-[11px] text-muted truncate mt-0.5">
                      Ref: {report?.report_number ?? "-"}
                    </p>
                  </div>

                  {/* Claimant Details */}
                  <div className="mt-2 lg:mt-0 min-w-0">
                    <p className="truncate text-xs sm:text-sm text-ink-soft flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-muted shrink-0 lg:hidden" />
                      {claimant?.full_name ?? "Pengguna Kampus"}
                    </p>
                  </div>

                  {/* Desktop Only: Status */}
                  <div className="hidden lg:block">
                    <StatusBadge kind="claim" status={claim.claim_status} />
                  </div>

                  {/* Date Submitted */}
                  <div className="mt-2.5 lg:mt-0 flex items-center justify-between lg:block border-t lg:border-t-0 border-line/40 pt-2 lg:pt-0">
                    <span className="text-xs text-muted">
                      {formatDateTime(claim.created_at)}
                    </span>
                    <span className="text-xs font-bold text-brand flex items-center gap-1 lg:hidden">
                      Tinjau <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>

                  {/* Desktop Hover Action Indicator */}
                  <div className="hidden lg:flex items-center justify-end">
                    <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand" />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        /* Empty State */
        <Card className="p-8 text-center border-line bg-surface/50 rounded-2xl shadow-none">
          <EmptyState
            icon={KeyRound}
            title="Tidak Ada Data Klaim"
            description="Belum ada berkas klaim kepemilikan yang sesuai dengan kriteria pencarian atau status terpilih."
          />
        </Card>
      )}
    </div>
  );
}
