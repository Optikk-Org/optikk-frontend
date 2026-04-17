import { useNavigate, useParams, useSearch } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import {
  useAlertRule,
  useCreateAlertRule,
  usePreviewAlertRule,
  useTestSlackWebhook,
  useUpdateAlertRule,
} from "@/features/alerts/hooks/useAlerts";
import type {
  AlertPrefill,
  AlertRuleCondition,
  AlertRulePayload,
  AlertRuleScope,
} from "@/features/alerts/types";
import { ROUTES } from "@/shared/constants/routes";

import { STEPS, type StepKey } from "../constants";
import { buildDefaultPayload } from "../defaults";

/**
 * State machine + mutations that drive the alert rule builder wizard.
 * The page component only consumes this hook — everything mutable lives here.
 */
export function useAlertRuleBuilder() {
  const navigate = useNavigate();
  const params = useParams({ strict: false }) as { ruleId?: string };
  const search = useSearch({ strict: false }) as AlertPrefill;
  const ruleId = params.ruleId;
  const isEditing = Boolean(ruleId);

  const existingQuery = useAlertRule(ruleId);
  const createMut = useCreateAlertRule();
  const updateMut = useUpdateAlertRule(ruleId ?? "");
  const slackTestMut = useTestSlackWebhook();
  const previewMut = usePreviewAlertRule();

  const [payload, setPayload] = useState<AlertRulePayload>(() => buildDefaultPayload(search));
  const [initialized, setInitialized] = useState(false);
  const [step, setStep] = useState<StepKey>("type");

  useEffect(() => {
    if (!initialized && existingQuery.data) {
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
    }
  }, [existingQuery.data, initialized]);

  useEffect(() => {
    if (step === "review") {
      void previewMut.mutateAsync(payload).catch(() => undefined);
    }
  }, [payload, previewMut, step]);

  const currentStepIndex = useMemo(
    () => STEPS.findIndex((entry) => entry.key === step),
    [step]
  );

  const patch = useCallback(
    (next: Partial<AlertRulePayload>) => setPayload((prev) => ({ ...prev, ...next })),
    []
  );
  const patchScope = useCallback(
    (next: Partial<AlertRuleScope>) =>
      setPayload((prev) => ({ ...prev, scope: { ...prev.scope, ...next } })),
    []
  );
  const patchCondition = useCallback(
    (next: Partial<AlertRuleCondition>) =>
      setPayload((prev) => ({ ...prev, condition: { ...prev.condition, ...next } })),
    []
  );

  const moveStep = useCallback(
    (direction: -1 | 1) => {
      setStep((prev) => {
        const idx = STEPS.findIndex((entry) => entry.key === prev);
        const nextIndex = Math.min(STEPS.length - 1, Math.max(0, idx + direction));
        return STEPS[nextIndex]?.key ?? "type";
      });
    },
    []
  );

  const onSave = useCallback(async () => {
    try {
      if (isEditing && ruleId) {
        await updateMut.mutateAsync(payload);
        toast.success("Rule updated");
      } else {
        const created = await createMut.mutateAsync(payload);
        toast.success("Rule created");
        navigate({
          to: ROUTES.alertRuleDetail.replace("$ruleId", created.id) as never,
        });
        return;
      }
      navigate({ to: ROUTES.alerts as never });
    } catch {
      toast.error("Failed to save rule");
    }
  }, [createMut, isEditing, navigate, payload, ruleId, updateMut]);

  const onTestSlack = useCallback(async () => {
    try {
      const result = await slackTestMut.mutateAsync(payload);
      if (result.delivered) toast.success("Slack test message sent");
      else toast.error(result.error ?? "Slack test failed");
    } catch {
      toast.error("Slack test failed");
    }
  }, [payload, slackTestMut]);

  return {
    payload,
    setPayload,
    step,
    setStep,
    currentStepIndex,
    isEditing,
    previewMut,
    slackTestMut,
    patch,
    patchScope,
    patchCondition,
    moveStep,
    onSave,
    onTestSlack,
  };
}
