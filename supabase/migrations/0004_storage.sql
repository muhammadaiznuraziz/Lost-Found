-- Lost&Found — bucket dan kebijakan penyimpanan file.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'report-photos',
  'report-photos',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'claim-evidence',
  'claim-evidence',
  false,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

-- =========================================================
-- REPORT PHOTOS (publik)
-- =========================================================
drop policy if exists "report_photos_storage_read" on storage.objects;
create policy "report_photos_storage_read"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'report-photos');

drop policy if exists "report_photos_storage_insert" on storage.objects;
create policy "report_photos_storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'report-photos'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "report_photos_storage_update" on storage.objects;
create policy "report_photos_storage_update"
on storage.objects for update
to authenticated
using (
  bucket_id = 'report-photos'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "report_photos_storage_delete" on storage.objects;
create policy "report_photos_storage_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'report-photos'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

-- =========================================================
-- CLAIM EVIDENCE (privat)
-- =========================================================
drop policy if exists "claim_evidence_storage_read" on storage.objects;
create policy "claim_evidence_storage_read"
on storage.objects for select
to authenticated
using (
  bucket_id = 'claim-evidence'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);

drop policy if exists "claim_evidence_storage_insert" on storage.objects;
create policy "claim_evidence_storage_insert"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'claim-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "claim_evidence_storage_delete" on storage.objects;
create policy "claim_evidence_storage_delete"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'claim-evidence'
  and (
    (storage.foldername(name))[1] = auth.uid()::text
    or public.is_admin()
  )
);
