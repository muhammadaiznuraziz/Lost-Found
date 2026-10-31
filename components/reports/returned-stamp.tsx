import { CheckCheck } from "lucide-react";

/** True jika laporan sudah kembali ke pemiliknya (display_status dari item_report_status view). */
export function isReturnedStatus(displayStatus?: string | null) {
  return displayStatus === "Dikembalikan";
}

/**
 * Stempel "SUDAH KEMBALI KE PEMILIK" gaya cap karet (miring, bingkai ganda).
 * Dipasang sebagai overlay di atas foto barang yang sudah kembali.
 * Gunakan `compact` untuk thumbnail berukuran kecil.
 */
export function ReturnedStamp({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <div className="pointer-events-none select-none" role="presentation">
      <div
        className={`-rotate-[8deg] flex items-center shadow-lg backdrop-blur-[2px] ${
          compact
            ? "gap-1.5 rounded-md border border-brand-strong/60 bg-brand-strong/10 px-2 py-1"
            : "gap-2.5 rounded-xl border-2 border-brand-strong/60 bg-brand-strong/10 px-3.5 py-2 sm:gap-3 sm:px-5 sm:py-3"
        }`}
      >
        <span
          className={`rounded lg:border lg:border-brand-strong/40 ${
            compact ? "" : "p-1.5 sm:p-2"
          }`}
        >
          <CheckCheck
            className={`text-brand-strong ${
              compact ? "h-3.5 w-3.5" : "h-4 w-4 sm:h-5 sm:w-5"
            }`}
            strokeWidth={2.75}
            aria-hidden="true"
          />
        </span>
        <span className="leading-tight">
          <span
            className={`block font-extrabold uppercase text-brand-strong ${
              compact
                ? "text-[9px] tracking-[0.14em]"
                : "text-xs tracking-[0.18em] sm:text-sm"
            }`}
          >
            Sudah Kembali
          </span>
          <span
            className={`block font-bold uppercase text-brand-strong/80 ${
              compact
                ? "text-[9px] tracking-[0.2em]"
                : "text-[9px] tracking-[0.28em] sm:text-[10px]"
            }`}
          >
            ke pemiliknya
          </span>
        </span>
      </div>
    </div>
  );
}

/** Overlay stempel yang diposisikan di tengah kontainer foto (kontainer harus `relative`). */
export function ReturnedStampOverlay({ compact = false }: { compact?: boolean }) {
  return (
    <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
      <ReturnedStamp compact={compact} />
    </div>
  );
}
