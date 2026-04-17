import { Input } from "@/components/ui";

import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { LabeledRow } from "../../components/LabeledRow";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function ServiceScope({ payload, patchScope }: Props) {
  return (
    <>
      <LabeledRow label="Service name">
        <Input
          value={payload.scope.service_name ?? ""}
          onChange={(e) => patchScope({ service_name: e.target.value })}
          placeholder="checkout"
        />
      </LabeledRow>
      {payload.preset_kind === "service_error_rate" && (
        <LabeledRow label="Environment (optional)">
          <Input
            value={payload.scope.environment ?? ""}
            onChange={(e) => patchScope({ environment: e.target.value })}
            placeholder="prod"
          />
        </LabeledRow>
      )}
      {payload.preset_kind === "slo_burn_rate" && (
        <LabeledRow label="SLO ID">
          <Input
            value={payload.scope.slo_id ?? ""}
            onChange={(e) => patchScope({ slo_id: e.target.value })}
            placeholder="checkout-availability"
          />
        </LabeledRow>
      )}
    </>
  );
}
