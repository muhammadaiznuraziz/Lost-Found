import {
  CLAIM_STATUS,
  FLAG_STATUS,
  HANDOVER_STATUS,
  ITEM_STATUS,
  REPORT_STATUS,
  REPORT_TYPE,
  type Tone,
} from "@/lib/constants";
import { Badge } from "./badge";

type StatusKind = "report" | "claim" | "handover" | "flag" | "item" | "type";

const maps: Record<StatusKind, Record<string, { label: string; tone: Tone }>> = {
  report: REPORT_STATUS,
  claim: CLAIM_STATUS,
  handover: HANDOVER_STATUS,
  flag: FLAG_STATUS,
  item: ITEM_STATUS,
  type: REPORT_TYPE,
};

export function StatusBadge({
  kind,
  status,
  dot = true,
  className,
}: {
  kind: StatusKind;
  status: string;
  dot?: boolean;
  className?: string;
}) {
  const config = maps[kind][status] ?? {
    label: status,
    tone: "neutral" as Tone,
  };

  return (
    <Badge tone={config.tone} dot={dot} className={className}>
      {config.label}
    </Badge>
  );
}
