// React Query hooks for the alerting feature.
//
// Global refresh bumps `refreshKey` in the app store; `QueryLifecycleBridge`
// invalidates team-scoped queries so alerts refetch without new cache keys.

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { useTeamId } from "@store/appStore";

import { alertsApi } from "../api/alertsApi";
import type {
  AlertRule,
  AlertRulePayload,
} from "../types";

const ALERTS_SCOPE = "alerts";

export function alertRuleQueryKey(id: string, teamId: number | null) {
  return [ALERTS_SCOPE, "rule", id, teamId] as const;
}

export function alertRulesQueryKey(teamId: number | null) {
  return [ALERTS_SCOPE, "rules", teamId] as const;
}

export function alertIncidentsQueryKey(teamId: number | null, state?: string) {
  return [ALERTS_SCOPE, "incidents", teamId, state ?? "all"] as const;
}

export function useAlertRules() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: alertRulesQueryKey(teamId),
    queryFn: () => alertsApi.listRules({ teamId }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
    enabled: true,
  });
}

export function useAlertRule(id: string | undefined) {
  const teamId = useTeamId();
  return useQuery({
    queryKey: alertRuleQueryKey(id ?? "", teamId),
    queryFn: () => alertsApi.getRule(id as string),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
  });
}

export function useAlertIncidents(options?: {
  readonly refetchInterval?: number;
  readonly state?: "firing" | "resolved" | "all";
}) {
  const teamId = useTeamId();
  const state = options?.state;
  return useQuery({
    queryKey: alertIncidentsQueryKey(teamId, state),
    queryFn: () => alertsApi.listIncidents({ state, teamId }),
    placeholderData: keepPreviousData,
    refetchInterval: options?.refetchInterval,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
  });
}

export function useRuleAudit(id: string | undefined) {
  const teamId = useTeamId();
  return useQuery({
    queryKey: [ALERTS_SCOPE, "audit", id, teamId] as const,
    queryFn: () => alertsApi.ruleAudit(id as string),
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
  });
}

export function useSilences() {
  const teamId = useTeamId();
  return useQuery({
    queryKey: [ALERTS_SCOPE, "silences", teamId] as const,
    queryFn: () => alertsApi.listSilences(),
    placeholderData: keepPreviousData,
    staleTime: 0,
    gcTime: 30_000,
    retry: false,
  });
}

export function useCreateAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: AlertRulePayload) => alertsApi.createRule(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useUpdateAlertRule(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<AlertRulePayload>) => alertsApi.updateRule(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useDeleteAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => alertsApi.deleteRule(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useMuteAlertRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, until }: { id: string; until: string | null }) =>
      alertsApi.muteRule(id, until),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useAckAlertInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceId, until }: { instanceId: string; until?: string | null }) =>
      alertsApi.ackInstance(instanceId, until),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useSnoozeAlertInstance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ instanceId, minutes }: { instanceId: string; minutes: number }) =>
      alertsApi.snoozeInstance(instanceId, minutes),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: [ALERTS_SCOPE] });
    },
  });
}

export function useTestSlackWebhook() {
  return useMutation({
    mutationFn: (webhookUrl: string) => alertsApi.testSlackWebhook(webhookUrl),
  });
}

export function useBacktestRule(id: string) {
  return useMutation({
    mutationFn: ({ from, to }: { from: string; to: string }) =>
      alertsApi.backtestRule(id, { from, to }),
  });
}

export function useTestRulePayload() {
  return useMutation({
    mutationFn: (payload: AlertRulePayload) => alertsApi.testPayload(payload),
  });
}

export type AlertRuleWithInstanceCount = AlertRule & { firingInstances: number };
