import { Badge, Button, Card, Input } from "@/components/ui";
import type { AlertRulePayload } from "@/features/alerts/types";
import type { UseMutationResult } from "@tanstack/react-query";

import { LabeledRow } from "../components/LabeledRow";

interface SlackTestResult {
  delivered: boolean;
  notification: { title: string; body: string };
}

interface Props {
  payload: AlertRulePayload;
  patch: (next: Partial<AlertRulePayload>) => void;
  slackTestMut: UseMutationResult<SlackTestResult, unknown, AlertRulePayload>;
  onTestSlack: () => void | Promise<void>;
}

export function AlertDeliveryStep({ payload, patch, slackTestMut, onTestSlack }: Props) {
  return (
    <Card className="mt-3 flex flex-col gap-4 p-4">
      <LabeledRow label="Slack webhook URL">
        <div className="flex items-center gap-2">
          <Input
            value={payload.delivery.slack_webhook_url}
            onChange={(e) =>
              patch({
                delivery: { ...payload.delivery, slack_webhook_url: e.target.value },
              })
            }
            placeholder="https://hooks.slack.com/services/..."
          />
          <Button variant="secondary" size="sm" onClick={() => void onTestSlack()}>
            Send test
          </Button>
        </div>
      </LabeledRow>
      <LabeledRow label="Optional note">
        <textarea
          value={payload.delivery.note ?? ""}
          onChange={(e) =>
            patch({
              delivery: { ...payload.delivery, note: e.target.value },
            })
          }
          placeholder="Tell responders what to check first."
          className="min-h-[96px] rounded-[var(--card-radius)] border border-[var(--border-color)] bg-[var(--bg-secondary)] px-3 py-2 text-[13px] text-[var(--text-primary)] outline-none"
        />
      </LabeledRow>
      {slackTestMut.data ? (
        <Card className="border border-[var(--border-color)] bg-[var(--bg-tertiary)] p-3">
          <div className="mb-2 flex items-center gap-2">
            <Badge variant={slackTestMut.data.delivered ? "success" : "error"}>
              {slackTestMut.data.delivered ? "Delivered" : "Failed"}
            </Badge>
            <span className="text-[12px] text-[var(--text-secondary)]">Latest Slack test</span>
          </div>
          <div className="font-medium text-[13px] text-[var(--text-primary)]">
            {slackTestMut.data.notification.title}
          </div>
          <pre className="mt-2 whitespace-pre-wrap text-[12px] text-[var(--text-secondary)]">
            {slackTestMut.data.notification.body}
          </pre>
        </Card>
      ) : null}
    </Card>
  );
}
