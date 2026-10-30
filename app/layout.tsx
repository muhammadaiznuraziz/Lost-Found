import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Inisialisasi Font Plus Jakarta Sans dengan benar
const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Lost&Found — Barang hilang kampus, kembali ke pemiliknya",
    template: "%s · Lost&Found",
  },
  description:
    "Platform terpusat untuk melaporkan, mencari, mengklaim, dan mengembalikan barang hilang di lingkungan kampus.",
  applicationName: "Lost&Found",
  keywords: ["barang hilang", "barang temuan", "kampus", "lost and found"],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="flex min-h-dvh flex-col font-sans bg-surface text-ink">
        {children}
      </body>
    </html>
  );
}
