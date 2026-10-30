"use client";

import Link from "next/link";
import { startTransition, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import { ArrowLeft, Send, ShieldCheck } from "lucide-react";
import { createReport } from "@/app/actions/reports";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldHint,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import type { CampusLocation, Category, ReportType } from "@/types";

function formatDateLabel(value: string) {
  if (!value) return "-";
  const date = new Date(`${value}T00:00:00`);
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function ReportForm({
  type,
  categories,
  locations,
  defaultEmail,
}: {
  type: ReportType;
  categories: Category[];
  locations: CampusLocation[];
  defaultEmail: string;
}) {
  const [state, action, pending] = useActionState(createReport, undefined);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const formDataRef = useRef<FormData | null>(null);
  const [summary, setSummary] = useState<{
    item_name: string;
    category: string;
    date: string;
    location: string;
    dropoff: string;
    description: string;
    contact_preference: string;
    contact_value: string;
    photos: string[];
  } | null>(null);
  const isFound = type === "FOUND";
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    if (state?.message || state?.errors) setStep("edit");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    formDataRef.current = formData;

    const categoryId = String(formData.get("category_id") ?? "");
    const locationId = String(formData.get("location_id") ?? "");
    const dropoffId = String(formData.get("dropoff_location_id") ?? "");
    const preference = String(formData.get("contact_preference") ?? "");

    setSummary({
      item_name: String(formData.get("item_name") ?? ""),
      category:
        categories.find((c) => String(c.id) === categoryId)?.name ?? "-",
      date: formatDateLabel(String(formData.get("date_occurred") ?? "")),
      location: locations.find((l) => String(l.id) === locationId)?.name ?? "-",
      dropoff: locations.find((l) => String(l.id) === dropoffId)?.name ?? "-",
      description: String(formData.get("description_public") ?? ""),
      contact_preference:
        preference === "EMAIL"
          ? "Email"
          : preference === "WHATSAPP"
            ? "WhatsApp"
            : "Tidak ingin dihubungi",
      contact_value: String(formData.get("contact_value") ?? ""),
      photos: formData
        .getAll("photos")
        .filter(
          (value): value is File => value instanceof File && value.size > 0,
        )
        .map((file) => file.name),
    });
    setStep("confirm");
  }

  if (step === "confirm" && summary) {
    return (
      <div className="space-y-6">
        <Alert tone="info" title="U12 — Tinjau sebelum kirim">
          Periksa ringkasan laporan di bawah. Data yang sudah dikirim akan
          diverifikasi admin sebelum dipublikasikan.
        </Alert>

        <div className="rounded-[var(--radius-card)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-accent">
            Ringkasan laporan {isFound ? "barang temuan" : "barang hilang"}
          </h2>

          <dl className="mt-4 space-y-3 text-sm">
            {[
              ["Nama barang", summary.item_name],
              [
                isFound ? "Tanggal ditemukan" : "Tanggal kehilangan",
                summary.date,
              ],
              ["Kategori", summary.category],
              [
                isFound ? "Lokasi ditemukan" : "Lokasi terakhir terlihat",
                summary.location,
              ],
              ...(isFound
                ? [["Lokasi penyerahan", summary.dropoff] as const]
                : []),
              [
                "Preferensi kontak",
                summary.contact_preference === "Tidak ingin dihubungi"
                  ? summary.contact_preference
                  : `${summary.contact_preference} — ${summary.contact_value || "-"}`,
              ],
              [
                "Foto",
                summary.photos.length
                  ? `${summary.photos.length} foto terlampir`
                  : "Tidak ada foto",
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                className="grid gap-0.5 sm:grid-cols-[180px_1fr]"
              >
                <dt className="text-muted">{label}</dt>
                <dd className="font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-4 rounded-[var(--radius-card)] border border-line bg-surface-2/50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Deskripsi publik
            </p>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-ink">
              {summary.description}
            </p>
          </div>

          {summary.photos.length ? (
            <ul className="mt-4 flex flex-wrap gap-2 text-xs text-muted">
              {summary.photos.map((name) => (
                <li
                  key={name}
                  className="rounded-full border border-line bg-surface-2 px-3 py-1"
                >
                  {name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setStep("edit")}
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Kembali dan periksa lagi
          </Button>
          <Button
            type="button"
            size="lg"
            loading={pending}
            disabled={!formDataRef.current}
            onClick={() => {
              const formData = formDataRef.current;
              if (formData) {
                startTransition(() => {
                  action(formData);
                });
              }
            }}
          >
            {pending ? "Mengirim laporan..." : "Kirim laporan"}
            {!pending ? <Send className="h-4 w-4" aria-hidden /> : null}
          </Button>
        </div>

        <FieldHint>
          Dengan mengirim laporan, kamu menyatakan informasi yang diberikan
          benar dan tidak memuat data sensitif yang tidak perlu.
        </FieldHint>
      </div>
    );
  }

  return (
    <form
      action={action}
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="report_type" value={type} />

      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

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
            placeholder={
              isFound ? "Contoh: Dompet kulit hitam" : "Contoh: Earphone putih"
            }
            defaultValue={state?.values?.item_name}
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
            defaultValue={state?.values?.category_id ?? ""}
            required
          >
            <option value="">Pilih kategori</option>
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
            defaultValue={state?.values?.date_occurred}
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
            defaultValue={state?.values?.location_id ?? ""}
            required
          >
            <option value="">Pilih lokasi</option>
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
            hint="Pilih titik layanan tempat barang akan diserahkan."
            error={state?.errors?.dropoff_location_id?.[0]}
          >
            <Select
              id="dropoff_location_id"
              name="dropoff_location_id"
              defaultValue={state?.values?.dropoff_location_id ?? ""}
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
          hint="Jelaskan ciri umum barang. Jangan tulis ciri rahasia yang hanya diketahui pemilik."
          error={state?.errors?.description_public?.[0]}
          className="sm:col-span-2"
        >
          <Textarea
            id="description_public"
            name="description_public"
            placeholder="Warna, bahan, merek, kondisi, dan informasi lain yang membantu pencocokan..."
            defaultValue={state?.values?.description_public}
            required
            minLength={20}
            maxLength={2000}
          />
        </Field>

        <Field
          label="Foto barang"
          htmlFor="photos"
          hint="Maksimal 3 foto, masing-masing 4 MB. Format JPG, PNG, atau WEBP."
          error={state?.errors?.photos?.[0]}
          className="sm:col-span-2"
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
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/50 p-4 sm:p-5">
        <h2 className="text-sm font-semibold text-ink">Kontak privat</h2>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Kontak ini tidak ditampilkan ke publik. Hanya kamu dan admin yang
          dapat melihatnya.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="Preferensi kontak"
            htmlFor="contact_preference"
            required
            error={state?.errors?.contact_preference?.[0]}
          >
            <Select
              id="contact_preference"
              name="contact_preference"
              defaultValue={state?.values?.contact_preference ?? "EMAIL"}
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
            hint="Isi email atau nomor WhatsApp sesuai preferensi."
            error={state?.errors?.contact_value?.[0]}
          >
            <Input
              id="contact_value"
              name="contact_value"
              placeholder={defaultEmail || "nama@kampus.ac.id"}
              defaultValue={state?.values?.contact_value ?? defaultEmail}
              maxLength={120}
            />
          </Field>
        </div>
      </div>

      <div className="rounded-[var(--radius-card)] border border-line bg-surface-2/50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-ink">
          <ShieldCheck className="h-4 w-4 text-brand" aria-hidden />
          Sebelum melanjutkan
        </div>
        <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
          <li>
            · Data akan ditinjau ulang pada langkah konfirmasi sebelum dikirim.
          </li>
          <li>· Laporan hanya tampil publik setelah admin menyetujuinya.</li>
        </ul>
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href="/laporkan"
          className="text-sm font-medium text-ink-soft hover:text-ink"
        >
          Batal dan kembali
        </Link>
        <Button type="submit" size="lg" loading={pending}>
          Lanjut ke konfirmasi
          {!pending ? <Send className="h-4 w-4" aria-hidden /> : null}
        </Button>
      </div>
    </form>
  );
}
