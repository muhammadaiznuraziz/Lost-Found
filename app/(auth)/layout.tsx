import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-brand/10 via-surface to-surface lg:grid lg:grid-cols-2">
      {/* SISI KIRI (Desktop Banner - Sesuai gambar Anda) */}
      <div className="hidden lg:flex flex-col justify-between bg-brand p-12 text-on-brand relative overflow-hidden">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-on-brand/80 hover:text-on-brand transition-colors w-fit"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Beranda
        </Link>

        <div className="max-w-md space-y-4">
          <h2 className="text-3xl font-extrabold tracking-tight">
            Barang hilang punya jalan pulang.
          </h2>
          <p className="text-sm text-on-brand/80 leading-relaxed">
            Laporkan, telusuri, dan klaim barang dengan alur yang jelas dan
            terverifikasi.
          </p>

          <ul className="space-y-3 pt-4 text-xs font-medium text-on-brand/90">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              Setiap laporan diverifikasi admin sebelum tayang.
            </li>
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="h-4 w-4 shrink-0 text-accent" />
              Klaim wajib disertai bukti kepemilikan.
            </li>
          </ul>
        </div>

        <p className="text-xs text-on-brand/60">
          © {new Date().getFullYear()} Lost&Found Universitas Muhammadiyah
          Cirebon.
        </p>
      </div>

      {/* SISI KANAN (Form Panel) */}
      <div className="flex flex-col justify-center items-center min-h-screen lg:min-h-0 p-4 sm:p-8">
        {/* Navigation Back khusus Mobile */}
        <div className="w-full max-w-md mb-4 lg:hidden">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Beranda
          </Link>
        </div>

        {/* Card Form Pembungkus */}
        <div className="w-full max-w-md bg-surface rounded-[28px] sm:rounded-[32px] p-6 sm:p-8 shadow-xl border border-line/50">
          {children}
        </div>
      </div>
    </div>
  );
}
