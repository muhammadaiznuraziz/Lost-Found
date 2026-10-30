import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { requireAdmin } from "@/lib/auth";
import { ADMIN_NAV } from "@/lib/constants";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireAdmin();

  return (
    <AppShell profile={session.profile!} items={ADMIN_NAV} label="Admin">
      {children}
    </AppShell>
  );
}
