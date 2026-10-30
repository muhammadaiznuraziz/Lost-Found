export const APP_NAME = "Lost&Found";
export const CAMPUS_NAME = "yuemsi";
export const APP_TAGLINE = "Every item deserves a way home.";

export type Tone = "brand" | "accent" | "danger" | "info" | "neutral";

export const REPORT_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Menunggu Verifikasi", tone: "accent" },
  NEEDS_REVISION: { label: "Perlu Perbaikan", tone: "info" },
  ACTIVE: { label: "Aktif", tone: "brand" },
  REJECTED: { label: "Ditolak", tone: "danger" },
  CLOSED: { label: "Ditutup", tone: "neutral" },
};

export const CLAIM_STATUS: Record<string, { label: string; tone: Tone }> = {
  PENDING: { label: "Menunggu Verifikasi", tone: "accent" },
  IN_REVIEW: { label: "Sedang Diperiksa", tone: "info" },
  APPROVED: { label: "Disetujui", tone: "brand" },
  REJECTED: { label: "Ditolak", tone: "danger" },
  COMPLETED: { label: "Selesai", tone: "brand" },
  CANCELLED: { label: "Dibatalkan", tone: "neutral" },
};

export const HANDOVER_STATUS: Record<string, { label: string; tone: Tone }> = {
  SCHEDULED: { label: "Dijadwalkan", tone: "info" },
  COMPLETED: { label: "Selesai", tone: "brand" },
  CANCELLED: { label: "Dibatalkan", tone: "neutral" },
};

export const FLAG_STATUS: Record<string, { label: string; tone: Tone }> = {
  OPEN: { label: "Menunggu Tinjauan", tone: "accent" },
  REVIEWED: { label: "Sudah Ditinjau", tone: "brand" },
  DISMISSED: { label: "Diabaikan", tone: "neutral" },
};

export const ITEM_STATUS: Record<string, { label: string; tone: Tone }> = {
  Menunggu_Verifikasi: { label: "Menunggu Verifikasi", tone: "accent" },
  Perlu_Perbaikan: { label: "Perlu Perbaikan", tone: "info" },
  Aktif: { label: "Aktif", tone: "brand" },
  Tersedia: { label: "Tersedia", tone: "brand" },
  Ada_Klaim: { label: "Ada Klaim", tone: "info" },
  Siap_Diserahkan: { label: "Siap Diserahkan", tone: "brand" },
  Dikembalikan: { label: "Dikembalikan", tone: "brand" },
  Ditolak: { label: "Ditolak", tone: "danger" },
  Ditutup: { label: "Ditutup", tone: "neutral" },
};

export const REPORT_TYPE: Record<string, { label: string; tone: Tone }> = {
  LOST: { label: "Barang Hilang", tone: "danger" },
  FOUND: { label: "Barang Temuan", tone: "brand" },
};

export const CONTACT_PREFERENCE: Record<string, string> = {
  EMAIL: "Email kampus",
  WHATSAPP: "WhatsApp",
  NONE: "Tidak ditampilkan",
};

export const EVIDENCE_TYPE: Record<string, string> = {
  PHOTO: "Foto barang",
  PURCHASE_PROOF: "Bukti pembelian",
  OWNERSHIP_DOCUMENT: "Dokumen kepemilikan",
  OTHER: "Bukti lain",
};

export const NAV_LINKS = [
  { href: "/", label: "Beranda" },
  { href: "/cari", label: "Cari Barang" },
  { href: "/peta", label: "Peta Kampus" },
  { href: "/cara-kerja", label: "Cara Kerja" },
];

export const ADMIN_NAV = [
  { href: "/admin", label: "Overview", icon: "layout" },
  { href: "/admin/laporan", label: "Manajemen Laporan", icon: "report" },
  { href: "/admin/klaim", label: "Manajemen Klaim", icon: "claim" },
  {
    href: "/admin/pengembalian",
    label: "Pengembalian Barang",
    icon: "handover",
  },
  { href: "/admin/pengguna", label: "Pengguna", icon: "users" },
  { href: "/admin/mencurigakan", label: "Laporan Mencurigakan", icon: "flag" },
  { href: "/admin/audit", label: "Audit Trail", icon: "history" },
];

export const USER_NAV = [
  { href: "/dashboard", label: "Ringkasan", icon: "layout" },
  { href: "/dashboard/laporan", label: "Laporan Saya", icon: "report" },
  { href: "/dashboard/klaim", label: "Klaim Saya", icon: "claim" },
  { href: "/dashboard/notifikasi", label: "Notifikasi", icon: "bell" },
  { href: "/dashboard/profil", label: "Profil", icon: "users" },
];

export const REPORT_STATUS_ORDER = [
  "PENDING",
  "NEEDS_REVISION",
  "ACTIVE",
  "REJECTED",
  "CLOSED",
] as const;

export const MAX_PHOTO_SIZE = 4 * 1024 * 1024;
export const MAX_EVIDENCE_SIZE = 4 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
