import { useParams, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { usePreviewAlertRule } from "@/features/alerts/hooks/useAlerts";
import type { AlertPrefill, AlertRulePayload } from "@/features/alerts/types";

import { buildDefaultPayload } from "../defaults";

import { useHydrateFromRule } from "./useHydrateFromRule";
import { usePayloadPatches } from "./usePayloadPatches";
import { useSaveRule } from "./useSaveRule";
import { useSlackTest } from "./useSlackTest";
import { useStepCursor } from "./useStepCursor";

/**
 * State machine + mutations that drive the alert rule builder wizard.
 * The page component only consumes this hook — everything mutable lives here.
 */
export function useAlertRuleBuilder() {
  const params = useParams({ strict: false }) as { ruleId?: string };
  const search = useSearch({ strict: false }) as AlertPrefill;
  const ruleId = params.ruleId;

  const previewMut = usePreviewAlertRule();
  const [payload, setPayload] = useState<AlertRulePayload>(() => buildDefaultPayload(search));
  useHydrateFromRule(ruleId, setPayload);

  const patches = usePayloadPatches(setPayload);
  const cursor = useStepCursor();
  const { onSave, isEditing } = useSaveRule(ruleId, payload);
  const { slackTestMut, onTestSlack } = useSlackTest(payload);

  useEffect(() => {
    if (cursor.step === "review") {
      void previewMut.mutateAsync(payload).catch(() => undefined);
    }
  }, [payload, previewMut, cursor.step]);

  return {
    payload,
    setPayload,
    ...cursor,
    isEditing,
    previewMut,
    slackTestMut,
    ...patches,
    onSave,
    onTestSlack,
  };
}
