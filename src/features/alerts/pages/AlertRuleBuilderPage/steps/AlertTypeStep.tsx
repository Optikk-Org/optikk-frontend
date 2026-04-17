import { Card, Input, Select } from "@/components/ui";
import type { AlertPresetKind, AlertRulePayload } from "@/features/alerts/types";

import { LabeledRow } from "../components/LabeledRow";
import { PRESET_OPTIONS, titleForPreset } from "../constants";
import { payloadWithPreset } from "../defaults";

interface Props {
  payload: AlertRulePayload;
  patch: (next: Partial<AlertRulePayload>) => void;
}

export function AlertTypeStep({ payload, patch }: Props) {
  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      <LabeledRow label="Rule name">
        <Input
          value={payload.name}
          onChange={(e) => patch({ name: e.target.value })}
          placeholder="Checkout error rate"
        />
      </LabeledRow>
      <LabeledRow label="Description">
        <Input
          value={payload.description ?? ""}
          onChange={(e) => patch({ description: e.target.value })}
          placeholder="What this alert is protecting"
        />
      </LabeledRow>
      <LabeledRow label="Alert type">
        <Select
          value={payload.preset_kind}
          onChange={(value) => patch(payloadWithPreset(value as AlertPresetKind, payload))}
          options={PRESET_OPTIONS}
          size="sm"
        />
      </LabeledRow>
      <div className="rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[13px] text-[var(--text-secondary)]">
        <div className="font-medium text-[var(--text-primary)]">
          {titleForPreset(payload.preset_kind)}
        </div>
        <div className="mt-1">
          {payload.preset_kind === "service_error_rate" &&
            "Alert when a service error rate crosses a clear threshold."}
          {payload.preset_kind === "slo_burn_rate" &&
            "Alert when an SLO target drifts into burn territory with preset sensitivity."}
          {payload.preset_kind === "http_check" &&
            "Alert when a health check endpoint starts failing."}
          {payload.preset_kind.startsWith("ai_") &&
            "Alert on a focused AI signal such as latency, error rate, cost, or quality."}
        </div>
      </div>
    </Card>
  );
}
