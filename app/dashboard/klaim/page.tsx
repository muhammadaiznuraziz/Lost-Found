import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/auth";
import { getUserClaims } from "@/lib/data/claims";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Klaim Saya",
};

export default async function MyClaimsPage() {
  const session = await requireUser("/dashboard/klaim");
  const claims = await getUserClaims(session.authUser.id);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Klaim saya"
        title="Daftar klaim"
        description="Pantau pemeriksaan bukti dan jadwal penyerahan barang."
        action={
          <Link href="/cari?type=FOUND" className={buttonVariants({ size: "sm" })}>
            Cari barang temuan
          </Link>
        }
      />

      {claims.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-line">
            {claims.map(({ claim, report }) => (
              <li key={claim.id}>
                <Link
                  href={`/dashboard/klaim/${claim.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-surface-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      {report?.item_name ?? "Barang tidak tersedia"}
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {claim.claim_number} · Diajukan{" "}
                      {formatDateTime(claim.created_at)}
                      {report ? ` · ${formatDate(report.date_occurred)}` : ""}
                    </p>
                  </div>
                  <StatusBadge kind="claim" status={claim.claim_status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={KeyRound}
          title="Belum ada klaim"
          description="Jika kamu menemukan barang temuan yang cocok, buka detailnya dan ajukan klaim dengan bukti kepemilikan."
          action={
            <Link
              href="/cari?type=FOUND"
              className={buttonVariants({ size: "sm" })}
            >
              Lihat barang temuan
            </Link>
          }
        />
      )}
    </div>
  );
}
