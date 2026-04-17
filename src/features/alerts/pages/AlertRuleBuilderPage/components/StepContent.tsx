import type { useAlertRuleBuilder } from "../hooks/useAlertRuleBuilder";
import { AlertConditionStep } from "../steps/AlertConditionStep";
import { AlertDeliveryStep } from "../steps/AlertDeliveryStep";
import { AlertReviewStep } from "../steps/AlertReviewStep";
import { AlertScopeStep } from "../steps/AlertScopeStep";
import { AlertTypeStep } from "../steps/AlertTypeStep";

type Builder = ReturnType<typeof useAlertRuleBuilder>;

export function StepContent({ builder }: { builder: Builder }) {
  const { step, payload, patch, patchScope, patchCondition, previewMut, slackTestMut, onTestSlack } =
    builder;

  if (step === "type") return <AlertTypeStep payload={payload} patch={patch} />;
  if (step === "scope") return <AlertScopeStep payload={payload} patchScope={patchScope} />;
  if (step === "condition")
    return <AlertConditionStep payload={payload} patch={patch} patchCondition={patchCondition} />;
  if (step === "delivery")
    return (
      <AlertDeliveryStep
        payload={payload}
        patch={patch}
        slackTestMut={slackTestMut}
        onTestSlack={onTestSlack}
      />
    );
  if (step === "review") return <AlertReviewStep payload={payload} previewMut={previewMut} />;
  return null;
}
