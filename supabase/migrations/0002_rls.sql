-- Lost&Found — Row Level Security dan hak akses kolom.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.campus_locations enable row level security;
alter table public.item_reports enable row level security;
alter table public.report_photos enable row level security;
alter table public.report_status_history enable row level security;
alter table public.report_flags enable row level security;
alter table public.claims enable row level security;
alter table public.claim_evidence enable row level security;
alter table public.claim_status_history enable row level security;
alter table public.handovers enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- =========================================================
-- PROFILES
-- =========================================================
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- =========================================================
-- REFERENCE DATA
-- =========================================================
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories for select
to anon, authenticated
using (true);

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write"
on public.categories for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "locations_public_read" on public.campus_locations;
create policy "locations_public_read"
on public.campus_locations for select
to anon, authenticated
using (true);

drop policy if exists "locations_admin_write" on public.campus_locations;
create policy "locations_admin_write"
on public.campus_locations for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- ITEM REPORTS
-- =========================================================
drop policy if exists "reports_select_visible" on public.item_reports;
create policy "reports_select_visible"
on public.item_reports for select
to anon, authenticated
using (
  report_status = 'ACTIVE'
  or user_id = auth.uid()
  or public.is_admin()
);

drop policy if exists "reports_insert_own" on public.item_reports;
create policy "reports_insert_own"
on public.item_reports for insert
to authenticated
with check (
  user_id = auth.uid()
  and report_status = 'PENDING'
);

drop policy if exists "reports_update_own_editable" on public.item_reports;
create policy "reports_update_own_editable"
on public.item_reports for update
to authenticated
using (
  user_id = auth.uid()
  and report_status in ('PENDING', 'NEEDS_REVISION')
)
with check (
  user_id = auth.uid()
  and report_status in ('PENDING', 'NEEDS_REVISION')
);

drop policy if exists "reports_admin_update" on public.item_reports;
create policy "reports_admin_update"
on public.item_reports for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "reports_delete_own_pending" on public.item_reports;
create policy "reports_delete_own_pending"
on public.item_reports for delete
to authenticated
using (
  (user_id = auth.uid() and report_status = 'PENDING')
  or public.is_admin()
);

-- =========================================================
-- REPORT PHOTOS
-- =========================================================
drop policy if exists "report_photos_select_visible" on public.report_photos;
create policy "report_photos_select_visible"
on public.report_photos for select
to anon, authenticated
using (
  exists (
    select 1 from public.item_reports r
    where r.id = report_photos.report_id
  )
);

drop policy if exists "report_photos_write_owner" on public.report_photos;
create policy "report_photos_write_owner"
on public.report_photos for all
to authenticated
using (
  exists (
    select 1 from public.item_reports r
    where r.id = report_photos.report_id
      and (
        (r.user_id = auth.uid() and r.report_status in ('PENDING', 'NEEDS_REVISION'))
        or public.is_admin()
      )
  )
)
with check (
  exists (
    select 1 from public.item_reports r
    where r.id = report_photos.report_id
      and (
        (r.user_id = auth.uid() and r.report_status in ('PENDING', 'NEEDS_REVISION'))
        or public.is_admin()
      )
  )
);

-- =========================================================
-- REPORT STATUS HISTORY
-- =========================================================
drop policy if exists "report_history_select_owner_admin" on public.report_status_history;
create policy "report_history_select_owner_admin"
on public.report_status_history for select
to authenticated
using (
  exists (
    select 1 from public.item_reports r
    where r.id = report_status_history.report_id
      and (r.user_id = auth.uid() or public.is_admin())
  )
);

-- =========================================================
-- REPORT FLAGS
-- =========================================================
drop policy if exists "flags_insert_authenticated" on public.report_flags;
create policy "flags_insert_authenticated"
on public.report_flags for insert
to authenticated
with check (
  reporter_id = auth.uid()
  and exists (
    select 1 from public.item_reports r
    where r.id = report_flags.report_id
      and r.user_id <> auth.uid()
  )
);

drop policy if exists "flags_select_own_or_admin" on public.report_flags;
create policy "flags_select_own_or_admin"
on public.report_flags for select
to authenticated
using (reporter_id = auth.uid() or public.is_admin());

drop policy if exists "flags_admin_update" on public.report_flags;
create policy "flags_admin_update"
on public.report_flags for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- CLAIMS
-- =========================================================
drop policy if exists "claims_select_related" on public.claims;
create policy "claims_select_related"
on public.claims for select
to authenticated
using (
  claimant_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.item_reports r
    where r.id = claims.item_report_id and r.user_id = auth.uid()
  )
);

drop policy if exists "claims_insert_valid" on public.claims;
create policy "claims_insert_valid"
on public.claims for insert
to authenticated
with check (
  claimant_id = auth.uid()
  and exists (
    select 1 from public.item_reports r
    where r.id = claims.item_report_id
      and r.report_type = 'FOUND'
      and r.report_status = 'ACTIVE'
      and r.user_id <> auth.uid()
  )
);

drop policy if exists "claims_admin_update" on public.claims;
create policy "claims_admin_update"
on public.claims for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "claims_delete_own_pending" on public.claims;
create policy "claims_delete_own_pending"
on public.claims for delete
to authenticated
using (claimant_id = auth.uid() and claim_status = 'PENDING');

-- =========================================================
-- CLAIM EVIDENCE
-- =========================================================
drop policy if exists "claim_evidence_select_related" on public.claim_evidence;
create policy "claim_evidence_select_related"
on public.claim_evidence for select
to authenticated
using (
  exists (
    select 1 from public.claims c
    join public.item_reports r on r.id = c.item_report_id
    where c.id = claim_evidence.claim_id
      and (c.claimant_id = auth.uid() or r.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "claim_evidence_insert_claimant" on public.claim_evidence;
create policy "claim_evidence_insert_claimant"
on public.claim_evidence for insert
to authenticated
with check (
  exists (
    select 1 from public.claims c
    where c.id = claim_evidence.claim_id
      and c.claimant_id = auth.uid()
      and c.claim_status in ('PENDING', 'IN_REVIEW')
  )
);

drop policy if exists "claim_evidence_delete_claimant" on public.claim_evidence;
create policy "claim_evidence_delete_claimant"
on public.claim_evidence for delete
to authenticated
using (
  exists (
    select 1 from public.claims c
    where c.id = claim_evidence.claim_id
      and c.claimant_id = auth.uid()
      and c.claim_status in ('PENDING', 'IN_REVIEW')
  )
  or public.is_admin()
);

-- =========================================================
-- CLAIM STATUS HISTORY
-- =========================================================
drop policy if exists "claim_history_select_related" on public.claim_status_history;
create policy "claim_history_select_related"
on public.claim_status_history for select
to authenticated
using (
  exists (
    select 1 from public.claims c
    join public.item_reports r on r.id = c.item_report_id
    where c.id = claim_status_history.claim_id
      and (c.claimant_id = auth.uid() or r.user_id = auth.uid() or public.is_admin())
  )
);

-- =========================================================
-- HANDOVERS
-- =========================================================
drop policy if exists "handovers_select_related" on public.handovers;
create policy "handovers_select_related"
on public.handovers for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1 from public.claims c
    where c.id = handovers.claim_id and c.claimant_id = auth.uid()
  )
  or exists (
    select 1 from public.item_reports r
    where r.id = handovers.item_report_id and r.user_id = auth.uid()
  )
);

drop policy if exists "handovers_admin_write" on public.handovers;
create policy "handovers_admin_write"
on public.handovers for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own"
on public.notifications for delete
to authenticated
using (user_id = auth.uid());

-- =========================================================
-- AUDIT LOGS
-- =========================================================
drop policy if exists "audit_logs_admin_read" on public.audit_logs;
create policy "audit_logs_admin_read"
on public.audit_logs for select
to authenticated
using (public.is_admin());

-- =========================================================
-- VIEWS
-- =========================================================
grant select on public.public_profiles to anon, authenticated;
grant select on public.item_report_status to anon, authenticated;

-- =========================================================
-- COLUMN PRIVILEGES
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
