import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  MapPin,
  MessageCircle,
  ShieldAlert,
  Tag,
  User,
} from "lucide-react";
import { reviewReportAction } from "@/app/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Select, Textarea } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getReportFlags } from "@/lib/data/admin";
import {
  getOwnReportContact,
  getReportById,
  getReportClaims,
  getReportHistory,
} from "@/lib/data/reports";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import { formatDate, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tinjau Laporan",
};

export default async function AdminReportDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const report = await getReportById(id);

  if (!report) notFound();

  const [contact, claims, history, flags] = await Promise.all([
    getOwnReportContact(report.id),
    getReportClaims(report.id),
    getReportHistory(report.id),
    getReportFlags(report.id),
  ]);

  return (
    <div className="space-y-5">
      <Link
        href="/admin/laporan"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke manajemen laporan
      </Link>

      <PageHeader
        eyebrow={report.report_number}
        title={report.item_name}
        description={`Dibuat ${formatDateTime(report.created_at)} oleh ${
          report.profiles?.full_name ?? "pengguna"
        }`}
        action={
          <div className="flex items-center gap-2">
            <StatusBadge kind="report" status={report.report_status} />
            <Link
              href={`/laporan/${report.id}`}
              target="_blank"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Pratinjau publik
            </Link>
          </div>
        }
      />

      {query.message ? <Alert tone="success">{query.message}</Alert> : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      {report.rejection_reason ? (
        <Alert tone="warning" title="Catatan penolakan/perbaikan">
          {report.rejection_reason}
        </Alert>
      ) : null}

      {report.reference_report ? (
        <Alert tone="info" title="Laporan Merujuk Barang Hilang">
          Laporan temuan ini merujuk ke laporan kehilangan:{" "}
          <strong>{report.reference_report.item_name}</strong> (
          {report.reference_report.report_number}).{" "}
          <Link
            href={`/admin/laporan/${report.reference_report.id}`}
            className="underline font-semibold"
          >
            Buka Laporan Kehilangan Terkait &rarr;
          </Link>
        </Alert>
      ) : null}

      {report.referencing_reports && report.referencing_reports.length > 0 ? (
        <Alert
          tone="info"
          title={`Ada ${report.referencing_reports.length} Laporan Penemuan Terkait`}
        >
          Laporan kehilangan ini memiliki laporan temuan yang merujuk:
          <ul className="mt-2 list-disc pl-5 space-y-1">
            {report.referencing_reports.map((ref) => (
              <li key={ref.id}>
                <Link
                  href={`/admin/laporan/${ref.id}`}
                  className="underline font-semibold"
                >
                  {ref.report_number} - {ref.item_name}
                </Link>{" "}
                (Status: {ref.report_status})
              </li>
            ))}
          </ul>
        </Alert>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        <div className="space-y-5">
          <Card className="overflow-hidden">
            {report.report_photos.length > 0 ? (
              <div className="grid gap-2 bg-surface-2 p-2 sm:grid-cols-2">
                {report.report_photos.map((photo) => (
                  <a
                    key={photo.id}
                    href={publicPhotoUrl(photo.storage_path) ?? "#"}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicPhotoUrl(photo.storage_path) ?? "#"}
                      alt={report.item_name}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            ) : null}
            <div className="space-y-4 p-5">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {report.description_public}
              </p>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <Tag className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted">Kategori</dt>
                    <dd className="text-ink">
                      {report.categories?.name ?? "-"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted">Lokasi</dt>
                    <dd className="text-ink">
                      {report.campus_locations?.name ?? "-"}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <CalendarDays
                    className="mt-0.5 h-4 w-4 text-muted"
                    aria-hidden
                  />
                  <div>
                    <dt className="text-xs text-muted">Tanggal kejadian</dt>
                    <dd className="text-ink">
                      {formatDate(report.date_occurred)}
                    </dd>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="mt-0.5 h-4 w-4 text-muted" aria-hidden />
                  <div>
                    <dt className="text-xs text-muted">Pelapor</dt>
                    <dd className="text-ink">
                      {report.profiles?.full_name ?? "Pengguna"}
                    </dd>
                  </div>
                </div>
              </dl>

              {contact ? (
                <div className="rounded-[var(--radius-control)] border border-line bg-surface-2 p-3">
                  <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
                    <MessageCircle className="h-4 w-4" aria-hidden />
                    Kontak privat
                  </p>
                  <p className="mt-1 text-sm text-ink">
                    {contact.contact_preference}: {contact.contact_value}
                  </p>
                </div>
              ) : null}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">Riwayat status</h2>
            <ol className="mt-3 space-y-3">
              {history.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <div>
                    <StatusBadge kind="report" status={item.new_status} />
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
          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">
              Verifikasi laporan
            </h2>
            <form action={reviewReportAction} className="mt-4 space-y-4">
              <input type="hidden" name="report_id" value={report.id} />
              <Field label="Keputusan" htmlFor="status" required>
                <Select
                  id="status"
                  name="status"
                  defaultValue={
                    report.report_status === "PENDING"
                      ? "ACTIVE"
                      : report.report_status
                  }
                >
                  <option value="ACTIVE">Aktifkan / tayangkan</option>
                  <option value="NEEDS_REVISION">Minta perbaikan</option>
                  <option value="REJECTED">Tolak laporan</option>
                </Select>
              </Field>
              <Field
                label="Catatan"
                htmlFor="reason"
                hint="Wajib untuk penolakan. Dikirim ke pelapor untuk perbaikan."
              >
                <Textarea
                  id="reason"
                  name="reason"
                  rows={3}
                  defaultValue={report.rejection_reason ?? ""}
                  placeholder="Tuliskan alasan atau hal yang perlu diperbaiki..."
                />
              </Field>
              <Button type="submit" className="w-full">
                Simpan keputusan
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="text-sm font-semibold text-ink">
              Klaim pada laporan ini
            </h2>
            {claims.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {claims.map((claim) => (
                  <li key={claim.id}>
                    <Link
                      href={`/admin/klaim/${claim.id}`}
                      className="flex items-center justify-between gap-2 rounded-[var(--radius-control)] border border-line px-3 py-2 text-sm hover:bg-surface-2"
                    >
                      <span className="font-medium text-ink">
                        {claim.claim_number}
                      </span>
                      <StatusBadge kind="claim" status={claim.claim_status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">Belum ada klaim.</p>
            )}
          </Card>

          {flags.length > 0 ? (
            <Card className="p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <ShieldAlert className="h-4 w-4 text-danger" aria-hidden />
                Flag pengguna
              </h2>
              <ul className="mt-3 space-y-3">
                {flags.map((flag) => (
                  <li
                    key={flag.id}
                    className="rounded-[var(--radius-control)] border border-line p-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <StatusBadge kind="flag" status={flag.flag_status} />
                      <span className="text-xs text-muted">
                        {formatDateTime(flag.created_at)}
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-ink-soft">
                      {flag.reason}
                    </p>
                    <Link
                      href="/admin/mencurigakan"
                      className="mt-2 inline-block text-xs font-semibold text-brand hover:underline"
                    >
                      Tinjau flag
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}
        </div>
      </div>
    </div>
  );
}
