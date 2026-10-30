-- Lost&Found — perbaikan GRANT yang tidak otomatis terpasang
-- Ketika tabel dibuat lewat `supabase db push`, default privileges Supabase
-- tidak selalu aktif, sehingga anon/authenticated tidak punya izin dasar.
-- Migration ini mengembalikan izin tersebut, lalu menegaskan kembali
-- sesuaian kolom (column-level grants) dari 0002_rls.sql.

-- =========================================================
-- BASELINE SELECT
-- =========================================================
grant select on public.categories to anon, authenticated;
grant select on public.campus_locations to anon, authenticated;
grant select on public.report_photos to anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.item_reports to authenticated;
grant select on public.report_status_history to authenticated;
grant select on public.report_flags to authenticated;
grant select on public.claims to authenticated;
grant select on public.claim_evidence to authenticated;
grant select on public.claim_status_history to authenticated;
grant select on public.handovers to authenticated;
grant select on public.notifications to authenticated;
grant select on public.audit_logs to authenticated;

-- =========================================================
-- BASELINE WRITE (RLS tetap mengatur baris mana yang boleh)
-- =========================================================
grant insert on public.report_photos to authenticated;
grant update on public.report_photos to authenticated;
grant delete on public.report_photos to authenticated;

grant delete on public.item_reports to authenticated;

grant delete on public.claims to authenticated;

grant insert on public.claim_evidence to authenticated;
grant delete on public.claim_evidence to authenticated;

grant delete on public.notifications to authenticated;
grant update on public.notifications to authenticated;

grant update on public.profiles to authenticated;

-- =========================================================
-- NARROWING (replay persis dari 0002_rls.sql)
-- =========================================================
-- contact_value tidak boleh terbaca lewat query publik.
revoke select on public.item_reports from anon, authenticated;
grant select (
  id,
  report_number,
  user_id,
  report_type,
  item_name,
  category_id,
  description_public,
  date_occurred,
  location_id,
  dropoff_location_id,
  contact_preference,
  report_status,
  created_at,
  updated_at,
  reviewed_by,
  reviewed_at,
  rejection_reason
) on public.item_reports to anon, authenticated;

-- admin_notes hanya dapat dibaca melalui RPC admin.
revoke select on public.claims from authenticated, anon;
grant select (
  id,
  claim_number,
  item_report_id,
  claimant_id,
  ownership_description,
  claim_status,
  reviewed_by,
  reviewed_at,
  rejection_reason,
  created_at,
  updated_at
) on public.claims to authenticated;

revoke insert on public.item_reports from authenticated, anon;
grant insert (
  user_id,
  report_type,
  item_name,
  category_id,
  description_public,
  date_occurred,
  location_id,
  dropoff_location_id,
  contact_preference,
  contact_value
) on public.item_reports to authenticated;

revoke insert on public.claims from authenticated, anon;
grant insert (item_report_id, claimant_id, ownership_description)
  on public.claims to authenticated;

revoke insert on public.report_flags from authenticated, anon;
grant insert (report_id, reporter_id, reason)
  on public.report_flags to authenticated;

revoke update on public.profiles from authenticated, anon;
grant update (full_name, student_id, avatar_url, updated_at)
  on public.profiles to authenticated;

revoke update on public.item_reports from authenticated, anon;
grant update (
  item_name,
  category_id,
  description_public,
  date_occurred,
  location_id,
  dropoff_location_id,
  contact_preference,
  contact_value,
  updated_at
) on public.item_reports to authenticated;

revoke update on public.claims from authenticated, anon;
revoke insert on public.handovers from authenticated, anon;
revoke update on public.handovers from authenticated, anon;

revoke update on public.notifications from authenticated, anon;
grant update (read_at) on public.notifications to authenticated;

revoke insert, update, delete on public.audit_logs from authenticated, anon;
revoke insert, update, delete on public.report_status_history from authenticated, anon;
revoke insert, update, delete on public.claim_status_history from authenticated, anon;

grant execute on function public.is_admin() to anon, authenticated;
