import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock,
  FileText,
  History,
  Info,
  Mail,
  MapPin,
  ExternalLink,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  completeHandoverAction,
  reviewClaimAction,
  scheduleHandoverAction,
} from "@/app/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminClaimDetail } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Tinjau Klaim | Admin Portal",
};

export default async function AdminClaimDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const detail = await getAdminClaimDetail(id);

  if (!detail) notFound();

  const {
    claim,
    report,
    evidence,
    evidenceUrls,
    handover,
    history,
    claimant,
    adminNotes,
  } = detail;

  return (
    <div className="page-shell max-w-7xl mx-auto px-4 pb-12 sm:pb-16 space-y-6">
      {/* Top Navigation */}
      <div>
        <Link
          href="/admin/klaim"
          className="inline-flex items-center gap-2 rounded-xl border border-line/60 bg-surface px-3.5 py-2 text-xs sm:text-sm font-medium text-ink-soft shadow-sm transition-all hover:border-line hover:bg-surface-hover hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Manajemen Klaim</span>
        </Link>
      </div>

      {/* Header Admin */}
      <PageHeader
        eyebrow={`ID KLAIM: ${claim.claim_number}`}
        title="Tinjau Klaim Kepemilikan"
        description={`Diajukan pada ${formatDateTime(claim.created_at)}`}
        action={
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <StatusBadge kind="claim" status={claim.claim_status} />
            {report && (
              <Link
                href={`/admin/laporan/${report.id}`}
                className={buttonVariants({
                  variant: "secondary",
                  size: "sm",
                  className: "rounded-xl font-semibold text-xs sm:text-sm",
                })}
              >
                Lihat Detail Laporan →
              </Link>
            )}
          </div>
        }
      />

      {/* Global Alerts */}
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

      {claim.rejection_reason && (
        <Alert
          tone="warning"
          title="Alasan Penolakan Sebelumnya"
          className="rounded-xl"
        >
          {claim.rejection_reason}
        </Alert>
      )}

      {/* Main Grid Content */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Left Column: Evidence & History */}
        <div className="space-y-6">
          {/* Deskripsi Kepemilikan */}
          <Card className="p-5 sm:p-6 border-line bg-surface shadow-sm rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" aria-hidden="true" />
              Deskripsi & Bukti Kepemilikan
            </h2>
            <div className="mt-3 rounded-xl border border-line/60 bg-surface-2/40 p-4">
              <p className="whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {claim.ownership_description}
              </p>
            </div>

            {adminNotes && (
              <div className="mt-4 rounded-xl border border-line bg-amber-500/10 p-3.5">
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900 dark:text-amber-200">
                  Catatan Internal Admin
                </p>
                <p className="mt-1 text-xs sm:text-sm text-ink-soft">
                  {adminNotes}
                </p>
              </div>
            )}
          </Card>

          {/* Lampiran Bukti File / Foto */}
          <Card className="p-5 sm:p-6 border-line bg-surface shadow-sm rounded-2xl">
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink">
                Lampiran Dokumen ({evidence.length})
              </h2>
              <span className="text-xs text-muted">
                Klik untuk membuka file
              </span>
            </div>

            {evidence.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {evidence.map((item) => {
                  const url = evidenceUrls[item.storage_path];
                  const isPdf = item.storage_path
                    .toLowerCase()
                    .endsWith(".pdf");

                  return (
                    <li
                      key={item.id}
                      className="group relative overflow-hidden rounded-xl border border-line bg-surface-2/30 transition-all hover:border-accent/50 hover:shadow-sm"
                    >
                      {url && !isPdf ? (
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="block relative aspect-video w-full overflow-hidden bg-surface-2"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={url}
                            alt={item.description ?? "Bukti klaim"}
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
                            <ExternalLink className="h-5 w-5 text-white" />
                          </div>
                        </a>
                      ) : (
                        <a
                          href={url ?? "#"}
                          target="_blank"
                          rel="noreferrer"
                          className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-2 p-4 text-xs font-semibold text-ink-soft transition-colors group-hover:bg-accent/10 group-hover:text-accent"
                        >
                          <FileText
                            className="h-8 w-8 text-muted group-hover:text-accent"
                            aria-hidden="true"
                          />
                          <span>Buka Dokumen PDF/Lampiran</span>
                        </a>
                      )}
                      <div className="p-2.5 bg-surface border-t border-line/60">
                        <p className="truncate text-xs font-medium text-ink">
                          {item.description || "Tanpa deskripsi"}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-line p-6 text-center text-xs sm:text-sm text-muted">
                Pengklaim tidak mengunggah berkas foto atau dokumen pendukung.
              </div>
            )}
          </Card>

          {/* Audit Trail / Riwayat Klaim */}
          <Card className="p-5 sm:p-6 border-line bg-surface shadow-sm rounded-2xl">
            <h2 className="text-sm font-bold uppercase tracking-wider text-ink flex items-center gap-2 border-b border-line/60 pb-3">
              <History className="h-4 w-4 text-accent" aria-hidden="true" />
              Riwayat Audit Status Klaim
            </h2>

            {history.length > 0 ? (
              <div className="relative mt-4 pl-4 sm:pl-6 space-y-6 before:absolute before:left-2 sm:before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-line">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="relative flex items-start gap-3"
                  >
                    <span className="absolute -left-4 sm:-left-6 top-1 h-2.5 w-2.5 rounded-full ring-4 ring-surface bg-accent" />
                    <div className="flex-1 rounded-xl border border-line/60 bg-surface-2/30 p-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <StatusBadge kind="claim" status={item.new_status} />
                        <span className="text-[11px] font-medium text-muted flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDateTime(item.created_at)}
                        </span>
                      </div>
                      {item.reason && (
                        <p className="mt-2 text-xs text-ink-soft italic">
                          &quot;{item.reason}&quot;
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs sm:text-sm text-muted">
                Belum ada catatan perubahan status pada klaim ini.
              </p>
            )}
          </Card>
        </div>

        {/* Right Column: Actions & User Info Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-28">
          {/* Profil Pengklaim */}
          <Card className="p-5 border-line bg-surface shadow-sm rounded-2xl">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <UserCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              Identitas Pemohon (Pengklaim)
            </h2>
            <div className="mt-3 space-y-2 text-xs sm:text-sm text-ink-soft rounded-xl border border-line/60 bg-surface-2/40 p-3.5">
              <p className="flex items-center gap-2 font-semibold text-ink">
                <ShieldCheck
                  className="h-4 w-4 text-brand shrink-0"
                  aria-hidden="true"
                />
                {claimant?.full_name ?? "Nama Tidak Terdaftar"}
              </p>
              {claimant?.email && (
                <p className="flex items-center gap-2 break-all text-muted">
                  <Mail className="h-4 w-4 shrink-0" aria-hidden="true" />
                  {claimant.email}
                </p>
              )}
            </div>
          </Card>

          {/* Form Keputusan Admin */}
          {!["COMPLETED", "CANCELLED"].includes(claim.claim_status) && (
            <Card className="p-5 border-line bg-surface shadow-sm rounded-2xl">
              <h2 className="text-sm font-bold uppercase tracking-wider text-ink border-b border-line/60 pb-3">
                Ambil Keputusan Klaim
              </h2>
              <form action={reviewClaimAction} className="mt-4 space-y-4">
                <input type="hidden" name="claim_id" value={claim.id} />
                <Field label="Ubah Status Klaim" htmlFor="status" required>
                  <Select
                    id="status"
                    name="status"
                    className="rounded-xl"
                    defaultValue={
                      claim.claim_status === "PENDING"
                        ? "IN_REVIEW"
                        : claim.claim_status
                    }
                  >
                    <option value="IN_REVIEW">Tandai Sedang Diperiksa</option>
                    <option value="APPROVED">Setujui Klaim (ACC)</option>
                    <option value="REJECTED">Tolak Klaim</option>
                  </Select>
                </Field>

                <Field
                  label="Catatan / Alasan Pertimbangan"
                  htmlFor="reason"
                  hint="Wajib diisi saat menolak. Pengklaim dapat membaca pesan ini."
                >
                  <Textarea
                    id="reason"
                    name="reason"
                    rows={3}
                    defaultValue={claim.rejection_reason ?? ""}
                    placeholder="Tuliskan catatan pertimbangan admin..."
                    className="rounded-xl text-xs sm:text-sm"
                  />
                </Field>

                <Button
                  type="submit"
                  className="w-full font-semibold rounded-xl"
                >
                  Simpan Decision Admin
                </Button>
              </form>
            </Card>
          )}

          {/* Form Jadwalkan Penyerahan */}
          {claim.claim_status === "APPROVED" &&
            handover?.handover_status !== "SCHEDULED" && (
              <Card className="p-5 border-line bg-surface shadow-sm rounded-2xl border-brand/30 bg-brand/5">
                <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-brand-strong">
                  <CalendarClock
                    className="h-4 w-4 text-brand"
                    aria-hidden="true"
                  />
                  Jadwalkan Penyerahan
                </h2>
                <form
                  action={scheduleHandoverAction}
                  className="mt-4 space-y-4"
                >
                  <input type="hidden" name="claim_id" value={claim.id} />
                  <Field
                    label="Lokasi Temu / Pos Penyerahan"
                    htmlFor="location"
                    required
                  >
                    <Input
                      id="location"
                      name="location"
                      defaultValue=""
                      placeholder="Misal: Pos Satpam Gedung Rektorat"
                      className="rounded-xl bg-surface"
                      required
                    />
                  </Field>
                  <Field
                    label="Waktu Penyerahan"
                    htmlFor="scheduled_at"
                    required
                  >
                    <Input
                      id="scheduled_at"
                      name="scheduled_at"
                      type="datetime-local"
                      className="rounded-xl bg-surface"
                      required
                    />
                  </Field>
                  <Button
                    type="submit"
                    variant="secondary"
                    className="w-full font-semibold rounded-xl"
                  >
                    Simpan & Kirim Jadwal
                  </Button>
                </form>
              </Card>
            )}

          {/* Status Penyerahan Terjadwal */}
          {handover && (
            <Card className="p-5 border-line bg-surface shadow-sm rounded-2xl">
              <h2 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-ink border-b border-line/60 pb-3">
                <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
                Status Serah Terima
              </h2>
              <div className="mt-3 space-y-2 text-xs sm:text-sm text-ink-soft rounded-xl border border-line/60 bg-surface-2/40 p-3.5">
                <p>
                  <strong>Lokasi:</strong> {handover.handover_location}
                </p>
                <p>
                  <strong>Jadwal:</strong>{" "}
                  {formatDateTime(handover.scheduled_at)}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <strong>Status:</strong>
                  <StatusBadge
                    kind="handover"
                    status={handover.handover_status}
                  />
                </div>
                {handover.completed_at && (
                  <p className="text-xs text-brand font-medium pt-1">
                    Selesai pada {formatDateTime(handover.completed_at)}
                  </p>
                )}
              </div>

              {handover.handover_status === "SCHEDULED" && (
                <form
                  action={completeHandoverAction}
                  className="mt-4 space-y-3"
                >
                  <input type="hidden" name="handover_id" value={handover.id} />
                  <input type="hidden" name="claim_id" value={claim.id} />
                  <Field label="Catatan Final Serah Terima" htmlFor="notes">
                    <Textarea
                      id="notes"
                      name="notes"
                      rows={2}
                      placeholder="Opsional: Misal diserahkan dengan bukti KTM"
                      className="rounded-xl text-xs"
                    />
                  </Field>
                  <Button
                    type="submit"
                    className="w-full font-semibold rounded-xl"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Konfirmasi
                    Penyerahan Selesai
                  </Button>
                </form>
              )}
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}
