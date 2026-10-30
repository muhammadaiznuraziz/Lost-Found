import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  ExternalLink,
  MapPin,
  PackageOpen,
  Pencil,
  XCircle,
} from "lucide-react";
import { cancelReportAction } from "@/app/actions/dashboard";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/auth";
import { CONTACT_PREFERENCE } from "@/lib/constants";
import {
  getOwnReportContact,
  getReportById,
  getReportClaims,
  getReportHistory,
} from "@/lib/data/reports";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Detail Laporan",
};

export default async function MyReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    baru?: string;
    diperbarui?: string;
    dibatalkan?: string;
    error?: string;
  }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const session = await requireUser(`/dashboard/laporan/${id}`);
  const report = await getReportById(id);

  if (!report) notFound();

  const isOwner = report.user_id === session.authUser.id;
  const isAdmin = session.profile?.role === "ADMIN";

  if (!isOwner && !isAdmin) notFound();

  const [contact, claims, history] = await Promise.all([
    getOwnReportContact(report.id),
    getReportClaims(report.id),
    getReportHistory(report.id),
  ]);

  const editable = ["PENDING", "NEEDS_REVISION"].includes(
    report.report_status,
  );
  const activeClaims = claims.filter((claim) =>
    ["PENDING", "IN_REVIEW", "APPROVED"].includes(claim.claim_status),
  );
  const canCancel = editable && activeClaims.length === 0;
  const displayStatus = report.item_report_status?.[0]?.display_status;
  const primary =
    report.report_photos.find((photo) => photo.is_primary) ??
    report.report_photos[0];

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/laporan"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar laporan
      </Link>

      <PageHeader
        eyebrow={report.report_number}
        title={report.item_name}
        description={`${report.categories?.name ?? "Tanpa kategori"} · ${formatDate(
          report.date_occurred,
        )}`}
        action={
          <div className="flex flex-wrap gap-2">
            {report.report_status === "ACTIVE" ? (
              <Link
                href={`/laporan/${report.id}`}
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                <ExternalLink className="h-4 w-4" aria-hidden />
                Lihat publik
              </Link>
            ) : null}
            {editable ? (
              <Link
                href={`/dashboard/laporan/${report.id}/edit`}
                className={buttonVariants({ size: "sm" })}
              >
                <Pencil className="h-4 w-4" aria-hidden />
                Edit laporan
              </Link>
            ) : null}
          </div>
        }
      />

      {query.baru ? (
        <Alert tone="success" title="Laporan berhasil dikirim">
          Nomor laporan <strong>{report.report_number}</strong>. Laporan akan
          tayang setelah diverifikasi admin.
        </Alert>
      ) : null}
      {query.diperbarui ? (
        <Alert tone="success">Perubahan laporan berhasil disimpan.</Alert>
      ) : null}
      {query.dibatalkan ? (
        <Alert tone="info">Laporan telah dibatalkan.</Alert>
      ) : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      {report.report_status === "NEEDS_REVISION" ? (
        <Alert tone="warning" title="Admin meminta perbaikan">
          {report.rejection_reason ??
            "Periksa kembali kelengkapan laporan, lalu kirim ulang."}
        </Alert>
      ) : null}
      {report.report_status === "REJECTED" ? (
        <Alert tone="danger" title="Laporan ditolak">
          {report.rejection_reason ?? "Laporan tidak dipublikasikan."}
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            <div className="aspect-[16/9] bg-surface-2">
              {primary ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicPhotoUrl(primary.storage_path) ?? ""}
                  alt={primary.alt_text ?? report.item_name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="dot-grid flex h-full w-full items-center justify-center text-muted">
                  <PackageOpen className="h-10 w-10" aria-hidden />
                </div>
              )}
            </div>
            <div className="space-y-3 p-5">
              <div className="flex flex-wrap gap-2">
                <StatusBadge kind="type" status={report.report_type} />
                <StatusBadge
                  kind="item"
                  status={displayStatus ?? report.report_status}
                />
              </div>
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {report.description_public}
              </p>
              <dl className="grid gap-2 pt-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <MapPin className="h-4 w-4 text-muted" aria-hidden />
                  {report.campus_locations?.name ?? "Lokasi tidak diketahui"}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <CalendarDays className="h-4 w-4 text-muted" aria-hidden />
                  {formatDate(report.date_occurred)}
                </div>
              </dl>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Riwayat status</h2>
            <ol className="mt-3 space-y-3">
              {history.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <p className="text-sm font-medium text-ink">
                      {item.new_status === "PENDING"
                        ? "Menunggu verifikasi"
                        : item.new_status === "NEEDS_REVISION"
                          ? "Perlu perbaikan"
                          : item.new_status === "ACTIVE"
                            ? "Laporan aktif"
                            : item.new_status === "REJECTED"
                              ? "Ditolak"
                              : "Ditutup"}
                    </p>
                    <p className="text-xs text-muted">
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
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Kontak privat</h2>
            {contact?.contact_value ? (
              <>
                <p className="mt-2 text-sm text-ink-soft">
                  {CONTACT_PREFERENCE[contact.contact_preference] ??
                    contact.contact_preference}
                  :{" "}
                  <span className="font-medium text-ink">
                    {contact.contact_value}
                  </span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  Hanya kamu dan admin yang dapat melihat kontak ini.
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Tidak ada kontak yang dibagikan.
              </p>
            )}
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">
              Klaim pada laporan
            </h2>
            {claims.length > 0 ? (
              <ul className="mt-3 divide-y divide-line">
                {claims.map((claim) => (
                  <li
                    key={claim.id}
                    className="flex items-center justify-between gap-2 py-2.5"
                  >
                    <div>
                      <p className="text-sm font-medium text-ink">
                        {claim.claim_number}
                      </p>
                      <p className="text-xs text-muted">
                        {formatDateTime(claim.created_at)}
                      </p>
                    </div>
                    <StatusBadge kind="claim" status={claim.claim_status} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Belum ada klaim.</p>
            )}
          </Card>

          {canCancel ? (
            <Card className="p-5">
              <h2 className="text-sm font-semibold text-ink">
                Batalkan laporan
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted">
                Laporan yang dibatalkan tidak dapat diaktifkan kembali. Kamu
                dapat membuat laporan baru jika diperlukan.
              </p>
              <form action={cancelReportAction} className="mt-3">
                <input type="hidden" name="report_id" value={report.id} />
                <button
                  type="submit"
                  className={buttonVariants({
                    variant: "danger",
                    size: "sm",
                    className: "w-full",
                  })}
                >
                  <XCircle className="h-4 w-4" aria-hidden />
                  Batalkan laporan
                </button>
              </form>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
