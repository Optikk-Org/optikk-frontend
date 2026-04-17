import type { Dispatch, SetStateAction } from "react";
import { useCallback } from "react";

import type {
  AlertRuleCondition,
  AlertRulePayload,
  AlertRuleScope,
} from "@/features/alerts/types";

export function usePayloadPatches(setPayload: Dispatch<SetStateAction<AlertRulePayload>>) {
  const patch = useCallback(
    (next: Partial<AlertRulePayload>) => setPayload((prev) => ({ ...prev, ...next })),
    [setPayload]
  );
  const patchScope = useCallback(
    (next: Partial<AlertRuleScope>) =>
      setPayload((prev) => ({ ...prev, scope: { ...prev.scope, ...next } })),
    [setPayload]
  );
  const patchCondition = useCallback(
    (next: Partial<AlertRuleCondition>) =>
      setPayload((prev) => ({ ...prev, condition: { ...prev.condition, ...next } })),
    [setPayload]
  );
  return { patch, patchScope, patchCondition };
}
