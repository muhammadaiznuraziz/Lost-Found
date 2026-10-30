import type { Metadata } from "next";
import Link from "next/link";
import { UserPlus } from "lucide-react";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Daftar | Lost&Found UMC",
  description: "Buat akun Lost&Found Universitas Muhammadiyah Cirebon.",
};

export default function RegisterPage() {
  return (
    <div className="w-full space-y-6">
      {/* Header Form */}
      <div className="space-y-3">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink">
          Buat Akun Baru
        </h1>
        <p className="text-xs sm:text-sm text-muted leading-relaxed">
          Satu akun untuk melaporkan barang hilang, barang temuan, dan
          mengajukan klaim kepemilikan.
        </p>
      </div>

      {/* Form Registrasi Client */}
      <RegisterForm />

      {/* Footer Link Login */}
      <p className="pt-2 text-center text-xs sm:text-sm text-muted border-t border-line/40">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-bold text-brand hover:underline underline-offset-4"
        >
          Masuk Sekarang
        </Link>
      </p>
    </div>
  );
}
