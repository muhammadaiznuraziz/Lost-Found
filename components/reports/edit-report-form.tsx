"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Save } from "lucide-react";
import { updateReport } from "@/app/actions/dashboard";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldHint,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { publicPhotoUrl } from "@/lib/supabase/storage";
import type {
  CampusLocation,
  Category,
  ContactPreference,
  ReportWithRelations,
} from "@/types";

export function EditReportForm({
  report,
  categories,
  locations,
  contact,
}: {
  report: ReportWithRelations;
  categories: Category[];
  locations: CampusLocation[];
  contact: { contact_preference: ContactPreference; contact_value: string } | null;
}) {
  const [state, action, pending] = useActionState(updateReport, undefined);
  const isFound = report.report_type === "FOUND";
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="report_id" value={report.id} />
      <input type="hidden" name="report_type" value={report.report_type} />

      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

      {report.report_status === "NEEDS_REVISION" ? (
        <Alert tone="warning" title="Laporan perlu diperbaiki">
          {report.rejection_reason ??
            "Periksa kembali kelengkapan laporan sebelum mengirim ulang."}
        </Alert>
      ) : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Nama barang"
          htmlFor="item_name"
          required
          error={state?.errors?.item_name?.[0]}
          className="sm:col-span-2"
        >
          <Input
            id="item_name"
            name="item_name"
            defaultValue={state?.values?.item_name ?? report.item_name}
            required
            maxLength={150}
          />
        </Field>

        <Field
          label="Kategori"
          htmlFor="category_id"
          required
          error={state?.errors?.category_id?.[0]}
        >
          <Select
            id="category_id"
            name="category_id"
            defaultValue={
              state?.values?.category_id ?? String(report.category_id)
            }
            required
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={isFound ? "Tanggal ditemukan" : "Tanggal kehilangan"}
          htmlFor="date_occurred"
          required
          error={state?.errors?.date_occurred?.[0]}
        >
          <Input
            id="date_occurred"
            name="date_occurred"
            type="date"
            max={today}
            defaultValue={
              state?.values?.date_occurred ?? report.date_occurred
            }
            required
          />
        </Field>

        <Field
          label={isFound ? "Lokasi ditemukan" : "Lokasi terakhir terlihat"}
          htmlFor="location_id"
          required
          error={state?.errors?.location_id?.[0]}
        >
          <Select
            id="location_id"
            name="location_id"
            defaultValue={state?.values?.location_id ?? String(report.location_id)}
            required
          >
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
                {location.building ? ` — ${location.building}` : ""}
              </option>
            ))}
          </Select>
        </Field>

        {isFound ? (
          <Field
            label="Lokasi penyerahan"
            htmlFor="dropoff_location_id"
            required
            error={state?.errors?.dropoff_location_id?.[0]}
          >
            <Select
              id="dropoff_location_id"
              name="dropoff_location_id"
              defaultValue={
                state?.values?.dropoff_location_id ??
                String(report.dropoff_location_id ?? "")
              }
              required
            >
              <option value="">Pilih titik penyerahan</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                  {location.building ? ` — ${location.building}` : ""}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}

        <Field
          label="Deskripsi publik"
          htmlFor="description_public"
          required
          error={state?.errors?.description_public?.[0]}
          className="sm:col-span-2"
        >
          <Textarea
            id="description_public"
            name="description_public"
            defaultValue={
              state?.values?.description_public ?? report.description_public
            }
            minLength={20}
            maxLength={2000}
            required
          />
        </Field>
      </div>

      {report.report_photos.length > 0 ? (
        <div>
          <h2 className="text-sm font-semibold text-ink">Foto saat ini</h2>
          <p className="mt-1 text-xs text-muted">
            Centang foto yang ingin dihapus. Maksimal 3 foto per laporan.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {report.report_photos.map((photo) => (
              <label
                key={photo.id}
                className="group relative overflow-hidden rounded-2xl border border-line"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicPhotoUrl(photo.storage_path) ?? ""}
                  alt={photo.alt_text ?? report.item_name}
                  className="aspect-square w-full object-cover"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-2 bg-ink/70 px-2 py-1.5 text-xs text-white">
                  <input
                    type="checkbox"
                    name="remove_photo_ids"
                    value={photo.id}
                    className="h-3.5 w-3.5"
                  />
                  Hapus
                </span>
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <Field
        label="Tambah foto"
        htmlFor="photos"
        hint="Maksimal 3 foto total, masing-masing 4 MB. Format JPG, PNG, atau WEBP."
      >
        <Input
          id="photos"
          name="photos"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="file:mr-3 file:rounded-md file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
        />
      </Field>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/50 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink">Kontak privat</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field
            label="Preferensi kontak"
            htmlFor="contact_preference"
            required
            error={state?.errors?.contact_preference?.[0]}
          >
            <Select
              id="contact_preference"
              name="contact_preference"
              defaultValue={
                state?.values?.contact_preference ??
                contact?.contact_preference ??
                report.contact_preference ??
                "EMAIL"
              }
              required
            >
              <option value="EMAIL">Email</option>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="NONE">Tidak ingin dihubungi</option>
            </Select>
          </Field>

          <Field
            label="Kontak"
            htmlFor="contact_value"
            error={state?.errors?.contact_value?.[0]}
          >
            <Input
              id="contact_value"
              name="contact_value"
              defaultValue={
                state?.values?.contact_value ?? contact?.contact_value ?? ""
              }
              maxLength={120}
            />
          </Field>
        </div>
      </div>

      {report.report_status === "NEEDS_REVISION" ? (
        <label className="flex items-start gap-2.5 rounded-2xl border border-line bg-surface p-4 text-sm text-ink-soft">
          <input
            type="checkbox"
            name="resubmit"
            defaultChecked
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Kirim ulang laporan untuk diverifikasi setelah perubahan ini
            disimpan.
          </span>
        </label>
      ) : null}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/dashboard/laporan/${report.id}`}
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          Batal
        </Link>
        <Button type="submit" loading={pending}>
          {pending ? "Menyimpan..." : "Simpan perubahan"}
          {!pending ? <Save className="h-4 w-4" aria-hidden /> : null}
        </Button>
      </div>

      <FieldHint>
        Status verifikasi tidak dapat diubah dari halaman ini. Admin akan
        memeriksa ulang laporan yang dikirim ulang.
      </FieldHint>
    </form>
  );
}
