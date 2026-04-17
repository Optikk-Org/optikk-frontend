import { Card, Input, Select } from "@/components/ui";
import type { AlertPresetKind, AlertRulePayload } from "@/features/alerts/types";

import { LabeledRow } from "../components/LabeledRow";
import { PRESET_OPTIONS } from "../constants";
import { payloadWithPreset } from "../defaults";

import { PresetDescription } from "./type/PresetDescription";

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
      <PresetDescription kind={payload.preset_kind} />
    </Card>
  );
}
