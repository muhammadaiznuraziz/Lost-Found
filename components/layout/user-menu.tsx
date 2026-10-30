"use client";

import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck, User } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { logout } from "@/app/actions/auth";

export function UserMenu({
  name,
  email,
  role,
  avatarUrl,
}: {
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN";
  avatarUrl?: string | null;
}) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-2 rounded-full border border-line-strong bg-surface py-1 pl-1 pr-2.5 transition-colors hover:bg-surface-2 [&::-webkit-details-marker]:hidden">
        <Avatar name={name} src={avatarUrl} size="sm" />
        <span className="hidden max-w-28 truncate text-sm font-medium text-ink sm:block">
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          className="h-4 w-4 text-muted transition-transform group-open:rotate-180"
          aria-hidden
        />
      </summary>
      <div className="absolute right-0 top-[calc(100%+0.5rem)] w-60 overflow-hidden rounded-2xl border border-line bg-surface shadow-[var(--shadow-lift)]">
        <div className="border-b border-line px-4 py-3">
          <p className="truncate text-sm font-semibold text-ink">{name}</p>
          <p className="truncate text-xs text-muted">{email}</p>
        </div>
        <nav className="p-1.5">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <LayoutDashboard className="h-4 w-4" aria-hidden />
            Dashboard Saya
          </Link>
          <Link
            href="/dashboard/profil"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
          >
            <User className="h-4 w-4" aria-hidden />
            Profil
          </Link>
          {role === "ADMIN" ? (
            <Link
              href="/admin"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-ink-soft hover:bg-surface-2 hover:text-ink"
            >
              <ShieldCheck className="h-4 w-4" aria-hidden />
              Admin Dashboard
            </Link>
          ) : null}
          <form action={logout}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-danger hover:bg-danger-soft"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Keluar
            </button>
          </form>
        </nav>
      </div>
    </details>
  );
}
