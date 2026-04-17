import { useCallback } from "react";
import toast from "react-hot-toast";

import { useTestSlackWebhook } from "@/features/alerts/hooks/useAlerts";
import type { AlertRulePayload } from "@/features/alerts/types";

export function useSlackTest(payload: AlertRulePayload) {
  const slackTestMut = useTestSlackWebhook();
  const onTestSlack = useCallback(async () => {
    try {
      const result = await slackTestMut.mutateAsync(payload);
      if (result.delivered) toast.success("Slack test message sent");
      else toast.error(result.error ?? "Slack test failed");
    } catch {
      toast.error("Slack test failed");
    }
  }, [payload, slackTestMut]);
  return { slackTestMut, onTestSlack };
}
