import { Input } from "@/components/ui";

import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { LabeledRow } from "../../components/LabeledRow";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function AiScope({ payload, patchScope }: Props) {
  return (
    <>
      <LabeledRow label="Service name (optional)">
        <Input
          value={payload.scope.service_name ?? ""}
          onChange={(e) => patchScope({ service_name: e.target.value })}
          placeholder="llm-gateway"
        />
      </LabeledRow>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabeledRow label="Provider">
          <Input
            value={payload.scope.provider ?? ""}
            onChange={(e) => patchScope({ provider: e.target.value })}
            placeholder="openai"
          />
        </LabeledRow>
        <LabeledRow label="Model">
          <Input
            value={payload.scope.model ?? ""}
            onChange={(e) => patchScope({ model: e.target.value })}
            placeholder="gpt-4.1"
          />
        </LabeledRow>
      </div>
      <LabeledRow label="Prompt template (optional)">
        <Input
          value={payload.scope.prompt_template ?? ""}
          onChange={(e) => patchScope({ prompt_template: e.target.value })}
          placeholder="checkout-assistant"
        />
      </LabeledRow>
    </>
  );
}
