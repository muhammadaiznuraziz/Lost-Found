"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireUser } from "@/lib/auth";
import { ACCEPTED_IMAGE_TYPES, MAX_PHOTO_SIZE } from "@/lib/constants";
import {
  reportSchema,
  type ReportFormState,
} from "@/lib/validations/reports";

const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

function readNewPhotos(formData: FormData) {
  return formData
    .getAll("photos")
    .filter((value): value is File => value instanceof File && value.size > 0);
}

export async function cancelReportAction(formData: FormData) {
  const reportId = String(formData.get("report_id") ?? "");
  if (!reportId) redirect("/dashboard/laporan");

  await requireUser(`/dashboard/laporan/${reportId}`);

  if (!isSupabaseConfigured) {
    redirect(`/dashboard/laporan/${reportId}?error=Supabase belum dikonfigurasi.`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_report", {
    p_report_id: reportId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/laporan");
  revalidatePath(`/dashboard/laporan/${reportId}`);

  if (error) {
    redirect(
      `/dashboard/laporan/${reportId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/dashboard/laporan/${reportId}?dibatalkan=1`);
}

export async function cancelClaimAction(formData: FormData) {
  const claimId = String(formData.get("claim_id") ?? "");
  if (!claimId) redirect("/dashboard/klaim");

  await requireUser(`/dashboard/klaim/${claimId}`);

  if (!isSupabaseConfigured) {
    redirect(`/dashboard/klaim/${claimId}?error=Supabase belum dikonfigurasi.`);
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("cancel_claim", {
    p_claim_id: claimId,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/klaim");
  revalidatePath(`/dashboard/klaim/${claimId}`);

  if (error) {
    redirect(
      `/dashboard/klaim/${claimId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  redirect(`/dashboard/klaim/${claimId}?dibatalkan=1`);
}

export async function markNotificationReadAction(formData: FormData) {
  const notificationId = String(formData.get("notification_id") ?? "");
  if (!notificationId) return;

  await requireUser("/dashboard/notifikasi");

  if (!isSupabaseConfigured) return;

  const supabase = await createClient();
  await supabase.rpc("mark_notification_read", {
    p_notification_id: notificationId,
  });

  revalidatePath("/dashboard/notifikasi");
  revalidatePath("/dashboard");
}

export async function markAllNotificationsReadAction() {
  await requireUser("/dashboard/notifikasi");

  if (!isSupabaseConfigured) return;

  const supabase = await createClient();
  await supabase.rpc("mark_all_notifications_read");

  revalidatePath("/dashboard/notifikasi");
  revalidatePath("/dashboard");
}

export async function updateReport(
  _prevState: ReportFormState,
  formData: FormData,
): Promise<ReportFormState> {
  const reportId = String(formData.get("report_id") ?? "");
  const values = {
    report_type: String(formData.get("report_type") ?? ""),
    item_name: String(formData.get("item_name") ?? ""),
    category_id: String(formData.get("category_id") ?? ""),
    date_occurred: String(formData.get("date_occurred") ?? ""),
    location_id: String(formData.get("location_id") ?? ""),
    dropoff_location_id: String(formData.get("dropoff_location_id") ?? ""),
    description_public: String(formData.get("description_public") ?? ""),
    contact_preference: String(formData.get("contact_preference") ?? "EMAIL"),
    contact_value: String(formData.get("contact_value") ?? ""),
  };

  const parsed = reportSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, values };
  }

  const session = await requireUser(`/dashboard/laporan/${reportId}/edit`);

  if (!isSupabaseConfigured) {
    return { message: "Supabase belum dikonfigurasi.", values };
  }

  const supabase = await createClient();
  const { data: report } = await supabase
    .from("item_reports")
    .select("id, user_id, report_status")
    .eq("id", reportId)
    .maybeSingle();

  if (!report) return { message: "Laporan tidak ditemukan.", values };

  if (report.user_id !== session.authUser.id) {
    return { message: "Kamu tidak berhak mengubah laporan ini.", values };
  }

  if (!["PENDING", "NEEDS_REVISION"].includes(report.report_status)) {
    return {
      message: "Laporan pada tahap ini tidak dapat diubah.",
      values,
    };
  }

  const newPhotos = readNewPhotos(formData);
  const removeIds = formData
    .getAll("remove_photo_ids")
    .map((value) => String(value));

  const { data: existingPhotos } = await supabase
    .from("report_photos")
    .select("id, storage_path, is_primary")
    .eq("report_id", reportId)
    .order("sort_order");

  const photos = existingPhotos ?? [];
  const remaining = photos.filter(
    (photo) => !removeIds.includes(photo.id),
  );

  if (remaining.length + newPhotos.length > 3) {
    return { message: "Maksimal 3 foto untuk satu laporan.", values };
  }

  for (const file of newPhotos) {
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      return { message: "Format foto harus JPG, PNG, atau WEBP.", values };
    }
    if (file.size > MAX_PHOTO_SIZE) {
      return { message: "Ukuran setiap foto maksimal 4 MB.", values };
    }
  }

  const dropoff =
    parsed.data.report_type === "FOUND" && parsed.data.dropoff_location_id
      ? Number(parsed.data.dropoff_location_id)
      : null;

  const { error: updateError } = await supabase
    .from("item_reports")
    .update({
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
    })
    .eq("id", reportId);

  if (updateError) {
    return {
      message: "Perubahan gagal disimpan. Coba lagi beberapa saat lagi.",
      values,
    };
  }

  if (removeIds.length > 0) {
    const toRemove = photos.filter((photo) => removeIds.includes(photo.id));
    if (toRemove.length > 0) {
      await supabase.storage
        .from("report-photos")
        .remove(toRemove.map((photo) => photo.storage_path));
      await supabase
        .from("report_photos")
        .delete()
        .in(
          "id",
          toRemove.map((photo) => photo.id),
        );
    }
  }

  let hasPrimary = remaining.some((photo) => photo.is_primary);

  for (const [index, file] of newPhotos.entries()) {
    const extension = EXTENSION_BY_TYPE[file.type] ?? "jpg";
    const path = `${session.authUser.id}/${reportId}/${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("report-photos")
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      return {
        message:
          "Sebagian foto gagal diunggah. Perubahan lain sudah tersimpan; coba unggah ulang.",
        values,
      };
    }

    const { error: rowError } = await supabase.from("report_photos").insert({
      report_id: reportId,
      storage_path: path,
      alt_text: parsed.data.item_name,
      is_primary: !hasPrimary && index === 0,
      sort_order: remaining.length + index,
    });

    if (!rowError) {
      hasPrimary = true;
    }
  }

  if (!hasPrimary && remaining.length > 0) {
    await supabase
      .from("report_photos")
      .update({ is_primary: true })
      .eq("id", remaining[0].id);
  }

  if (formData.get("resubmit") === "on" && report.report_status === "NEEDS_REVISION") {
    const { error: resubmitError } = await supabase.rpc("resubmit_report", {
      p_report_id: reportId,
    });

    if (resubmitError) {
      return {
        message: `Perubahan tersimpan, tetapi pengiriman ulang gagal: ${resubmitError.message}`,
        values,
      };
    }
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/laporan");
  revalidatePath(`/dashboard/laporan/${reportId}`);
  revalidatePath(`/laporan/${reportId}`);

  redirect(`/dashboard/laporan/${reportId}?diperbarui=1`);
}
