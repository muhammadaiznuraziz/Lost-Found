import type { Metadata } from "next";
import Link from "next/link";
import { Flag, ShieldAlert } from "lucide-react";
import { resolveFlagAction } from "@/app/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Input, Select } from "@/components/ui/field";
import { StatusBadge } from "@/components/ui/status-badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { getAdminFlags } from "@/lib/data/admin";
import { cn, formatDateTime } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Laporan Mencurigakan",
};

const statuses = [
  { value: "OPEN", label: "Terbuka" },
  { value: "REVIEWED", label: "Sudah Ditinjau" },
  { value: "DISMISSED", label: "Diabaikan" },
] as const;

export default async function AdminFlagsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; message?: string; error?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.some((item) => item.value === query.status)
    ? query.status
    : undefined;
  const flags = await getAdminFlags();
  const filtered = status
    ? flags.filter((item) => item.flag.flag_status === status)
    : flags;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Laporan mencurigakan"
        description="Tinjau laporan pengguna tentang barang atau aktivitas yang mencurigakan."
      />

      {query.message ? <Alert tone="success">{query.message}</Alert> : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/admin/mencurigakan"
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
            href={`/admin/mencurigakan?status=${item.value}`}
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

      {filtered.length > 0 ? (
        <ul className="space-y-3">
          {filtered.map(({ flag, report, reporter }) => (
            <li
              key={flag.id}
              className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <ShieldAlert
                      className="h-4 w-4 text-danger"
                      aria-hidden
                    />
                    {report?.item_name ?? "Laporan"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted">
                    {report?.report_number ?? "-"} · dilaporkan oleh{" "}
                    {reporter?.full_name ?? "pengguna"} ·{" "}
                    {formatDateTime(flag.created_at)}
                  </p>
                </div>
                <StatusBadge kind="flag" status={flag.flag_status} />
              </div>

              <p className="mt-3 whitespace-pre-line text-sm text-ink-soft">
                {flag.reason}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                {report ? (
                  <Link
                    href={`/admin/laporan/${report.id}`}
                    className="font-semibold text-brand hover:underline"
                  >
                    Tinjau laporan
                  </Link>
                ) : null}

              </div>

              {flag.flag_status === "OPEN" ? (
                <form
                  action={resolveFlagAction}
                  className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4"
                >
                  <input type="hidden" name="flag_id" value={flag.id} />
                  <Select
                    name="status"
                    defaultValue="REVIEWED"
                    className="h-9 w-auto py-1 text-xs"
                    aria-label="Keputusan flag"
                  >
                    <option value="REVIEWED">Sudah ditinjau</option>
                    <option value="DISMISSED">Abaikan</option>
                  </Select>
                  <Input
                    name="note"
                    placeholder="Catatan tindak lanjut (opsional)"
                    className="min-w-0 flex-1 sm:max-w-sm"
                  />
                  <Button type="submit" size="sm">
                    Simpan
                  </Button>
                </form>
              ) : null}
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon={Flag}
          title="Tidak ada flag"
          description="Belum ada laporan mencurigakan yang cocok dengan filter ini."
        />
      )}
    </div>
  );
}
