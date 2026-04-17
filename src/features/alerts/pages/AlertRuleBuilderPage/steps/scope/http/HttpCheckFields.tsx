import { Input, Switch } from "@/components/ui";

import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { LabeledRow } from "../../../components/LabeledRow";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function HttpCheckFields({ payload, patchScope }: Props) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <LabeledRow label="Expected status">
          <Input
            type="number"
            value={String(payload.scope.expect_status ?? 200)}
            onChange={(e) => patchScope({ expect_status: Number(e.target.value) || 200 })}
          />
        </LabeledRow>
        <LabeledRow label="Timeout (ms)">
          <Input
            type="number"
            value={String(payload.scope.timeout_ms ?? 10000)}
            onChange={(e) =>
              patchScope({ timeout_ms: Math.max(1000, Number(e.target.value) || 10000) })
            }
          />
        </LabeledRow>
      </div>
      <LabeledRow label="Body contains (optional)">
        <Input
          value={payload.scope.expect_body_substring ?? ""}
          onChange={(e) => patchScope({ expect_body_substring: e.target.value })}
          placeholder="healthy"
        />
      </LabeledRow>
      <LabeledRow label="Follow redirects">
        <Switch
          checked={Boolean(payload.scope.follow_redirects)}
          onChange={(e) => patchScope({ follow_redirects: e.target.checked })}
        />
      </LabeledRow>
    </>
  );
}
