-- =========================================================
-- MIGRATION 0011: AKSES BACA LAPORAN PENEMUAN TERKAIT
-- =========================================================
-- Tujuan:
-- 1. Pemilik laporan kehilangan (Aiz) dapat langsung membuka laporan
--    penemuan (milik Budi) yang merujuk laporannya, meskipun laporan
--    penemuan tersebut masih PENDING / NEEDS_REVISION.
-- 2. Notifikasi REFERENCE_FOUND_SUBMITTED mengarah ke laporan penemuan
--    (bukan ke laporan kehilangan milik Aiz).

-- ---------------------------------------------------------
-- 1. Helper function (SECURITY DEFINER) untuk menghindari rekursi RLS
-- ---------------------------------------------------------
create or replace function public.owns_referenced_report(p_report_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.item_reports found
    join public.item_reports lost
      on lost.id = found.reference_report_id
    where found.id = p_report_id
      and found.reference_report_id is not null
      and lost.user_id = auth.uid()
  );
$$;

-- Policy dievaluasi sebagai role yang melakukan query, jadi anon juga butuh
-- EXECUTE (hasilnya selalu false untuk anon karena auth.uid() = null).
revoke all on function public.owns_referenced_report(uuid) from public;
grant execute on function public.owns_referenced_report(uuid)
  to anon, authenticated;

-- ---------------------------------------------------------
-- 2. Perluas policy SELECT item_reports
-- ---------------------------------------------------------
drop policy if exists "reports_select_visible" on public.item_reports;
create policy "reports_select_visible"
on public.item_reports for select
to anon, authenticated
using (
  report_status = 'ACTIVE'
  or user_id = auth.uid()
  or public.is_admin()
  or public.owns_referenced_report(id)
);

-- Catatan: policy report_photos_select_visible memakai subquery ke
-- item_reports, sehingga foto laporan penemuan otomatis ikut terlihat
-- oleh pemilik laporan kehilangan terkait. Kolom contact_value tetap
-- tidak di-grant ke anon/authenticated (lihat 0002 & 0010), jadi kontak
-- pelapor temuan tidak ikut terbuka.

-- ---------------------------------------------------------
-- 3. Notifikasi penemuan mengarah ke laporan penemuan (Budi)
-- ---------------------------------------------------------
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

    -- Notifikasi ke pemilik barang hilang (Aiz).
    -- related_report_id = new.id agar tautan membuka laporan penemuan.
    if v_ref_owner is not null then
      insert into public.notifications (user_id, title, message, notification_type, related_report_id)
      values (
        v_ref_owner,
        'Kabar Penemuan Barang Hilang',
        'Seseorang telah melaporkan penemuan yang merujuk pada laporan kehilangan Anda ('
          || coalesce(v_ref_number, '') || ' - '
          || coalesce(v_ref_item_name, 'Barang Anda')
          || '). Anda dapat melihat detail awal penemuan sekarang; laporan masih menunggu verifikasi admin.',
        'REFERENCE_FOUND_SUBMITTED',
        new.id
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
