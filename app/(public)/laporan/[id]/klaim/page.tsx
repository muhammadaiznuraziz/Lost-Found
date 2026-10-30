import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Info, KeyRound, MapPin } from "lucide-react";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ClaimForm } from "@/components/reports/claim-form";
import { requireUser } from "@/lib/auth";
import { getReportById } from "@/lib/data/reports";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import { formatDate } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) return { title: "Klaim Tidak Ditemukan | Portal Kampus" };

  return {
    title: `Ajukan Klaim: ${report.item_name}`,
    description: `Formulir verifikasi klaim kepemilikan untuk ${report.item_name}`,
  };
}

export default async function ClaimPage({ params }: PageProps) {
  const { id } = await params;
  const session = await requireUser(`/laporan/${id}/klaim`);
  const report = await getReportById(id);

  if (!report) notFound();

  const isOwner = report.user_id === session.authUser.id;
  const claimable =
    report.report_type === "FOUND" &&
    report.report_status === "ACTIVE" &&
    !isOwner;

  const photos = report.report_photos ?? [];
  const primaryPhoto = photos.find((p) => p.is_primary) ?? photos[0];

  return (
    /* Kompensasi pt-24 sm:pt-28 memastikan konten TIDAK TERTUTUP oleh floating navbar */
    <div className="page-shell max-w-2xl mx-auto px-4 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-5 sm:space-y-6">
      {/* Top Back Navigation */}
      <div>
        <Link
          href={`/laporan/${report.id}`}
          className="inline-flex items-center gap-2 rounded-xl border border-line/60 bg-surface px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs sm:text-sm font-medium text-ink-soft shadow-sm transition-all hover:border-line hover:bg-surface-hover hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          <span>Kembali ke Detail Barang</span>
        </Link>
      </div>

      {/* Header Section */}
      <header className="space-y-1.5 sm:space-y-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 border border-brand/20 px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-brand-strong">
          <KeyRound className="h-3 w-3 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          Verifikasi Kepemilikan
        </span>
        <h1 className="text-xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          Ajukan Klaim Barang
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Sebutkan ciri-ciri spesifik atau unggah dokumen pendukung. Admin
          kampus akan memeriksa bukti untuk mencegah klaim palsu.
        </p>
      </header>

      {/* Target Item Card (Responsive Thumbnail & Text Stack) */}
      <Card className="p-4 sm:p-5 border-line bg-surface shadow-sm rounded-2xl overflow-hidden">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4">
          {primaryPhoto ? (
            <div className="relative h-14 w-14 sm:h-20 sm:w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-surface-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicPhotoUrl(primaryPhoto.storage_path) ?? ""}
                alt={report.item_name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <span className="flex h-12 w-12 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
              <KeyRound className="h-5 w-5 sm:h-6 sm:w-6" aria-hidden="true" />
            </span>
          )}

          <div className="min-w-0 flex-1 space-y-0.5">
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted block">
              {report.report_number}
            </span>
            <h2 className="truncate text-sm sm:text-lg font-bold text-ink">
              {report.item_name}
            </h2>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 sm:gap-x-3 text-[11px] sm:text-xs text-muted pt-0.5">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
                <span className="truncate max-w-[120px] sm:max-w-[180px]">
                  {report.campus_locations?.name ?? "Lokasi tidak diketahui"}
                </span>
              </span>
              <span className="hidden sm:inline">•</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
                <span>{formatDate(report.date_occurred)}</span>
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Safety & Terms Notice */}
      <div className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-brand/20 bg-brand/5 p-3.5 sm:p-4 text-xs text-brand-strong leading-relaxed">
        <Info className="h-4 w-4 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="text-[11px] sm:text-xs">
          <strong>Ketentuan Klaim:</strong> Mohon jangan melampirkan informasi
          atau foto dokumen yang mengandung data sensitif pribadi (misal:
          NIK/KTP utuh). Sertakan nomor seri, goresan khas, atau foto barang
          saat bersama kamu.
        </p>
      </div>

      {/* Main Form Box */}
      <main className="rounded-2xl border border-line bg-surface p-4 sm:p-6 md:p-8 shadow-sm">
        {claimable ? (
          <ClaimForm reportId={report.id} itemName={report.item_name} />
        ) : (
          <div className="space-y-4 py-2">
            <Alert tone="warning" title="Klaim Tidak Dapat Diajukan">
              {isOwner
                ? "Kamu adalah pelapor barang temuan ini, sehingga tidak dapat mengajukan klaim atas barang milik sendiri."
                : "Klaim saat ini tidak tersedia atau laporan ini telah ditutup/selesai diproses."}
            </Alert>
            <Link
              href={`/laporan/${report.id}`}
              className={buttonVariants({
                variant: "secondary",
                size: "sm",
                className:
                  "rounded-xl font-semibold w-full sm:w-auto justify-center",
              })}
            >
              Kembali ke Halaman Barang
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
