"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
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

  // Notifikasi status laporan (termasuk REFERENCE_FOUND_APPROVED untuk pemilik
  // laporan kehilangan terkait) dibuat di dalam RPC review_report() melalui
  // trigger/function DB. Tidak diduplikasi di sini agar tidak dobel dan agar
  // notifikasi tidak terkirim ketika RPC gagal.

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

export async function completeOfflineHandoverAction(formData: FormData) {
  await requireAdmin();
  const reportId = String(formData.get("report_id") ?? "");
  const receivedBy = String(formData.get("received_by") ?? "").trim();
  const handedAtRaw = String(formData.get("handed_at") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();
  const backTo = `/admin/laporan/${reportId}`;

  if (!reportId) redirect("/admin/laporan");

  if (!isSupabaseConfigured) {
    redirect(withMessage(backTo, "error", "Supabase belum dikonfigurasi."));
  }

  if (!receivedBy) {
    redirect(withMessage(backTo, "error", "Nama penerima wajib diisi."));
  }

  let handedAt = new Date();
  if (handedAtRaw) {
    const parsed = new Date(handedAtRaw);
    if (Number.isNaN(parsed.getTime())) {
      redirect(withMessage(backTo, "error", "Tanggal penyerahan tidak valid."));
    }
    handedAt = parsed;
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("complete_offline_handover", {
    p_report_id: reportId,
    p_received_by: receivedBy,
    p_handed_at: handedAt.toISOString(),
    p_notes: notes || null,
  });

  revalidatePath("/admin");
  revalidatePath("/admin/laporan");
  revalidatePath(backTo);
  revalidatePath("/admin/pengembalian");
  revalidatePath("/admin/klaim");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/laporan");
  revalidatePath("/dashboard/klaim");
  revalidatePath("/dashboard/notifikasi");
  revalidatePath("/");
  revalidatePath("/cari");
  revalidatePath(`/laporan/${reportId}`);

  if (error) {
    redirect(withMessage(backTo, "error", error.message));
  }

  redirect(
    withMessage(
      backTo,
      "message",
      "Serah terima di luar aplikasi dicatat. Laporan temuan dan laporan kehilangan terkait telah ditutup.",
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
