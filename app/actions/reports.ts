"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireUser } from "@/lib/auth";
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_EVIDENCE_SIZE,
  MAX_PHOTO_SIZE,
} from "@/lib/constants";
import { CLAIM_EVIDENCE_BUCKET } from "@/lib/supabase/storage";
import {
  claimSchema,
  reportSchema,
  type ClaimFormState,
  type ReportFormState,
} from "@/lib/validations/reports";

const ACCEPTED_EVIDENCE_TYPES = [
  ...ACCEPTED_IMAGE_TYPES,
  "application/pdf",
];

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function readPhotos(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function validatePhotos(files: File[]) {
  if (files.length > 3) {
    return "Maksimal 3 foto untuk satu laporan.";
  }

  for (const file of files) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return "Format foto harus JPG, PNG, atau WEBP.";
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return "Ukuran setiap foto maksimal 4 MB.";
    }
  }

  return null;
}

export async function createReport(
  _prevState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const session = await requireUser("/laporkan");
  const reportType = String(formData.get("report_type") ?? "");

  const values = {
    report_type: reportType,
    item_name: String(formData.get("item_name") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    date_occurred: String(formData.get("date_occurred") ?? ""),
    location_id: String(formData.get("location_id") ?? ""),
    dropoff_location_id: String(formData.get("dropoff_location_id") ?? ""),
    description_public: String(formData.get("description_public") ?? ""),
    contact_preference: String(formData.get("contact_preference") ?? "EMAIL"),
    contact_value: String(formData.get("contact_value") ?? ""),
    reference_report_id: String(formData.get("reference_report_id") ?? "").trim(),
  };

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  if (!isSupabaseConfigured) {
    return {
      message:
        "Supabase belum dikonfigurasi. Hubungi admin atau isi variabel lingkungan terlebih dahulu.",
      values,
    };
  }

  const photos = readPhotos(formData);
  const photoError = validatePhotos(photos);
  if (photoError) {
    return { message: photoError, values };
  }

  const supabase = await createClient();
  const dropoff =
    parsed.data.report_type === "FOUND" && parsed.data.dropoff_location_id
      ? Number(parsed.data.dropoff_location_id)
      : null;

  const insertPayload: Record<string, unknown> = {
    user_id: session.authUser.id,
    report_type: parsed.data.report_type,
    item_name: parsed.data.item_name,
    category_id: parsed.data.category_id,
    date_occurred: parsed.data.date_occurred,
    location_id: parsed.data.location_id,
    dropoff_location_id: dropoff,
    description_public: parsed.data.description_public,
    contact_preference: parsed.data.contact_preference,
    contact_value:
      parsed.data.contact_preference === "NONE"
        ? null
        : (parsed.data.contact_value ?? null),
  };

  if (parsed.data.reference_report_id) {
    insertPayload.reference_report_id = parsed.data.reference_report_id;
  }

  let { data: created, error } = await supabase
    .from("item_reports")
    .insert(insertPayload)
    .select("id, report_number")
    .single();

  // Fallback anggun jika migrasi kolom reference_report_id belum dijalankan di database
  if (error && error.code === "42703" && insertPayload.reference_report_id) {
    delete insertPayload.reference_report_id;
    const retry = await supabase
      .from("item_reports")
      .insert(insertPayload)
      .select("id, report_number")
      .single();
    created = retry.data;
    error = retry.error;
  }

  if (error || !created) {
    return {
      message:
        "Laporan gagal disimpan. Periksa kembali data lalu coba beberapa saat lagi.",
      values,
    };
  }

  const uploadedPaths: string[] = [];

  for (const [index, file] of photos.entries()) {
    const extension = EXTENSION_BY_TYPE[file.type] ?? "jpg";
    const path = `${session.authUser.id}/${created.id}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("report-photos")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      if (uploadedPaths.length > 0) {
        await supabase.storage.from("report-photos").remove(uploadedPaths);
      }
      await supabase.from("item_reports").delete().eq("id", created.id);

      return {
        message:
          "Foto gagal diunggah sehingga laporan dibatalkan. Coba unggah ulang dengan ukuran lebih kecil.",
        values,
      };
    }

    uploadedPaths.push(path);

    const { error: photoRowError } = await supabase
      .from("report_photos")
      .insert({
        report_id: created.id,
        storage_path: path,
        alt_text: parsed.data.item_name,
        is_primary: index === 0,
        sort_order: index,
      });

    if (photoRowError) {
      await supabase.storage.from("report-photos").remove(uploadedPaths);
      await supabase.from("item_reports").delete().eq("id", created.id);

      return {
        message:
          "Foto gagal disimpan ke laporan. Coba lagi tanpa foto atau dengan foto lain.",
        values,
      };
    }
  }

  // Notifikasi konfirmasi, notifikasi ke pemilik laporan kehilangan, dan
  // notifikasi admin dibuat oleh trigger DB log_report_created() (migration 0010/0011).
  // Jangan diduplikasi di sini agar pengguna tidak menerima notifikasi ganda.

  revalidatePath("/");
  revalidatePath("/cari");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/laporan");
  revalidatePath("/dashboard/notifikasi");
  if (parsed.data.reference_report_id) {
    revalidatePath(`/dashboard/laporan/${parsed.data.reference_report_id}`);
    revalidatePath(`/laporan/${parsed.data.reference_report_id}`);
  }

  redirect(`/dashboard/laporan/${created.id}?baru=1`);
}

export async function flagReport(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reportId) redirect("/cari");

  await requireUser(`/laporan/${reportId}`);

  if (!isSupabaseConfigured) {
    redirect(`/laporan/${reportId}?error=${encodeURIComponent("Supabase belum dikonfigurasi.")}`);
  }

  if (reason.length < 10) {
    redirect(
      `/laporan/${reportId}?error=${encodeURIComponent(
        "Alasan penandaan minimal 10 karakter.",
      )}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("flag_report", {
    p_report_id: reportId,
    p_reason: reason,
  });

  if (error) {
    redirect(
      `/laporan/${reportId}?error=${encodeURIComponent(
        error.message || "Gagal mengirim tanda laporan.",
      )}`,
    );
  }

  revalidatePath(`/laporan/${reportId}`);
  redirect(
    `/laporan/${reportId}?flag=${encodeURIComponent(
      "Terima kasih. Admin akan meninjau laporan ini.",
    )}`,
  );
}

function readEvidence(formData: FormData) {
  return formData
    .getAll("evidence")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

function validateEvidence(files: File[]) {
  if (files.length > 3) {
    return "Maksimal 3 bukti untuk satu klaim.";
  }

  for (const file of files) {
    if (!ACCEPTED_EVIDENCE_TYPES.includes(file.type)) {
      return "Bukti harus berupa JPG, PNG, WEBP, atau PDF.";
    }
    if (file.size > MAX_EVIDENCE_SIZE) {
      return "Ukuran setiap bukti maksimal 4 MB.";
    }
  }

  return null;
}

export async function createClaim(
  _prevState: ClaimFormState,
  formData: FormData,
): Promise<ClaimFormState> {
  const reportId = String(formData.get("report_id") ?? "");
  const values = {
    report_id: reportId,
    ownership_description: String(
      formData.get("ownership_description") ?? "",
    ),
  };

  const parsed = claimSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const session = await requireUser(`/laporan/${reportId}/klaim`);

  if (!isSupabaseConfigured) {
    return {
      message:
        "Supabase belum dikonfigurasi. Hubungi admin atau isi variabel lingkungan terlebih dahulu.",
      values,
    };
  }

  const files = readEvidence(formData);
  const evidenceError = validateEvidence(files);
  if (evidenceError) {
    return { message: evidenceError, values };
  }

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("item_reports")
    .select("id, report_type, report_status, user_id")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) {
    return { message: "Laporan tidak ditemukan.", values };
  }

  if (report.report_type !== "FOUND" || report.report_status !== "ACTIVE") {
    return {
      message: "Klaim hanya dapat diajukan untuk barang temuan yang aktif.",
      values,
    };
  }

  if (report.user_id === session.authUser.id) {
    return {
      message: "Kamu tidak dapat mengklaim barang yang kamu laporkan sendiri.",
      values,
    };
  }

  const draftId = crypto.randomUUID();
  const uploaded: { path: string; type: string; name: string }[] = [];

  for (const file of files) {
    const extension = EXTENSION_BY_TYPE[file.type] ?? "pdf";
    const path = `${session.authUser.id}/${draftId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(CLAIM_EVIDENCE_BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      if (uploaded.length > 0) {
        await supabase.storage
          .from(CLAIM_EVIDENCE_BUCKET)
          .remove(uploaded.map((item) => item.path));
      }

      return {
        message:
          "Bukti gagal diunggah. Coba lagi dengan ukuran file yang lebih kecil.",
        values,
      };
    }

    uploaded.push({
      path,
      type: file.type === "application/pdf" ? "OTHER" : "PHOTO",
      name: file.name,
    });
  }

  const { data: claim, error } = await supabase
    .from("claims")
    .insert({
      item_report_id: reportId,
      claimant_id: session.authUser.id,
      ownership_description: parsed.data.ownership_description,
    })
    .select("id, claim_number")
    .single();

  if (error || !claim) {
    if (uploaded.length > 0) {
      await supabase.storage
        .from(CLAIM_EVIDENCE_BUCKET)
        .remove(uploaded.map((item) => item.path));
    }

    return {
      message: error?.code === "23505"
        ? "Kamu sudah memiliki klaim aktif untuk barang ini."
        : "Klaim gagal disimpan. Coba lagi beberapa saat lagi.",
      values,
    };
  }

  if (uploaded.length > 0) {
    const { error: evidenceRowError } = await supabase
      .from("claim_evidence")
      .insert(
        uploaded.map((item) => ({
          claim_id: claim.id,
          storage_path: item.path,
          evidence_type: item.type,
          description: item.name,
        })),
      );

    if (evidenceRowError) {
      await supabase.storage
        .from(CLAIM_EVIDENCE_BUCKET)
        .remove(uploaded.map((item) => item.path));
      await supabase.from("claims").delete().eq("id", claim.id);

      return {
        message:
          "Bukti gagal disimpan ke klaim. Coba lagi tanpa bukti atau dengan file lain.",
        values,
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/klaim");
  revalidatePath(`/laporan/${reportId}`);

  redirect(`/dashboard/klaim/${claim.id}?baru=1`);
}
