-- Lost&Found — GRANT untuk service_role.
-- Tabel dibuat via `supabase db push` tidak mewarisi default privileges,
-- jadi service_role (SUPABASE_SERVICE_ROLE_KEY) juga kehilangan akses.

grant all on all tables in schema public to service_role;

grant execute on all functions in schema public to service_role;

-- pastikan default privileges juga terpasang untuk tabel/migration berikutnya
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant execute on functions to service_role;
