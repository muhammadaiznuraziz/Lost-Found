import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().trim().email("Masukkan email yang valid."),
  password: z.string().min(1, "Kata sandi wajib diisi."),
});

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(3, "Nama lengkap minimal 3 karakter.")
      .max(100, "Nama lengkap maksimal 100 karakter."),
    student_id: z
      .string()
      .trim()
      .max(30, "NIM maksimal 30 karakter.")
      .optional()
      .or(z.literal("")),
    email: z
      .string()
      .trim()
      .email("Masukkan email yang valid.")
      .refine((value) => value.endsWith(".ac.id") || value.includes("@"), {
        message: "Gunakan email yang aktif.",
      }),
    password: z
      .string()
      .min(8, "Kata sandi minimal 8 karakter.")
      .regex(/[A-Za-z]/, "Kata sandi harus memuat huruf.")
      .regex(/[0-9]/, "Kata sandi harus memuat angka."),
    confirm_password: z.string(),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Konfirmasi kata sandi tidak sama.",
    path: ["confirm_password"],
  });

export const profileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(3, "Nama lengkap minimal 3 karakter.")
    .max(100, "Nama lengkap maksimal 100 karakter."),
  student_id: z
    .string()
    .trim()
    .max(30, "NIM maksimal 30 karakter.")
    .optional()
    .or(z.literal("")),
});

export type AuthState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      success?: string;
      values?: Record<string, string>;
    }
  | undefined;
