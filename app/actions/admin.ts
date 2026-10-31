"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { requireAdmin } from "@/lib/auth";

function withMessage(path: string, key: "message" | "error", value: string) {
  return `${path}?${key}=${encodeURIComponent(value)}`;
}

export async function reviewReportAction(formData: FormData) {
  const session = await requireAdmin();
  const reportId = String(formData.get("report_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!reportId) redirect("/admin/laporan");

  if (!isSupabaseConfigured) {
    redirect(withMessage(`/admin/laporan/${reportId}`, "error", "Supabase belum dikonfigurasi."));
  }

  if (!["ACTIVE", "NEEDS_REVISION", "REJECTED"].includes(status)) {
    redirect(withMessage(`/admin/laporan/${reportId}`, "error", "Status tidak valid."));
  }

  if (status === "REJECTED" && reason.length < 5) {
    redirect(
      withMessage(
        `/admin/laporan/${reportId}`,
        "error",
        "Alasan penolakan wajib diisi minimal 5 karakter.",
      ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_report", {
    p_report_id: reportId,
    p_new_status: status,
    p_reason: reason || null,
  });

  if (status === "ACTIVE") {
    try {
      const adminClient = createAdminClient();
      const { data: currentReport } = await adminClient
        .from("item_reports")
        .select("id, report_number, item_name, reference_report_id")
        .eq("id", reportId)
        .maybeSingle();

      if (currentReport?.reference_report_id) {
        const { data: refReport } = await adminClient
          .from("item_reports")
          .select("id, user_id, item_name, report_number")
          .eq("id", currentReport.reference_report_id)
          .maybeSingle();

        if (refReport) {
          await adminClient.from("notifications").insert({
            user_id: refReport.user_id,
            title: "Laporan Temuan Telah Diverifikasi",
            message: `Laporan penemuan (${currentReport.report_number}) yang merujuk pada kehilangan Anda (${refReport.report_number} - ${refReport.item_name}) telah disetujui & dipublikasikan oleh Admin. Anda dapat memeriksa barang temuan tersebut.`,
            notification_type: "REFERENCE_FOUND_APPROVED",
            related_report_id: currentReport.id,
          });
        }
      }
    } catch {
      // Abaikan jika sudah ditangani oleh trigger
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/laporan");
  revalidatePath(`/admin/laporan/${reportId}`);
  revalidatePath("/cari");
  revalidatePath("/");
  revalidatePath(`/laporan/${reportId}`);
  revalidatePath("/dashboard/notifikasi");
  revalidatePath("/dashboard");

  if (error) {
    redirect(withMessage(`/admin/laporan/${reportId}`, "error", error.message));
  }

  void session;
  redirect(
    withMessage(
      `/admin/laporan/${reportId}`,
      "message",
      "Status laporan berhasil diperbarui.",
    ),
  );
}

export async function reviewClaimAction(formData: FormData) {
  await requireAdmin();
  const claimId = String(formData.get("claim_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const reason = String(formData.get("reason") ?? "").trim();

  if (!claimId) redirect("/admin/klaim");

  if (!isSupabaseConfigured) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", "Supabase belum dikonfigurasi."));
  }

  if (!["IN_REVIEW", "APPROVED", "REJECTED"].includes(status)) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", "Status tidak valid."));
  }

  if (status === "REJECTED" && reason.length < 5) {
    redirect(
      withMessage(
        `/admin/klaim/${claimId}`,
        "error",
        "Alasan penolakan wajib diisi minimal 5 karakter.",
      ),
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("review_claim", {
    p_claim_id: claimId,
    p_new_status: status,
    p_reason: reason || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/klaim");
  revalidatePath(`/admin/klaim/${claimId}`);
  revalidatePath("/dashboard/klaim");
  revalidatePath(`/dashboard/klaim/${claimId}`);

  if (error) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", error.message));
  }

  redirect(
    withMessage(
      `/admin/klaim/${claimId}`,
      "message",
      "Status klaim berhasil diperbarui.",
    ),
  );
}

export async function scheduleHandoverAction(formData: FormData) {
  await requireAdmin();
  const claimId = String(formData.get("claim_id") ?? "");
  const location = String(formData.get("location") ?? "").trim();
  const scheduledAt = String(formData.get("scheduled_at") ?? "");

  if (!claimId) redirect("/admin/klaim");

  if (!isSupabaseConfigured) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", "Supabase belum dikonfigurasi."));
  }

  if (!location) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", "Lokasi wajib diisi."));
  }

  const parsedDate = scheduledAt ? new Date(scheduledAt) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", "Jadwal tidak valid."));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("schedule_handover", {
    p_claim_id: claimId,
    p_location: location,
    p_scheduled_at: parsedDate.toISOString(),
  });

  revalidatePath(`/admin/klaim/${claimId}`);
  revalidatePath("/admin/klaim");
  revalidatePath("/admin/pengembalian");
  revalidatePath("/dashboard/klaim");
  revalidatePath(`/dashboard/klaim/${claimId}`);

  if (error) {
    redirect(withMessage(`/admin/klaim/${claimId}`, "error", error.message));
  }

  redirect(
    withMessage(
      `/admin/klaim/${claimId}`,
      "message",
      "Jadwal penyerahan berhasil dibuat.",
    ),
  );
}

export async function completeHandoverAction(formData: FormData) {
  await requireAdmin();
  const handoverId = String(formData.get("handover_id") ?? "");
  const claimId = String(formData.get("claim_id") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!handoverId) redirect("/admin/pengembalian");

  if (!isSupabaseConfigured) {
    redirect(withMessage("/admin/pengembalian", "error", "Supabase belum dikonfigurasi."));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_handover", {
    p_handover_id: handoverId,
    p_notes: notes || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/pengembalian");
  revalidatePath("/admin/klaim");
  if (claimId) {
    revalidatePath(`/admin/klaim/${claimId}`);
    revalidatePath(`/dashboard/klaim/${claimId}`);
  }
  revalidatePath("/dashboard/klaim");
  revalidatePath("/dashboard/laporan");

  if (error) {
    redirect(withMessage("/admin/pengembalian", "error", error.message));
  }

  redirect(
    withMessage(
      "/admin/pengembalian",
      "message",
      "Penyerahan berhasil dikonfirmasi.",
    ),
  );
}

export async function resolveFlagAction(formData: FormData) {
  await requireAdmin();
  const flagId = String(formData.get("flag_id") ?? "");
  const status = String(formData.get("status") ?? "");
  const note = String(formData.get("note") ?? "").trim();

  if (!flagId) redirect("/admin/mencurigakan");

  if (!isSupabaseConfigured) {
    redirect(withMessage("/admin/mencurigakan", "error", "Supabase belum dikonfigurasi."));
  }

  if (!["REVIEWED", "DISMISSED"].includes(status)) {
    redirect(withMessage("/admin/mencurigakan", "error", "Status flag tidak valid."));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("resolve_flag", {
    p_flag_id: flagId,
    p_status: status,
    p_note: note || null,
  });

  revalidatePath("/admin/mencurigakan");
  revalidatePath("/admin");

  if (error) {
    redirect(withMessage("/admin/mencurigakan", "error", error.message));
  }

  redirect(
    withMessage(
      "/admin/mencurigakan",
      "message",
      "Flag berhasil ditinjau.",
    ),
  );
}

export async function setUserRoleAction(formData: FormData) {
  const session = await requireAdmin();
  const userId = String(formData.get("user_id") ?? "");
  const role = String(formData.get("role") ?? "");

  if (!userId) redirect("/admin/pengguna");

  if (!isSupabaseConfigured) {
    redirect(withMessage("/admin/pengguna", "error", "Supabase belum dikonfigurasi."));
  }

  if (userId === session.authUser.id) {
    redirect(
      withMessage(
        "/admin/pengguna",
        "error",
        "Kamu tidak dapat mengubah role akun sendiri.",
      ),
    );
  }

  if (!["STUDENT", "ADMIN"].includes(role)) {
    redirect(withMessage("/admin/pengguna", "error", "Role tidak valid."));
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_user_role", {
    p_user_id: userId,
    p_role: role,
  });

  revalidatePath("/admin/pengguna");
  revalidatePath("/admin");

  if (error) {
    redirect(withMessage("/admin/pengguna", "error", error.message));
  }

  redirect(
    withMessage("/admin/pengguna", "message", "Role pengguna diperbarui."),
  );
}
