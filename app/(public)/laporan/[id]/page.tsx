import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Flag,
  Info,
  MapPin,
  PackageOpen,
  ShieldAlert,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { flagReport } from "@/app/actions/reports";
import { Alert } from "@/components/ui/alert";
import { Avatar } from "@/components/ui/avatar";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/status-badge";
import { Textarea } from "@/components/ui/field";
import { ReportCard } from "@/components/reports/report-card";
import { getSessionUser } from "@/lib/auth";
import { CONTACT_PREFERENCE, REPORT_TYPE } from "@/lib/constants";
import {
  getOwnReportContact,
  getRelatedReports,
  getReportById,
  getReportClaims,
} from "@/lib/data/reports";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import { formatDate, formatDateTime } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ flag?: string; error?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const report = await getReportById(id);

  if (!report) return { title: "Laporan tidak ditemukan | Kampus" };

  return {
    title: `${report.item_name} | Detail Laporan`,
    description: report.description_public.slice(0, 160),
  };
}

export default async function ReportDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { id } = await params;
  const query = await searchParams;
  const [report, session] = await Promise.all([
    getReportById(id),
    getSessionUser(),
  ]);

  if (!report) notFound();

  const profile = session?.profile;
  const isOwner = profile?.id === report.user_id;
  const isAdmin = profile?.role === "ADMIN";
  const canSeePrivate = isOwner || isAdmin;

  const [related, claims, contact] = await Promise.all([
    getRelatedReports(report, 3),
    canSeePrivate ? getReportClaims(report.id) : Promise.resolve([]),
    canSeePrivate ? getOwnReportContact(report.id) : Promise.resolve(null),
  ]);

  const photos = report.report_photos;
  const primary = photos.find((photo) => photo.is_primary) ?? photos[0];
  const displayStatus = report.item_report_status?.[0]?.display_status;
  const claimHref = `/laporan/${report.id}/klaim`;
  const canClaim =
    report.report_type === "FOUND" &&
    report.report_status === "ACTIVE" &&
    !isOwner;

  return (
    /* Kompensasi pt-24 (sm:pt-28) menjamin konten TIDAK TERTUTUP oleh floating navbar */
    <div className="page-shell max-w-6xl mx-auto px-4 pt-24 sm:pt-28 pb-12 sm:pb-16">
      {/* Breadcrumb Navigation */}
      <nav
        aria-label="Breadcrumb"
        className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-muted mb-4"
      >
        <Link href="/" className="hover:text-ink transition-colors">
          Beranda
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <Link href="/cari" className="hover:text-ink transition-colors">
          Cari Barang
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="truncate font-medium text-ink max-w-[200px] sm:max-w-none">
          {report.report_number}
        </span>
      </nav>

      {/* Notifications / Alerts */}
      {query.flag && (
        <Alert tone="success" className="mb-6">
          {query.flag}
        </Alert>
      )}
      {query.error && (
        <Alert tone="danger" className="mb-6">
          {query.error}
        </Alert>
      )}

      {/* Main Layout Grid */}
      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
        {/* Left Column: Image Gallery & Detail Info */}
        <div className="space-y-6">
          {/* Main Photo Gallery Container */}
          <Card className="overflow-hidden border-line bg-surface shadow-sm rounded-2xl">
            <div className="relative aspect-video sm:aspect-[4/3] w-full overflow-hidden bg-surface-2">
              {primary ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={publicPhotoUrl(primary.storage_path) ?? ""}
                  alt={primary.alt_text ?? report.item_name}
                  className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
              ) : (
                <div className="dot-grid flex h-full w-full flex-col items-center justify-center gap-3 text-muted p-6">
                  <PackageOpen
                    className="h-12 w-12 stroke-[1.25]"
                    aria-hidden="true"
                  />
                  <p className="text-sm font-medium">
                    Tidak ada foto terlampir
                  </p>
                </div>
              )}

              {/* Status Overlay Badges */}
              <div className="absolute left-3 top-3 sm:left-4 sm:top-4 flex flex-wrap gap-2">
                <StatusBadge kind="type" status={report.report_type} />
                <StatusBadge
                  kind="item"
                  status={displayStatus ?? report.report_status}
                />
              </div>
            </div>

            {/* Thumbnail Strip */}
            {photos.length > 1 && (
              <div className="grid grid-cols-4 gap-2 border-t border-line bg-surface/50 p-3">
                {photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative aspect-square overflow-hidden rounded-lg border border-line bg-surface-2"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publicPhotoUrl(photo.storage_path) ?? ""}
                      alt={photo.alt_text ?? report.item_name}
                      className="h-full w-full object-cover transition-opacity hover:opacity-90"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Primary Item Information */}
          <Card className="p-5 sm:p-7 border-line bg-surface shadow-sm rounded-2xl">
            <div className="border-b border-line/60 pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
                {report.item_name}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm font-medium text-muted flex items-center gap-2">
                <span>
                  {REPORT_TYPE[report.report_type]?.label ?? report.report_type}
                </span>
                <span>•</span>
                <span className="text-accent">
                  {report.categories?.name ?? "Tanpa kategori"}
                </span>
              </p>
            </div>

            {/* Key Metrics */}
            <dl className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-line/80 bg-surface-2/40 px-4 py-3.5">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <CalendarDays
                    className="h-4 w-4 text-accent"
                    aria-hidden="true"
                  />
                  Tanggal Kejadian
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-ink">
                  {formatDate(report.date_occurred)}
                </dd>
              </div>

              <div className="rounded-xl border border-line/80 bg-surface-2/40 px-4 py-3.5">
                <dt className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  <MapPin className="h-4 w-4 text-accent" aria-hidden="true" />
                  Lokasi Terkait
                </dt>
                <dd className="mt-1.5 text-sm font-semibold text-ink">
                  {report.campus_locations?.name ?? "Tidak diketahui"}
                </dd>
              </div>
            </dl>

            {/* Public Description */}
            <div className="mt-6">
              <h2 className="text-sm font-bold text-ink uppercase tracking-wide">
                Deskripsi Publik
              </h2>
              <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-ink-soft">
                {report.description_public}
              </p>
            </div>

            {/* Dropoff Location Banner */}
            {report.report_type === "FOUND" && report.dropoff_location && (
              <div className="mt-6 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3.5 text-sm text-brand-strong">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-brand" /> Titik
                  Penyerahan Barang
                </p>
                <p className="mt-1 text-xs sm:text-sm">
                  {report.dropoff_location.name}
                  {report.dropoff_location.building
                    ? ` · ${report.dropoff_location.building}`
                    : ""}
                </p>
              </div>
            )}
          </Card>

          {/* Claims List (Owner/Admin View) */}
          {canSeePrivate && claims.length > 0 && (
            <Card className="p-5 sm:p-6 border-line bg-surface shadow-sm rounded-2xl">
              <h2 className="text-base font-bold text-ink">
                Klaim Pengajuan Masuk ({claims.length})
              </h2>
              <ul className="mt-4 divide-y divide-line/60">
                {claims.map((claim) => (
                  <li
                    key={claim.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0 last:pb-0"
                  >
                    <div>
                      <p className="text-sm font-bold text-ink">
                        {claim.claim_number}
                      </p>
                      <p className="text-xs text-muted mt-0.5">
                        Diajukan pada {formatDateTime(claim.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge kind="claim" status={claim.claim_status} />
                      <Link
                        href={
                          isAdmin
                            ? `/admin/klaim/${claim.id}`
                            : `/dashboard/klaim/${claim.id}`
                        }
                        className="text-xs font-bold text-brand hover:underline"
                      >
                        Detail Klaim →
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Right Column: Sticky Action Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-28">
          {/* Main Action Card */}
          <Card className="p-5 sm:p-6 border-line bg-surface shadow-sm rounded-2xl">
            <div className="flex items-center justify-between gap-3 border-b border-line/60 pb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Status Laporan
                </p>
                <div className="mt-1.5">
                  <StatusBadge
                    kind="item"
                    status={displayStatus ?? report.report_status}
                  />
                </div>
              </div>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink">
                {report.report_type === "FOUND" ? (
                  <PackageOpen className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ShieldAlert className="h-5 w-5" aria-hidden="true" />
                )}
              </span>
            </div>

            {/* CTAs */}
            <div className="mt-5 space-y-3">
              {canClaim &&
                (profile ? (
                  <Link
                    href={claimHref}
                    className={buttonVariants({
                      size: "lg",
                      className:
                        "w-full justify-center font-semibold rounded-xl",
                    })}
                  >
                    Ajukan Klaim Barang
                    <ArrowRight className="h-4 w-4 ml-1" aria-hidden="true" />
                  </Link>
                ) : (
                  <Link
                    href={`/login?next=${encodeURIComponent(claimHref)}`}
                    className={buttonVariants({
                      size: "lg",
                      className:
                        "w-full justify-center font-semibold rounded-xl",
                    })}
                  >
                    Masuk untuk Mengklaim
                  </Link>
                ))}

              {isOwner && (
                <Link
                  href={`/dashboard/laporan/${report.id}`}
                  className={buttonVariants({
                    variant: "secondary",
                    className: "w-full justify-center font-semibold rounded-xl",
                  })}
                >
                  Kelola Laporan Saya
                </Link>
              )}

              {report.report_type === "LOST" &&
                report.report_status === "ACTIVE" && (
                  <Link
                    href="/laporkan?type=FOUND"
                    className={buttonVariants({
                      variant: "secondary",
                      className:
                        "w-full justify-center font-semibold rounded-xl",
                    })}
                  >
                    Saya Menemukan Barang Ini
                  </Link>
                )}
            </div>

            {/* Reporter Profile */}
            <div className="mt-6 flex items-center gap-3 border-t border-line/60 pt-4">
              <Avatar
                name={report.profiles?.full_name ?? "Pengguna"}
                size="sm"
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-ink">
                  {report.profiles?.full_name ?? "Pengguna Kampus"}
                </p>
                <p className="text-xs text-muted">
                  Dilaporkan {formatDateTime(report.created_at)}
                </p>
              </div>
            </div>
          </Card>

          {/* Private Contact Box (Owner / Admin Only) */}
          {canSeePrivate && contact?.contact_value && (
            <Card className="p-5 border-line bg-surface shadow-sm rounded-2xl">
              <div className="flex items-center gap-2 text-sm font-bold text-ink">
                <UserRound className="h-4 w-4 text-accent" aria-hidden="true" />
                Kontak Privat
              </div>
              <p className="mt-2 text-xs sm:text-sm text-ink-soft leading-relaxed">
                {CONTACT_PREFERENCE[contact.contact_preference] ??
                  contact.contact_preference}
                :{" "}
                <span className="font-semibold text-ink">
                  {contact.contact_value}
                </span>
              </p>
              <p className="mt-2 text-xs text-muted">
                Hanya terjangkau oleh pelapor dan admin kampus.
              </p>
            </Card>
          )}

          {/* Safety Guidelines */}
          <Card className="p-5 border-line bg-surface/60 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 text-sm font-bold text-ink">
              <ShieldCheck className="h-4 w-4 text-brand" aria-hidden="true" />
              Panduan Keamanan
            </div>
            <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
              <li className="flex gap-2">
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>
                  Jangan mengirim uang/transaksi dalam bentuk apa pun.
                </span>
              </li>
              <li className="flex gap-2">
                <Info
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand"
                  aria-hidden="true"
                />
                <span>
                  Serah terima barang disarankan di pos satpam/admin kampus.
                </span>
              </li>
            </ul>
          </Card>

          {/* Flag Report Action */}
          {profile && !isOwner && (
            <Card className="p-4 border-line bg-surface/40 shadow-sm rounded-2xl">
              <details className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-muted hover:text-ink">
                  <span className="flex items-center gap-2">
                    <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                    Tandai Laporan Mencurigakan
                  </span>
                  <span className="text-xs transition-transform group-open:rotate-180">
                    ▼
                  </span>
                </summary>
                <form
                  action={flagReport}
                  className="mt-3 space-y-3 pt-2 border-t border-line/40"
                >
                  <input type="hidden" name="report_id" value={report.id} />
                  <Textarea
                    name="reason"
                    minLength={10}
                    required
                    placeholder="Jelaskan indikasi kejanggalan laporan ini..."
                    className="min-h-20 text-xs rounded-xl"
                  />
                  <button
                    type="submit"
                    className={buttonVariants({
                      variant: "secondary",
                      size: "sm",
                      className: "w-full text-xs font-semibold rounded-lg",
                    })}
                  >
                    Kirim Laporan Kejahatan
                  </button>
                </form>
              </details>
            </Card>
          )}
        </aside>
      </div>

      {/* Related Reports Section */}
      {related.length > 0 && (
        <section className="mt-12 sm:mt-16 border-t border-line/80 pt-8 sm:pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
                Laporan Serupa
              </h2>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Barang lain dalam kategori yang sama
              </p>
            </div>
            <Link
              href={`/cari?category=${report.category_id}`}
              className="text-xs sm:text-sm font-semibold text-brand hover:underline"
            >
              Lihat Kategori Ini →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <ReportCard key={item.id} report={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
