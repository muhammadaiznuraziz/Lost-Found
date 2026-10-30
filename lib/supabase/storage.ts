import { SUPABASE_URL } from "./env";

export const REPORT_PHOTO_BUCKET = "report-photos";
export const CLAIM_EVIDENCE_BUCKET = "claim-evidence";

export function publicPhotoUrl(path: string | null | undefined) {
  if (!path) return null;
  return `${SUPABASE_URL}/storage/v1/object/public/${REPORT_PHOTO_BUCKET}/${path}`;
}
