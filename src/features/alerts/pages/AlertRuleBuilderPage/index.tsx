import { Bell, Save, Send } from "lucide-react";

import { Button } from "@/components/ui";
import { PageHeader, PageShell } from "@shared/components/ui";

import { BuilderFooter } from "./components/BuilderFooter";
import { StepIndicator } from "./components/StepIndicator";
import { useAlertRuleBuilder } from "./hooks/useAlertRuleBuilder";
import { AlertConditionStep } from "./steps/AlertConditionStep";
import { AlertDeliveryStep } from "./steps/AlertDeliveryStep";
import { AlertReviewStep } from "./steps/AlertReviewStep";
import { AlertScopeStep } from "./steps/AlertScopeStep";
import { AlertTypeStep } from "./steps/AlertTypeStep";

export default function AlertRuleBuilderPage() {
  const {
    payload,
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
  } = useAlertRuleBuilder();

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={isEditing ? "Edit alert rule" : "New alert rule"}
        subtitle="Define alerts through guided presets, then connect the rule to Slack."
        icon={<Bell size={22} />}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setStep("review")}>
              <Send size={12} /> Review
            </Button>
            <Button variant="primary" size="sm" onClick={onSave}>
              <Save size={12} /> Save
            </Button>
          </div>
        }
      />

      <StepIndicator step={step} onSelect={setStep} />

      {step === "type" && <AlertTypeStep payload={payload} patch={patch} />}
      {step === "scope" && <AlertScopeStep payload={payload} patchScope={patchScope} />}
      {step === "condition" && (
        <AlertConditionStep payload={payload} patch={patch} patchCondition={patchCondition} />
      )}
      {step === "delivery" && (
        <AlertDeliveryStep
          payload={payload}
          patch={patch}
          slackTestMut={slackTestMut}
          onTestSlack={onTestSlack}
        />
      )}
      {step === "review" && <AlertReviewStep payload={payload} previewMut={previewMut} />}

      <BuilderFooter currentStepIndex={currentStepIndex} onMove={moveStep} />
    </PageShell>
  );
}
