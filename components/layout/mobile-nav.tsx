"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, Menu, Plus, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/constants";
import { Logo } from "@/components/ui/logo";
import { logout } from "@/app/actions/auth";

export function MobileNav({
  isLoggedIn,
  isAdmin,
}: {
  isLoggedIn: boolean;
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isHomePage = pathname === "/";

  const handleBack = () => {
    setOpen(false);
    router.back();
  };

  return (
    <div
      className={`fixed top-4 left-4 right-4 z-50 flex items-center pointer-events-none lg:hidden ${
        isHomePage ? "justify-end" : "justify-between"
      }`}
    >
      {/* Tombol Kembali (Sembunyi jika di Beranda) */}
      {!isHomePage && (
        <button
          type="button"
          onClick={handleBack}
          aria-label="Kembali ke halaman sebelumnya"
          className="pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand shadow-lg transition-transform active:scale-95"
        >
          <ArrowLeft className="h-6 w-6 stroke-[2.5]" />
        </button>
      )}

      {/* Group Kapsul Logo & Hamburger */}
      <div className="pointer-events-auto flex items-center gap-0">
        <div className="flex h-12 items-center justify-center rounded-full bg-surface px-8 shadow-lg backdrop-blur-md">
          <Logo />
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            aria-expanded={open}
            aria-controls="mobile-nav-panel"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-surface text-brand shadow-lg transition-transform active:scale-95"
          >
            {open ? (
              <X className="h-6 w-6 stroke-[2.5]" />
            ) : (
              <Menu className="h-6 w-6 stroke-[2.5]" />
            )}
          </button>

          {open && (
            <div
              id="mobile-nav-panel"
              className="absolute right-0 top-15 z-50 w-[220px] rounded-3xl bg-surface p-5 shadow-2xl"
            >
              <nav className="flex flex-col gap-3.5">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="text-base font-semibold text-brand transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </Link>
                ))}

                <Link
                  href="/laporkan"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand shadow-sm transition-transform hover:opacity-90 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[3]" aria-hidden />
                  Laporkan
                </Link>

                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      onClick={() => setOpen(false)}
                      className="text-base font-semibold text-brand transition-opacity hover:opacity-80"
                    >
                      Dashboard Saya
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setOpen(false)}
                        className="text-base font-semibold text-brand transition-opacity hover:opacity-80"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <form action={logout}>
                      <button
                        type="submit"
                        className="w-full text-left text-base font-semibold text-danger transition-opacity hover:opacity-80"
                      >
                        Keluar
                      </button>
                    </form>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="inline-flex items-center justify-center rounded-full bg-brand px-4 py-2 text-sm font-semibold text-on-brand shadow-sm transition-transform hover:opacity-90 active:scale-95"
                  >
                    Login
                  </Link>
                )}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
