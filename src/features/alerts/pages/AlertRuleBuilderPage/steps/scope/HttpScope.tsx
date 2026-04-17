import type { AlertRulePayload, AlertRuleScope } from "@/features/alerts/types";

import { HttpCheckFields } from "./http/HttpCheckFields";
import { UrlMethodFields } from "./http/UrlMethodFields";

interface Props {
  payload: AlertRulePayload;
  patchScope: (next: Partial<AlertRuleScope>) => void;
}

export function HttpScope({ payload, patchScope }: Props) {
  return (
    <>
      <UrlMethodFields payload={payload} patchScope={patchScope} />
      <HttpCheckFields payload={payload} patchScope={patchScope} />
    </>
  );
}
