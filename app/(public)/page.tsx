import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  HandHeart,
  PackageSearch,
  Search,
  ShieldCheck,
  Waypoints,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { ReportCard } from "@/components/reports/report-card";
import { getPublicReports, getPublicStats } from "@/lib/data/reports";
import { getCategories } from "@/lib/data/reference";

export default async function HomePage() {
  const [stats, categories, found, lost] = await Promise.all([
    getPublicStats(),
    getCategories(),
    getPublicReports({ type: "FOUND", pageSize: 4 }),
    getPublicReports({ type: "LOST", pageSize: 4 }),
  ]);

  const recent = found.items.slice(0, 4);
  const recentLost = lost.items.slice(0, 4);
  const highlightCategories = categories.slice(0, 9);

  const steps = [
    {
      icon: ClipboardCheck,
      title: "Laporkan",
      description:
        "Buat laporan barang hilang atau barang temuan lengkap dengan foto dan lokasi.",
      href: "/laporkan",
      cta: "Buat laporan",
    },
    {
      icon: PackageSearch,
      title: "Cari",
      description:
        "Telusuri laporan lewat kata kunci, kategori, dan lokasi kampus.",
      href: "/cari",
      cta: "Cari barang",
    },
    {
      icon: Waypoints,
      title: "Klaim",
      description:
        "Ajukan klaim beserta bukti kepemilikan. Admin memverifikasi sebelum penyerahan.",
      href: "/cara-kerja",
      cta: "Lihat detail",
    },
    {
      icon: HandHeart,
      title: "Kembali",
      description:
        "Barang diserahkan di titik layanan kampus dan proses ditutup dengan konfirmasi.",
      href: "/cara-kerja",
      cta: "Prosedur penyerahan",
    },
  ];

  const safetyNotes = [
    "Seluruh laporan diperiksa admin sebelum tampil publik.",
    "Kontak privat kamu hanya dapat dilihat oleh kamu dan admin.",
    "Sertakan cukup ciri umum di deskripsi; simpan ciri rahasia untuk bukti klaim.",
    "Bukti kepemilikan disimpan pada penyimpanan privat (non-publik).",
  ];

  const faqs = [
    {
      q: "Apakah menggunakan Lost&Found UMC berbayar?",
      a: "Gratis. Platform ini layanan internal kampus untuk membantu pencarian dan pengembalian barang.",
    },
    {
      q: "Laporan saya tampil di halaman publik?",
      a: "Tidak langsung. Laporan masuk status Menunggu Verifikasi dan tampil publik setelah admin menyetujuinya.",
    },
    {
      q: "Apakah kontak atau ciri rahasia barang tampil publik?",
      a: "Tidak. Kontak privat dan detail sensitif hanya dapat diakses oleh pemilik laporan dan admin.",
    },
    {
      q: "Bagaimana jika saya tidak yakin barang itu milik saya?",
      a: "Ajukan klaim dengan bukti kepemilikan. Admin akan memeriksa bukti memanah sebelum barang diserahkan.",
    },
    {
      q: "Di mana barang temuan harus diserahkan?",
      a: "Saat membuat laporan barang temuan, kamu memilih titik penyerahan. Administrator akan menyimpan barang tersebut sampai klaim sah disetujui.",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 lg:px-8">
      {/* 1. HERO */}
      <section className="relative overflow-hidden rounded-[2.5rem] border border-line bg-gradient-to-b from-brand-soft/30 via-surface to-surface p-6 shadow-sm sm:p-10">
        <div className="max-w-3xl space-y-4">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand/20 bg-brand-soft px-3 py-1 text-xs font-semibold text-brand-strong">
            {stats.totalReports} laporan · {stats.availableItems} barang siap
            diserahkan · {stats.returnedItems} sudah kembali
          </span>
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-5xl">
            Hilang di kampus?
            <br />
            <span className="text-brand-strong">Cari di sini dulu.</span>
          </h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            Semua laporan barang hilang dan barang temuan kampus terpusat di
            satu tempat — diverifikasi admin, aman privatnya, sampai barang
            kembali ke pemiliknya.
          </p>

          {/* Search bar */}
          <form
            action="/cari"
            className="mt-6 flex w-full items-center gap-2 rounded-full border border-line bg-surface p-2 pl-4 shadow-sm transition-all focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20 sm:max-w-xl"
          >
            <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden />
            <input
              type="text"
              name="q"
              placeholder="Cari dompet, KTM, kunci motor, earphone..."
              aria-label="Cari barang"
              className="w-full bg-transparent text-sm text-ink placeholder:text-muted focus:outline-none"
            />
            <button
              type="submit"
              className={buttonVariants({
                variant: "primary",
                size: "md",
                className: "shrink-0 rounded-full px-5",
              })}
            >
              Cari
            </button>
          </form>

          {/* Primary CTA */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/laporkan"
              className={buttonVariants({
                size: "lg",
                className: "rounded-full shadow-sm font-semibold",
              })}
            >
              Laporkan barang
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <Link
              href="/cari"
              className={buttonVariants({
                variant: "secondary",
                size: "lg",
                className: "rounded-full font-semibold",
              })}
            >
              <Search className="h-4 w-4" aria-hidden />
              Cari barang
            </Link>
          </div>
        </div>
      </section>

      {/* 2. CATEGORIES */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Telusuri per kategori
            </h2>
            <p className="mt-1 text-sm text-muted">
              Klik kategori yang paling mendekati barang yang kamu cari.
            </p>
          </div>
          <Link
            href="/cari"
            className="hidden shrink-0 text-sm font-semibold text-brand-strong hover:underline sm:inline-flex"
          >
            Lihat semua →
          </Link>
        </div>

        {categories.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {highlightCategories.map((category) => (
              <Link
                key={category.id}
                href={`/cari?category=${category.id}`}
                className="rounded-full border border-line bg-surface px-4 py-2 text-sm font-semibold text-ink-soft shadow-2xs transition-all hover:border-brand/40 hover:bg-brand-soft/40 hover:text-brand-strong"
              >
                {category.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {/* 3. RECENT FOUND ITEMS */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Barang temuan terbaru
            </h2>
            <p className="mt-1 text-sm text-muted">
              Mungkin salah satu dari ini barangmu — buka detail untuk
              mengajukan klaim.
            </p>
          </div>
          <Link
            href="/cari?type=FOUND"
            className="hidden shrink-0 text-sm font-semibold text-brand-strong hover:underline sm:inline-flex"
          >
            Semua temuan →
          </Link>
        </div>

        {recent.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {recent.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center text-sm text-muted">
            Belum ada barang temuan yang tayang. Laporan baru akan tampil di
            sini setelah diverifikasi admin.
          </p>
        )}
      </section>

      {/* 4. RECENT LOST ITEMS */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Laporan kehilangan terbaru
            </h2>
            <p className="mt-1 text-sm text-muted">
              Sambil melintas di area kampus, jaga mata kalau kamu melihat
              barang ini — pelapor mengharapkan bantuanmu.
            </p>
          </div>
          <Link
            href="/cari?type=LOST"
            className="hidden shrink-0 text-sm font-semibold text-brand-strong hover:underline sm:inline-flex"
          >
            Semua laporan hilang →
          </Link>
        </div>

        {recentLost.length ? (
          <div className="mt-4 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {recentLost.map((report) => (
              <ReportCard key={report.id} report={report} />
            ))}
          </div>
        ) : (
          <p className="mt-4 rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/60 px-6 py-10 text-center text-sm text-muted">
            Belum ada laporan kehilangan yang tayang.
          </p>
        )}
      </section>

      {/* 5. HOW IT WORKS */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
              Cara kerjanya
            </h2>
            <p className="mt-1 text-sm text-muted">
              Empat langkah dari laporan sampai barang kembali.
            </p>
          </div>
          <Link
            href="/cara-kerja"
            className="hidden shrink-0 text-sm font-semibold text-brand-strong hover:underline sm:inline-flex"
          >
            Panduan lengkap →
          </Link>
        </div>

        <div className="mt-4 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <Link
              key={step.title}
              href={step.href}
              className="group flex flex-col rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:border-brand/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-soft text-brand-strong">
                <step.icon className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                Langkah {index + 1}
              </p>
              <h3 className="mt-1 text-lg font-bold text-ink group-hover:text-brand-strong">
                {step.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">
                {step.description}
              </p>
              <span className="mt-4 text-sm font-semibold text-brand-strong">
                {step.cta} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. SAFETY & FAQ */}
      <section className="mt-10 grid gap-4 lg:grid-cols-5 lg:items-start">
        {/* 1. CARD KEAMANAN & PRIVASI */}
        <div className="relative overflow-hidden rounded-3xl border border-brand/20 bg-brand p-6 sm:p-8 text-on-brand shadow-sm lg:col-span-2">
          {/* Decorative Background Radial Glow */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />

          <div className="flex items-center gap-2.5 text-base font-bold">
            <ShieldCheck
              className="h-6 w-6 shrink-0 text-white"
              aria-hidden="true"
            />
            <span>Keamanan & Privasi</span>
          </div>

          <ul className="mt-5 space-y-3 text-xs sm:text-sm leading-relaxed text-white/90">
            {safetyNotes.map((note) => (
              <li key={note} className="flex items-start gap-2.5">
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-white/80 mt-0.5"
                  aria-hidden="true"
                />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 2. CARD PERTANYAAN UMUM (FAQ) */}
        <div className="rounded-3xl border border-line bg-surface p-6 sm:p-8 shadow-sm lg:col-span-3">
          <h2 className="text-xl font-bold tracking-tight text-ink sm:text-2xl">
            Pertanyaan Umum
          </h2>

          <div className="mt-4 divide-y divide-line/60">
            {faqs.map((faq) => (
              <details
                key={faq.q}
                className="group py-3.5 first:pt-2 last:pb-0"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-xs sm:text-sm font-semibold text-ink transition-colors group-hover:text-brand [&::-webkit-details-marker]:hidden">
                  <span>{faq.q}</span>
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-muted transition-transform duration-300 group-open:rotate-180 group-open:bg-brand/10 group-open:text-brand">
                    <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                </summary>
                <p className="mt-2.5 text-xs sm:text-sm leading-relaxed text-muted pr-4">
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {/* 6. FINAL CTA */}
      <section className="mt-10 overflow-hidden rounded-[var(--radius-card)] border border-line bg-gradient-to-r from-brand-soft/40 to-surface p-6 shadow-sm sm:p-10">
        <h2 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
          Setiap barang pantas pulang.
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
          Punya barang hilang atau menemukan barang di kampus? Laporkan sekarang
          — admin kampus akan menverifikasi dan menghubungkan barangnya dengan
          pemiliknya.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/laporkan"
            className={buttonVariants({
              size: "lg",
              className: "rounded-full font-semibold",
            })}
          >
            Mulai laporan
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/cara-kerja"
            className={buttonVariants({
              variant: "secondary",
              size: "lg",
              className: "rounded-full font-semibold",
            })}
          >
            Pahami prosesnya
          </Link>
        </div>
      </section>
    </div>
  );
}
