import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Navigation, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { CampusMapClient } from "@/components/map/campus-map-client";
import { getLocations } from "@/lib/data/reference";

export const metadata: Metadata = {
  title: "Peta Kampus UMC",
  description:
    "Lihat titik lokasi dan layanan penyerahan barang di lingkungan Universitas Muhammadiyah Cirebon.",
};

// Koordinat Pusat UMC Kampus 2 Watubelah Cirebon (-6.7533, 108.5135)
const DEFAULT_UMC_CENTER = {
  latitude: -6.7533,
  longitude: 108.5135,
};

export default async function CampusMapPage() {
  const locations = await getLocations();

  // Filter lokasi yang memiliki koordinat valid
  const withCoordinates = locations.filter(
    (location) => location.latitude !== null && location.longitude !== null,
  );

  return (
    <div className="mx-auto max-w-2xl lg:max-w-4xl xl:max-w-5xl px-4 pb-6 sm:pb-10 space-y-6">
      {/* 1. Header / Top Navigation Bar */}
      <header className="flex items-center justify-between pb-2">
        <div>
          <p className="text-xs font-semibold text-accent uppercase tracking-wider">
            Universitas Muhammadiyah Cirebon
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
            Peta Kampus UMC
          </h1>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface shadow-sm border border-line text-ink">
          <MapPin className="h-5 w-5 text-brand" />
        </span>
      </header>

      {/* 2. Hero Section: Map Canvas (Diikat dengan z-0 agar tidak menutupi navbar) */}
      <section className="relative z-0 overflow-hidden rounded-[24px] sm:rounded-[28px] lg:rounded-[32px] border border-line bg-surface shadow-md">
        <div className="relative h-[280px] sm:h-[380px] md:h-[440px] lg:h-[500px] xl:h-[560px] w-full overflow-hidden">
          <CampusMapClient
            locations={withCoordinates}
            defaultCenter={DEFAULT_UMC_CENTER}
            defaultZoom={17}
          />

          {/* Floating Pill Label Lokasi UMC */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-10 flex items-center gap-2 rounded-full bg-surface/90 px-3 py-1.5 sm:px-4 sm:py-2 text-[11px] sm:text-xs font-semibold text-ink shadow-lg backdrop-blur-md border border-line/50">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Kampus 2 UMC Watubelah, Cirebon</span>
          </div>
        </div>
      </section>

      {/* 3. Filter / Category Pills */}
      <section className="space-y-4 pt-2">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-ink tracking-tight">
            Titik Lokasi & Layanan
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-muted leading-relaxed">
            Gunakan peta untuk mengenali area gedung dan titik penyerahan barang
            di lingkungan UMC.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <span className="rounded-full bg-surface border border-line px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs">
            Gedung Rektorat
          </span>
          <span className="rounded-full bg-surface border border-line px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs">
            Fakultas Teknik (FT)
          </span>
          <span className="rounded-full bg-surface border border-line px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs">
            Perpustakaan Pusat
          </span>
          <span className="rounded-full bg-surface border border-line px-3.5 py-1.5 text-xs font-medium text-ink shadow-xs">
            Pos Satpam
          </span>
        </div>
      </section>

      {/* 4. Daftar Lokasi UMC */}
      <section className="space-y-3 pt-2">
        <h3 className="text-xs sm:text-sm font-semibold text-muted uppercase tracking-wider">
          Daftar Gedung & Area UMC
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {locations.map((location) => (
            <div
              key={location.id}
              className="group flex items-center justify-between rounded-2xl border border-line bg-surface p-3.5 sm:p-4 transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-strong">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-ink">
                    {location.name}
                  </h4>
                  {location.building && (
                    <p className="text-[11px] sm:text-xs text-muted mt-0.5">
                      {location.building}
                    </p>
                  )}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5" />
            </div>
          ))}

          {locations.length === 0 && (
            <div className="col-span-full rounded-2xl border border-dashed border-line p-6 text-center text-xs sm:text-sm text-muted">
              Belum ada lokasi spesifik terdaftar di database.
            </div>
          )}
        </div>
      </section>

      {/* 5. CTA Card Layanan Terpadu */}
      <section className="rounded-[20px] sm:rounded-[24px] border border-brand/20 bg-brand-soft/40 p-4 sm:p-5 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full bg-brand-strong text-white">
            <Navigation className="h-4 w-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs sm:text-sm font-semibold text-ink">
              Menemukan Barang di Kampus?
            </h4>
            <p className="text-[11px] sm:text-xs leading-relaxed text-muted">
              Serahkan ke pos satpam terdekat atau Sekretariat BEM / Layanan
              Kemahasiswaan UMC.
            </p>
          </div>
        </div>
        <Link
          href="/laporkan?type=FOUND"
          className={buttonVariants({
            size: "sm",
            className:
              "mt-3 sm:mt-4 w-full rounded-full bg-brand text-on-brand hover:opacity-90 font-semibold shadow-sm text-xs sm:text-sm",
          })}
        >
          Laporkan barang temuan
        </Link>
      </section>
    </div>
  );
}
