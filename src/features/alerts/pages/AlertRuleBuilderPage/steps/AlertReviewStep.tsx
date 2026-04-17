import { Badge, Card } from "@/components/ui";
import type { AlertRulePayload } from "@/features/alerts/types";
import type { UseMutationResult } from "@tanstack/react-query";

import { titleForPreset } from "../constants";

interface PreviewEngine {
  condition_type: string;
  operator: string;
  windows: Array<{ name: string; secs: number }>;
  critical_threshold: number;
  for_secs: number;
  no_data_secs: number;
}

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
      <Card className="p-4">
        <div className="mb-3 flex items-center gap-2">
          <Badge variant="info">{titleForPreset(payload.preset_kind)}</Badge>
          <Badge variant={payload.enabled ? "success" : "warning"}>
            {payload.enabled ? "Enabled" : "Disabled"}
          </Badge>
        </div>
        <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Summary
        </div>
        <div className="mt-2 text-[14px] text-[var(--text-primary)]">
          {previewMut.data?.summary ?? "Loading preview…"}
        </div>
        {previewMut.data?.engine ? (
          <div className="mt-4 rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3 text-[12px] text-[var(--text-secondary)]">
            <div>Engine type: {previewMut.data.engine.condition_type}</div>
            <div>Operator: {previewMut.data.engine.operator}</div>
            <div>
              Windows:{" "}
              {previewMut.data.engine.windows
                .map((window) => `${window.name}:${window.secs}s`)
                .join(", ")}
            </div>
            <div>Threshold: {previewMut.data.engine.critical_threshold}</div>
            <div>Hold: {previewMut.data.engine.for_secs}s</div>
            <div>No data: {previewMut.data.engine.no_data_secs}s</div>
          </div>
        ) : null}
      </Card>

      <Card className="p-4">
        <div className="text-[12px] text-[var(--text-muted)] uppercase tracking-[0.06em]">
          Slack message preview
        </div>
        <div className="mt-2 font-medium text-[13px] text-[var(--text-primary)]">
          {previewMut.data?.notification.title ?? payload.name ?? "Alert preview"}
        </div>
        <pre className="mt-3 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
          {previewMut.data?.notification.body ?? "Loading preview…"}
        </pre>
      </Card>
    </div>
  );
}
