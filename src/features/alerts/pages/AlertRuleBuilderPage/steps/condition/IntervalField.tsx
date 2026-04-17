import { Input } from "@/components/ui";

import type { AlertRuleCondition, AlertRulePayload } from "@/features/alerts/types";

import { LabeledRow } from "../../components/LabeledRow";

interface Props {
  payload: AlertRulePayload;
  patchCondition: (next: Partial<AlertRuleCondition>) => void;
}

export function IntervalField({ payload, patchCondition }: Props) {
  const isHttpCheck = payload.preset_kind === "http_check";
  const value = isHttpCheck
    ? (payload.condition.evaluation_interval_minutes ?? 1)
    : (payload.condition.window_minutes ?? 5);
  return (
    <LabeledRow label={isHttpCheck ? "Check interval (minutes)" : "Window (minutes)"}>
      <Input
        type="number"
        value={String(value)}
        onChange={(e) =>
          patchCondition(
            isHttpCheck
              ? { evaluation_interval_minutes: Number(e.target.value) || 1 }
              : { window_minutes: Number(e.target.value) || 5 }
          )
        }
      />
    </LabeledRow>
  );
}
