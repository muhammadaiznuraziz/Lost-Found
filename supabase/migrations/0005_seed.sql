-- Lost&Found — data referensi awal.

insert into public.categories (name, slug, description)
values
  ('Elektronik', 'elektronik', 'Ponsel, laptop, charger, earphone, dan perangkat elektronik lain.'),
  ('Dompet dan Uang', 'dompet-uang', 'Dompet, tas kecil, uang tunai, dan kartu.'),
  ('Kartu Identitas', 'kartu-identitas', 'KTM, KTP, SIM, dan kartu identitas lain.'),
  ('Tas', 'tas', 'Tas punggung, tas jinjing, tas laptop, dan sejenisnya.'),
  ('Alat Tulis', 'alat-tulis', 'Buku, pulpen, alat gambar, dan perlengkapan belajar.'),
  ('Pakaian', 'pakaian', 'Jaket, kemeja, kaos, dan pakaian lain.'),
  ('Aksesori', 'aksesori', 'Jam tangan, gelang, cincin, kacamata, dan aksesori lain.'),
  ('Kunci', 'kunci', 'Kunci kendaraan, kunci kamar, dan gantungan kunci.'),
  ('Lainnya', 'lainnya', 'Barang yang belum masuk kategori lain.')
on conflict (slug) do update
set name = excluded.name,
    description = excluded.description;

insert into public.campus_locations (name, building, description, latitude, longitude)
values
  ('Perpustakaan Pusat', 'Gedung A', 'Area baca, ruang diskusi, dan lobi perpustakaan.', -6.9178000, 107.6185000),
  ('Gedung Fakultas Teknik', 'Gedung B', 'Ruang kelas dan lobi fakultas teknik.', -6.9186000, 107.6197000),
  ('Laboratorium Komputer', 'Gedung C', 'Laboratorium komputer lantai 2 dan 3.', -6.9192000, 107.6189000),
  ('Kantin Kampus', 'Area Terbuka', 'Kantin utama dan area makan bersama.', -6.9171000, 107.6202000),
  ('Area Parkir Utama', 'Area Terbuka', 'Parkir motor dan mobil dekat gerbang utama.', -6.9165000, 107.6193000),
  ('Auditorium', 'Gedung D', 'Aula serbaguna dan ruang seminar.', -6.9180000, 107.6208000),
  ('Masjid Kampus', 'Area Terbuka', 'Masjid dan area wudu kampus.', -6.9169000, 107.6181000),
  ('Gedung Layanan Terpadu', 'Gedung E', 'Titik penyerahan barang temuan dan layanan administrasi.', -6.9174000, 107.6190000)
on conflict (name) do update
set building = excluded.building,
    description = excluded.description,
    latitude = excluded.latitude,
    longitude = excluded.longitude;

-- =========================================================
-- PROMOSI ADMIN
-- =========================================================
-- Daftarkan akun admin lewat halaman /registrasi terlebih dahulu,
-- lalu jalankan perintah berikut dengan email admin kampus:
--
--   update public.profiles
--   set role = 'ADMIN'
--   where email = 'admin@kampus.ac.id';
--
-- Jangan pernah mengubah role dari metadata pendaftaran pengguna.
