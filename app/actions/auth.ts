"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  loginSchema,
  profileSchema,
  registerSchema,
  type AuthState,
} from "@/lib/validations/auth";
import { safeRedirectPath } from "@/lib/utils";

const NOT_CONFIGURED =
  "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local.";

export async function login(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) return { message: NOT_CONFIGURED };

  const email = String(formData.get("email") ?? "");
  const parsed = loginSchema.safeParse({
    email,
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      values: { email },
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return {
      message:
        error.message === "Email not confirmed"
          ? "Email belum dikonfirmasi. Periksa kotak masuk email kampusmu."
          : "Email atau kata sandi tidak sesuai.",
      values: { email },
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user?.id ?? "")
    .maybeSingle();

  const nextParam = formData.get("next");
  const fallback = profile?.role === "ADMIN" ? "/admin" : "/dashboard";
  redirect(nextParam ? safeRedirectPath(String(nextParam)) : fallback);
}

export async function register(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  if (!isSupabaseConfigured) return { message: NOT_CONFIGURED };

  const values = {
    full_name: String(formData.get("full_name") ?? ""),
    student_id: String(formData.get("student_id") ?? ""),
    email: String(formData.get("email") ?? ""),
  };

  const parsed = registerSchema.safeParse({
    ...values,
    password: formData.get("password"),
    confirm_password: formData.get("confirm_password"),
  });

  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        student_id: parsed.data.student_id || null,
      },
    },
  });

  if (error) {
    return {
      message:
        error.message.includes("already registered") ||
        error.message.includes("already been registered")
          ? "Email ini sudah terdaftar. Silakan masuk."
          : "Pendaftaran gagal. Coba lagi beberapa saat lagi.",
      values,
    };
  }

  if (!data.session) {
    return {
      success:
        "Akun dibuat. Periksa email kampusmu untuk mengonfirmasi, lalu masuk.",
      values: { email: parsed.data.email },
    };
  }

  redirect("/dashboard");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function updateProfile(
  _prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const values = {
    full_name: String(formData.get("full_name") ?? ""),
    student_id: String(formData.get("student_id") ?? ""),
  };

  const parsed = profileSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Sesi berakhir. Silakan masuk kembali." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      student_id: parsed.data.student_id || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  if (error) {
    return { message: "Profil gagal diperbarui.", values };
  }

  revalidatePath("/dashboard/profil");
  revalidatePath("/dashboard");
  return { success: "Profil berhasil diperbarui.", values };
}
