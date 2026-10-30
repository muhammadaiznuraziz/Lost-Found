import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FileSearch,
  HandHeart,
  KeyRound,
  PackageSearch,
  ShieldCheck,
  Waypoints,
  Sparkles,
  CheckCircle2,
  HelpCircle,
  AlertCircle,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CLAIM_STATUS, REPORT_STATUS } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Cara Kerja | Lost&Found UMC",
  description:
    "Pelajari alur pelaporan, verifikasi, klaim, dan pengembalian barang di Lost&Found kampus.",
};

const reportStatuses = [
  "PENDING",
  "NEEDS_REVISION",
  "ACTIVE",
  "REJECTED",
  "CLOSED",
] as const;

const claimStatuses = [
  "PENDING",
  "IN_REVIEW",
  "APPROVED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;

export default function HowItWorksPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:py-12 mt-13 space-y-12">
      {/* 1. HERO HEADER */}
      <header className="relative overflow-hidden rounded-[28px] border border-line bg-gradient-to-b from-brand-soft/30 via-surface to-surface p-6 sm:p-10 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong border border-brand/20">
            Panduan Pengguna
          </span>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-ink">
            Dari Laporan Sampai Barang Kembali
          </h1>
          <p className="text-sm sm:text-base leading-relaxed text-muted">
            Lost&amp;Found UMC menjamin transparansi pelaporan. Baik kamu yang
            kehilangan atau menemukan barang, ikuti alur terverifikasi berikut.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/laporkan"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full shadow-sm font-semibold gap-2",
              })}
            >
              Mulai Laporkan
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/cari"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "rounded-full border-line font-semibold",
              })}
            >
              Cari Barang Hilang
            </Link>
          </div>
        </div>
      </header>

      {/* 2. 3 TAHAP UTAMA (BENTO CARDS) */}
      <section className="space-y-4">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            3 Langkah Sederhana
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Sistem kami dirancang untuk memastikan barang kembali ke pemilik
            sah.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              step: "01",
              icon: ClipboardCheck,
              title: "Buat Laporan",
              body: "Pilih jenis laporan (Kehilangan/Temuan), isi deskripsi, lokasi spesifik, dan unggah foto pendukung.",
              tag: "Langkah Pertama",
            },
            {
              step: "02",
              icon: ShieldCheck,
              title: "Verifikasi Admin",
              body: "Tim admin mengecek kelayakan data laporan sebelum dipublikasikan untuk menghindari penyalahgunaan.",
              tag: "Keamanan Data",
            },
            {
              step: "03",
              icon: HandHeart,
              title: "Klaim & Serah Terima",
              body: "Pemilik mengajukan bukti kepemilikan. Setelah cocok, barang diserahkan via Pos Satpam / Layanan Terpadu.",
              tag: "Tahap Akhir",
            },
          ].map((item) => (
            <Card
              key={item.step}
              className="relative overflow-hidden rounded-[24px] border border-line bg-surface p-6 shadow-xs transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong font-bold">
                  <item.icon className="h-6 w-6" aria-hidden />
                </span>
                <span className="text-3xl font-black text-line/80 font-mono">
                  {item.step}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-bold text-ink">{item.title}</h3>
              <p className="mt-2 text-xs sm:text-sm leading-relaxed text-muted">
                {item.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. DUAL TRACK GUIDE (JIKALAU HILANG VS NEMU) */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Track 1: Kehilangan */}
        <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600">
              <PackageSearch className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">
                Kamu Kehilangan Barang?
              </h3>
              <p className="text-xs text-muted">Ikuti panduan pencarian ini</p>
            </div>
          </div>

          <ol className="relative border-l border-line/60 ml-3 space-y-6">
            {[
              "Cari di halaman 'Cari Barang' menggunakan kata kunci atau filter lokasi.",
              "Jika tidak ada, buat Laporan Kehilangan agar tercatat di sistem.",
              "Pantau Notifikasi & Dashboard secara berkala.",
              "Ajukan Klaim jika menemukan barang yang cocok dengan melampirkan bukti kepemilikan.",
            ].map((stepText, idx) => (
              <li key={idx} className="pl-6 relative">
                <span className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-line text-[11px] font-bold text-ink shadow-xs">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                  {stepText}
                </p>
              </li>
            ))}
          </ol>
        </div>

        {/* Track 2: Menemukan */}
        <div className="rounded-[28px] border border-line bg-surface p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 border-b border-line pb-4">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <Waypoints className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h3 className="text-base font-bold text-ink">
                Kamu Menemukan Barang?
              </h3>
              <p className="text-xs text-muted">Amankan dan laporkan segera</p>
            </div>
          </div>

          <ol className="relative border-l border-line/60 ml-3 space-y-6">
            {[
              "Amankan barang dan catat lokasi spesifik penemuan di area kampus.",
              "Buat Laporan Barang Temuan lengkap dengan foto produk.",
              "Serahkan barang ke Pos Satpam atau Layanan Terpadu UMC.",
              "Simpan detail rahasia barang (seperti isi dompet/wallpaper) untuk verifikasi klaim.",
            ].map((stepText, idx) => (
              <li key={idx} className="pl-6 relative">
                <span className="absolute -left-[13px] top-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-line text-[11px] font-bold text-ink shadow-xs">
                  {idx + 1}
                </span>
                <p className="text-xs sm:text-sm text-ink-soft leading-relaxed">
                  {stepText}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 4. EXPLANATION OF STATUSES */}
      <section className="space-y-6">
        <div className="space-y-1">
          <h2 className="text-xl sm:text-2xl font-bold text-ink">
            Memahami Status
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Arti dari setiap lencana status pada laporan dan klaim kamu.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Status Laporan */}
          <div className="rounded-[24px] border border-line bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink border-b border-line pb-3">
              <FileSearch className="h-4 w-4 text-brand" aria-hidden />
              Status Laporan
            </div>
            <div className="space-y-3">
              {reportStatuses.map((status) => (
                <div
                  key={status}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-2/50 border border-line/40"
                >
                  <span className="mt-0.5 shrink-0 rounded-md bg-surface border border-line px-2 py-0.5 text-[11px] font-bold text-ink">
                    {REPORT_STATUS[status]?.label ?? status}
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    {status === "PENDING"
                      ? "Laporan dikirim & menunggu pemeriksaan admin."
                      : status === "NEEDS_REVISION"
                        ? "Memerlukan perbaikan data sebelum dipublikasi."
                        : status === "ACTIVE"
                          ? "Laporan telah disetujui & tayang untuk publik."
                          : status === "REJECTED"
                            ? "Laporan ditolak (alasan terlampir di dashboard)."
                            : "Proses selesai / barang telah berhasil dikembalikan."}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Status Klaim */}
          <div className="rounded-[24px] border border-line bg-surface p-6 space-y-4">
            <div className="flex items-center gap-2 text-sm font-bold text-ink border-b border-line pb-3">
              <KeyRound className="h-4 w-4 text-brand" aria-hidden />
              Status Klaim
            </div>
            <div className="space-y-3">
              {claimStatuses.map((status) => (
                <div
                  key={status}
                  className="flex items-start gap-3 p-2.5 rounded-xl bg-surface-2/50 border border-line/40"
                >
                  <span className="mt-0.5 shrink-0 rounded-md bg-surface border border-line px-2 py-0.5 text-[11px] font-bold text-ink">
                    {CLAIM_STATUS[status]?.label ?? status}
                  </span>
                  <p className="text-xs text-muted leading-relaxed">
                    {status === "PENDING"
                      ? "Pengajuan klaim baru dibuat."
                      : status === "IN_REVIEW"
                        ? "Admin sedang memverifikasi bukti kepemilikan."
                        : status === "APPROVED"
                          ? "Klaim disetujui & menunggu jadwal pengambilan."
                          : status === "REJECTED"
                            ? "Bukti kepemilikan tidak sesuai."
                            : status === "COMPLETED"
                              ? "Barang telah diserahkan secara sah."
                              : "Pengajuan klaim dibatalkan oleh pemohon."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 5. CTA BOTTOM */}
      <section className="rounded-[28px] border border-brand/20 bg-gradient-to-r from-brand-soft/60 to-surface p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="text-xl font-bold text-ink">
            Siap Menggunakan Lost&Found?
          </h2>
          <p className="text-xs sm:text-sm text-muted">
            Daftar dengan akun mahasiswa/staf UMC untuk mulai melapor.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto justify-center">
          <Link
            href="/registrasi"
            className={buttonVariants({
              size: "lg",
              className:
                "rounded-full shadow-sm font-semibold w-full sm:w-auto",
            })}
          >
            Buat Akun
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className:
                "rounded-full border-line font-semibold w-full sm:w-auto",
            })}
          >
            Masuk
          </Link>
        </div>
      </section>
    </div>
  );
}
