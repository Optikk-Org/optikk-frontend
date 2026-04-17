import type { Dispatch, SetStateAction } from "react";
import { useEffect, useState } from "react";

import { useAlertRule } from "@/features/alerts/hooks/useAlerts";
import type { AlertRulePayload } from "@/features/alerts/types";

export function useHydrateFromRule(
  ruleId: string | undefined,
  setPayload: Dispatch<SetStateAction<AlertRulePayload>>
) {
  const existingQuery = useAlertRule(ruleId);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized || !existingQuery.data) return;
    const rule = existingQuery.data;
    setPayload({
      name: rule.name,
      description: rule.description ?? "",
      preset_kind: rule.preset_kind,
      scope: rule.scope,
      condition: rule.condition,
      delivery: rule.delivery,
      enabled: rule.enabled,
    });
    setInitialized(true);
  }, [existingQuery.data, initialized, setPayload]);
}
