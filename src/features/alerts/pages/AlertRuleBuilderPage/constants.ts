import type { AlertPresetKind, AlertSeverity } from "@/features/alerts/types";

export const STEPS = [
  { key: "type", label: "Type" },
  { key: "scope", label: "Scope" },
  { key: "condition", label: "Condition" },
  { key: "delivery", label: "Slack" },
  { key: "review", label: "Review" },
] as const;

export type StepKey = (typeof STEPS)[number]["key"];

export const PRESET_OPTIONS: Array<{ label: string; value: AlertPresetKind }> = [
  { label: "Service error rate", value: "service_error_rate" },
  { label: "SLO burn rate", value: "slo_burn_rate" },
  { label: "HTTP check", value: "http_check" },
  { label: "AI latency", value: "ai_latency" },
  { label: "AI error rate", value: "ai_error_rate" },
  { label: "AI cost spike", value: "ai_cost_spike" },
  { label: "AI quality drop", value: "ai_quality_drop" },
];

export const SEVERITY_OPTIONS: Array<{ label: string; value: AlertSeverity }> = [
  { label: "P1 - Critical", value: "p1" },
  { label: "P2 - High", value: "p2" },
  { label: "P3 - Medium", value: "p3" },
  { label: "P4 - Low", value: "p4" },
  { label: "P5 - Info", value: "p5" },
];

export const SENSITIVITY_OPTIONS = [
  { label: "Fast", value: "fast" },
  { label: "Balanced", value: "balanced" },
  { label: "Slow", value: "slow" },
];

export function titleForPreset(kind: AlertPresetKind): string {
  return PRESET_OPTIONS.find((option) => option.value === kind)?.label ?? kind;
}
