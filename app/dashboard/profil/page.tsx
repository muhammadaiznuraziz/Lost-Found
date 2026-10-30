import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/auth/profile-form";
import { requireUser } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil",
};

export default async function ProfilePage() {
  const session = await requireUser("/dashboard/profil");
  const profile = session.profile;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Profil"
        title="Informasi akun"
        description="Perbarui nama dan NIM yang digunakan pada laporan dan klaim."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_0.6fr] lg:items-start">
        <Card className="p-5 sm:p-6">
          <ProfileForm
            fullName={profile?.full_name ?? ""}
            studentId={profile?.student_id ?? null}
          />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-ink">Detail akun</h2>
          <dl className="mt-3 space-y-3 text-sm">
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Email
              </dt>
              <dd className="mt-0.5 break-all text-ink">{profile?.email}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Peran
              </dt>
              <dd className="mt-1">
                <Badge tone={profile?.role === "ADMIN" ? "accent" : "brand"}>
                  {profile?.role === "ADMIN" ? "Admin" : "Pengguna"}
                </Badge>
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide text-muted">
                Bergabung
              </dt>
              <dd className="mt-0.5 text-ink">
                {formatDate(profile?.created_at)}
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-xs leading-relaxed text-muted">
            Email tidak dapat diubah dari halaman ini. Hubungi admin kampus
            jika perlu mengganti email.
          </p>
        </Card>
      </div>
    </div>
  );
}
