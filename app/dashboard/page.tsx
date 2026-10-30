import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  KeyRound,
  PackageOpen,
  PackageSearch,
  Plus,
  Search,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { requireUser } from "@/lib/auth";
import {
  getStudentStats,
  getUserReports,
} from "@/lib/data/reports";
import { getNotifications } from "@/lib/data/notifications";
import { formatDate, formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard",
};

export default async function DashboardPage() {
  const session = await requireUser("/dashboard");
  const userId = session.authUser.id;
  const profile = session.profile;

  const [stats, reports, notifications] = await Promise.all([
    getStudentStats(userId),
    getUserReports(userId),
    getNotifications(userId, 5),
  ]);

  const recentReports = reports.slice(0, 4);
  const firstName = profile?.full_name.split(" ")[0] ?? "Kawan";

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan"
        title={`Halo, ${firstName}`}
        description="Pantau laporan, klaim, dan notifikasi terbaru dari satu tempat."
        action={
          <Link
            href="/laporkan"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="h-4 w-4" aria-hidden />
            Laporan baru
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Barang hilang"
          value={stats.lost}
          icon={PackageSearch}
          tone="danger"
          hint="Laporan kehilangan milikmu"
        />
        <StatCard
          label="Barang temuan"
          value={stats.found}
          icon={PackageOpen}
          hint="Laporan temuan milikmu"
        />
        <StatCard
          label="Klaim aktif"
          value={stats.activeClaims}
          icon={KeyRound}
          tone="info"
          hint="Menunggu atau sedang diperiksa"
        />
        <StatCard
          label="Notifikasi baru"
          value={stats.unreadNotifications}
          icon={Bell}
          tone="accent"
          hint="Belum kamu baca"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">
                Laporan terbaru
              </h2>
              <p className="text-xs text-muted">
                Status dan aktivitas laporan milikmu
              </p>
            </div>
            <Link
              href="/dashboard/laporan"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Semua
            </Link>
          </div>

          {recentReports.length > 0 ? (
            <ul className="divide-y divide-line">
              {recentReports.map((report) => {
                const displayStatus =
                  report.item_report_status?.[0]?.display_status;

                return (
                  <li key={report.id}>
                    <Link
                      href={`/dashboard/laporan/${report.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-surface-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-ink">
                          {report.item_name}
                        </p>
                        <p className="mt-0.5 text-xs text-muted">
                          {report.report_number} ·{" "}
                          {formatDate(report.date_occurred)}
                        </p>
                      </div>
                      <StatusBadge
                        kind="item"
                        status={displayStatus ?? report.report_status}
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-10">
              <EmptyState
                icon={PackageOpen}
                title="Belum ada laporan"
                description="Mulai dengan melaporkan barang hilang atau barang temuan."
                action={
                  <Link
                    href="/laporkan"
                    className={buttonVariants({ size: "sm" })}
                  >
                    Buat laporan
                  </Link>
                }
                className="border-0 bg-transparent py-0"
              />
            </div>
          )}

          <div className="border-t border-line px-5 py-3">
            <Link
              href="/cari"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              <Search className="h-4 w-4" aria-hidden />
              Cari barang temuan
            </Link>
          </div>
        </section>

        <section className="rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div>
              <h2 className="text-sm font-semibold text-ink">Notifikasi</h2>
              <p className="text-xs text-muted">Pembaruan terakhir</p>
            </div>
            <Link
              href="/dashboard/notifikasi"
              className="text-sm font-semibold text-brand hover:underline"
            >
              Semua
            </Link>
          </div>

          {notifications.length > 0 ? (
            <ul className="divide-y divide-line">
              {notifications.map((notification) => (
                <li key={notification.id} className="px-5 py-3.5">
                  <div className="flex items-start gap-2">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        notification.read_at ? "bg-line-strong" : "bg-accent"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted">
                        {formatRelative(notification.created_at)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-5 py-10 text-center text-sm text-muted">
              Belum ada notifikasi.
            </p>
          )}

          <div className="border-t border-line px-5 py-3">
            <Link
              href="/dashboard/klaim"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline"
            >
              Lihat klaim saya
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </section>
      </div>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          {
            href: "/laporkan/baru?type=LOST",
            title: "Laporkan kehilangan",
            body: "Buat laporan barangmu yang hilang.",
          },
          {
            href: "/laporkan/baru?type=FOUND",
            title: "Laporkan temuan",
            body: "Catat barang yang kamu temukan.",
          },
          {
            href: "/cari",
            title: "Cari barang",
            body: "Telusuri laporan yang sudah tayang.",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group rounded-[var(--radius-card)] border border-line bg-surface p-4 transition-colors hover:border-brand/40 hover:bg-brand-soft/30"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-ink">{item.title}</p>
              <ArrowRight
                className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand"
                aria-hidden
              />
            </div>
            <p className="mt-1 text-xs text-muted">{item.body}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}
