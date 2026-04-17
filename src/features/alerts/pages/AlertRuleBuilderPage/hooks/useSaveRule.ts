import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";
import toast from "react-hot-toast";

import { useCreateAlertRule, useUpdateAlertRule } from "@/features/alerts/hooks/useAlerts";
import type { AlertRulePayload } from "@/features/alerts/types";
import { ROUTES } from "@/shared/constants/routes";

export function useSaveRule(ruleId: string | undefined, payload: AlertRulePayload) {
  const navigate = useNavigate();
  const createMut = useCreateAlertRule();
  const updateMut = useUpdateAlertRule(ruleId ?? "");
  const isEditing = Boolean(ruleId);

  const onSave = useCallback(async () => {
    try {
      if (isEditing && ruleId) {
        await updateMut.mutateAsync(payload);
        toast.success("Rule updated");
        navigate({ to: ROUTES.alerts as never });
        return;
      }
      const created = await createMut.mutateAsync(payload);
      toast.success("Rule created");
      navigate({ to: ROUTES.alertRuleDetail.replace("$ruleId", created.id) as never });
    } catch {
      toast.error("Failed to save rule");
    }
  }, [createMut, isEditing, navigate, payload, ruleId, updateMut]);

  return { onSave, isEditing };
}
