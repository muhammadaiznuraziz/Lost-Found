import { z } from "zod";

const todayEnd = () => {
  const date = new Date();
  date.setHours(23, 59, 59, 999);
  return date;
};

export const reportSchema = z
  .object({
    report_type: z.enum(["LOST", "FOUND"], {
      message: "Pilih jenis laporan.",
    }),
    item_name: z
      .string()
      .trim()
      .min(3, "Nama barang minimal 3 karakter.")
      .max(150, "Nama barang maksimal 150 karakter."),
    category_id: z.coerce
      .number({ message: "Pilih kategori." })
      .int()
      .positive("Pilih kategori."),
    date_occurred: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Pilih tanggal kejadian.")
      .refine(
        (value) => new Date(`${value}T00:00:00`) <= todayEnd(),
        "Tanggal tidak boleh di masa depan.",
      ),
    location_id: z.coerce
      .number({ message: "Pilih lokasi." })
      .int()
      .positive("Pilih lokasi."),
    dropoff_location_id: z.string().trim().optional(),
    description_public: z
      .string()
      .trim()
      .min(20, "Deskripsi minimal 20 karakter agar mudah dicocokkan.")
      .max(2000, "Deskripsi maksimal 2000 karakter."),
    contact_preference: z.enum(["EMAIL", "WHATSAPP", "NONE"], {
      message: "Pilih preferensi kontak.",
    }),
    contact_value: z.string().trim().max(120).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.report_type === "FOUND" && !data.dropoff_location_id) {
      ctx.addIssue({
        code: "custom",
        path: ["dropoff_location_id"],
        message: "Pilih lokasi penyerahan barang.",
      });
    }

    if (data.contact_preference === "NONE") return;

    if (!data.contact_value || data.contact_value.length < 5) {
      ctx.addIssue({
        code: "custom",
        path: ["contact_value"],
        message: "Isi kontak yang dapat dihubungi minimal 5 karakter.",
      });
      return;
    }

    if (
      data.contact_preference === "EMAIL" &&
      !z.string().email().safeParse(data.contact_value).success
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["contact_value"],
        message: "Masukkan alamat email yang valid.",
      });
    }

    if (
      data.contact_preference === "WHATSAPP" &&
      !/^[0-9+\-\s()]{7,20}$/.test(data.contact_value)
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["contact_value"],
        message: "Masukkan nomor WhatsApp yang valid.",
      });
    }
  });

export type ReportFormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      success?: string;
      values?: Record<string, string>;
    }
  | undefined;

export const flagSchema = z.object({
  report_id: z.string().uuid(),
  reason: z.string().trim().min(10, "Alasan minimal 10 karakter.").max(500),
});

export const claimSchema = z.object({
  report_id: z.string().uuid("Laporan tidak valid."),
  ownership_description: z
    .string()
    .trim()
    .min(30, "Jelaskan bukti kepemilikan minimal 30 karakter.")
    .max(2000, "Keterangan maksimal 2000 karakter."),
});

export type ClaimFormState =
  | {
      errors?: Record<string, string[] | undefined>;
      message?: string;
      values?: Record<string, string>;
    }
  | undefined;
