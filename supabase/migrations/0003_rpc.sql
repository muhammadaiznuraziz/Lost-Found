-- Lost&Found — RPC transaksional untuk alur verifikasi, klaim, dan pengembalian.

-- =========================================================
-- REVIEW REPORT (admin)
-- =========================================================
create or replace function public.review_report(
  p_report_id uuid,
  p_new_status public.report_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.item_reports;
  v_title text;
  v_message text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat memverifikasi laporan.';
  end if;

  if p_new_status not in ('ACTIVE', 'NEEDS_REVISION', 'REJECTED') then
    raise exception 'Status verifikasi tidak valid.';
  end if;

  if p_new_status = 'REJECTED' and coalesce(trim(p_reason), '') = '' then
    raise exception 'Alasan penolakan wajib diisi.';
  end if;

  select * into v_report
  from public.item_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;

  perform set_config('app.change_reason', coalesce(p_reason, ''), true);

  update public.item_reports
  set report_status = p_new_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = case when p_new_status = 'REJECTED' then p_reason else null end
  where id = p_report_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'item_report',
    p_report_id,
    'REPORT_' || p_new_status::text,
    jsonb_build_object('report_status', v_report.report_status),
    jsonb_build_object('report_status', p_new_status),
    p_reason
  );

  v_title := case p_new_status
    when 'ACTIVE' then 'Laporan disetujui'
    when 'NEEDS_REVISION' then 'Laporan perlu diperbaiki'
    else 'Laporan ditolak'
  end;

  v_message := case p_new_status
    when 'ACTIVE' then 'Laporan ' || v_report.report_number || ' telah dipublikasikan.'
    when 'NEEDS_REVISION' then 'Laporan ' || v_report.report_number || ' perlu dilengkapi. ' || coalesce(p_reason, '')
    else 'Laporan ' || v_report.report_number || ' ditolak. ' || coalesce(p_reason, '')
  end;

  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id)
  values (
    v_report.user_id,
    v_title,
    v_message,
    'REPORT_' || p_new_status::text,
    p_report_id
  );
end;
$$;

-- =========================================================
-- REVIEW CLAIM (admin)
-- =========================================================
create or replace function public.review_claim(
  p_claim_id uuid,
  p_new_status public.claim_status,
  p_reason text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim public.claims;
  v_report public.item_reports;
  v_title text;
  v_message text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat memeriksa klaim.';
  end if;

  if p_new_status not in ('IN_REVIEW', 'APPROVED', 'REJECTED') then
    raise exception 'Status klaim tidak valid.';
  end if;

  if p_new_status = 'REJECTED' and coalesce(trim(p_reason), '') = '' then
    raise exception 'Alasan penolakan wajib diisi.';
  end if;

  select * into v_claim
  from public.claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'Klaim tidak ditemukan.';
  end if;

  select * into v_report
  from public.item_reports
  where id = v_claim.item_report_id
  for update;

  if p_new_status = 'APPROVED' and v_report.report_status <> 'ACTIVE' then
    raise exception 'Klaim hanya dapat disetujui untuk laporan yang aktif.';
  end if;

  perform set_config('app.change_reason', coalesce(p_reason, ''), true);

  update public.claims
  set claim_status = p_new_status,
      reviewed_by = auth.uid(),
      reviewed_at = now(),
      rejection_reason = case when p_new_status = 'REJECTED' then p_reason else null end,
      admin_notes = case when p_new_status = 'IN_REVIEW' then coalesce(p_reason, admin_notes) else admin_notes end
  where id = p_claim_id;

  if p_new_status = 'APPROVED' then
    perform set_config(
      'app.change_reason',
      'Klaim lain disetujui untuk barang yang sama',
      true
    );

    update public.claims
    set claim_status = 'REJECTED',
        rejection_reason = 'Klaim lain disetujui untuk barang yang sama',
        reviewed_by = auth.uid(),
        reviewed_at = now()
    where item_report_id = v_claim.item_report_id
      and id <> p_claim_id
      and claim_status in ('PENDING', 'IN_REVIEW');
  end if;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'claim',
    p_claim_id,
    'CLAIM_' || p_new_status::text,
    jsonb_build_object('claim_status', v_claim.claim_status),
    jsonb_build_object('claim_status', p_new_status),
    p_reason
  );

  v_title := case p_new_status
    when 'IN_REVIEW' then 'Klaim sedang diperiksa'
    when 'APPROVED' then 'Klaim disetujui'
    else 'Klaim ditolak'
  end;

  v_message := case p_new_status
    when 'IN_REVIEW' then 'Klaim ' || v_claim.claim_number || ' sedang diperiksa admin.'
    when 'APPROVED' then 'Klaim ' || v_claim.claim_number || ' disetujui. Tunggu jadwal penyerahan barang.'
    else 'Klaim ' || v_claim.claim_number || ' ditolak. ' || coalesce(p_reason, '')
  end;

  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id, related_claim_id)
  values (
    v_claim.claimant_id,
    v_title,
    v_message,
    'CLAIM_' || p_new_status::text,
    v_claim.item_report_id,
    p_claim_id
  );

  if p_new_status = 'APPROVED' then
    insert into public.notifications
      (user_id, title, message, notification_type, related_report_id, related_claim_id)
    values (
      v_report.user_id,
      'Barang siap diserahkan',
      'Klaim untuk laporan ' || v_report.report_number || ' telah disetujui. Admin akan mengatur penyerahan.',
      'CLAIM_APPROVED_OWNER',
      v_report.id,
      p_claim_id
    );
  end if;
end;
$$;

-- =========================================================
-- SCHEDULE HANDOVER (admin)
-- =========================================================
create or replace function public.schedule_handover(
  p_claim_id uuid,
  p_location text,
  p_scheduled_at timestamptz
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim public.claims;
  v_handover_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat menjadwalkan penyerahan.';
  end if;

  if coalesce(trim(p_location), '') = '' then
    raise exception 'Lokasi penyerahan wajib diisi.';
  end if;

  select * into v_claim
  from public.claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'Klaim tidak ditemukan.';
  end if;

  if v_claim.claim_status <> 'APPROVED' then
    raise exception 'Klaim harus disetujui sebelum penyerahan dijadwalkan.';
  end if;

  if exists (
    select 1 from public.handovers
    where claim_id = p_claim_id and handover_status = 'SCHEDULED'
  ) then
    raise exception 'Sudah ada jadwal penyerahan aktif untuk klaim ini.';
  end if;

  insert into public.handovers
    (item_report_id, claim_id, handled_by, handover_location, handover_status, scheduled_at)
  values (
    v_claim.item_report_id,
    p_claim_id,
    auth.uid(),
    p_location,
    'SCHEDULED',
    p_scheduled_at
  )
  returning id into v_handover_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, new_value)
  values (
    auth.uid(),
    'handover',
    v_handover_id,
    'HANDOVER_SCHEDULED',
    jsonb_build_object(
      'claim_id', p_claim_id,
      'location', p_location,
      'scheduled_at', p_scheduled_at
    )
  );

  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id, related_claim_id)
  values (
    v_claim.claimant_id,
    'Jadwal penyerahan barang',
    'Penyerahan dijadwalkan di ' || p_location || ' pada ' ||
      to_char(p_scheduled_at, 'DD Mon YYYY HH24:MI') || '.',
    'HANDOVER_SCHEDULED',
    v_claim.item_report_id,
    p_claim_id
  );

  return v_handover_id;
end;
$$;

-- =========================================================
-- COMPLETE HANDOVER (admin)
-- =========================================================
create or replace function public.complete_handover(
  p_handover_id uuid,
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_handover public.handovers;
  v_claim public.claims;
  v_report public.item_reports;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengonfirmasi penyerahan.';
  end if;

  select * into v_handover
  from public.handovers
  where id = p_handover_id
  for update;

  if not found then
    raise exception 'Penyerahan tidak ditemukan.';
  end if;

  if v_handover.handover_status = 'COMPLETED' then
    raise exception 'Penyerahan sudah dikonfirmasi.';
  end if;

  select * into v_claim
  from public.claims
  where id = v_handover.claim_id
  for update;

  select * into v_report
  from public.item_reports
  where id = v_handover.item_report_id
  for update;

  perform set_config(
    'app.change_reason',
    coalesce(nullif(trim(p_notes), ''), 'Barang telah diserahkan'),
    true
  );

  update public.handovers
  set handover_status = 'COMPLETED',
      completed_at = now(),
      handled_by = auth.uid(),
      confirmation_notes = p_notes
  where id = p_handover_id;

  update public.claims
  set claim_status = 'COMPLETED'
  where id = v_claim.id;

  update public.item_reports
  set report_status = 'CLOSED'
  where id = v_report.id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, new_value, reason)
  values (
    auth.uid(),
    'handover',
    p_handover_id,
    'HANDOVER_COMPLETED',
    jsonb_build_object('claim_id', v_claim.id, 'report_id', v_report.id),
    p_notes
  );

  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id, related_claim_id)
  values
    (
      v_claim.claimant_id,
      'Barang telah dikembalikan',
      'Penyerahan untuk klaim ' || v_claim.claim_number || ' telah dikonfirmasi.',
      'HANDOVER_COMPLETED',
      v_report.id,
      v_claim.id
    ),
    (
      v_report.user_id,
      'Proses pengembalian selesai',
      'Laporan ' || v_report.report_number || ' telah ditutup karena barang sudah diserahkan.',
      'REPORT_CLOSED',
      v_report.id,
      v_claim.id
    );
end;
$$;

-- =========================================================
-- CANCEL REPORT (owner)
-- =========================================================
create or replace function public.cancel_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.item_reports;
begin
  select * into v_report
  from public.item_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;

  if v_report.user_id <> auth.uid() and not public.is_admin() then
    raise exception 'Kamu tidak berhak membatalkan laporan ini.';
  end if;

  if v_report.report_status not in ('PENDING', 'NEEDS_REVISION') then
    raise exception 'Laporan pada tahap ini tidak dapat dibatalkan.';
  end if;

  if exists (
    select 1 from public.claims
    where item_report_id = p_report_id
      and claim_status in ('PENDING', 'IN_REVIEW', 'APPROVED')
  ) then
    raise exception 'Laporan memiliki klaim aktif dan tidak dapat dibatalkan.';
  end if;

  perform set_config('app.change_reason', 'Dibatalkan oleh pelapor', true);

  update public.item_reports
  set report_status = 'CLOSED'
  where id = p_report_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'item_report',
    p_report_id,
    'REPORT_CANCELLED',
    jsonb_build_object('report_status', v_report.report_status),
    jsonb_build_object('report_status', 'CLOSED'),
    'Dibatalkan oleh pelapor'
  );
end;
$$;

-- =========================================================
-- RESUBMIT REPORT (owner, setelah perbaikan)
-- =========================================================
create or replace function public.resubmit_report(p_report_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.item_reports;
begin
  select * into v_report
  from public.item_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;

  if v_report.user_id <> auth.uid() then
    raise exception 'Kamu tidak berhak mengirim ulang laporan ini.';
  end if;

  if v_report.report_status <> 'NEEDS_REVISION' then
    raise exception 'Laporan tidak berada pada tahap perbaikan.';
  end if;

  perform set_config('app.change_reason', 'Dikirim ulang oleh pelapor', true);

  update public.item_reports
  set report_status = 'PENDING',
      rejection_reason = null
  where id = p_report_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'item_report',
    p_report_id,
    'REPORT_RESUBMITTED',
    jsonb_build_object('report_status', v_report.report_status),
    jsonb_build_object('report_status', 'PENDING'),
    'Dikirim ulang oleh pelapor'
  );
end;
$$;

grant execute on function public.resubmit_report(uuid) to authenticated;
revoke execute on function public.resubmit_report(uuid) from public, anon;

-- =========================================================
-- CANCEL CLAIM (claimant)
-- =========================================================
create or replace function public.cancel_claim(p_claim_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_claim public.claims;
begin
  select * into v_claim
  from public.claims
  where id = p_claim_id
  for update;

  if not found then
    raise exception 'Klaim tidak ditemukan.';
  end if;

  if v_claim.claimant_id <> auth.uid() then
    raise exception 'Kamu tidak berhak membatalkan klaim ini.';
  end if;

  if v_claim.claim_status not in ('PENDING', 'IN_REVIEW') then
    raise exception 'Klaim pada tahap ini tidak dapat dibatalkan.';
  end if;

  perform set_config('app.change_reason', 'Dibatalkan oleh pengaju klaim', true);

  update public.claims
  set claim_status = 'CANCELLED'
  where id = p_claim_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'claim',
    p_claim_id,
    'CLAIM_CANCELLED',
    jsonb_build_object('claim_status', v_claim.claim_status),
    jsonb_build_object('claim_status', 'CANCELLED'),
    'Dibatalkan oleh pengaju klaim'
  );
end;
$$;

-- =========================================================
-- FLAG REPORT (authenticated user)
-- =========================================================
create or replace function public.flag_report(
  p_report_id uuid,
  p_reason text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_flag_id uuid;
begin
  if coalesce(trim(p_reason), '') = '' then
    raise exception 'Alasan penandaan wajib diisi.';
  end if;

  if not exists (
    select 1 from public.item_reports
    where id = p_report_id and user_id <> auth.uid()
  ) then
    raise exception 'Kamu tidak dapat menandai laporan ini.';
  end if;

  insert into public.report_flags (report_id, reporter_id, reason)
  values (p_report_id, auth.uid(), p_reason)
  on conflict (report_id, reporter_id) do nothing
  returning id into v_flag_id;

  if v_flag_id is not null then
    insert into public.audit_logs
      (actor_id, entity_type, entity_id, action, new_value)
    values (
      auth.uid(),
      'report_flag',
      v_flag_id,
      'REPORT_FLAGGED',
      jsonb_build_object('report_id', p_report_id, 'reason', p_reason)
    );
  end if;
end;
$$;

-- =========================================================
-- RESOLVE FLAG (admin)
-- =========================================================
create or replace function public.resolve_flag(
  p_flag_id uuid,
  p_status public.flag_status,
  p_note text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat meninjau flag.';
  end if;

  if p_status not in ('REVIEWED', 'DISMISSED') then
    raise exception 'Status peninjauan tidak valid.';
  end if;

  update public.report_flags
  set flag_status = p_status,
      reviewed_by = auth.uid(),
      reviewed_at = now()
  where id = p_flag_id;

  if not found then
    raise exception 'Flag tidak ditemukan.';
  end if;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, new_value, reason)
  values (
    auth.uid(),
    'report_flag',
    p_flag_id,
    'FLAG_' || p_status::text,
    jsonb_build_object('flag_status', p_status),
    p_note
  );
end;
$$;

-- =========================================================
-- NOTIFICATIONS
-- =========================================================
create or replace function public.mark_notification_read(p_notification_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set read_at = coalesce(read_at, now())
  where id = p_notification_id and user_id = auth.uid();
end;
$$;

create or replace function public.mark_all_notifications_read()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.notifications
  set read_at = now()
  where user_id = auth.uid() and read_at is null;
end;
$$;

-- =========================================================
-- PRIVATE FIELD ACCESS
-- =========================================================
create or replace function public.get_own_report_contact(p_report_id uuid)
returns table (contact_preference public.contact_preference, contact_value text)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1 from public.item_reports r
    where r.id = p_report_id
      and (r.user_id = auth.uid() or public.is_admin())
  ) then
    raise exception 'Akses ditolak.';
  end if;

  return query
    select r.contact_preference, r.contact_value
    from public.item_reports r
    where r.id = p_report_id;
end;
$$;

create or replace function public.get_claim_admin_notes(p_claim_id uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_notes text;
begin
  if not public.is_admin() then
    raise exception 'Akses ditolak.';
  end if;

  select admin_notes into v_notes
  from public.claims
  where id = p_claim_id;

  return v_notes;
end;
$$;

-- =========================================================
-- USER ROLE (admin)
-- =========================================================
create or replace function public.set_user_role(
  p_user_id uuid,
  p_role public.user_role
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_old public.user_role;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat mengubah role.';
  end if;

  select role into v_old from public.profiles where id = p_user_id;

  if not found then
    raise exception 'Pengguna tidak ditemukan.';
  end if;

  update public.profiles set role = p_role where id = p_user_id;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value)
  values (
    auth.uid(),
    'profile',
    p_user_id,
    'USER_ROLE_CHANGED',
    jsonb_build_object('role', v_old),
    jsonb_build_object('role', p_role)
  );
end;
$$;

-- =========================================================
-- PUBLIC STATS (agregat aman untuk beranda)
-- =========================================================
create or replace function public.get_public_stats()
returns table (
  total_reports bigint,
  available_items bigint,
  returned_items bigint,
  total_users bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.item_reports
      where report_status in ('ACTIVE', 'CLOSED')),
    (select count(*) from public.item_reports
      where report_status = 'ACTIVE' and report_type = 'FOUND'),
    (select count(*) from public.handovers
      where handover_status = 'COMPLETED'),
    (select count(*) from public.profiles);
$$;

grant execute on function public.get_public_stats() to anon, authenticated;

-- =========================================================
-- EXECUTE GRANTS
-- =========================================================
grant execute on function public.review_report(uuid, public.report_status, text) to authenticated;
grant execute on function public.review_claim(uuid, public.claim_status, text) to authenticated;
grant execute on function public.schedule_handover(uuid, text, timestamptz) to authenticated;
grant execute on function public.complete_handover(uuid, text) to authenticated;
grant execute on function public.cancel_report(uuid) to authenticated;
grant execute on function public.cancel_claim(uuid) to authenticated;
grant execute on function public.flag_report(uuid, text) to authenticated;
grant execute on function public.resolve_flag(uuid, public.flag_status, text) to authenticated;
grant execute on function public.mark_notification_read(uuid) to authenticated;
grant execute on function public.mark_all_notifications_read() to authenticated;
grant execute on function public.get_own_report_contact(uuid) to authenticated;
grant execute on function public.get_claim_admin_notes(uuid) to authenticated;
grant execute on function public.set_user_role(uuid, public.user_role) to authenticated;

-- Fungsi security definer tidak boleh dapat dipanggil anon/PUBLIC.
revoke execute on function public.review_report(uuid, public.report_status, text) from public, anon;
revoke execute on function public.review_claim(uuid, public.claim_status, text) from public, anon;
revoke execute on function public.schedule_handover(uuid, text, timestamptz) from public, anon;
revoke execute on function public.complete_handover(uuid, text) from public, anon;
revoke execute on function public.cancel_report(uuid) from public, anon;
revoke execute on function public.cancel_claim(uuid) from public, anon;
revoke execute on function public.flag_report(uuid, text) from public, anon;
revoke execute on function public.resolve_flag(uuid, public.flag_status, text) from public, anon;
revoke execute on function public.mark_notification_read(uuid) from public, anon;
revoke execute on function public.mark_all_notifications_read() from public, anon;
revoke execute on function public.get_own_report_contact(uuid) from public, anon;
revoke execute on function public.get_claim_admin_notes(uuid) from public, anon;
revoke execute on function public.set_user_role(uuid, public.user_role) from public, anon;
