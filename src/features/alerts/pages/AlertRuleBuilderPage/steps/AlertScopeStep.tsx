import { Card } from "@/components/ui";
import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { AiScope } from "./scope/AiScope";
import { HttpScope } from "./scope/HttpScope";
import { ServiceScope } from "./scope/ServiceScope";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function AlertScopeStep({ payload, patchScope }: Props) {
  const kind = payload.preset_kind;
  const isService = kind === "service_error_rate" || kind === "slo_burn_rate";
  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      {isService ? <ServiceScope payload={payload} patchScope={patchScope} /> : null}
      {kind === "http_check" ? <HttpScope payload={payload} patchScope={patchScope} /> : null}
      {kind.startsWith("ai_") ? <AiScope payload={payload} patchScope={patchScope} /> : null}
    </Card>
  );
}
