import { Card, Select, Switch } from "@/components/ui";
import type {
  AlertRuleCondition,
  AlertRulePayload,
  AlertSeverity,
} from "@/features/alerts/types";

import { LabeledRow } from "../components/LabeledRow";
import { SENSITIVITY_OPTIONS, SEVERITY_OPTIONS } from "../constants";

import { ThresholdFields } from "./condition/ThresholdFields";

interface Props {
  payload: AlertRulePayload;
  patch: (next: Partial<AlertRulePayload>) => void;
  patchCondition: (next: Partial<AlertRuleCondition>) => void;
}

export function AlertConditionStep({ payload, patch, patchCondition }: Props) {
  const isSloBurn = payload.preset_kind === "slo_burn_rate";

  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      {isSloBurn ? (
        <LabeledRow label="Sensitivity">
          <Select
            value={payload.condition.sensitivity ?? "balanced"}
            onChange={(value) =>
              patchCondition({ sensitivity: value as "fast" | "balanced" | "slow" })
            }
            options={SENSITIVITY_OPTIONS}
            size="sm"
          />
        </LabeledRow>
      ) : (
        <ThresholdFields payload={payload} patchCondition={patchCondition} />
      )}

      <LabeledRow label="Severity">
        <Select
          value={payload.condition.severity ?? "p2"}
          onChange={(value) => patchCondition({ severity: value as AlertSeverity })}
          options={SEVERITY_OPTIONS}
          size="sm"
        />
      </LabeledRow>
      <LabeledRow label="Enabled">
        <Switch
          checked={payload.enabled}
          onChange={(e) => patch({ enabled: e.target.checked })}
        />
      </LabeledRow>
    </Card>
  );
}
