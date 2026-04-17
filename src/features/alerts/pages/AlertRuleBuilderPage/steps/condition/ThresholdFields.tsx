import { Input } from "@/components/ui";

import type { AlertRuleCondition, AlertRulePayload } from "@/features/alerts/types";

import { LabeledRow } from "../../components/LabeledRow";

import { IntervalField } from "./IntervalField";

interface Props {
  payload: AlertRulePayload;
  patchCondition: (next: Partial<AlertRuleCondition>) => void;
}

export function ThresholdFields({ payload, patchCondition }: Props) {
  const isHttpCheck = payload.preset_kind === "http_check";
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabeledRow label="Threshold">
          <Input
            type="number"
            value={String(payload.condition.threshold)}
            onChange={(e) => patchCondition({ threshold: Number(e.target.value) || 0 })}
          />
        </LabeledRow>
        <IntervalField payload={payload} patchCondition={patchCondition} />
      </div>
      {!isHttpCheck && (
        <LabeledRow label="Hold time (minutes)">
          <Input
            type="number"
            value={String(payload.condition.hold_minutes ?? 2)}
            onChange={(e) => patchCondition({ hold_minutes: Number(e.target.value) || 2 })}
          />
        </LabeledRow>
      )}
    </>
  );
}
