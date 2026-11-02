import type { Metadata } from "next";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/actions/dashboard";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireUser } from "@/lib/auth";
import { getNotifications } from "@/lib/data/notifications";
import { formatDateTime, formatRelative } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Notifikasi",
};

export default async function NotificationsPage() {
  const session = await requireUser("/dashboard/notifikasi");
  const notifications = await getNotifications(session.authUser.id);
  const unread = notifications.filter((item) => !item.read_at).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Notifikasi"
        title="Pembaruan aktivitas"
        description="Informasi perubahan status laporan, klaim, dan penyerahan barang."
        action={
          unread > 0 ? (
            <form action={markAllNotificationsReadAction}>
              <Button type="submit" variant="secondary" size="sm">
                <CheckCheck className="h-4 w-4" aria-hidden />
                Tandai semua dibaca
              </Button>
            </form>
          ) : null
        }
      />

      {notifications.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <ul className="divide-y divide-line">
            {notifications.map((notification) => {
              const isAdmin = session.profile?.role === "ADMIN";
              let href: string | null = null;

              if (notification.related_claim_id) {
                href = isAdmin
                  ? `/admin/klaim/${notification.related_claim_id}`
                  : `/dashboard/klaim/${notification.related_claim_id}`;
              } else if (notification.related_report_id) {
                if (notification.notification_type.startsWith("ADMIN_") && isAdmin) {
                  href = `/admin/laporan/${notification.related_report_id}`;
                } else if (
                  notification.notification_type.startsWith("REFERENCE_")
                ) {
                  // Notifikasi yang merujuk laporan penemuan: pemilik laporan
                  // kehilangan boleh membuka laporan (termasuk PENDING) lewat
                  // policy RLS 0011/0012.
                  href = `/laporan/${notification.related_report_id}`;
                } else {
                  href = `/dashboard/laporan/${notification.related_report_id}`;
                }
              }

              return (
                <li
                  key={notification.id}
                  className={`flex flex-wrap items-start justify-between gap-3 px-5 py-4 ${
                    notification.read_at ? "" : "bg-accent-soft/25"
                  }`}
                >
                  <div className="flex min-w-0 gap-3">
                    <span
                      className={`mt-2 h-2 w-2 shrink-0 rounded-full ${
                        notification.read_at ? "bg-line-strong" : "bg-accent"
                      }`}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-ink">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatRelative(notification.created_at)} ·{" "}
                        {formatDateTime(notification.created_at)}
                      </p>
                      {href ? (
                        <Link
                          href={href}
                          className="mt-1.5 inline-block text-xs font-semibold text-brand hover:underline"
                        >
                          Lihat detail
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {!notification.read_at ? (
                    <form action={markNotificationReadAction}>
                      <input
                        type="hidden"
                        name="notification_id"
                        value={notification.id}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        Tandai dibaca
                      </Button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={Bell}
          title="Belum ada notifikasi"
          description="Pembaruan status laporan dan klaim akan muncul di sini."
        />
      )}
    </div>
  );
}
