"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Flag,
  History,
  KeyRound,
  LayoutDashboard,
  PackageCheck,
  FileText,
  Users,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  layout: LayoutDashboard,
  report: FileText,
  claim: KeyRound,
  handover: PackageCheck,
  users: Users,
  flag: Flag,
  history: History,
  bell: Bell,
};

export function SideNav({
  items,
  variant = "vertical",
}: {
  items: { href: string; label: string; icon: string }[];
  variant?: "vertical" | "horizontal";
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi dasbor"
      className={cn(
        variant === "vertical"
          ? "space-y-1"
          : "flex gap-1 overflow-x-auto pb-1",
      )}
    >
      {items.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const isRoot = item.href === "/dashboard" || item.href === "/admin";
        const active =
          pathname === item.href ||
          (!isRoot && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-2.5 rounded-xl text-sm font-medium transition-colors",
              variant === "vertical" ? "px-3 py-2.5" : "shrink-0 px-3 py-2",
              active
                ? "bg-brand-soft text-brand-strong"
                : "text-ink-soft hover:bg-surface-2 hover:text-ink",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            <span className="whitespace-nowrap">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
