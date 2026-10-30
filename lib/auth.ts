import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/env";
import type { Profile } from "@/types";

export const getSessionUser = cache(async () => {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return { authUser: user, profile: (profile as Profile | null) ?? null };
});

export async function requireUser(nextPath = "/dashboard") {
  const session = await getSessionUser();
  if (!session) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireUser("/admin");
  if (session.profile?.role !== "ADMIN") {
    redirect("/dashboard");
  }
  return session;
}

export async function requireStudent() {
  const session = await requireUser("/dashboard");
  if (session.profile?.role === "ADMIN") {
    redirect("/admin");
  }
  return session;
}
