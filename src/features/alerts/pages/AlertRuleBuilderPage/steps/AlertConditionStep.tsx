import { Card, Input, Select, Switch } from "@/components/ui";
import type {
  AlertRuleCondition,
  AlertRulePayload,
  AlertSeverity,
} from "@/features/alerts/types";

import { LabeledRow } from "../components/LabeledRow";
import { SENSITIVITY_OPTIONS, SEVERITY_OPTIONS } from "../constants";

interface Props {
  payload: AlertRulePayload;
  patch: (next: Partial<AlertRulePayload>) => void;
  patchCondition: (next: Partial<AlertRuleCondition>) => void;
}

export function AlertConditionStep({ payload, patch, patchCondition }: Props) {
  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      {payload.preset_kind === "slo_burn_rate" ? (
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
        <>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <LabeledRow label="Threshold">
              <Input
                type="number"
                value={String(payload.condition.threshold)}
                onChange={(e) => patchCondition({ threshold: Number(e.target.value) || 0 })}
              />
            </LabeledRow>
            <LabeledRow
              label={
                payload.preset_kind === "http_check"
                  ? "Check interval (minutes)"
                  : "Window (minutes)"
              }
            >
              <Input
                type="number"
                value={String(
                  payload.preset_kind === "http_check"
                    ? (payload.condition.evaluation_interval_minutes ?? 1)
                    : (payload.condition.window_minutes ?? 5)
                )}
                onChange={(e) =>
                  patchCondition(
                    payload.preset_kind === "http_check"
                      ? { evaluation_interval_minutes: Number(e.target.value) || 1 }
                      : { window_minutes: Number(e.target.value) || 5 }
                  )
                }
              />
            </LabeledRow>
          </div>
          {payload.preset_kind !== "http_check" && (
            <LabeledRow label="Hold time (minutes)">
              <Input
                type="number"
                value={String(payload.condition.hold_minutes ?? 2)}
                onChange={(e) => patchCondition({ hold_minutes: Number(e.target.value) || 2 })}
              />
            </LabeledRow>
          )}
        </>
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
