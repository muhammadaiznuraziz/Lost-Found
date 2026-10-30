import Link from "next/link";
import { Plus } from "lucide-react";
import { getSessionUser } from "@/lib/auth";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import { MobileNav } from "./mobile-nav";
import { UserMenu } from "./user-menu";

export async function SiteHeader() {
  const session = await getSessionUser();
  const profile = session?.profile;

  return (
    <>
      {/* 1. DESKTOP FLOATING CAPSULE HEADER (Hanya Tampil di Layar Desktop lg:) */}
      <header className="fixed top-4 inset-x-0 z-40 hidden w-full justify-center px-8 lg:flex pointer-events-none">
        <div className="flex w-full max-w-7xl items-center justify-between gap-4">
          {/* KAPSUL 1: Logo Terpisah di Kiri (Wajib pointer-events-auto) */}
          <div className="pointer-events-auto flex h-12 items-center justify-center rounded-full bg-surface/90 px-6 shadow-lg backdrop-blur-md border border-line/30">
            <Logo />
          </div>

          {/* KAPSUL 2: Navigasi Links & Group Tombol Aksi */}
          <div className="pointer-events-auto flex h-12 items-center justify-between gap-8 rounded-full bg-surface/90 px-6 shadow-lg backdrop-blur-md border border-line/30">
            {/* Navigation Links */}
            <nav
              className="flex items-center gap-6"
              aria-label="Navigasi utama"
            >
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semi text-brand transition-opacity hover:opacity-80"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons Group: Menempel Rapi & Punya Separator/Gap Khusus di Kiri */}
            <div className="flex items-center gap-0 pl-4 border-l border-line/20">
              <Link
                href="/laporkan"
                className="inline-flex items-center gap-1.5 rounded-full bg-brand px-4 py-2 text-sm font-semi text-on-brand shadow-sm transition-transform hover:opacity-90 active:scale-95"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" aria-hidden />
                Laporkan
              </Link>

              {profile ? (
                <UserMenu
                  name={profile.full_name}
                  email={profile.email}
                  role={profile.role}
                  avatarUrl={profile.avatar_url}
                />
              ) : (
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semi text-on-brand shadow-sm transition-transform hover:opacity-90 active:scale-95"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. MOBILE FLOATING NAV (Hanya Tampil di Layar Mobile/Tablet < lg) */}
      <MobileNav
        isLoggedIn={Boolean(profile)}
        isAdmin={profile?.role === "ADMIN"}
      />
    </>
  );
}
