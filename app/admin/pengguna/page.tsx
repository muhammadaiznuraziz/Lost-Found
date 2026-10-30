import type { Metadata } from "next";
import { Users } from "lucide-react";
import { setUserRoleAction } from "@/app/actions/admin";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Select } from "@/components/ui/field";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/dashboard/page-header";
import { requireAdmin } from "@/lib/auth";
import { getAllProfiles } from "@/lib/data/admin";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pengguna",
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string; error?: string }>;
}) {
  const session = await requireAdmin();
  const query = await searchParams;
  const profiles = await getAllProfiles();

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Admin"
        title="Pengguna"
        description="Kelola peran akun. Hanya admin yang dapat memverifikasi laporan dan klaim."
      />

      {query.message ? <Alert tone="success">{query.message}</Alert> : null}
      {query.error ? <Alert tone="danger">{query.error}</Alert> : null}

      {profiles.length > 0 ? (
        <div className="overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-[var(--shadow-card)]">
          <div className="hidden grid-cols-[1.3fr_1.4fr_0.8fr_0.9fr_1fr] gap-3 border-b border-line bg-surface-2 px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-muted md:grid">
            <span>Nama</span>
            <span>Email</span>
            <span>Peran</span>
            <span>Bergabung</span>
            <span>Ubah peran</span>
          </div>
          <ul className="divide-y divide-line">
            {profiles.map((profile) => {
              const isSelf = profile.id === session.authUser.id;

              return (
                <li
                  key={profile.id}
                  className="grid gap-2 px-5 py-3.5 md:grid-cols-[1.3fr_1.4fr_0.8fr_0.9fr_1fr] md:items-center md:gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-ink">
                      {profile.full_name}
                      {isSelf ? (
                        <span className="ml-1 text-xs text-muted">(kamu)</span>
                      ) : null}
                    </p>
                    {profile.student_id ? (
                      <p className="text-xs text-muted">
                        NIM {profile.student_id}
                      </p>
                    ) : null}
                  </div>
                  <span className="truncate text-xs text-ink-soft">
                    {profile.email}
                  </span>
                  <span>
                    <Badge tone={profile.role === "ADMIN" ? "accent" : "brand"}>
                      {profile.role === "ADMIN" ? "Admin" : "Pengguna"}
                    </Badge>
                  </span>
                  <span className="text-xs text-muted">
                    {formatDate(profile.created_at)}
                  </span>
                  <form
                    action={setUserRoleAction}
                    className="flex items-center gap-2"
                  >
                    <input type="hidden" name="user_id" value={profile.id} />
                    <Select
                      name="role"
                      defaultValue={profile.role}
                      disabled={isSelf}
                      className="h-9 py-1 text-xs"
                      aria-label={`Peran ${profile.full_name}`}
                    >
                      <option value="STUDENT">Pengguna</option>
                      <option value="ADMIN">Admin</option>
                    </Select>
                    <Button
                      type="submit"
                      size="sm"
                      variant="secondary"
                      disabled={isSelf}
                    >
                      Simpan
                    </Button>
                  </form>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="Belum ada pengguna"
          description="Pengguna akan muncul setelah mendaftar."
        />
      )}
    </div>
  );
}
