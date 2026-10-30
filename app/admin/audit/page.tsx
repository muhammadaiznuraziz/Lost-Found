import type { Metadata } from "next";
import { History } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminAuditLogs } from "@/lib/data/admin";
import { formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Audit Trail",
};

const actionLabels: Record<string, string> = {
  REPORT_CREATED: "Laporan dibuat",
  REPORT_STATUS_CHANGED: "Status laporan diubah",
  CLAIM_CREATED: "Klaim dibuat",
  CLAIM_STATUS_CHANGED: "Status klaim diubah",
  HANDOVER_SCHEDULED: "Penyerahan dijadwalkan",
  HANDOVER_COMPLETED: "Penyerahan selesai",
  FLAG_CREATED: "Laporan ditandai",
  FLAG_REVIEWED: "Flag ditinjau",
  FLAG_DISMISSED: "Flag diabaikan",
  PROFILE_ROLE_CHANGED: "Peran pengguna diubah",
};

export default async function AdminAuditPage() {
  const logs = await getAdminAuditLogs(150);

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Audit trail"
        description="Jejak aktivitas penting pada laporan, klaim, penyerahan, dan peran pengguna."
      />

      {logs.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="hidden grid-cols-[1fr_1.1fr_1.4fr_0.9fr] gap-3 border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
            <span>Waktu</span>
            <span>Aktor</span>
            <span>Aksi</span>
            <span>Entitas</span>
          </div>
          <ul className="divide-y divide-line">
            {logs.map(({ log, actor }) => (
              <li
                key={log.id}
                className="grid gap-1 px-5 py-3 text-sm md:grid-cols-[1fr_1.1fr_1.4fr_0.9fr] md:items-center md:gap-3"
              >
                <span className="text-xs text-muted">
                  {formatDateTime(log.created_at)}
                </span>
                <span className="truncate text-xs text-ink-soft">
                  {actor?.full_name ?? "Sistem"}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-ink">
                    {actionLabels[log.action] ?? log.action}
                  </p>
                  {log.reason ? (
                    <p className="mt-0.5 line-clamp-1 text-xs text-muted">
                      {log.reason}
                    </p>
                  ) : null}
                </div>
                <span className="truncate text-xs text-muted">
                  {log.entity_type}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={History}
          title="Belum ada aktivitas"
          description="Audit trail akan terisi setelah ada perubahan status atau keputusan admin."
        />
      )}
    </div>
  );
}
