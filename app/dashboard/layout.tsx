import type { ReactNode } from "react";

export const dynamic = "force-dynamic";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { USER_NAV } from "@/lib/constants";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await requireUser("/dashboard");

  return (
    <AppShell
      profile={session.profile!}
      items={USER_NAV}
      label="Pengguna"
    >
      {children}
    </AppShell>
  );
}
