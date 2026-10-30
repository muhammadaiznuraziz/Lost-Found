import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowUpRight, LogOut } from "lucide-react";
import { logout } from "@/app/actions/auth";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/ui/logo";
import { SideNav } from "./side-nav";
import { UserMenu } from "./user-menu";
import type { Profile } from "@/types";

export function AppShell({
  profile,
  items,
  children,
  label,
}: {
  profile: Profile;
  items: { href: string; label: string; icon: string }[];
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="min-h-svh bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md lg:hidden">
        <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg px-2 py-1 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              Beranda
            </Link>
            <UserMenu
              name={profile.full_name}
              email={profile.email}
              role={profile.role}
              avatarUrl={profile.avatar_url}
            />
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-6 space-y-5">
            <Logo />

            <div className="rounded-[var(--radius-card)] border border-line bg-surface p-3">
              <div className="flex items-center gap-2.5">
                <Avatar
                  name={profile.full_name}
                  src={profile.avatar_url}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">
                    {profile.full_name}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {profile.email}
                  </p>
                </div>
              </div>
              <div className="mt-2.5 flex items-center gap-2">
                <Badge tone={profile.role === "ADMIN" ? "accent" : "brand"}>
                  {label}
                </Badge>
              </div>
            </div>

            <SideNav items={items} />

            <div className="space-y-1 border-t border-line pt-4">
              <Link
                href="/"
                className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium text-ink-soft hover:bg-surface-2 hover:text-ink"
              >
                <ArrowUpRight className="h-4 w-4" aria-hidden />
                Kembali ke situs
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm font-medium text-danger hover:bg-danger-soft"
                >
                  <LogOut className="h-4 w-4" aria-hidden />
                  Keluar
                </button>
              </form>
            </div>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="mb-5 lg:hidden">
            <SideNav items={items} variant="horizontal" />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
