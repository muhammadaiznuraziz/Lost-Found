import {
  AlertTriangle,
  CheckCircle2,
  Info,
  X,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type AlertTone = "info" | "success" | "warning" | "danger";

const config: Record<
  AlertTone,
  { className: string; icon: LucideIcon; iconColor: string }
> = {
  info: {
    className: "border-info/30 bg-info-soft/60 text-info-strong dark:text-info",
    icon: Info,
    iconColor: "text-info",
  },
  success: {
    className:
      "border-brand/30 bg-brand-soft/60 text-brand-strong dark:text-brand",
    icon: CheckCircle2,
    iconColor: "text-brand",
  },
  warning: {
    className:
      "border-accent/35 bg-accent-soft/60 text-accent-strong dark:text-accent",
    icon: AlertTriangle,
    iconColor: "text-accent",
  },
  danger: {
    className:
      "border-danger/30 bg-danger-soft/60 text-danger-strong dark:text-danger",
    icon: XCircle,
    iconColor: "text-danger",
  },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children?: ReactNode;
  action?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Alert({
  tone = "info",
  title,
  children,
  action,
  onClose,
  className,
}: AlertProps) {
  const { className: toneClass, icon: Icon, iconColor } = config[tone];
  const isDanger = tone === "danger";

  return (
    <div
      role={isDanger ? "alert" : "status"}
      aria-live={isDanger ? "assertive" : "polite"}
      className={cn(
        "relative flex items-start justify-between gap-3 rounded-xl border p-4 text-xs sm:text-sm shadow-sm transition-all",
        toneClass,
        className,
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <Icon
          className={cn("h-5 w-5 shrink-0 mt-0.5", iconColor)}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 space-y-1">
          {title && (
            <h4 className="font-bold leading-tight tracking-tight text-ink">
              {title}
            </h4>
          )}
          {children && (
            <div className="leading-relaxed text-ink-soft break-words">
              {children}
            </div>
          )}
          {action && <div className="pt-2">{action}</div>}
        </div>
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-black/5 hover:text-ink focus:outline-none focus:ring-2 focus:ring-accent/20 dark:hover:bg-white/10"
          aria-label="Tutup pemberitahuan"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
