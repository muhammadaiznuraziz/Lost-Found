import Link from "next/link";
import { ArrowUpRight, CalendarDays, MapPin, PackageOpen } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import { formatDate } from "@/lib/utils";
import {
  ReturnedStampOverlay,
  isReturnedStatus,
} from "./returned-stamp";
import type { ReportWithRelations } from "@/types";

export function ReportCard({ report }: { report: ReportWithRelations }) {
  const photo =
    report.report_photos?.find((item) => item.is_primary) ??
    report.report_photos?.[0];
  const photoUrl = publicPhotoUrl(photo?.storage_path);
  const displayStatus = report.item_report_status?.[0]?.display_status;
  const returned = isReturnedStatus(displayStatus);

  return (
    <Link
      href={`/laporan/${report.id}`}
      className="group flex flex-col gap-3 rounded-[28px] border border-line bg-surface p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
    >
      {/* 1. INFORMASI BARANG (Di ATAS foto) */}
      <div className="space-y-2">
        {/* Judul Barang (Memakai baris sendiri agar teks panjang lega) */}
        <h3 className="line-clamp-1 text-base font-bold text-ink group-hover:text-brand transition-colors">
          {report.item_name}
        </h3>

        {/* Baris Badge Status (Ditaruh di bawah judul) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusBadge kind="type" status={report.report_type} />
          <StatusBadge
            kind="item"
            status={displayStatus ?? report.report_status}
          />
        </div>

        {/* Lokasi & Tanggal Kejadian */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 pt-0.5 text-xs text-muted">
          <span className="flex items-center gap-1">
            <MapPin
              className="h-3.5 w-3.5 text-accent shrink-0"
              aria-hidden="true"
            />
            <span className="truncate max-w-[150px]">
              {report.campus_locations?.name ?? "Lokasi tidak diketahui"}
            </span>
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays
              className="h-3.5 w-3.5 text-muted shrink-0"
              aria-hidden="true"
            />
            <span>{formatDate(report.date_occurred)}</span>
          </span>
        </div>
      </div>

      {/* 2. KONTAINER FOTO (Di BAHWAH informasi) */}
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-surface-2">
        {photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={photo?.alt_text ?? report.item_name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              returned ? "grayscale opacity-70" : ""
            }`}
            loading="lazy"
          />
        ) : (
          <div
            className={`dot-grid flex h-full w-full items-center justify-center ${
              returned ? "opacity-60" : ""
            }`}
          >
            <PackageOpen
              className="h-10 w-10 text-muted/60"
              strokeWidth={1.25}
              aria-hidden="true"
            />
          </div>
        )}

        {/* Stempel "Sudah Kembali ke Pemilik" untuk barang yang sudah kembali */}
        {returned && <ReturnedStampOverlay />}

        {/* Tombol Floating Action (Detail ↗) */}
        <div className="absolute bottom-3 right-3 flex items-center">
          <span className="inline-flex h-9 items-center justify-center rounded-full bg-white/90 px-4 text-xs font-semibold text-blue-600 shadow-sm backdrop-blur-md transition-all group-hover:bg-white group-hover:text-blue-700">
            Detail
          </span>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-blue-600 shadow-sm backdrop-blur-md transition-all group-hover:bg-white group-hover:text-blue-700">
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
      </div>
    </Link>
  );
}
