import type {
  AlertPrefill,
  AlertPresetKind,
  AlertRuleCondition,
  AlertRulePayload,
  AlertRuleScope,
} from "@/features/alerts/types";

export function defaultConditionForPreset(presetKind: AlertPresetKind): AlertRuleCondition {
  switch (presetKind) {
    case "service_error_rate":
      return { threshold: 5, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "slo_burn_rate":
      return { threshold: 2, severity: "p2", sensitivity: "balanced" };
    case "http_check":
      return { threshold: 0.5, evaluation_interval_minutes: 1, severity: "p2" };
    case "ai_latency":
      return { threshold: 2500, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "ai_error_rate":
      return { threshold: 5, window_minutes: 5, hold_minutes: 2, severity: "p2" };
    case "ai_cost_spike":
      return { threshold: 50, window_minutes: 15, hold_minutes: 5, severity: "p2" };
    case "ai_quality_drop":
      return { threshold: 0.7, window_minutes: 15, hold_minutes: 5, severity: "p2" };
  }
}

export function defaultScopeForPreset(
  presetKind: AlertPresetKind,
  prefill?: AlertPrefill
): AlertRuleScope {
  switch (presetKind) {
    case "service_error_rate":
      return {
        service_name: prefill?.serviceName ?? "",
        environment: prefill?.environment ?? "",
      };
    case "slo_burn_rate":
      return {
        service_name: prefill?.serviceName ?? "",
        slo_id: prefill?.sloId ?? "",
      };
    case "http_check":
      return {
        url: prefill?.url ?? "https://",
        method: "GET",
        expect_status: 200,
        timeout_ms: 10000,
        follow_redirects: false,
      };
    case "ai_latency":
    case "ai_error_rate":
    case "ai_cost_spike":
    case "ai_quality_drop":
      return {
        service_name: prefill?.serviceName ?? "",
        provider: prefill?.provider ?? "",
        model: prefill?.model ?? "",
        prompt_template: prefill?.promptTemplate ?? "",
      };
  }
}

export function buildDefaultPayload(prefill?: AlertPrefill): AlertRulePayload {
  const presetKind = prefill?.presetKind ?? "service_error_rate";
  return {
    name: "",
    description: "",
    preset_kind: presetKind,
    scope: defaultScopeForPreset(presetKind, prefill),
    condition: defaultConditionForPreset(presetKind),
    delivery: {
      slack_webhook_url: "",
      note: "",
    },
    enabled: true,
  };
}

export function payloadWithPreset(
  nextPreset: AlertPresetKind,
  current: AlertRulePayload
): AlertRulePayload {
  return {
    ...current,
    preset_kind: nextPreset,
    scope: defaultScopeForPreset(nextPreset, {
      serviceName: current.scope.service_name,
      environment: current.scope.environment,
      sloId: current.scope.slo_id,
      url: current.scope.url,
      provider: current.scope.provider,
      model: current.scope.model,
      promptTemplate: current.scope.prompt_template,
    }),
    condition: defaultConditionForPreset(nextPreset),
  };
}
