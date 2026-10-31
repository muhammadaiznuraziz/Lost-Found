-- =========================================================
-- MIGRATION 0010: PENGHUBUNG LAPORAN & SISTEM NOTIFIKASI
-- =========================================================

-- 1. Tambah kolom reference_report_id ke public.item_reports
alter table public.item_reports
  add column if not exists reference_report_id uuid references public.item_reports(id) on delete set null;

create index if not exists item_reports_reference_idx
  on public.item_reports (reference_report_id);

-- 2. Perbarui izin (Grants) agar authenticated dapat insert & select kolom baru
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
  contact_value,
  reference_report_id
) on public.item_reports to authenticated;

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
  rejection_reason,
  reference_report_id
) on public.item_reports to anon, authenticated;

-- 3. Perbarui trigger log_report_created() saat Budi mengirim form
create or replace function public.log_report_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref_owner uuid;
  v_ref_item_name varchar(150);
  v_ref_number varchar(30);
begin
  insert into public.report_status_history (report_id, old_status, new_status, changed_by, reason)
  values (new.id, null, 'PENDING', new.user_id, 'Laporan baru dikirim');

  -- Notifikasi konfirmasi ke pembuat laporan (Budi)
  insert into public.notifications (user_id, title, message, notification_type, related_report_id)
  values (
    new.user_id,
    'Laporan berhasil dikirim',
    'Laporan ' || new.report_number || ' sedang menunggu verifikasi admin.',
    'REPORT_CREATED',
    new.id
  );

  -- Jika laporan temuan ini merujuk ke laporan kehilangan (misal milik Aiz)
  if new.reference_report_id is not null then
    select user_id, item_name, report_number
    into v_ref_owner, v_ref_item_name, v_ref_number
    from public.item_reports
    where id = new.reference_report_id;

    -- Notifikasi ke pemilik barang hilang (Aiz)
    if v_ref_owner is not null then
      insert into public.notifications (user_id, title, message, notification_type, related_report_id)
      values (
        v_ref_owner,
        'Kabar Penemuan Barang Hilang',
        'Seseorang telah melaporkan penemuan yang merujuk pada laporan kehilangan Anda (' || coalesce(v_ref_number, '') || ' - ' || coalesce(v_ref_item_name, 'Barang Anda') || '). Laporan sedang dalam proses verifikasi admin.',
        'REFERENCE_FOUND_SUBMITTED',
        new.reference_report_id
      );
    end if;

    -- Notifikasi ke Admin
    insert into public.notifications (user_id, title, message, notification_type, related_report_id)
    select p.id,
           'Laporan Temuan Baru Merujuk Kehilangan',
           'Laporan temuan baru ' || new.report_number || ' merujuk pada laporan kehilangan ' || coalesce(v_ref_number, '') || ' (' || coalesce(v_ref_item_name, '') || ').',
           'ADMIN_REFERENCE_FOUND',
           new.id
    from public.profiles p
    where p.role = 'ADMIN';
  end if;

  return new;
end;
$$;

-- 4. Perbarui review_report() untuk notifikasi status ke Aiz dan Budi saat diverifikasi admin
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
  v_ref_owner uuid;
  v_ref_item_name varchar(150);
  v_ref_number varchar(30);
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

  -- Notifikasi ke pelapor temuan (Budi)
  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id)
  values (
    v_report.user_id,
    v_title,
    v_message,
    'REPORT_' || p_new_status::text,
    p_report_id
  );

  -- Notifikasi status ke pemilik laporan kehilangan (Aiz) jika laporan temuan disetujui
  if v_report.reference_report_id is not null and p_new_status = 'ACTIVE' then
    select user_id, item_name, report_number
    into v_ref_owner, v_ref_item_name, v_ref_number
    from public.item_reports
    where id = v_report.reference_report_id;

    if v_ref_owner is not null then
      insert into public.notifications
        (user_id, title, message, notification_type, related_report_id)
      values (
        v_ref_owner,
        'Laporan Temuan Telah Diverifikasi',
        'Laporan penemuan (' || v_report.report_number || ') yang merujuk pada kehilangan Anda (' || coalesce(v_ref_number, '') || ' - ' || coalesce(v_ref_item_name, '') || ') telah disetujui & dipublikasikan oleh Admin. Anda dapat memeriksa barang temuan tersebut.',
        'REFERENCE_FOUND_APPROVED',
        v_report.id
      );
    end if;
  end if;
end;
$$;
