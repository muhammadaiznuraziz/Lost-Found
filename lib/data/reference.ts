import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { CampusLocation, Category } from "@/types";

export const getCategories = cache(async (): Promise<Category[]> => {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (data as Category[] | null) ?? [];
});

export const getLocations = cache(async (): Promise<CampusLocation[]> => {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("campus_locations")
    .select("*")
    .eq("is_active", true)
    .order("name");

  return (data as CampusLocation[] | null) ?? [];
});

export function indexById<T extends { id: number }>(rows: T[]) {
  return new Map(rows.map((row) => [row.id, row]));
}
