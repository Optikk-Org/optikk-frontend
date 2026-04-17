import { Card, Input, Select, Switch } from "@/components/ui";
import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { LabeledRow } from "../components/LabeledRow";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function AlertScopeStep({ payload, patchScope }: Props) {
  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      {(payload.preset_kind === "service_error_rate" ||
        payload.preset_kind === "slo_burn_rate") && (
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
      )}

      {payload.preset_kind === "http_check" && (
        <>
          <LabeledRow label="URL">
            <Input
              value={payload.scope.url ?? ""}
              onChange={(e) => patchScope({ url: e.target.value })}
              placeholder="https://example.com/health"
            />
          </LabeledRow>
          <LabeledRow label="Method">
            <Select
              value={payload.scope.method ?? "GET"}
              onChange={(value) => patchScope({ method: value })}
              options={[
                { label: "GET", value: "GET" },
                { label: "HEAD", value: "HEAD" },
              ]}
              size="sm"
            />
          </LabeledRow>
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
      )}

      {payload.preset_kind.startsWith("ai_") && (
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
      )}
    </Card>
  );
}
