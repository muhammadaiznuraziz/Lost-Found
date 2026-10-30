import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-brand", className)}
      aria-hidden
    />
  );
}

export function PageLoading({ label = "Memuat data…" }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-sm text-muted">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}
