import type { AlertRulePayload } from "@/features/alerts/types";
import type { UseMutationResult } from "@tanstack/react-query";

import { type PreviewEngine, ReviewSummaryCard } from "./review/ReviewSummaryCard";
import { SlackPreviewCard } from "./review/SlackPreviewCard";

interface PreviewResult {
  summary: string;
  engine?: PreviewEngine;
  notification: { title: string; body: string };
}

interface Props {
  payload: AlertRulePayload;
  previewMut: UseMutationResult<PreviewResult, unknown, AlertRulePayload>;
}

export function AlertReviewStep({ payload, previewMut }: Props) {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3 xl:grid-cols-2">
      <ReviewSummaryCard
        payload={payload}
        summary={previewMut.data?.summary}
        engine={previewMut.data?.engine}
      />
      <SlackPreviewCard
        fallbackTitle={payload.name}
        notification={previewMut.data?.notification}
      />
    </div>
  );
}
