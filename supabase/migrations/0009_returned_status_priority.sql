-- =========================================================
-- PERBAIKAN PRIORITAS display_status
-- =========================================================
-- Sebelumnya kondisi report_status = 'CLOSED' dievaluasi pertama,
-- sehingga barang yang sudah kembali (handover COMPLETED, laporan CLOSED)
-- selalu berstatus 'Ditutup' dan stamp 'Dikembalikan' tidak pernah tampil.
-- Kondisi 'Dikembalikan' dipindah ke urutan pertama.
create or replace view public.item_report_status
with (security_invoker = true)
as
select
  r.id as report_id,
  case
    when exists (
      select 1 from public.handovers h
      where h.item_report_id = r.id and h.handover_status = 'COMPLETED'
    ) then 'Dikembalikan'
    when r.report_status = 'CLOSED' then 'Ditutup'
    when exists (
      select 1 from public.claims c
      where c.item_report_id = r.id and c.claim_status = 'APPROVED'
    ) then 'Siap_Diserahkan'
    when exists (
      select 1 from public.claims c
      where c.item_report_id = r.id and c.claim_status in ('PENDING', 'IN_REVIEW')
    ) then 'Ada_Klaim'
    when r.report_status = 'ACTIVE' and r.report_type = 'FOUND' then 'Tersedia'
    when r.report_status = 'ACTIVE' and r.report_type = 'LOST' then 'Aktif'
    when r.report_status = 'PENDING' then 'Menunggu_Verifikasi'
    when r.report_status = 'NEEDS_REVISION' then 'Perlu_Perbaikan'
    when r.report_status = 'REJECTED' then 'Ditolak'
    else 'Ditutup'
  end as display_status
from public.item_reports r;

grant select on public.item_report_status to anon, authenticated;
