"use client";

import { useActionState } from "react";
import { UserPlus } from "lucide-react";
import { register } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldHint, Input } from "@/components/ui/field";

export function RegisterForm() {
  const [state, action, pending] = useActionState(register, undefined);

  if (state?.success) {
    return (
      <Alert tone="success" title="Akun berhasil dibuat">
        {state.success}
      </Alert>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <Field
        label="Nama lengkap"
        htmlFor="full_name"
        required
        error={state?.errors?.full_name?.[0]}
      >
        <Input
          id="full_name"
          name="full_name"
          autoComplete="name"
          placeholder="Nama sesuai KTM"
          defaultValue={state?.values?.full_name}
          required
        />
      </Field>

      <Field
        label="NIM"
        htmlFor="student_id"
        hint="Opsional, membantu admin memverifikasi klaim."
        error={state?.errors?.student_id?.[0]}
      >
        <Input
          id="student_id"
          name="student_id"
          inputMode="numeric"
          placeholder="Contoh: 2112345678"
          defaultValue={state?.values?.student_id}
        />
      </Field>

      <Field
        label="Email"
        htmlFor="email"
        required
        hint="Gunakan email aktif yang kamu pantau."
        error={state?.errors?.email?.[0]}
      >
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="nama@kampus.ac.id"
          defaultValue={state?.values?.email}
          required
        />
      </Field>

      <Field
        label="Kata sandi"
        htmlFor="password"
        required
        error={state?.errors?.password?.[0]}
      >
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          placeholder="Buat kata sandi"
          required
        />
        <FieldHint>Minimal 8 karakter, kombinasi huruf dan angka.</FieldHint>
      </Field>

      <Field
        label="Konfirmasi kata sandi"
        htmlFor="confirm_password"
        required
        error={state?.errors?.confirm_password?.[0]}
      >
        <Input
          id="confirm_password"
          name="confirm_password"
          type="password"
          autoComplete="new-password"
          placeholder="Ulangi kata sandi"
          required
        />
      </Field>

      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Mendaftarkan..." : "Buat akun"}
        {!pending ? <UserPlus className="h-4 w-4" aria-hidden /> : null}
      </Button>
    </form>
  );
}
