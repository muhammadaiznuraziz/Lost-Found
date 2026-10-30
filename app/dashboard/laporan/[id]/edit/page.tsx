import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { EditReportForm } from "@/components/reports/edit-report-form";
import { requireUser } from "@/lib/auth";
import { getCategories, getLocations } from "@/lib/data/reference";
import { getOwnReportContact, getReportById } from "@/lib/data/reports";

export const metadata: Metadata = {
  title: "Edit Laporan",
};

export default async function EditReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireUser(`/dashboard/laporan/${id}/edit`);
  const report = await getReportById(id);

  if (!report) notFound();

  if (report.user_id !== session.authUser.id) notFound();

  if (!["PENDING", "NEEDS_REVISION"].includes(report.report_status)) {
    redirect(`/dashboard/laporan/${report.id}`);
  }

  const [categories, locations, contact] = await Promise.all([
    getCategories(),
    getLocations(),
    getOwnReportContact(report.id),
  ]);

  return (
    <div className="space-y-5">
      <Link
        href={`/dashboard/laporan/${report.id}`}
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-soft hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke detail laporan
      </Link>

      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          Edit laporan
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
          {report.item_name}
        </h1>
        <p className="mt-1 text-sm text-muted">{report.report_number}</p>
      </header>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-7">
        <EditReportForm
          report={report}
          categories={categories}
          locations={locations}
          contact={
            contact
              ? {
                  contact_preference:
                    contact.contact_preference as
                      | "EMAIL"
                      | "WHATSAPP"
                      | "NONE",
                  contact_value: contact.contact_value,
                }
              : null
          }
        />
      </div>
    </div>
  );
}
