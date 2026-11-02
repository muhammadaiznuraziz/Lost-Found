import type { Metadata } from "next";
import Link from "next/link";
import { Handshake, MapPin } from "lucide-react";
import { completeHandoverAction } from "@/app/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminHandovers } from "@/lib/data/admin";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pengembalian Barang",
};

const statuses = [
  { value: "SCHEDULED", label: "Dijadwalkan" },
  { value: "COMPLETED", label: "Selesai" },
  { value: "CANCELLED", label: "Dibatalkan" },
] as const;

export default async function AdminHandoversPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string; error?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.some((item) => item.value === query.status)
    ? query.status
    : undefined;
  const handovers = await getAdminHandovers({ status });

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Pengembalian barang"
        description="Konfirmasi penyerahan barang kepada pemilik setelah klaim disetujui."
      />

      {query.message ? <Alert tone="success">{query.message}</Alert> : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/pengembalian"
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
            !status
              ? "border-brand bg-brand text-white"
              : "border-line bg-surface text-ink-soft hover:border-brand/40",
          )}
        >
          Semua
        </Link>
        {statuses.map((item) => (
          <Link
            key={item.value}
            href={`/admin/pengembalian?status=${item.value}`}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              status === item.value
                ? "border-brand bg-brand text-white"
                : "border-line bg-surface text-ink-soft hover:border-brand/40",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>

      {handovers.length > 0 ? (
        <ul className="space-y-3">
          {handovers.map(({ handover, report, claim, claimant }) => (
            <li
              key={handover.id}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">
                    {report?.item_name ?? "Barang"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {report?.report_number ?? "-"} ·{" "}
                    {claim?.claim_number ?? "Serah terima luar aplikasi"} ·{" "}
                    {claimant?.full_name ?? handover.received_by ?? "Pengguna"}
                  </p>
                </div>
                <StatusBadge
                  kind="handover"
                  status={handover.handover_status}
                />
              </div>

              <div className="mt-3 grid gap-2 text-sm text-ink-soft sm:grid-cols-2">
                <p className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted" aria-hidden />
                  {handover.handover_location}
                </p>
                <p>Jadwal: {formatDateTime(handover.scheduled_at)}</p>
                {handover.completed_at ? (
                  <p>Selesai: {formatDateTime(handover.completed_at)}</p>
                ) : null}
                {handover.confirmation_notes ? (
                  <p className="text-xs text-muted sm:col-span-2">
                    Catatan: {handover.confirmation_notes}
                  </p>
                ) : null}
              </div>

              {handover.handover_status === "SCHEDULED" ? (
                <form
                  action={completeHandoverAction}
                  className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4"
                >
                  <input
                    type="hidden"
                    name="handover_id"
                    value={handover.id}
                  />
                  <input
                    type="hidden"
                    name="claim_id"
                    value={handover.claim_id ?? ""}
                  />
                  <Input
                    name="notes"
                    placeholder="Catatan serah terima (opsional)"
                    className="min-w-0 flex-1 sm:max-w-sm"
                  />
                  <Button type="submit" size="sm">
                    Konfirmasi selesai
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Handshake}
          title="Belum ada penyerahan"
          description="Jadwalkan penyerahan dari halaman detail klaim yang sudah disetujui."
        />
      )}
    </div>
  );
}
