"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { login } from "@/app/actions/auth";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState(login, undefined);

  return (
    <form action={action} className="space-y-5">
      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}
      {state?.success ? <Alert tone="success">{state.success}</Alert> : null}

      <Field
        label="Email"
        htmlFor="email"
        required
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
          autoComplete="current-password"
          placeholder="Masukkan kata sandi"
          required
        />
      </Field>

      <input type="hidden" name="next" value={next ?? ""} />

      <Button type="submit" className="w-full" loading={pending}>
        {pending ? "Memproses..." : "Masuk"}
        {!pending ? <LogIn className="h-4 w-4" aria-hidden /> : null}
      </Button>
    </form>
  );
}
