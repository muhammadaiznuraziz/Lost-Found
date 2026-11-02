-- =========================================================
-- MIGRATION 0012: KONTAK PENEMU UNTUK PEMILIK LAPORAN KEHILANGAN
-- =========================================================
-- Kontak penemu ditampilkan segera (laporan masih PENDING) kepada pemilik
-- laporan kehilangan yang dirujuk, sesuai keputusan produk.
-- Laporan yang REJECTED tetap disembunyikan.

-- ---------------------------------------------------------
-- 1. RPC kontak: izinkan pemilik laporan kehilangan terkait
-- ---------------------------------------------------------
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
      and (
        r.user_id = auth.uid()
        or public.is_admin()
        or (
          r.report_status <> 'REJECTED'
          and exists (
            select 1 from public.item_reports lost
            where lost.id = r.reference_report_id
              and lost.user_id = auth.uid()
          )
        )
      )
  ) then
    raise exception 'Akses ditolak.';
  end if;

  return query
    select r.contact_preference, r.contact_value
    from public.item_reports r
    where r.id = p_report_id;
end;
$$;

revoke execute on function public.get_own_report_contact(uuid) from public, anon;
grant execute on function public.get_own_report_contact(uuid) to authenticated;

-- ---------------------------------------------------------
-- 2. Sembunyikan laporan temuan yang ditolak dari pemilik
--    laporan kehilangan terkait
-- ---------------------------------------------------------
drop policy if exists "reports_select_visible" on public.item_reports;
create policy "reports_select_visible"
on public.item_reports for select
to anon, authenticated
using (
  report_status = 'ACTIVE'
  or user_id = auth.uid()
  or public.is_admin()
  or (
    report_status <> 'REJECTED'
    and public.owns_referenced_report(id)
  )
);

-- ---------------------------------------------------------
-- 3. Sertakan kontak penemu pada notifikasi pertama ke pemilik
--    laporan kehilangan
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
          || '). '
          || case
               when coalesce(new.contact_value, '') <> ''
                 and coalesce(new.contact_preference::text, 'NONE') <> 'NONE'
               then 'Kontak penemu ('
                 || case new.contact_preference
                      when 'WHATSAPP' then 'WhatsApp'
                      when 'EMAIL' then 'Email kampus'
                      else new.contact_preference::text
                    end
                 || '): ' || new.contact_value || '. '
               else 'Penemu tidak mencantumkan kontak. '
             end
          || 'Laporan masih menunggu verifikasi admin.',
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
