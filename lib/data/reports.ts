import "server-only";

import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCategories, getLocations, indexById } from "./reference";
import type {
  Claim,
  ItemDisplayStatus,
  ItemReport,
  ReportPhoto,
  ReportStatusHistory,
  ReportType,
  ReportWithRelations,
} from "@/types";

export const REPORT_COLUMNS = [
  "id",
  "report_number",
  "user_id",
  "report_type",
  "item_name",
  "category_id",
  "description_public",
  "date_occurred",
  "location_id",
  "dropoff_location_id",
  "contact_preference",
  "report_status",
  "created_at",
  "updated_at",
  "reviewed_by",
  "reviewed_at",
  "rejection_reason",
].join(", ");

export interface ReportQuery {
  q?: string;
  type?: ReportType;
  categoryId?: number;
  locationId?: number;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
}

export const REPORT_PAGE_SIZE = 12;

function escapeSearchTerm(value: string) {
  return value.replace(/[%,()"'\\]/g, " ").replace(/\s+/g, " ").trim();
}

export async function hydrateReports(
  rows: ItemReport[],
): Promise<ReportWithRelations[]> {
  if (rows.length === 0) return [];

  const supabase = await createClient();
  const reportIds = rows.map((row) => row.id);
  const userIds = [...new Set(rows.map((row) => row.user_id))];

  const [photosResult, profilesResult, statusResult, categories, locations] =
    await Promise.all([
      supabase
        .from("report_photos")
        .select("*")
        .in("report_id", reportIds)
        .order("sort_order"),
      supabase
        .from("public_profiles")
        .select("id, full_name")
        .in("id", userIds),
      supabase
        .from("item_report_status")
        .select("report_id, display_status")
        .in("report_id", reportIds),
      getCategories(),
      getLocations(),
    ]);

  const photos = (photosResult.data as ReportPhoto[] | null) ?? [];
  const profiles =
    (profilesResult.data as { id: string; full_name: string }[] | null) ?? [];
  const statuses =
    (statusResult.data as
      | { report_id: string; display_status: ItemDisplayStatus }[]
      | null) ?? [];

  const categoryMap = indexById(categories);
  const locationMap = indexById(locations);
  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const statusMap = new Map(
    statuses.map((status) => [status.report_id, status.display_status]),
  );

  return rows.map((row) => {
    const displayStatus = statusMap.get(row.id);

    return {
      ...row,
      categories: categoryMap.get(row.category_id) ?? null,
      campus_locations: locationMap.get(row.location_id) ?? null,
      dropoff_location: row.dropoff_location_id
        ? (locationMap.get(row.dropoff_location_id) ?? null)
        : null,
      report_photos: photos.filter((photo) => photo.report_id === row.id),
      profiles: profileMap.get(row.user_id) ?? null,
      item_report_status: displayStatus
        ? [{ report_id: row.id, display_status: displayStatus }]
        : [],
    };
  });
}

export async function getPublicReports(query: ReportQuery = {}) {
  const empty = {
    items: [] as ReportWithRelations[],
    total: 0,
    page: 1,
    pageSize: REPORT_PAGE_SIZE,
    totalPages: 0,
  };

  if (!isSupabaseConfigured) return empty;

  const supabase = await createClient();
  const page = Math.max(1, query.page ?? 1);
  const pageSize = query.pageSize ?? REPORT_PAGE_SIZE;

  let request = supabase
    .from("item_reports")
    .select(REPORT_COLUMNS, { count: "exact" })
    .eq("report_status", "ACTIVE");

  if (query.type) request = request.eq("report_type", query.type);
  if (query.categoryId) request = request.eq("category_id", query.categoryId);
  if (query.locationId) request = request.eq("location_id", query.locationId);
  if (query.dateFrom) request = request.gte("date_occurred", query.dateFrom);
  if (query.dateTo) request = request.lte("date_occurred", query.dateTo);

  const term = query.q ? escapeSearchTerm(query.q) : "";
  if (term) {
    request = request.or(
      `item_name.ilike.%${term}%,description_public.ilike.%${term}%`,
    );
  }

  const from = (page - 1) * pageSize;
  const { data, count, error } = await request
    .order("created_at", { ascending: false })
    .range(from, from + pageSize - 1);

  if (error || !data) return empty;

  const total = count ?? 0;

  return {
    items: await hydrateReports(data as unknown as ItemReport[]),
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getRecentReports(limit = 6) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("item_reports")
    .select(REPORT_COLUMNS)
    .eq("report_status", "ACTIVE")
    .order("created_at", { ascending: false })
    .limit(limit);

  return hydrateReports((data as ItemReport[] | null) ?? []);
}

export async function getReportById(
  id: string,
): Promise<ReportWithRelations | null> {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  let queryResult = await supabase
    .from("item_reports")
    .select(`${REPORT_COLUMNS}, reference_report_id`)
    .eq("id", id)
    .maybeSingle();

  if (queryResult.error && queryResult.error.code === "42703") {
    queryResult = await supabase
      .from("item_reports")
      .select(REPORT_COLUMNS)
      .eq("id", id)
      .maybeSingle();
  }

  const data = queryResult.data;
  if (!data) return null;

  const [report] = await hydrateReports([data as unknown as ItemReport]);
  if (!report) return null;

  // Jika laporan ini merujuk ke laporan lain
  if (report.reference_report_id) {
    const { data: refData } = await supabase
      .from("item_reports")
      .select("id, report_number, item_name, report_type, report_status")
      .eq("id", report.reference_report_id)
      .maybeSingle();
    if (refData) {
      report.reference_report = refData;
    }
  }

  // Periksa apakah ada laporan temuan yang merujuk ke laporan ini
  try {
    const { data: referencingData, error: refErr } = await supabase
      .from("item_reports")
      .select(REPORT_COLUMNS)
      .eq("reference_report_id", report.id);

    if (!refErr && referencingData && referencingData.length > 0) {
      report.referencing_reports = await hydrateReports(
        referencingData as unknown as ItemReport[],
      );
    }
  } catch {
    // Abaikan jika kolom belum dimigrasi di database
  }

  return report;
}

export async function getReportsByIds(ids: string[]) {
  if (!isSupabaseConfigured || ids.length === 0) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("item_reports")
    .select(REPORT_COLUMNS)
    .in("id", ids);

  return hydrateReports((data as unknown as ItemReport[] | null) ?? []);
}

export async function getRelatedReports(
  report: ReportWithRelations,
  limit = 3,
) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("item_reports")
    .select(REPORT_COLUMNS)
    .eq("report_status", "ACTIVE")
    .eq("report_type", report.report_type)
    .eq("category_id", report.category_id)
    .neq("id", report.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  return hydrateReports((data as ItemReport[] | null) ?? []);
}

export async function getUserReports(userId: string) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("item_reports")
    .select(REPORT_COLUMNS)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  return hydrateReports((data as ItemReport[] | null) ?? []);
}

export async function getReportClaims(reportId: string) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("claims")
    .select(
      "id, claim_number, item_report_id, claimant_id, ownership_description, claim_status, reviewed_by, reviewed_at, rejection_reason, created_at, updated_at",
    )
    .eq("item_report_id", reportId)
    .order("created_at", { ascending: false });

  return (data as Claim[] | null) ?? [];
}

export async function getReportHistory(reportId: string) {
  if (!isSupabaseConfigured) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("report_status_history")
    .select("*")
    .eq("report_id", reportId)
    .order("created_at", { ascending: true });

  return (data as ReportStatusHistory[] | null) ?? [];
}

export async function getOwnReportContact(reportId: string) {
  if (!isSupabaseConfigured) return null;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_own_report_contact", {
    p_report_id: reportId,
  });

  const row = Array.isArray(data) ? data[0] : null;
  return (row as { contact_preference: string; contact_value: string } | null) ??
    null;
}

export async function getPublicStats() {
  const fallback = {
    totalReports: 0,
    availableItems: 0,
    returnedItems: 0,
    totalUsers: 0,
  };

  if (!isSupabaseConfigured) return fallback;

  const supabase = await createClient();
  const { data } = await supabase.rpc("get_public_stats");
  const row = Array.isArray(data) ? data[0] : null;

  if (!row) return fallback;

  return {
    totalReports: Number(row.total_reports ?? 0),
    availableItems: Number(row.available_items ?? 0),
    returnedItems: Number(row.returned_items ?? 0),
    totalUsers: Number(row.total_users ?? 0),
  };
}

export async function getStudentStats(userId: string) {
  const stats = {
    lost: 0,
    found: 0,
    activeClaims: 0,
    unreadNotifications: 0,
  };

  if (!isSupabaseConfigured) return stats;

  const supabase = await createClient();

  const [lost, found, claims, notifications] = await Promise.all([
    supabase
      .from("item_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("report_type", "LOST"),
    supabase
      .from("item_reports")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("report_type", "FOUND"),
    supabase
      .from("claims")
      .select("id", { count: "exact", head: true })
      .eq("claimant_id", userId)
      .in("claim_status", ["PENDING", "IN_REVIEW", "APPROVED"]),
    supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("read_at", null),
  ]);

  return {
    lost: lost.count ?? 0,
    found: found.count ?? 0,
    activeClaims: claims.count ?? 0,
    unreadNotifications: notifications.count ?? 0,
  };
}
