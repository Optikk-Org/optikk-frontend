import { Bell } from "lucide-react";

import { PageHeader, PageShell } from "@shared/components/ui";

import { BuilderFooter } from "./components/BuilderFooter";
import { HeaderActions } from "./components/HeaderActions";
import { StepContent } from "./components/StepContent";
import { StepIndicator } from "./components/StepIndicator";
import { useAlertRuleBuilder } from "./hooks/useAlertRuleBuilder";

export default function AlertRuleBuilderPage() {
  const builder = useAlertRuleBuilder();

  return (
    <PageShell className="min-h-screen">
      <PageHeader
        title={builder.isEditing ? "Edit alert rule" : "New alert rule"}
        subtitle="Define alerts through guided presets, then connect the rule to Slack."
        icon={<Bell size={22} />}
        actions={<HeaderActions onReview={() => builder.setStep("review")} onSave={builder.onSave} />}
      />
      <StepIndicator step={builder.step} onSelect={builder.setStep} />
      <StepContent builder={builder} />
      <BuilderFooter currentStepIndex={builder.currentStepIndex} onMove={builder.moveStep} />
    </PageShell>
  );
}
