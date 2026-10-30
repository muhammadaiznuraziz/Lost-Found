import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, ShieldCheck, ArrowUpRight } from "lucide-react";
import { APP_TAGLINE, CAMPUS_NAME, NAV_LINKS } from "@/lib/constants";

// Inline SVG Icon untuk Instagram (karena Lucide tidak menyediakan brand icons)
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

export function SiteFooter() {
  return (
    <footer className="w-full bg-paper p-4 md:p-8">
      {/* MAIN AWWWARDS-STYLE FOOTER CONTAINER */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-brand px-6 py-10 text-white shadow-2xl md:px-12 md:py-14">
        {/* TOP COLUMNS SECTION */}
        <div className="grid gap-10 md:grid-cols-3 md:gap-8">
          {/* COLUMN 1: Platform Overview */}
          <div className="flex flex-col items-start">
            <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-semi text-white/90 backdrop-blur-sm">
              tentang platform
            </span>
            <h3 className="text-xl font-extrabold leading-snug text-white md:text-2xl">
              Platform Lost &amp; Found Resmi {CAMPUS_NAME}.
            </h3>
            <p className="mt-2 text-sm text-white/80 leading-relaxed">
              {APP_TAGLINE}
            </p>
          </div>

          {/* COLUMN 2: Navigation Links */}
          <div className="flex flex-col items-start">
            <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-semi text-white/90 backdrop-blur-sm">
              jelajahi
            </span>
            <ul className="space-y-2 text-lg font-bold text-white">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="inline-flex items-center gap-1 transition-opacity hover:opacity-75"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight className="h-4 w-4 opacity-70" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: Contact & Support */}
          <div className="flex flex-col items-start">
            <span className="mb-4 inline-block rounded-full border border-white/25 bg-white/10 px-3.5 py-1 text-xs font-semi text-white/90 backdrop-blur-sm">
              pusat bantuan
            </span>

            <div className="space-y-3 text-sm font-semi text-white/90">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 shrink-0 text-amber-300" />
                Gedung Layanan Terpadu, Lt. 1
              </p>
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-amber-300" />
                <a
                  href="mailto:lostfound@kampus.ac.id"
                  className="underline decoration-white/40 underline-offset-4 hover:decoration-white"
                >
                  lostfound@kampus.ac.id
                </a>
              </p>
              <p className="flex items-center gap-2 text-xs font-medium text-white/70">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-300" />
                Bukti verifikasi klaim terenkripsi &amp; privat
              </p>
            </div>

            {/* Social Icons Row */}
            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram Kampus"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-transform active:scale-95 hover:bg-white hover:text-brand"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="mailto:lostfound@kampus.ac.id"
                aria-label="Email Helpdesk"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white transition-transform active:scale-95 hover:bg-white hover:text-brand"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* BOTTOM GIGANTIC WATERMARK & STICKER ACCENTS */}
        <div className="relative mt-12 pt-8 border-t border-white/15 flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Giant Typography / Logo Watermark Container */}
          <div className="relative w-full select-none py-2 flex justify-center md:justify-start">
            <Image
              src="/logo.svg"
              alt="Lost & Found Watermark"
              width={100}
              height={550}
              className="h-16 w-auto object-contain brightness-0 invert opacity-20 md:h-28 lg:h-36"
              priority
            />
          </div>

          {/* Copyright Tag */}
          <div className="shrink-0 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semi text-white/80 backdrop-blur-sm">
            © {new Date().getFullYear()} {CAMPUS_NAME}
          </div>
        </div>
      </div>
    </footer>
  );
}
