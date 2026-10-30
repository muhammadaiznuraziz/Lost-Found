"use client";

import { startTransition, useEffect, useRef, useState } from "react";
import { useActionState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  FileCheck,
  FileText,
  Image as ImageIcon,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { createClaim } from "@/app/actions/reports";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldHint, Input, Textarea } from "@/components/ui/field";

export function ClaimForm({
  reportId,
  itemName,
}: {
  reportId: string;
  itemName: string;
}) {
  const [state, action, pending] = useActionState(createClaim, undefined);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const formDataRef = useRef<FormData | null>(null);

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [summary, setSummary] = useState<{
    description: string;
    evidenceFiles: { name: string; size: string; isPdf: boolean }[];
  } | null>(null);

  useEffect(() => {
    if (state?.message || state?.errors) setStep("edit");
  }, [state]);

  function formatFileSize(bytes: number) {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (!event.target.files) return;
    const filesArray = Array.from(event.target.files);

    if (filesArray.length > 3) {
      alert("Maksimal 3 berkas bukti yang dapat diunggah.");
      event.target.value = "";
      return;
    }

    setSelectedFiles(filesArray);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    formDataRef.current = formData;

    const files = formData
      .getAll("evidence")
      .filter((v): v is File => v instanceof File && v.size > 0);

    setSummary({
      description: String(formData.get("ownership_description") ?? ""),
      evidenceFiles: files.map((f) => ({
        name: f.name,
        size: formatFileSize(f.size),
        isPdf: f.type === "application/pdf" || f.name.endsWith(".pdf"),
      })),
    });

    setStep("confirm");
  }

  /* --- STEP 2: KONFIRMASI DATA --- */
  if (step === "confirm" && summary) {
    return (
      <div className="space-y-6">
        <Alert tone="info" title="Tinjau Klaim Sebelum Dikirim">
          Periksa kembali bukti dan ciri kepemilikan untuk barang{" "}
          <strong className="font-bold text-ink">{itemName}</strong> sebelum
          diajukan ke admin.
        </Alert>

        <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6 shadow-sm space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-accent" />
              Bukti & Ciri Kepemilikan
            </p>
            <div className="mt-2.5 rounded-xl border border-line/60 bg-surface-2/40 p-4">
              <p className="whitespace-pre-line text-xs sm:text-sm leading-relaxed text-ink">
                {summary.description}
              </p>
            </div>
          </div>

          <div className="border-t border-line/60 pt-4">
            <p className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1.5">
              <FileCheck className="h-4 w-4 text-accent" />
              Lampiran Bukti ({summary.evidenceFiles.length})
            </p>

            {summary.evidenceFiles.length > 0 ? (
              <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                {summary.evidenceFiles.map((file, idx) => (
                  <li
                    key={idx}
                    className="flex items-center gap-2.5 rounded-xl border border-line/70 bg-surface-2/50 p-2.5 text-xs text-ink"
                  >
                    {file.isPdf ? (
                      <FileText className="h-4 w-4 shrink-0 text-red-500" />
                    ) : (
                      <ImageIcon className="h-4 w-4 shrink-0 text-brand" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{file.name}</p>
                      <p className="text-[10px] text-muted">{file.size}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-muted italic">
                Tidak ada lampiran berkas.
              </p>
            )}
          </div>
        </div>

        {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            disabled={pending}
            onClick={() => setStep("edit")}
            className="w-full sm:w-auto justify-center rounded-xl font-semibold"
          >
            <ArrowLeft className="h-4 w-4 mr-1" aria-hidden />
            Kembali & Periksa Lagi
          </Button>
          <Button
            type="button"
            loading={pending}
            disabled={!formDataRef.current}
            onClick={() => {
              if (formDataRef.current) {
                startTransition(() => {
                  action(formDataRef.current);
                });
              }
            }}
            className="w-full sm:w-auto justify-center rounded-xl font-semibold"
          >
            {pending ? "Mengirim Klaim..." : "Kirim Klaim Sekarang"}
            {!pending ? <Upload className="h-4 w-4 ml-1" aria-hidden /> : null}
          </Button>
        </div>
      </div>
    );
  }

  /* --- STEP 1: FORM PENGISIAN --- */
  return (
    <form
      action={action}
      noValidate
      className="space-y-6"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="report_id" value={reportId} />

      {state?.message ? <Alert tone="danger">{state.message}</Alert> : null}

      <Field
        label="Bukti dan Ciri Kepemilikan"
        htmlFor="ownership_description"
        required
        hint="Sebutkan ciri spesifik yang tidak tercantum di deskripsi publik (seperti isi dompet, riwayat goresan, stiker khusus, atau nomor seri)."
        error={state?.errors?.ownership_description?.[0]}
      >
        <Textarea
          id="ownership_description"
          name="ownership_description"
          placeholder="Jelaskan mengapa barang ini milikmu dan ciri khusus yang dapat diverifikasi admin..."
          defaultValue={state?.values?.ownership_description}
          minLength={30}
          maxLength={2000}
          required
          className="min-h-36 rounded-2xl border-line/80 p-4 text-xs sm:text-sm focus:border-accent"
        />
      </Field>

      <Field
        label="Lampiran Bukti (Opsional)"
        htmlFor="evidence"
        hint="Maksimal 3 file (Foto barang, bukti transaksi/nota, atau PDF pendukung, maks 4 MB/file)."
        error={state?.errors?.evidence?.[0]}
      >
        <Input
          id="evidence"
          name="evidence"
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          multiple
          onChange={handleFileChange}
          className="rounded-xl border-line/80 py-2 text-xs sm:text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-ink hover:file:bg-surface-hover"
        />

        {selectedFiles.length > 0 && (
          <div className="mt-2.5 space-y-1.5">
            <p className="text-[11px] font-semibold text-muted">
              Berkas terpilih ({selectedFiles.length}/3):
            </p>
            <div className="flex flex-wrap gap-2">
              {selectedFiles.map((file, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface-2/60 px-2.5 py-1 text-xs text-ink"
                >
                  <span className="truncate max-w-[180px] font-medium">
                    {file.name}
                  </span>
                  <span className="text-[10px] text-muted">
                    ({formatFileSize(file.size)})
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}
      </Field>

      {/* Notice Card */}
      <div className="rounded-xl border border-line bg-surface-2/50 p-4 sm:p-5">
        <div className="flex items-center gap-2 text-sm font-bold text-ink">
          <ShieldCheck
            className="h-4 w-4 shrink-0 text-brand"
            aria-hidden="true"
          />
          <span>Sebelum Mengirim</span>
        </div>

        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-muted">
          <li className="flex items-start gap-2">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5"
              aria-hidden="true"
            />
            <span>
              Data akan ditinjau ulang pada langkah konfirmasi sebelum dikirim.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5"
              aria-hidden="true"
            />
            <span>Bukti hanya dapat dilihat oleh kamu dan admin.</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5"
              aria-hidden="true"
            />
            <span>
              Klaim palsu dapat membuat proses pengembalian dibatalkan.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2
              className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5"
              aria-hidden="true"
            />
            <span>
              Barang baru dianggap kembali setelah penyerahan dikonfirmasi.
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <FieldHint className="text-xs">
          Klaim akan diperiksa admin sebelum disetujui.
        </FieldHint>
        <Button
          type="submit"
          loading={pending}
          className="justify-center rounded-xl font-semibold"
        >
          Lanjut ke Konfirmasi
          {!pending && <Upload className="h-4 w-4 ml-1" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}
