import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Info,
  PackageSearch,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Laporkan Barang | Platform Kampus",
  description:
    "Pilih jenis laporan: barang hilang atau barang temuan di kampus.",
};

export default function ReportChoicePage() {
  return (
    <div className="page-shell max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:py-12">
      {/* Header Section */}
      <header className="max-w-xl">
        <h1 className="mt-5 text-2xl font-bold tracking-tight text-ink sm:text-3xl md:text-4xl">
          Apa yang ingin kamu laporkan?
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base leading-relaxed">
          Pilih kategori pelaporan yang sesuai. Sesi login diperlukan untuk
          memverifikasi identitas dan keamanan data kamu.
        </p>
      </header>

      {/* Main Selection Cards */}
      <div className="mt-8 grid gap-4 sm:gap-6 md:grid-cols-2">
        {/* Option 1: Barang Hilang */}
        <Link
          href="/laporkan/baru?type=LOST"
          className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-danger/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-danger/20"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-danger/10 text-danger transition-colors group-hover:bg-danger group-hover:text-white">
                <PackageSearch className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-danger opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                Pilih{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-ink group-hover:text-danger transition-colors">
              Saya Kehilangan Barang
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Buat laporan kehilangan agar sistem dan komunitas dapat membantu
              pencocokan lokasi dan deskripsi barang kamu.
            </p>

            <ul className="mt-6 space-y-2.5 border-t border-line/60 pt-4 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-danger mt-0.5" />
                <span>Nama, kategori, tanggal, dan lokasi terakhir</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-danger mt-0.5" />
                <span>Deskripsi publik & foto referensi</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-danger mt-0.5" />
                <span>Kontak privat terpeta aman untuk verifikasi</span>
              </li>
            </ul>
          </div>
        </Link>

        {/* Option 2: Barang Temuan */}
        <Link
          href="/laporkan/baru?type=FOUND"
          className="group relative flex flex-col justify-between rounded-2xl border border-line bg-surface p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand/50 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-brand/20"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 text-brand transition-colors group-hover:bg-brand group-hover:text-white">
                <Sparkles className="h-6 w-6" aria-hidden="true" />
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand opacity-0 transition-opacity group-hover:opacity-100 sm:opacity-100">
                Pilih{" "}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>

            <h2 className="mt-5 text-xl font-bold text-ink group-hover:text-brand transition-colors">
              Saya Menemukan Barang
            </h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">
              Daftarkan barang yang kamu temukan. Sembunyikan detail rahasia
              untuk mencegah klaim kepemilikan palsu.
            </p>

            <ul className="mt-6 space-y-2.5 border-t border-line/60 pt-4 text-xs sm:text-sm text-ink-soft">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                <span>Nama, kategori, tanggal, dan penemuan</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                <span>Foto umum dan koordinat titik penyerahan</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                <span>Deskripsi aman tanpa membocorkan ciri khusus</span>
              </li>
            </ul>
          </div>
        </Link>
      </div>

      {/* Trust & Policy Section */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <Card className="border-line/70 bg-surface/50 shadow-none">
          <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
            <ShieldCheck
              className="h-5 w-5 shrink-0 text-brand mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Privasi Data Terjamin
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Nomor kontak dan informasi sensitif kamu tidak dipublikasikan
                secara terbuka. Komunikasi dimediasi oleh sistem/admin.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-line/70 bg-surface/50 shadow-none">
          <CardContent className="flex items-start gap-3.5 p-4 sm:p-5">
            <Info
              className="h-5 w-5 shrink-0 text-info mt-0.5"
              aria-hidden="true"
            />
            <div>
              <h3 className="text-sm font-semibold text-ink">
                Proses Verifikasi Admin
              </h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">
                Setiap laporan yang masuk akan ditinjau oleh tim admin sebelum
                dipublikasikan untuk menghindari spaming dan penipuan.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
