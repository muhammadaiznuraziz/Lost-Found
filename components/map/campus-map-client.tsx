"use client";

import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";
import type { CampusLocation } from "@/types";

const CampusMap = dynamic(() => import("./campus-map"), {
  ssr: false,
  loading: () => (
    <div className="dot-grid flex h-[520px] w-full flex-col items-center justify-center gap-2 text-muted">
      <MapPinned className="h-8 w-8" aria-hidden />
      <p className="text-sm">Memuat peta kampus...</p>
    </div>
  ),
});

export function CampusMapClient({
  locations,
}: {
  locations: CampusLocation[];
}) {
  return <CampusMap locations={locations} />;
}
