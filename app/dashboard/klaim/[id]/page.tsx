import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  ExternalLink,
  FileText,
  KeyRound,
  MapPin,
  XCircle,
} from "lucide-react";
import { cancelClaimAction } from "@/app/actions/dashboard";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/auth";
import { getClaimById } from "@/lib/data/claims";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detail Klaim",
};

export default async function ClaimDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    baru?: string;
    dibatalkan?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const session = await requireUser(`/dashboard/klaim/${id}`);
  const detail = await getClaimById(id);

  if (!detail) notFound();

  const { claim, report, evidence, evidenceUrls, handover, history } = detail;

  if (
    claim.claimant_id !== session.authUser.id &&
    session.profile?.role !== "ADMIN"
  ) {
    notFound();
  }

  const canCancel = ["PENDING", "IN_REVIEW"].includes(claim.claim_status);

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/klaim"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar klaim
      </Link>

      <PageHeader
        eyebrow={claim.claim_number}
        title="Detail klaim"
        description={`Diajukan ${formatDateTime(claim.created_at)}`}
        action={
          report ? (
            <Link
              href={`/laporan/${report.id}`}
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              <ExternalLink className="h-4 w-4" aria-hidden />
              Lihat laporan
            </Link>
          ) : null
        }
      />

      {query.baru ? (
        <Alert tone="success" title="Klaim berhasil diajukan">
          Admin akan memeriksa bukti kepemilikanmu. Pantau status di halaman
          ini.
        </Alert>
      ) : null}
      {query.dibatalkan ? (
        <Alert tone="info">Klaim telah dibatalkan.</Alert>
      ) : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      {claim.claim_status === "REJECTED" ? (
        <Alert tone="danger" title="Klaim ditolak">
          {claim.rejection_reason ?? "Klaim tidak disetujui admin."}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <KeyRound className="h-4 w-4 text-brand" aria-hidden />
                Bukti kepemilikan
              </div>
              <StatusBadge kind="claim" status={claim.claim_status} />
            </div>
            <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
              {claim.ownership_description}
            </p>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">
              Lampiran bukti
            </h2>
            {evidence.length > 0 ? (
              <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                {evidence.map((item) => {
                  const url = evidenceUrls[item.storage_path];
                  const isPdf = item.storage_path.toLowerCase().endsWith(".pdf");

                  return (
                    <li
                      key={item.id}
                      className="overflow-hidden rounded-[var(--radius-control)] border border-line"
                    >
                      {url && !isPdf ? (
                        <a href={url} target="_blank" rel="noreferrer">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={item.description ?? "Bukti klaim"}
                            className="aspect-video w-full object-cover"
                          />
                        </a>
                      ) : (
                        <a
                          href={url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-2 text-sm text-ink-soft"
                        >
                          <FileText className="h-6 w-6" aria-hidden />
                          Lihat dokumen
                        </a>
                      )}
                      <p className="truncate px-3 py-2 text-xs text-muted">
                        {item.description ?? "Bukti"}
                      </p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Tidak ada lampiran bukti.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Riwayat klaim</h2>
            <ol className="mt-3 space-y-3">
              {history.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      <StatusBadge kind="claim" status={item.new_status} />
                    </p>
                    <p className="mt-1 text-xs text-muted">
                      {formatDateTime(item.created_at)}
                      {item.reason ? ` · ${item.reason}` : ""}
                    </p>
                  </div>
                </li>
              ))}
              {history.length === 0 ? (
                <li className="text-sm text-muted">Belum ada riwayat.</li>
              ) : null}
            </ol>
          </Card>
        </div>

        <div className="space-y-5">
          {report ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">Barang</h2>
              <p className="mt-2 text-sm font-medium text-ink">
                {report.item_name}
              </p>
              <p className="mt-1 text-xs text-muted">
                {report.report_number} ·{" "}
                {report.campus_locations?.name ?? "Lokasi tidak diketahui"} ·{" "}
                {formatDate(report.date_occurred)}
              </p>
            </Card>
          ) : null}

          {handover ? (
            <Card className="p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                <CalendarClock className="h-4 w-4 text-brand" aria-hidden />
                Penyerahan barang
              </div>
              <div className="mt-3 space-y-2 text-sm text-ink-soft">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted" aria-hidden />
                  {handover.handover_location}
                </p>
                <p>
                  Jadwal:{" "}
                  <span className="font-medium text-ink">
                    {formatDateTime(handover.scheduled_at)}
                  </span>
                </p>
                <p>
                  Status:{" "}
                  <StatusBadge
                    kind="handover"
                    status={handover.handover_status}
                  />
                </p>
                {handover.completed_at ? (
                  <p>
                    Dikonfirmasi: {formatDateTime(handover.completed_at)}
                  </p>
                ) : null}
                {handover.confirmation_notes ? (
                  <p className="text-xs text-muted">
                    Catatan: {handover.confirmation_notes}
                  </p>
                ) : null}
              </div>
            </Card>
          ) : null}

          {canCancel ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">
                Batalkan klaim
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Klaim yang dibatalkan tidak dapat dilanjutkan. Kamu dapat
                mengajukan klaim baru jika masih berhak.
              </p>
              <form action={cancelClaimAction} className="mt-3">
                <input type="hidden" name="claim_id" value={claim.id} />
                <button
                  type="submit"
                  className={buttonVariants({
                    variant: "danger",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  <XCircle className="h-4 w-4" aria-hidden />
                  Batalkan klaim
                </button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
