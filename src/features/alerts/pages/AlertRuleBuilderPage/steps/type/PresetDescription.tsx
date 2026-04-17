import type { AlertPresetKind } from "@/features/alerts/types";

import { titleForPreset } from "../../constants";

function descriptionFor(kind: AlertPresetKind): string {
  if (kind === "service_error_rate")
    return "Alert when a service error rate crosses a clear threshold.";
  if (kind === "slo_burn_rate")
    return "Alert when an SLO target drifts into burn territory with preset sensitivity.";
  if (kind === "http_check") return "Alert when a health check endpoint starts failing.";
  if (kind.startsWith("ai_"))
    return "Alert on a focused AI signal such as latency, error rate, cost, or quality.";
  return "";
}

export function PresetDescription({ kind }: { kind: AlertPresetKind }) {
  return (
    <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[13px] text-[var(--text-secondary)]">
      <div className="font-medium text-[var(--text-primary)]">{titleForPreset(kind)}</div>
      <div className="mt-1">{descriptionFor(kind)}</div>
    </div>
  );
}
