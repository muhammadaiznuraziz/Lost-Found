import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  CLAIM_COLUMNS,
  getClaimById,
  type ClaimDetail,
} from "./claims";
import {
  getReportsByIds,
  hydrateReports,
  REPORT_COLUMNS,
} from "./reports";
import type {
  AuditLog,
  Claim,
  Handover,
  ItemReport,
  Profile,
  ReportFlag,
  ReportWithRelations,
} from "@/types";

export async function getAdminStats() {
  const fallback = {
    totalReports: 0,
    pendingReports: 0,
    activeFound: 0,
    pendingClaims: 0,
    completedHandovers: 0,
    openFlags: 0,
  };

  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const [total, pending, found, claims, handovers, flags] = await Promise.all([
    supabase
      .from("item_reports")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("item_reports")
      .select("id", { count: "exact", head: true })
      .in("report_status", ["PENDING", "NEEDS_REVISION"]),
    supabase
      .from("item_reports")
      .select("id", { count: "exact", head: true })
      .eq("report_type", "FOUND")
      .eq("report_status", "ACTIVE"),
    supabase
      .from("claims")
      .select("id", { count: "exact", head: true })
      .in("claim_status", ["PENDING", "IN_REVIEW"]),
    supabase
      .from("handovers")
      .select("id", { count: "exact", head: true })
      .eq("handover_status", "COMPLETED"),
    supabase
      .from("report_flags")
      .select("id", { count: "exact", head: true })
      .eq("flag_status", "OPEN"),
  ]);

  return {
    totalReports: total.count ?? 0,
    pendingReports: pending.count ?? 0,
    activeFound: found.count ?? 0,
    pendingClaims: claims.count ?? 0,
    completedHandovers: handovers.count ?? 0,
    openFlags: flags.count ?? 0,
  };
}

export async function getAdminReports(filters: {
  status?: string;
  type?: string;
  q?: string;
} = {}) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  let request = supabase
    .from("item_reports")
    .select(REPORT_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.status) request = request.eq("report_status", filters.status);
  if (filters.type) request = request.eq("report_type", filters.type);
  if (filters.q) {
    const term = filters.q.replace(/[%,()"'\\]/g, " ").trim();
    if (term) {
      request = request.or(
        `item_name.ilike.%${term}%,report_number.ilike.%${term}%`,
      );
    }
  }

  const { data } = await request.limit(200);
  return hydrateReports((data as unknown as ItemReport[] | null) ?? []);
}

export interface AdminClaimItem {
  claim: Claim;
  report: ReportWithRelations | null;
  claimant: Pick<Profile, "id" | "full_name"> | null;
}

export async function getAdminClaims(filters: {
  status?: string;
  q?: string;
} = {}): Promise<AdminClaimItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  let request = supabase
    .from("claims")
    .select(CLAIM_COLUMNS)
    .order("created_at", { ascending: false });

  if (filters.status) request = request.eq("claim_status", filters.status);
  if (filters.q) {
    const term = filters.q.replace(/[%,()"'\\]/g, " ").trim();
    if (term) request = request.ilike("claim_number", `%${term}%`);
  }

  const { data } = await request.limit(200);
  const claims = (data as unknown as Claim[] | null) ?? [];

  const reports = await getReportsByIds([
    ...new Set(claims.map((claim) => claim.item_report_id)),
  ]);
  const reportMap = new Map(reports.map((report) => [report.id, report]));

  const claimantIds = [...new Set(claims.map((claim) => claim.claimant_id))];
  const { data: profiles } =
    claimantIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, full_name")
          .in("id", claimantIds)
      : { data: [] };
  const profileMap = new Map(
    ((profiles as { id: string; full_name: string }[] | null) ?? []).map(
      (profile) => [profile.id, profile],
    ),
  );

  return claims.map((claim) => ({
    claim,
    report: reportMap.get(claim.item_report_id) ?? null,
    claimant: profileMap.get(claim.claimant_id) ?? null,
  }));
}

export async function getAdminClaimDetail(
  id: string,
): Promise<(ClaimDetail & { adminNotes: string | null }) | null> {
  if (!isSupabaseConfigured) return null;

  const detail = await getClaimById(id);
  if (!detail) return null;

  const supabase = await createClient();
  const [{ data: notes }, { data: profile }] = await Promise.all([
    supabase.rpc("get_claim_admin_notes", { p_claim_id: id }),
    supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", detail.claim.claimant_id)
      .maybeSingle(),
  ]);

  return {
    ...detail,
    claimant:
      (profile as Pick<Profile, "id" | "full_name" | "email"> | null) ??
      detail.claimant,
    adminNotes: (notes as string | null) ?? null,
  };
}

export interface AdminHandoverItem {
  handover: Handover;
  report: ReportWithRelations | null;
  claim: Pick<Claim, "id" | "claim_number" | "claimant_id"> | null;
  claimant: Pick<Profile, "id" | "full_name"> | null;
}

export async function getAdminHandovers(filters: {
  status?: string;
} = {}): Promise<AdminHandoverItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  let request = supabase
    .from("handovers")
    .select("*")
    .order("created_at", { ascending: false });

  if (filters.status) {
    request = request.eq("handover_status", filters.status);
  }

  const { data } = await request.limit(200);
  const handovers = (data as Handover[] | null) ?? [];

  const reportIds = [...new Set(handovers.map((item) => item.item_report_id))];
  const claimIds = [...new Set(handovers.map((item) => item.claim_id))];

  const [reports, claimsResult] = await Promise.all([
    getReportsByIds(reportIds),
    claimIds.length > 0
      ? supabase
          .from("claims")
          .select("id, claim_number, claimant_id")
          .in("id", claimIds)
      : Promise.resolve({ data: [] }),
  ]);

  const reportMap = new Map(reports.map((report) => [report.id, report]));
  const claims =
    (claimsResult.data as
      | Pick<Claim, "id" | "claim_number" | "claimant_id">[]
      | null) ?? [];
  const claimMap = new Map(claims.map((claim) => [claim.id, claim]));

  const claimantIds = [...new Set(claims.map((claim) => claim.claimant_id))];
  const { data: profiles } =
    claimantIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, full_name")
          .in("id", claimantIds)
      : { data: [] };
  const profileMap = new Map(
    ((profiles as { id: string; full_name: string }[] | null) ?? []).map(
      (profile) => [profile.id, profile],
    ),
  );

  return handovers.map((handover) => {
    const claim = claimMap.get(handover.claim_id) ?? null;
    return {
      handover,
      report: reportMap.get(handover.item_report_id) ?? null,
      claim,
      claimant: claim ? (profileMap.get(claim.claimant_id) ?? null) : null,
    };
  });
}

export async function getAllProfiles() {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  return (data as Profile[] | null) ?? [];
}

export interface AdminFlagItem {
  flag: ReportFlag;
  report: Pick<ItemReport, "id" | "report_number" | "item_name" | "report_type"> | null;
  reporter: Pick<Profile, "id" | "full_name"> | null;
}

export async function getAdminFlags(): Promise<AdminFlagItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("report_flags")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);

  const flags = (data as ReportFlag[] | null) ?? [];
  const reportIds = [...new Set(flags.map((flag) => flag.report_id))];
  const reporterIds = [...new Set(flags.map((flag) => flag.reporter_id))];

  const [reportsResult, profilesResult] = await Promise.all([
    reportIds.length > 0
      ? supabase
          .from("item_reports")
          .select("id, report_number, item_name, report_type")
          .in("id", reportIds)
      : Promise.resolve({ data: [] }),
    reporterIds.length > 0
      ? supabase
          .from("public_profiles")
          .select("id, full_name")
          .in("id", reporterIds)
      : Promise.resolve({ data: [] }),
  ]);

  const reportMap = new Map(
    (
      (reportsResult.data as
        | Pick<ItemReport, "id" | "report_number" | "item_name" | "report_type">[]
        | null) ?? []
    ).map((report) => [report.id, report]),
  );
  const profileMap = new Map(
    (
      (profilesResult.data as { id: string; full_name: string }[] | null) ?? []
    ).map((profile) => [profile.id, profile]),
  );

  return flags.map((flag) => ({
    flag,
    report: reportMap.get(flag.report_id) ?? null,
    reporter: profileMap.get(flag.reporter_id) ?? null,
  }));
}

export async function getReportFlags(reportId: string) {
  if (!isSupabaseConfigured) return [] as ReportFlag[];

  const supabase = await createClient();
  const { data } = await supabase
    .from("report_flags")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: false });

  return (data as ReportFlag[] | null) ?? [];
}

export interface AdminAuditItem {
  log: AuditLog;
  actor: Pick<Profile, "id" | "full_name"> | null;
}

export async function getAdminAuditLogs(limit = 100): Promise<AdminAuditItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  const logs = (data as AuditLog[] | null) ?? [];
  const actorIds = [
    ...new Set(logs.map((log) => log.actor_id).filter(Boolean)),
  ] as string[];

  const { data: profiles } =
    actorIds.length > 0
      ? await supabase
          .from("public_profiles")
          .select("id, full_name")
          .in("id", actorIds)
      : { data: [] };

  const profileMap = new Map(
    ((profiles as { id: string; full_name: string }[] | null) ?? []).map(
      (profile) => [profile.id, profile],
    ),
  );

  return logs.map((log) => ({
    log,
    actor: log.actor_id ? (profileMap.get(log.actor_id) ?? null) : null,
  }));
}
