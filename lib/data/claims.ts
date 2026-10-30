import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { CLAIM_EVIDENCE_BUCKET } from "@/lib/supabase/storage";
import { getReportById, getReportsByIds } from "./reports";
import type {
  Claim,
  ClaimEvidence,
  ClaimStatusHistory,
  Handover,
  Profile,
  ReportWithRelations,
} from "@/types";

export const CLAIM_COLUMNS = [
  "id",
  "claim_number",
  "item_report_id",
  "claimant_id",
  "ownership_description",
  "claim_status",
  "reviewed_by",
  "reviewed_at",
  "rejection_reason",
  "created_at",
  "updated_at",
].join(", ");

export interface ClaimListItem {
  claim: Claim;
  report: ReportWithRelations | null;
}

export interface ClaimDetail {
  claim: Claim;
  report: ReportWithRelations | null;
  evidence: ClaimEvidence[];
  evidenceUrls: Record<string, string>;
  handover: Handover | null;
  history: ClaimStatusHistory[];
  claimant: Pick<Profile, "id" | "full_name" | "email"> | null;
}

export async function getUserClaims(
  userId: string,
): Promise<ClaimListItem[]> {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("claims")
    .select(CLAIM_COLUMNS)
    .eq("claimant_id", userId)
    .order("created_at", { ascending: false });

  const claims = (data as unknown as Claim[] | null) ?? [];
  const reports = await getReportsByIds([
    ...new Set(claims.map((claim) => claim.item_report_id)),
  ]);
  const reportMap = new Map(reports.map((report) => [report.id, report]));

  return claims.map((claim) => ({
    claim,
    report: reportMap.get(claim.item_report_id) ?? null,
  }));
}

export async function getClaimById(id: string): Promise<ClaimDetail | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data: claimData } = await supabase
    .from("claims")
    .select(CLAIM_COLUMNS)
    .eq("id", id)
    .maybeSingle();

  if (!claimData) return null;

  const claim = claimData as unknown as Claim;

  const [report, evidenceResult, handoverResult, historyResult, claimantResult] =
    await Promise.all([
      getReportById(claim.item_report_id),
      supabase
        .from("claim_evidence")
        .select("*")
        .eq("claim_id", claim.id)
        .order("created_at"),
      supabase
        .from("handovers")
        .select("*")
        .eq("claim_id", claim.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("claim_status_history")
        .select("*")
        .eq("claim_id", claim.id)
        .order("created_at", { ascending: true }),
      supabase
        .from("public_profiles")
        .select("id, full_name")
        .eq("id", claim.claimant_id)
        .maybeSingle(),
    ]);

  const evidence = (evidenceResult.data as ClaimEvidence[] | null) ?? [];
  const evidenceUrls: Record<string, string> = {};

  if (evidence.length > 0) {
    const { data: signed } = await supabase.storage
      .from(CLAIM_EVIDENCE_BUCKET)
      .createSignedUrls(
        evidence.map((item) => item.storage_path),
        60 * 60,
      );

    signed?.forEach((item) => {
      if (item.path && item.signedUrl) {
        evidenceUrls[item.path] = item.signedUrl;
      }
    });
  }

  const claimant = claimantResult.data as
    | Pick<Profile, "id" | "full_name">
    | null;

  return {
    claim,
    report,
    evidence,
    evidenceUrls,
    handover: (handoverResult.data as Handover | null) ?? null,
    history: (historyResult.data as ClaimStatusHistory[] | null) ?? [],
    claimant: claimant
      ? { ...claimant, email: "" }
      : null,
  };
}

export async function getClaimHistory(claimId: string) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("claim_status_history")
    .select("*")
    .eq("claim_id", claimId)
    .order("created_at", { ascending: true });

  return (data as ClaimStatusHistory[] | null) ?? [];
}
