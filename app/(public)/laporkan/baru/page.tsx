import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Info, PackageSearch, Sparkles } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";
import { requireUser } from "@/lib/auth";
import { getCategories, getLocations } from "@/lib/data/reference";
import { getReportById } from "@/lib/data/reports";
import type { ReportType } from "@/types";

type Props = {
  searchParams: Promise<{ type?: string; ref_report_id?: string }>;
};

// Metadata Dinamis untuk Tab Browser & SEO Internal
export async function generateMetadata({
  searchParams,
}: Props): Promise<Metadata> {
  const params = await searchParams;
  const isFound = params.type === "FOUND";
  const isLost = params.type === "LOST";

  if (!isFound && !isLost) {
    return { title: "Formulir Laporan | Portal Kampus" };
  }

  return {
    title: isFound ? "Laporkan Barang Temuan" : "Laporkan Barang Hilang",
    description: isFound
      ? "Formulir pelaporan barang temuan di area kampus."
      : "Formulir pelaporan barang hilang untuk pencocokan data.",
  };
}

export default async function NewReportPage({ searchParams }: Props) {
  const params = await searchParams;
  const type: ReportType | null =
    params.type === "LOST" || params.type === "FOUND" ? params.type : null;

  if (!type) redirect("/laporkan");

  const session = await requireUser(
    params.ref_report_id
      ? `/laporkan/baru?type=${type}&ref_report_id=${params.ref_report_id}`
      : `/laporkan/baru?type=${type}`,
  );
  const [categories, locations, referenceReport] = await Promise.all([
    getCategories(),
    getLocations(),
    params.ref_report_id ? getReportById(params.ref_report_id) : Promise.resolve(null),
  ]);

  const isFound = type === "FOUND";

  return (
    <div className="page-shell max-w-3xl mx-auto px-4 pb-6 sm:px-6 sm:pb-10 lg:pb-12">
      {/* Back Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/laporkan"
          className="inline-flex items-center gap-2 rounded-xl border border-line/60 bg-surface px-3.5 py-2 text-xs font-medium text-ink-soft shadow-sm transition-all hover:border-line hover:bg-surface-hover hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 sm:text-sm"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span>Ganti Jenis Laporan</span>
        </Link>

        {/* Dynamic Context Badge */}
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
            isFound
              ? "bg-brand/10 text-brand border border-brand/20"
              : "bg-danger/10 text-danger border border-danger/20"
          }`}
        >
          {isFound ? (
            <>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Barang Temuan
            </>
          ) : (
            <>
              <PackageSearch className="h-3.5 w-3.5" aria-hidden="true" />
              Barang Hilang
            </>
          )}
        </span>
      </div>

      {/* Header Section */}
      <header className="mt-6">
        <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          {isFound
            ? "Laporkan barang yang kamu temukan"
            : "Laporkan barang milikmu yang hilang"}
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base leading-relaxed max-w-2xl">
          {isFound
            ? "Isi detail seaman mungkin. Hindari menulis ciri rahasia yang dapat dimanfaatkan untuk klaim kepemilikan palsu."
            : "Tuliskan rincian selengkap mungkin. Detail yang akurat mempermudah pencocokan saat barang ditemukan."}
        </p>
      </header>

      {/* Reference Report Context Banner */}
      {referenceReport && (
        <div className="mt-6 rounded-2xl border border-brand/30 bg-brand/5 p-4 sm:p-5 text-sm">
          <div className="flex items-center gap-2 font-bold text-brand">
            <Sparkles className="h-5 w-5" aria-hidden="true" />
            <span>Menanggapi Laporan Barang Hilang</span>
          </div>
          <p className="mt-2 text-ink">
            Kamu sedang melaporkan penemuan yang merespons laporan kehilangan:{" "}
            <strong>{referenceReport.item_name}</strong> ({referenceReport.report_number}).
          </p>
          <p className="mt-1 text-xs text-muted">
            Laporan temuan ini akan otomatis terhubung. Pemilik barang hilang dan admin kampus akan menerima notifikasi setelah kamu mengirim formulir ini.
          </p>
        </div>
      )}

      {/* Contextual Warning/Tip Banner */}
      <div
        className={`mt-6 flex items-start gap-3 rounded-xl p-4 border text-xs sm:text-sm leading-relaxed ${
          isFound
            ? "bg-brand/5 border-brand/20 text-brand-strong"
            : "bg-amber-500/5 border-amber-500/20 text-amber-900 dark:text-amber-200"
        }`}
      >
        <Info className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>
          {isFound ? (
            <>
              <strong>Tips Aman:</strong> Jangan cantumkan nomor seri penuh,
              stiker khusus, atau isi dompet secara detail pada deskripsi umum.
            </>
          ) : (
            <>
              <strong>Catatan:</strong> Informasi kontak pribadi kamu tidak akan
              ditampilkan publik demi menjaga privasi dan keamanan.
            </>
          )}
        </p>
      </div>

      {/* Form Container Card */}
      <main className="mt-6 rounded-2xl border border-line bg-surface p-4.5 shadow-sm sm:p-6 md:p-8">
        <ReportForm
          type={type}
          categories={categories}
          locations={locations}
          defaultEmail={session.profile?.email ?? session.authUser.email ?? ""}
          referenceReport={referenceReport}
        />
      </main>
    </div>
  );
}
