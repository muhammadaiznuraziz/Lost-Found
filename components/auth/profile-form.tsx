"use client";

import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateProfile } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function ProfileForm({
  fullName,
  studentId,
}: {
  fullName: string;
  studentId: string | null;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);

  return (
    <form action={action} className="space-y-5">
      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}
      {state?.success ? (
        <Alert tone="success">{state.success}</Alert>
      ) : null}

      <Field
        label="Nama lengkap"
        htmlFor="full_name"
        required
        error={state?.errors?.full_name?.[0]}
      >
        <Input
          id="full_name"
          name="full_name"
          defaultValue={state?.values?.full_name ?? fullName}
          required
          maxLength={100}
        />
      </Field>

      <Field
        label="NIM"
        htmlFor="student_id"
        hint="Opsional. Membantu admin mencocokkan identitas saat klaim."
        error={state?.errors?.student_id?.[0]}
      >
        <Input
          id="student_id"
          name="student_id"
          defaultValue={state?.values?.student_id ?? studentId ?? ""}
          maxLength={30}
        />
      </Field>

      <Button type="submit" loading={pending}>
        {pending ? "Menyimpan..." : "Simpan profil"}
        {!pending ? <Save className="h-4 w-4" aria-hidden /> : null}
      </Button>
    </form>
  );
}
