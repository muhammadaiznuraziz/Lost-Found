export type Role = "STUDENT" | "ADMIN";
export type ReportType = "LOST" | "FOUND";
export type ReportStatus =
  | "PENDING"
  | "NEEDS_REVISION"
  | "ACTIVE"
  | "REJECTED"
  | "CLOSED";
export type ClaimStatus =
  | "PENDING"
  | "IN_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "CANCELLED";
export type HandoverStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";
export type FlagStatus = "OPEN" | "REVIEWED" | "DISMISSED";
export type EvidenceType =
  | "PHOTO"
  | "PURCHASE_PROOF"
  | "OWNERSHIP_DOCUMENT"
  | "OTHER";
export type ContactPreference = "EMAIL" | "WHATSAPP" | "NONE";
export type ItemDisplayStatus =
  | "Menunggu_Verifikasi"
  | "Perlu_Perbaikan"
  | "Tersedia"
  | "Ada_Klaim"
  | "Siap_Diserahkan"
  | "Dikembalikan"
  | "Ditolak"
  | "Ditutup";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  student_id: string | null;
  role: Role;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface CampusLocation {
  id: number;
  name: string;
  building: string | null;
  description: string | null;
  latitude: number | null;
  longitude: number | null;
  is_active: boolean;
  created_at: string;
}

export interface ItemReport {
  id: string;
  report_number: string;
  user_id: string;
  report_type: ReportType;
  item_name: string;
  category_id: number;
  description_public: string;
  date_occurred: string;
  location_id: number;
  dropoff_location_id: number | null;
  contact_preference: ContactPreference | null;
  contact_value: string | null;
  report_status: ReportStatus;
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  storage_path: string;
  alt_text: string | null;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ReportStatusHistory {
  id: number;
  report_id: string;
  old_status: ReportStatus | null;
  new_status: ReportStatus;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface Claim {
  id: string;
  claim_number: string;
  item_report_id: string;
  claimant_id: string;
  ownership_description: string;
  claim_status: ClaimStatus;
  admin_notes: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClaimEvidence {
  id: string;
  claim_id: string;
  storage_path: string;
  evidence_type: EvidenceType;
  description: string | null;
  created_at: string;
}

export interface ClaimStatusHistory {
  id: number;
  claim_id: string;
  old_status: ClaimStatus | null;
  new_status: ClaimStatus;
  changed_by: string | null;
  reason: string | null;
  created_at: string;
}

export interface Handover {
  id: string;
  item_report_id: string;
  claim_id: string;
  handled_by: string | null;
  handover_location: string;
  handover_status: HandoverStatus;
  scheduled_at: string | null;
  completed_at: string | null;
  confirmation_notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  notification_type: string;
  related_report_id: string | null;
  related_claim_id: string | null;
  read_at: string | null;
  created_at: string;
}

export interface ReportFlag {
  id: string;
  report_id: string;
  reporter_id: string;
  reason: string;
  flag_status: FlagStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string;
}

export interface AuditLog {
  id: number;
  actor_id: string | null;
  entity_type: string;
  entity_id: string;
  action: string;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  reason: string | null;
  created_at: string;
}

export interface ItemReportStatusView {
  report_id: string;
  display_status: ItemDisplayStatus;
}

export interface ReportWithRelations extends ItemReport {
  categories: Pick<Category, "id" | "name" | "slug"> | null;
  campus_locations:
    | Pick<CampusLocation, "id" | "name" | "building">
    | null;
  dropoff_location:
    | Pick<CampusLocation, "id" | "name" | "building">
    | null;
  report_photos: ReportPhoto[];
  profiles: Pick<Profile, "id" | "full_name"> | null;
  claims?: Pick<Claim, "id" | "claim_status">[];
  item_report_status?: ItemReportStatusView[];
}

export interface ClaimWithRelations extends Claim {
  item_reports:
    | (Pick<
        ItemReport,
        | "id"
        | "report_number"
        | "item_name"
        | "report_type"
        | "report_status"
        | "user_id"
      > & {
        report_photos?: ReportPhoto[];
        categories?: Pick<Category, "name"> | null;
        campus_locations?: Pick<CampusLocation, "name"> | null;
      })
    | null;
  profiles: Pick<Profile, "id" | "full_name" | "email"> | null;
  claim_evidence: ClaimEvidence[];
  handovers?: Handover[];
}

export interface FlagWithRelations extends ReportFlag {
  item_reports:
    | Pick<ItemReport, "id" | "report_number" | "item_name" | "report_type">
    | null;
  profiles: Pick<Profile, "id" | "full_name"> | null;
}

export interface HandoverWithRelations extends Handover {
  item_reports:
    | (Pick<ItemReport, "id" | "report_number" | "item_name"> & {
        report_photos?: ReportPhoto[];
      })
    | null;
  claims:
    | (Pick<Claim, "id" | "claim_number" | "claimant_id"> & {
        profiles?: Pick<Profile, "id" | "full_name" | "email"> | null;
      })
    | null;
}
