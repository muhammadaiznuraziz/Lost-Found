import Link from "next/link";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";
import type { CampusLocation, Category, ReportType } from "@/types";

export interface ReportFilterValues {
  q?: string;
  type?: string;
  category?: string;
  location?: string;
  from?: string;
  to?: string;
}

export function ReportFilters({
  categories,
  locations,
  values,
}: {
  categories: Category[];
  locations: CampusLocation[];
  values: ReportFilterValues;
}) {
  const hasFilters = Boolean(
    values.q ||
      values.type ||
      values.category ||
      values.location ||
      values.from ||
      values.to,
  );

  return (
    <form
      action="/cari"
      method="get"
      className="rounded-[var(--radius-card)] border border-line bg-surface p-4 shadow-[var(--shadow-card)] sm:p-5"
    >
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        <SlidersHorizontal className="h-4 w-4 text-muted" aria-hidden />
        Filter pencarian
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="Kata kunci" htmlFor="q" className="sm:col-span-2">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <Input
              id="q"
              name="q"
              defaultValue={values.q}
              placeholder="Nama barang atau ciri-ciri"
              className="pl-9"
            />
          </div>
        </Field>

        <Field label="Jenis laporan" htmlFor="type">
          <Select id="type" name="type" defaultValue={values.type ?? ""}>
            <option value="">Semua jenis</option>
            <option value="FOUND">Barang temuan</option>
            <option value="LOST">Barang hilang</option>
          </Select>
        </Field>

        <Field label="Kategori" htmlFor="category">
          <Select
            id="category"
            name="category"
            defaultValue={values.category ?? ""}
          >
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Lokasi" htmlFor="location">
          <Select
            id="location"
            name="location"
            defaultValue={values.location ?? ""}
          >
            <option value="">Semua lokasi</option>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Dari tanggal" htmlFor="from">
          <Input
            id="from"
            name="from"
            type="date"
            defaultValue={values.from}
          />
        </Field>

        <Field label="Sampai tanggal" htmlFor="to">
          <Input id="to" name="to" type="date" defaultValue={values.to} />
        </Field>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Button type="submit" size="sm">
          <Search className="h-4 w-4" aria-hidden />
          Cari barang
        </Button>
        {hasFilters ? (
          <Link
            href="/cari"
            className="inline-flex h-9 items-center gap-1.5 rounded-[var(--radius-control)] px-3 text-sm font-medium text-ink-soft transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <X className="h-4 w-4" aria-hidden />
            Hapus filter
          </Link>
        ) : null}
      </div>

    </form>
  );
}

export function parseReportType(value: string | undefined): ReportType | undefined {
  return value === "LOST" || value === "FOUND" ? value : undefined;
}
