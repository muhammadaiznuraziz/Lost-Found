-- Lost&Found — GRANT sequence untuk role aplikasi.
-- `generate_report_number()` / `generate_claim_number()` dipanggil sebagai
-- default kolom saat insert oleh role authenticated, sehingga butuh USAGE
-- pada sequence yang dipakai.

grant usage, select on all sequences in schema public to authenticated, service_role;

alter default privileges in schema public
  grant usage, select on sequences to authenticated, service_role;
