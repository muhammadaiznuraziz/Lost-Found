import type { Metadata } from "next";
import Link from "next/link";
import { KeyRound } from "lucide-react";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk | Lost&Found UMC",
  description: "Masuk ke akun Lost&Found Universitas Muhammadiyah Cirebon.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <div className="w-full space-y-6">
      {/* Header Form */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Selamat Datang
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Masuk dengan akun kampus untuk melaporkan barang, memantau klaim, dan
          mengatur penyerahan.
        </p>
      </div>

      {/* Form Login Client */}
      <LoginForm next={next} />

      {/* Footer Link */}
      <p className="pt-2 text-center text-xs sm:text-sm text-muted border-t border-line/40">
        Belum punya akun?{" "}
        <Link
          href="/registrasi"
          className="font-bold text-brand hover:underline underline-offset-4"
        >
          Daftar Sekarang
        </Link>
      </p>
    </div>
  );
}
