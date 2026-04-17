import { Input, Select } from "@/components/ui";

import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { LabeledRow } from "../../../components/LabeledRow";

const METHOD_OPTIONS = [
  { label: "GET", value: "GET" },
  { label: "HEAD", value: "HEAD" },
];

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function UrlMethodFields({ payload, patchScope }: Props) {
  return (
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
          options={METHOD_OPTIONS}
          size="sm"
        />
      </LabeledRow>
    </>
  );
}
