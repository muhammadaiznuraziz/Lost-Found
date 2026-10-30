# PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Lost&Found — Campus Lost & Found Platform

**Versi:** 1.0  
**Kategori:** Web Application  
**Platform:** Responsive Web (Desktop, Tablet, Mobile)  
**Target Pengguna:** Mahasiswa, civitas akademika, dan administrator kampus  
**Tujuan Utama:** Membantu pengguna melaporkan, mencari, mencocokkan, dan mengembalikan barang hilang di lingkungan kampus.

---

# 1. PRODUCT OVERVIEW

## 1.1. Deskripsi Produk

Lost&Found adalah platform berbasis web yang dirancang untuk membantu civitas akademika menemukan kembali barang yang hilang dan melaporkan barang yang ditemukan di lingkungan kampus.

Website ini menyediakan sistem pelaporan terpusat sehingga informasi mengenai barang hilang dan barang temuan tidak lagi tersebar di grup WhatsApp, media sosial, atau pengumuman yang sulit dilacak.

Pengguna dapat mencari barang berdasarkan nama, kategori, tanggal, dan lokasi umum. Jika menemukan barang yang diduga miliknya, pengguna dapat mengajukan klaim kepemilikan melalui sistem yang dikelola administrator.

Administrator bertugas memverifikasi laporan, memeriksa klaim, dan memperbarui status barang hingga proses pengembalian selesai.

## 1.2. Problem Statement

Saat ini, informasi barang hilang di lingkungan kampus dapat tersebar di berbagai saluran komunikasi. Kondisi tersebut menimbulkan beberapa permasalahan:

1. Mahasiswa kesulitan menemukan informasi barang yang hilang.
2. Informasi barang temuan tidak tersimpan dalam satu tempat.
3. Pencarian laporan lama menjadi sulit.
4. Tidak ada mekanisme standar untuk memverifikasi kepemilikan barang.
5. Pemilik barang berisiko kehilangan kesempatan menemukan barangnya karena tidak mengetahui adanya laporan barang temuan.
6. Informasi kontak dan ciri barang berpotensi tersebar tanpa kontrol yang memadai.

Lost&Found bertujuan menyediakan satu platform yang lebih terstruktur, mudah digunakan, dan memperhatikan keamanan informasi.

## 1.3. Product Vision

Menjadi platform pencarian dan pelaporan barang hilang di lingkungan kampus yang mudah diakses, transparan, dan membantu mempertemukan barang dengan pemilik yang tepat.

## 1.4. Unique Value Proposition

Lost&Found menggabungkan tiga proses utama dalam satu platform:

- **Report:** Melaporkan barang hilang atau ditemukan.
- **Discover:** Mencari dan menemukan laporan barang yang relevan.
- **Recover:** Memverifikasi kepemilikan dan memfasilitasi pengembalian barang.

Nilai utama produk bukan hanya menyediakan katalog barang, melainkan membantu pengguna menyelesaikan proses kehilangan barang sampai tahap pengembalian.

---

# 2. PRODUCT OBJECTIVES

## 2.1. Tujuan Produk

1. Mempermudah mahasiswa membuat laporan barang hilang dan barang temuan.
2. Memusatkan seluruh laporan dalam satu platform.
3. Mempermudah pencarian melalui kategori, tanggal, dan lokasi.
4. Menyediakan proses klaim yang terstruktur.
5. Membantu admin memverifikasi laporan dan klaim.
6. Mengurangi risiko klaim palsu dan penyalahgunaan informasi.
7. Menyediakan pengalaman pengguna yang mudah dipahami oleh pengguna baru.

## 2.2. Success Metrics

Indikator keberhasilan awal yang akan dievaluasi:

| Metrik                                         | Target awal                                                 |
| ---------------------------------------------- | ----------------------------------------------------------- |
| Tingkat keberhasilan menyelesaikan tugas utama | Minimal 85% peserta uji berhasil                            |
| Keberhasilan membuat laporan                   | Minimal 90% peserta uji berhasil                            |
| Keberhasilan menemukan laporan yang relevan    | Minimal 85% peserta uji berhasil                            |
| Kesalahan saat mengisi formulir                | Semakin sedikit dari pengujian awal ke pengujian berikutnya |
| Kepuasan pengguna                              | Target rata-rata minimal 4 dari 5                           |
| Kelengkapan informasi laporan                  | Seluruh field wajib terisi sebelum pengiriman               |

Angka di atas merupakan target awal proyek, bukan hasil pengukuran. Target dapat disesuaikan setelah pengujian usability dilakukan.

---

# 3. TARGET USERS

## 3.1. Mahasiswa yang Kehilangan Barang

**Karakteristik:**

- Kehilangan barang di area kampus.
- Membutuhkan cara cepat untuk mencari informasi.
- Tidak selalu mengetahui apakah barangnya sudah ditemukan.

**Kebutuhan:**

- Membuat laporan kehilangan.
- Mencari barang temuan.
- Memeriksa status laporan.
- Mengajukan klaim kepemilikan.

**Pain Points:**

- Informasi tersebar di berbagai grup.
- Sulit mengetahui apakah barang telah ditemukan.
- Tidak mengetahui siapa yang harus dihubungi.

## 3.2. Mahasiswa yang Menemukan Barang

**Karakteristik:**

- Menemukan barang yang diduga milik orang lain.
- Ingin membantu mengembalikan barang.
- Membutuhkan proses pelaporan yang sederhana.

**Kebutuhan:**

- Melaporkan barang temuan.
- Mengunggah foto dan deskripsi barang.
- Mengetahui prosedur penyerahan barang.
- Memastikan barang diserahkan kepada pihak yang tepat.

## 3.3. Administrator Kampus

**Karakteristik:**

- Mengelola laporan barang hilang dan temuan.
- Memeriksa klaim kepemilikan.
- Memperbarui status laporan.

**Kebutuhan:**

- Melihat seluruh laporan.
- Memverifikasi informasi.
- Memproses klaim.
- Mencatat hasil penyerahan barang.
- Menangani laporan mencurigakan.

---

# 4. USER ROLES & PERMISSIONS

Sistem memiliki dua role utama.

## 4.1. Student / Pengguna

Pengguna dapat:

- Melihat halaman publik.
- Mencari barang hilang atau ditemukan.
- Melihat detail laporan yang dipublikasikan.
- Mendaftar dan login.
- Membuat laporan kehilangan.
- Membuat laporan barang temuan.
- Mengajukan klaim barang.
- Melihat laporan miliknya.
- Memantau status laporan dan klaim.
- Membatalkan laporan miliknya jika belum memasuki tahap yang tidak memungkinkan pembatalan.

Pengguna tidak dapat:

- Memverifikasi laporan miliknya sendiri.
- Mengubah status verifikasi.
- Melihat data pribadi pengguna lain secara bebas.
- Menyetujui klaim atas barang yang dilaporkan oleh orang lain.

## 4.2. Admin

Admin dapat:

- Melihat seluruh laporan.
- Memverifikasi laporan.
- Menyetujui atau menolak publikasi laporan.
- Memeriksa klaim.
- Memperbarui status barang.
- Menandai barang telah dikembalikan.
- Menangani laporan mencurigakan.
- Melihat statistik.
- Mengakses riwayat perubahan status.

Admin wajib memberikan alasan ketika menolak laporan atau klaim.

**Aturan penting:** Hak akses admin harus diperiksa oleh sistem backend, bukan hanya dengan menyembunyikan tombol pada frontend.

---

# 5. INFORMATION ARCHITECTURE

## 5.1. Struktur Halaman Publik

```text
Lost&Found
│
├── Beranda
│
├── Cari Barang
│   ├── Semua Barang
│   ├── Barang Hilang
│   ├── Barang Ditemukan
│   └── Detail Barang
│
├── Peta Kampus
│
├── Cara Kerja
│
├── Laporkan
│   ├── Pilih Jenis Laporan
│   ├── Formulir Barang Hilang
│   ├── Formulir Barang Temuan
│   └── Konfirmasi Laporan
│
├── Login
│
├── Registrasi
│
└── Dashboard Pengguna
    ├── Ringkasan Aktivitas
    ├── Laporan Saya
    ├── Klaim Saya
    ├── Detail Laporan
    ├── Detail Klaim
    ├── Notifikasi
    └── Profil
```

## 5.2. Struktur Admin Dashboard

```text
Admin Dashboard
│
├── Overview
│
├── Manajemen Laporan
│   ├── Laporan Menunggu Verifikasi
│   ├── Laporan Aktif
│   ├── Laporan Ditolak
│   └── Detail Laporan
│
├── Manajemen Klaim
│   ├── Klaim Menunggu Verifikasi
│   ├── Klaim Disetujui
│   ├── Klaim Ditolak
│   └── Detail Klaim
│
├── Pengembalian Barang
│   ├── Barang Siap Diserahkan
│   └── Riwayat Pengembalian
│
├── Pengguna
│
├── Laporan Mencurigakan
│
└── Pengaturan
```

---

# 6. CORE FEATURES

## 6.1. Beranda

### Tujuan

Mengarahkan pengguna ke tindakan utama dengan cepat.

### Komponen

- Navbar.
- Hero section.
- Search bar.
- Tombol Cari Barang.
- Tombol Laporkan.
- Kategori barang.
- Barang yang baru ditemukan.
- Ringkasan cara kerja.
- Informasi keamanan.
- FAQ.
- Footer.

### Functional Requirements

- Pengguna dapat memulai pencarian dari beranda.
- Pengguna dapat memilih jenis laporan.
- Pengguna dapat membuka detail barang.
- Sistem hanya menampilkan laporan yang telah disetujui untuk dipublikasikan.

## 6.2. Pencarian Barang

### Tujuan

Membantu pengguna menemukan laporan yang relevan.

### Fitur

- Pencarian berdasarkan kata kunci.
- Filter jenis laporan.
- Filter kategori.
- Filter lokasi.
- Filter tanggal.
- Pengurutan berdasarkan tanggal terbaru.
- Pagination atau pemuatan hasil bertahap.
- Empty state.
- Loading state.

### Functional Requirements

1. Pengguna dapat mencari menggunakan nama atau deskripsi umum barang.
2. Pengguna dapat menggabungkan beberapa filter.
3. Sistem menampilkan hasil yang sesuai dengan kriteria.
4. Sistem menampilkan pesan jika tidak ada hasil.
5. Pengguna dapat menghapus filter.
6. Sistem tidak menampilkan laporan yang ditolak atau belum disetujui.

### Contoh Kategori

- Elektronik.
- Dompet dan uang.
- Kartu identitas.
- Tas.
- Alat tulis.
- Pakaian.
- Aksesori.
- Kunci.
- Lainnya.

## 6.3. Detail Barang

### Informasi yang Ditampilkan

- Foto barang.
- Nama atau jenis barang.
- Kategori.
- Tanggal kehilangan atau ditemukan.
- Lokasi umum.
- Deskripsi publik.
- Status laporan.
- Tombol tindakan yang relevan.

### Aturan

- Barang hilang menampilkan tombol yang mengarahkan pengguna untuk melihat prosedur pencarian atau membuat laporan.
- Barang temuan menampilkan tombol Ajukan Klaim.
- Kontak pribadi tidak ditampilkan secara terbuka.
- Informasi sensitif yang dapat dipakai untuk mengklaim barang tidak boleh ditampilkan secara publik.

## 6.4. Formulir Barang Hilang

### Field

| Field                      | Tipe                  | Wajib            |
| -------------------------- | --------------------- | ---------------- |
| Nama barang                | Text                  | Ya               |
| Kategori                   | Select                | Ya               |
| Tanggal kehilangan         | Date                  | Ya               |
| Lokasi terakhir terlihat   | Select                | Ya               |
| Deskripsi barang           | Textarea              | Ya               |
| Foto referensi             | Upload                | Tidak            |
| Kontak yang bisa dihubungi | Pilihan kontak privat | Sesuai kebijakan |

### Functional Requirements

- Validasi dilakukan sebelum laporan dikirim.
- Field wajib ditandai dengan jelas.
- Pengguna menerima pesan kesalahan yang spesifik.
- Pengguna dapat membatalkan pengisian.
- Data yang sudah diisi tidak hilang hanya karena terjadi kesalahan validasi.
- Setelah pengiriman berhasil, sistem membuat nomor laporan unik.

## 6.5. Formulir Barang Temuan

### Field

| Field                  | Tipe     | Wajib                          |
| ---------------------- | -------- | ------------------------------ |
| Nama atau jenis barang | Text     | Ya                             |
| Kategori               | Select   | Ya                             |
| Tanggal ditemukan      | Date     | Ya                             |
| Lokasi ditemukan       | Select   | Ya                             |
| Deskripsi publik       | Textarea | Ya                             |
| Foto barang            | Upload   | Disarankan                     |
| Lokasi penyerahan      | Select   | Ya jika titik layanan tersedia |

### Functional Requirements

- Sistem memvalidasi data laporan.
- Pengguna dapat mengunggah foto yang sesuai.
- Sistem menampilkan informasi tentang perlindungan privasi.
- Sistem memberikan nomor laporan setelah pengiriman berhasil.
- Barang berharga dapat diarahkan ke prosedur penyerahan melalui petugas kampus.

## 6.6. Sistem Klaim Barang

### Tujuan

Memastikan barang diserahkan kepada pemilik yang tepat.

### Alur

1. Pengguna membuka detail barang temuan.
2. Pengguna memilih Ajukan Klaim.
3. Sistem meminta login jika pengguna belum terautentikasi.
4. Pengguna mengisi informasi pendukung kepemilikan.
5. Sistem menyimpan klaim.
6. Admin memeriksa klaim.
7. Admin menyetujui atau menolak klaim dengan alasan.
8. Jika disetujui, proses penyerahan barang dilakukan melalui prosedur yang ditentukan.
9. Admin mencatat penyelesaian pengembalian.

### Data Klaim

- ID klaim.
- ID barang.
- ID pengaju.
- Informasi pendukung kepemilikan.
- Waktu pengajuan.
- Status.
- Catatan admin.
- Riwayat perubahan status.

### Status Klaim

- Menunggu Verifikasi.
- Sedang Diperiksa.
- Disetujui.
- Ditolak.
- Selesai.
- Dibatalkan.

### Aturan Bisnis

- Pengguna tidak dapat mengklaim barang yang dilaporkannya sendiri sebagai barang temuan.
- Pengguna dapat memiliki klaim aktif hanya sesuai kebijakan yang ditentukan untuk setiap barang.
- Admin harus memeriksa bukti kepemilikan sebelum menyetujui klaim.
- Informasi sensitif pada bukti klaim hanya dapat diakses oleh pihak berwenang.
- Klaim yang disetujui belum berarti barang telah dikembalikan.
- Status Selesai hanya diberikan setelah penyerahan dikonfirmasi.

## 6.7. Dashboard Pengguna

### Informasi

- Total laporan kehilangan.
- Total laporan barang temuan.
- Klaim yang sedang diproses.
- Aktivitas terbaru.
- Status masing-masing laporan.

### Fitur

- Melihat detail laporan.
- Memantau perubahan status.
- Melihat alasan penolakan.
- Membatalkan laporan sesuai aturan.
- Memperbarui informasi profil.

## 6.8. Admin Dashboard

### Overview

Menampilkan:

- Total laporan.
- Laporan menunggu verifikasi.
- Barang ditemukan yang masih aktif.
- Klaim menunggu pemeriksaan.
- Barang yang sudah dikembalikan.

### Manajemen Laporan

Admin dapat:

- Membuka detail laporan.
- Memeriksa kelengkapan informasi.
- Menyetujui laporan.
- Menolak laporan dengan alasan.
- Meminta perbaikan jika diperlukan.
- Memperbarui status laporan.

### Manajemen Klaim

Admin dapat:

- Melihat informasi klaim.
- Memeriksa bukti kepemilikan.
- Menyetujui klaim.
- Menolak klaim dengan alasan.
- Mencatat proses penyerahan barang.

### Audit Trail

Sistem mencatat perubahan penting, termasuk:

- Siapa yang melakukan perubahan.
- Data yang berubah.
- Waktu perubahan.
- Alasan perubahan jika relevan.

---

# 7. USER FLOWS

## 7.1. Flow: Mencari Barang

```text
Beranda
   ↓
Cari Barang
   ↓
Masukkan Kata Kunci
   ↓
Pilih Filter
   ↓
Lihat Hasil
   ↓
Pilih Barang
   ↓
Detail Barang
   ↓
Ajukan Klaim jika Barang Temuan
```

## 7.2. Flow: Melaporkan Barang Hilang

```text
Beranda
   ↓
Laporkan
   ↓
Pilih Barang Hilang
   ↓
Login jika Belum Masuk
   ↓
Isi Formulir
   ↓
Validasi Input
   ↓
Kirim Laporan
   ↓
Konfirmasi Berhasil
   ↓
Menunggu Verifikasi
   ↓
Laporan Dipublikasikan jika Disetujui
```

## 7.3. Flow: Melaporkan Barang Temuan

```text
Beranda
   ↓
Laporkan
   ↓
Pilih Barang Temuan
   ↓
Login jika Belum Masuk
   ↓
Isi Formulir
   ↓
Kirim Laporan
   ↓
Konfirmasi Berhasil
   ↓
Menunggu Verifikasi
   ↓
Laporan Dipublikasikan jika Disetujui
   ↓
Klaim Diajukan oleh Calon Pemilik
   ↓
Admin Memeriksa Klaim
   ↓
Penyerahan Barang
   ↓
Selesai
```

## 7.4. Flow: Admin Memproses Klaim

```text
Admin Login
   ↓
Dashboard
   ↓
Manajemen Klaim
   ↓
Pilih Klaim
   ↓
Periksa Informasi
   ↓
Keputusan Admin
   ├── Ditolak → Alasan Penolakan
   └── Disetujui
           ↓
      Atur Penyerahan
           ↓
      Konfirmasi Penyerahan
           ↓
         Selesai
```

---

# 8. UI/UX REQUIREMENTS

Karena produk ini dibuat untuk tugas mata kuliah Interaksi Manusia dan Komputer, aspek usability menjadi bagian inti dari kebutuhan produk.

## 8.1. Design Principles

### A. Clarity

Pengguna harus memahami fungsi tombol, formulir, dan status tanpa perlu menebak.

### B. Consistency

Warna, tipografi, komponen, istilah, dan pola navigasi harus konsisten.

### C. Feedback

Setiap tindakan penting harus menghasilkan respons yang jelas.

Contoh:

- Laporan berhasil dikirim.
- Foto gagal diunggah.
- Klaim sedang diperiksa.
- Sesi login telah berakhir.

### D. Error Prevention

Sistem mencegah kesalahan sebelum terjadi.

Contoh:

- Validasi field wajib.
- Konfirmasi sebelum membatalkan laporan.
- Batasan tipe dan ukuran foto.
- Peringatan sebelum mengirim data yang belum lengkap.

### E. Recognition over Recall

Pengguna tidak perlu mengingat informasi dari halaman sebelumnya jika informasi tersebut dapat ditampilkan kembali.

### F. User Control

Pengguna dapat membatalkan tindakan yang belum selesai atau kembali ke halaman sebelumnya tanpa kehilangan seluruh data yang sudah diisi.

## 8.2. Responsive Design

Website harus dapat digunakan pada:

- Desktop.
- Tablet.
- Smartphone.

### Desktop

- Navbar horizontal.
- Grid beberapa kolom.
- Dashboard admin dengan sidebar.
- Formulir yang tidak terlalu lebar.

### Mobile

- Navigasi yang mudah dijangkau.
- Card dalam satu kolom jika diperlukan.
- Tombol utama dengan area sentuh memadai.
- Formulir yang mudah diisi.
- Tidak ada horizontal scrolling yang tidak diperlukan.

## 8.3. Accessibility

- Kontras warna teks dan latar memadai.
- Informasi tidak disampaikan melalui warna saja.
- Label formulir jelas.
- Navigasi keyboard didukung pada elemen interaktif.
- Gambar informatif memiliki teks alternatif.
- Pesan kesalahan dapat dikenali dengan jelas.
- Ukuran teks dapat dibaca tanpa harus memperbesar layar secara berlebihan.

## 8.4. Design System

Design system minimal mencakup:

- Color tokens.
- Typography scale.
- Spacing scale.
- Buttons.
- Inputs.
- Selects.
- Search bar.
- Item cards.
- Status badges.
- Modal.
- Toast notifications.
- Empty states.
- Loading states.
- Error states.
- Pagination.
- Navigation components.

Seluruh komponen utama harus dirancang sebagai reusable components di Figma.

---

# 9. STATUS SYSTEM

Status laporan dan status klaim harus dipisahkan agar pengguna tidak salah memahami proses.

## 9.1. Status Laporan

| Status              | Makna                                      |
| ------------------- | ------------------------------------------ |
| Menunggu Verifikasi | Laporan baru dikirim dan belum diputuskan  |
| Perlu Perbaikan     | Pengguna perlu melengkapi informasi        |
| Aktif               | Laporan sudah disetujui dan dipublikasikan |
| Ditolak             | Laporan tidak dapat dipublikasikan         |
| Ditutup             | Laporan tidak lagi aktif                   |

## 9.2. Status Barang Temuan

| Status              | Makna                                                         |
| ------------------- | ------------------------------------------------------------- |
| Menunggu Verifikasi | Laporan barang temuan sedang diperiksa                        |
| Tersedia            | Barang telah disetujui untuk dipublikasikan                   |
| Ada Klaim           | Setidaknya satu klaim sedang diperiksa                        |
| Siap Diserahkan     | Klaim telah disetujui dan proses penyerahan dapat dilanjutkan |
| Dikembalikan        | Barang telah diserahkan dan proses dikonfirmasi               |
| Ditutup             | Laporan telah ditutup                                         |

**Catatan implementasi:** Status barang temuan di atas adalah **status turunan** yang dihitung dari `report_status`, status klaim, dan status penyerahan. Status ini tidak disimpan sebagai kolom terpisah agar tidak terjadi duplikasi data. Implementasinya berupa view `item_report_status` pada database.

## 9.3. Status Klaim

| Status              | Makna                                |
| ------------------- | ------------------------------------ |
| Menunggu Verifikasi | Klaim baru diajukan                  |
| Sedang Diperiksa    | Admin sedang memeriksa bukti         |
| Disetujui           | Klaim dinyatakan valid               |
| Ditolak             | Klaim tidak memenuhi persyaratan     |
| Selesai             | Penyerahan barang telah dikonfirmasi |
| Dibatalkan          | Klaim dibatalkan sesuai kebijakan    |

Perubahan status harus mengikuti transisi yang ditentukan. Pengguna biasa tidak boleh mengubah status verifikasi atau status pengembalian secara langsung.

---

# 10. DATA MODEL

Model data awal yang disarankan menggunakan PostgreSQL.

## 10.1. profiles

Menyimpan informasi profil pengguna. Identitas autentikasi tetap dikelola oleh Supabase Auth (`auth.users`), sehingga password tidak pernah disimpan di tabel aplikasi.

- id (PK, FK ke `auth.users.id`)
- full_name
- email
- student_id (unik, opsional)
- role
- avatar_url
- created_at
- updated_at

`role` memiliki nilai `STUDENT` dan `ADMIN`. Pengguna tidak boleh mengubah role miliknya sendiri menjadi `ADMIN`; perubahan role hanya melalui mekanisme administratif.

## 10.2. item_reports

Menyimpan laporan kehilangan dan barang temuan.

- id
- report_number
- user_id
- report_type
- item_name
- category_id
- description_public
- date_occurred
- location_id
- dropoff_location_id (lokasi penyerahan untuk laporan `FOUND`, opsional)
- contact_preference
- contact_value (disimpan privat, tidak pernah ditampilkan publik)
- report_status
- created_at
- updated_at
- reviewed_by
- reviewed_at
- rejection_reason

Foto laporan **tidak** disimpan sebagai satu kolom `photo_url`, melainkan pada tabel terpisah `report_photos` agar satu laporan dapat memiliki beberapa foto.

`report_type` memiliki nilai:

- LOST
- FOUND

## 10.3. categories

Menyimpan kategori barang.

- id
- name
- slug
- is_active

## 10.4. campus_locations

Menyimpan daftar area atau lokasi kampus.

- id
- name
- building
- description
- is_active

Untuk MVP, gunakan lokasi yang telah ditentukan, bukan mengharuskan pengguna membagikan koordinat GPS secara presisi.

## 10.5. claims

Menyimpan pengajuan klaim barang.

- id
- claim_number
- item_report_id
- claimant_id
- ownership_description
- claim_status
- admin_notes
- reviewed_by
- reviewed_at
- rejection_reason
- created_at
- updated_at

Bukti kepemilikan **tidak** disimpan sebagai satu kolom `evidence_url`, melainkan pada tabel terpisah `claim_evidence` dengan penyimpanan privat.

## 10.6. handovers

Mencatat proses penyerahan barang.

- id
- item_report_id
- claim_id
- handled_by
- handover_location
- handover_status
- scheduled_at
- completed_at
- confirmation_notes
- created_at

## 10.7. notifications

Menyimpan notifikasi untuk pengguna.

- id
- user_id
- title
- message
- notification_type
- related_report_id
- related_claim_id
- read_at
- created_at

## 10.8. audit_logs

Menyimpan catatan perubahan penting.

- id
- actor_id
- entity_type
- entity_id
- action
- old_value
- new_value
- reason
- created_at

## 10.9. report_photos

Menyimpan referensi foto laporan (satu laporan dapat memiliki banyak foto).

- id
- report_id
- storage_path
- alt_text
- is_primary
- sort_order
- created_at

## 10.10. claim_evidence

Menyimpan bukti pendukung klaim pada penyimpanan privat.

- id
- claim_id
- storage_path
- evidence_type
- description
- created_at

## 10.11. report_flags

Menyimpan laporan konten mencurigakan yang perlu ditinjau admin.

- id
- report_id
- reporter_id
- reason
- flag_status
- reviewed_by
- reviewed_at
- created_at

### Relasi Utama

- Satu pengguna dapat membuat banyak laporan.
- Satu kategori dapat digunakan oleh banyak laporan.
- Satu laporan dapat memiliki banyak foto.
- Satu laporan barang temuan dapat memiliki beberapa pengajuan klaim, sesuai kebijakan sistem.
- Satu klaim dapat memiliki banyak bukti kepemilikan.
- Satu klaim dapat memiliki catatan proses penyerahan.
- Satu pengguna dapat menerima banyak notifikasi.
- Satu laporan dapat ditandai mencurigakan lebih dari sekali oleh pengguna berbeda.

**Catatan:** Struktur ini adalah rancangan awal. Relasi dan batasan harus disesuaikan dengan kebijakan kampus serta aturan penanganan klaim.

---

# 11. NON-FUNCTIONAL REQUIREMENTS

## 11.1. Performance

- Halaman utama diupayakan tampil dalam waktu sekitar 3 detik pada kondisi jaringan yang memadai.
- Gambar dioptimalkan agar tidak memperlambat halaman.
- Pencarian tidak boleh memuat seluruh data sekaligus.
- Loading state ditampilkan ketika proses membutuhkan waktu.

## 11.2. Security

- Autentikasi diperlukan untuk membuat laporan dan klaim.
- Hak akses diverifikasi di backend.
- Data pengguna dibatasi berdasarkan izin.
- Foto bukti kepemilikan tidak boleh menjadi file publik.
- Validasi input dilakukan di frontend dan backend.
- Upload dibatasi berdasarkan tipe file dan ukuran.
- Tindakan admin dicatat dalam audit log.
- Kredensial dan secret tidak disimpan di kode frontend.
- Kebijakan akses database harus mencegah pengguna membaca atau mengubah data yang bukan haknya.

## 11.3. Privacy

- Pengguna hanya diminta memberikan data yang diperlukan.
- Kontak pribadi tidak dipublikasikan secara otomatis.
- Foto tidak boleh menampilkan informasi sensitif secara tidak perlu.
- Bukti kepemilikan hanya dapat diakses oleh pihak berwenang.
- Data memiliki kebijakan retensi dan penghapusan yang jelas.

## 11.4. Reliability

- Sistem menampilkan pesan jika proses gagal.
- Pengguna tidak boleh menerima konfirmasi berhasil sebelum data benar-benar tersimpan.
- Pengiriman formulir harus mencegah duplikasi akibat klik berulang.
- Perubahan status penting harus tersimpan secara konsisten.

---

# 12. TECH STACK

Rekomendasi implementasi untuk versi web.

| Layer           | Teknologi               |
| --------------- | ----------------------- |
| UI/UX Design    | Figma                   |
| Frontend        | Next.js + TypeScript    |
| Styling         | Tailwind CSS            |
| UI Components   | Komponen reusable       |
| Database        | Supabase PostgreSQL     |
| Authentication  | Supabase Auth           |
| File Storage    | Supabase Storage        |
| Maps            | Leaflet + OpenStreetMap |
| Deployment      | Vercel                  |
| Version Control | Git + GitHub            |

### Arsitektur Sederhana

```text
User / Admin
     ↓
Next.js Web Application
     ↓
Authentication & Authorization
     ↓
Supabase
     ├── PostgreSQL
     ├── Storage
     └── Database Policies
```

Gunakan database policies dan pemeriksaan otorisasi yang sesuai untuk membatasi akses data.

Untuk tahap awal, peta dapat menggunakan gambar atau peta kampus sederhana. Integrasi peta interaktif dapat ditambahkan setelah fungsi pelaporan dan pencarian stabil.

---

# 13. MVP SCOPE

MVP adalah versi awal yang memiliki fitur minimum untuk menguji apakah produk benar-benar membantu pengguna.

## 13.1. Must Have

- Beranda.
- Pencarian barang.
- Filter kategori dan lokasi.
- Detail barang.
- Registrasi dan login.
- Formulir barang hilang.
- Formulir barang temuan.
- Upload foto.
- Dashboard pengguna.
- Pengajuan klaim.
- Admin dashboard.
- Verifikasi laporan.
- Verifikasi klaim.
- Status laporan dan klaim.
- Konfirmasi pengembalian barang.
- Validasi formulir.
- Kontrol akses.
- Responsive design.

## 13.2. Should Have

- Peta kampus interaktif.
- Notifikasi dalam aplikasi.
- Riwayat aktivitas.
- Audit log.
- Filter tanggal.
- Pelaporan konten mencurigakan.

## 13.3. Could Have

- Rekomendasi laporan yang mirip.
- Pencocokan otomatis laporan kehilangan dan temuan.
- Notifikasi email.
- Statistik tingkat pengembalian barang.
- QR code untuk nomor laporan.

## 13.4. Won't Have in MVP

- Aplikasi Android native.
- Aplikasi iOS native.
- Chat pribadi antarpengguna.
- Integrasi WhatsApp otomatis.
- Pengenalan barang berbasis AI.
- Sistem multi-kampus.
- Pembayaran atau transaksi finansial.

Fitur yang tidak masuk MVP dapat dipertimbangkan setelah kebutuhan pengguna dan kelayakan implementasi dievaluasi.

---

# 14. USABILITY TESTING PLAN

Pengujian dilakukan untuk mengetahui apakah desain mudah dipahami dan digunakan.

## 14.1. Target Peserta

Mulai dengan 5–10 mahasiswa sebagai pengujian eksploratif. Jumlah ini membantu menemukan masalah usability awal, tetapi tidak otomatis mewakili seluruh populasi mahasiswa.

## 14.2. Skenario Pengujian

### Task 1 — Mencari Barang

"Temukan laporan dompet hitam yang ditemukan di perpustakaan."

Indikator:

- Pengguna menemukan menu pencarian.
- Pengguna menggunakan filter dengan benar.
- Pengguna membuka laporan yang relevan.

### Task 2 — Melaporkan Kehilangan

"Bayangkan kamu kehilangan kartu mahasiswa. Buat laporan kehilangan."

Indikator:

- Pengguna memilih jenis laporan yang tepat.
- Pengguna mengisi formulir.
- Pengguna memahami status setelah laporan dikirim.

### Task 3 — Melaporkan Barang Temuan

"Bayangkan kamu menemukan tumbler di gedung kampus. Laporkan barang tersebut."

Indikator:

- Pengguna memilih formulir yang tepat.
- Pengguna memahami informasi yang harus diisi.
- Pengguna menyelesaikan pelaporan.

### Task 4 — Mengajukan Klaim

"Temukan barang yang kamu yakini milikmu dan ajukan klaim."

Indikator:

- Pengguna memahami tombol klaim.
- Pengguna dapat mengisi informasi pendukung.
- Pengguna memahami bahwa klaim harus diverifikasi.

## 14.3. Data yang Dicatat

- Tingkat penyelesaian tugas.
- Waktu penyelesaian.
- Jumlah kesalahan.
- Titik ketika pengguna mengalami kebingungan.
- Masukan dari pengguna.
- Penilaian kemudahan penggunaan.

## 14.4. Iterasi Desain

Setelah pengujian:

1. Identifikasi masalah dengan dampak terbesar.
2. Prioritaskan masalah yang menghalangi penyelesaian tugas.
3. Perbaiki desain.
4. Uji ulang alur yang telah diperbaiki.
5. Dokumentasikan perubahan sebelum dan sesudah.

---

# 15. ACCEPTANCE CRITERIA

Fitur dianggap memenuhi kebutuhan ketika kriteria berikut terpenuhi.

## Pencarian

- Pengguna dapat mencari berdasarkan kata kunci.
- Filter bekerja sesuai pilihan pengguna.
- Tidak ada hasil menampilkan empty state yang jelas.
- Laporan yang belum disetujui tidak tampil secara publik.

## Pelaporan

- Field wajib divalidasi.
- Pesan kesalahan mudah dipahami.
- Nomor laporan dibuat setelah penyimpanan berhasil.
- Pengguna dapat melihat status laporannya.

## Klaim

- Klaim terhubung dengan laporan barang temuan.
- Pengguna harus login.
- Admin dapat memeriksa bukti.
- Keputusan penolakan memiliki alasan.
- Klaim yang disetujui belum dianggap selesai sebelum penyerahan dikonfirmasi.

## Admin

- Admin dapat memverifikasi laporan dan klaim.
- Perubahan status tersimpan.
- Hak akses diperiksa di backend.
- Tindakan penting tercatat.

## Responsive Design

- Halaman dapat digunakan di desktop dan mobile.
- Formulir tidak terpotong.
- Tombol utama dapat dijangkau dan dibaca.
- Navigasi tetap konsisten.

---

# 16. DEVELOPMENT ROADMAP

## Phase 1 — Research & Planning

- Identifikasi masalah pengguna.
- Wawancara mahasiswa.
- Tentukan kebutuhan prioritas.
- Buat user persona.
- Buat user journey.
- Buat information architecture.

## Phase 2 — UI/UX Design

- Buat design system.
- Buat wireframe.
- Buat high-fidelity UI.
- Buat prototype interaktif.
- Lakukan usability testing.
- Perbaiki desain.

## Phase 3 — Core Development

- Setup proyek.
- Implementasi autentikasi.
- Implementasi database.
- Implementasi formulir laporan.
- Implementasi pencarian.
- Implementasi detail barang.

## Phase 4 — Claim & Admin

- Implementasi pengajuan klaim.
- Implementasi verifikasi laporan.
- Implementasi verifikasi klaim.
- Implementasi status pengembalian.
- Implementasi notifikasi dasar.

## Phase 5 — Testing & Deployment

- Functional testing.
- Security testing.
- Responsive testing.
- Usability testing.
- Perbaikan bug.
- Deployment.
- Evaluasi hasil.

---

# 17. DELIVERABLES

Hasil akhir proyek meliputi:

1. Dokumen PRD.
2. User persona.
3. User flow.
4. Information architecture.
5. Wireframe.
6. Design system.
7. High-fidelity UI di Figma.
8. Interactive prototype.
9. Website responsif.
10. Database schema.
11. Admin dashboard.
12. Laporan usability testing.
13. Dokumentasi hasil evaluasi.
14. Dokumentasi deployment.

---

# 18. FINAL PRODUCT DEFINITION

Lost&Found adalah website responsif untuk membantu mahasiswa melaporkan, mencari, mengklaim, dan mengembalikan barang yang hilang di lingkungan kampus.

Produk berfokus pada pengalaman pengguna yang sederhana, pencarian informasi yang efektif, verifikasi kepemilikan, perlindungan privasi, dan pengelolaan laporan yang terstruktur.

Keberhasilan produk dinilai bukan hanya dari jumlah fitur, tetapi juga dari kemampuan pengguna menyelesaikan tugas dengan mudah, tingkat kesalahan yang rendah, dan kejelasan proses dari pelaporan sampai pengembalian barang.

**Prinsip utama:**

_Find the item. Verify the owner. Return it safely._

**Lost&Found — Every item deserves a way home.**
