-- =========================================================
-- MIGRATION 0013: SERAH TERIMA DI LUAR APLIKASI
-- =========================================================
-- Kasus: barang sudah dikembalikan secara langsung (offline) tanpa klaim
-- di aplikasi. Admin perlu tetap dapat menutup laporan dengan jejak audit
-- dan status "Dikembalikan".

-- ---------------------------------------------------------
-- 1. handovers: klaim opsional + simpan nama penerima
-- ---------------------------------------------------------
alter table public.handovers
  alter column claim_id drop not null;

alter table public.handovers
  add column if not exists received_by varchar(150);

-- ---------------------------------------------------------
-- 2. RPC admin: catat serah terima offline
-- ---------------------------------------------------------
create or replace function public.complete_offline_handover(
  p_report_id uuid,
  p_received_by text,
  p_handed_at timestamptz default now(),
  p_notes text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.item_reports;
  v_lost public.item_reports;
  v_claim record;
  v_reason text := 'Barang telah diserahkan di luar aplikasi';
  v_notes text;
  v_received_by text;
begin
  if not public.is_admin() then
    raise exception 'Hanya admin yang dapat mencatat serah terima.';
  end if;

  v_received_by := trim(coalesce(p_received_by, ''));
  if v_received_by = '' then
    raise exception 'Nama penerima wajib diisi.';
  end if;

  if p_handed_at is null then
    raise exception 'Tanggal penyerahan wajib diisi.';
  end if;

  if p_handed_at > now() + interval '5 minutes' then
    raise exception 'Tanggal penyerahan tidak boleh di masa depan.';
  end if;

  select * into v_report
  from public.item_reports
  where id = p_report_id
  for update;

  if not found then
    raise exception 'Laporan tidak ditemukan.';
  end if;

  if v_report.report_type <> 'FOUND' then
    raise exception 'Hanya laporan barang temuan yang dapat dicatat serah terimanya.';
  end if;

  if exists (
    select 1 from public.handovers
    where item_report_id = p_report_id
      and handover_status = 'COMPLETED'
  ) then
    raise exception 'Serah terima untuk laporan ini sudah tercatat.';
  end if;

  v_notes := nullif(trim(coalesce(p_notes, '')), '');

  perform set_config(
    'app.change_reason',
    coalesce(v_notes, v_reason),
    true
  );

  -- Tolak semua klaim aktif lain beserta notifikasinya
  for v_claim in
    select id, claimant_id, claim_number
    from public.claims
    where item_report_id = p_report_id
      and claim_status in ('PENDING', 'IN_REVIEW', 'APPROVED')
    for update
  loop
    update public.claims
    set claim_status = 'REJECTED',
        reviewed_by = auth.uid(),
        reviewed_at = now(),
        rejection_reason = v_reason
    where id = v_claim.id;

    insert into public.notifications
      (user_id, title, message, notification_type, related_report_id, related_claim_id)
    values (
      v_claim.claimant_id,
      'Klaim ditutup',
      'Klaim ' || v_claim.claim_number || ' ditutup karena barang telah diserahkan di luar aplikasi.',
      'CLAIM_REJECTED',
      p_report_id,
      v_claim.id
    );
  end loop;

  -- Catat penyerahan offline (tanpa klaim)
  insert into public.handovers
    (item_report_id, claim_id, handled_by, handover_location, handover_status,
     scheduled_at, completed_at, confirmation_notes, received_by)
  values (
    p_report_id,
    null,
    auth.uid(),
    'Di luar aplikasi',
    'COMPLETED',
    p_handed_at,
    p_handed_at,
    v_notes,
    v_received_by
  );

  -- Tutup laporan temuan
  update public.item_reports
  set report_status = 'CLOSED'
  where id = p_report_id;

  -- Tutup laporan kehilangan yang dirujuk
  if v_report.reference_report_id is not null then
    select * into v_lost
    from public.item_reports
    where id = v_report.reference_report_id
    for update;

    if v_lost.id is not null
      and v_lost.report_status in ('PENDING', 'NEEDS_REVISION', 'ACTIVE') then
      update public.item_reports
      set report_status = 'CLOSED'
      where id = v_lost.id;
    end if;
  end if;

  insert into public.audit_logs
    (actor_id, entity_type, entity_id, action, old_value, new_value, reason)
  values (
    auth.uid(),
    'item_report',
    p_report_id,
    'OFFLINE_HANDOVER_COMPLETED',
    jsonb_build_object('report_status', v_report.report_status),
    jsonb_build_object(
      'report_status', 'CLOSED',
      'received_by', v_received_by,
      'handed_at', p_handed_at
    ),
    coalesce(v_notes, v_reason)
  );

  -- Notifikasi ke pelapor temuan
  insert into public.notifications
    (user_id, title, message, notification_type, related_report_id)
  values (
    v_report.user_id,
    'Barang sudah diserahkan',
    'Laporan ' || v_report.report_number || ' ditutup karena barang telah diserahkan di luar aplikasi kepada ' || v_received_by || '.',
    'REPORT_CLOSED',
    p_report_id
  );

  -- Notifikasi ke pemilik laporan kehilangan terkait
  if v_lost.id is not null then
    insert into public.notifications
      (user_id, title, message, notification_type, related_report_id)
    values (
      v_lost.user_id,
      'Barang Anda telah kembali',
      'Laporan penemuan ' || v_report.report_number || ' (' || v_report.item_name
        || ') merujuk pada laporan kehilangan Anda (' || v_lost.report_number
        || ' - ' || v_lost.item_name || ') dan barang telah dikembalikan di luar aplikasi. '
        || 'Laporan kehilangan Anda ikut ditutup.',
      'REFERENCE_FOUND_COMPLETED',
      p_report_id
    );
  end if;
end;
$$;

revoke execute on function public.complete_offline_handover(uuid, text, timestamptz, text)
  from public, anon;
grant execute on function public.complete_offline_handover(uuid, text, timestamptz, text)
  to authenticated;

-- ---------------------------------------------------------
-- 3. Perbaiki complete_handover(): ikut tutup & notifikasi
--    laporan kehilangan yang dirujuk
-- ---------------------------------------------------------
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
  v_lost public.item_reports;
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

  -- Tutup juga laporan kehilangan yang dirujuk laporan temuan ini
  if v_report.reference_report_id is not null then
    select * into v_lost
    from public.item_reports
    where id = v_report.reference_report_id
    for update;

    if v_lost.id is not null
      and v_lost.report_status in ('PENDING', 'NEEDS_REVISION', 'ACTIVE') then
      update public.item_reports
      set report_status = 'CLOSED'
      where id = v_lost.id;
    end if;
  end if;

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

  if v_lost.id is not null then
    insert into public.notifications
      (user_id, title, message, notification_type, related_report_id, related_claim_id)
    values (
      v_lost.user_id,
      'Barang Anda telah kembali',
      'Laporan penemuan ' || v_report.report_number || ' (' || v_report.item_name
        || ') yang merujuk pada laporan kehilangan Anda (' || v_lost.report_number
        || ' - ' || v_lost.item_name || ') telah diserahkan. '
        || 'Laporan kehilangan Anda ikut ditutup.',
      'REFERENCE_FOUND_COMPLETED',
      v_report.id,
      v_claim.id
    );
  end if;
end;
$$;

-- ---------------------------------------------------------
-- 4. Pemilik laporan kehilangan terkait boleh melihat data
--    serah terima laporan temuan (agar status "Dikembalikan")
-- ---------------------------------------------------------
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
    where r.id = handovers.item_report_id
      and (
        r.user_id = auth.uid()
        or exists (
          select 1 from public.item_reports lost
          where lost.id = r.reference_report_id
            and lost.user_id = auth.uid()
        )
      )
  )
);
