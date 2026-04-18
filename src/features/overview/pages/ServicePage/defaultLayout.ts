export const SERVICE_DETAIL_PAGE_ID = "service-detail" as const;
export const SERVICE_DETAIL_TAB_ID = "overview" as const;

export interface ServiceSectionSpec {
  readonly id: string;
  readonly label: string;
  readonly order: number;
}

export const SERVICE_DETAIL_SECTIONS: readonly ServiceSectionSpec[] = [
  { id: "golden-signals", label: "Golden signals", order: 10 },
  { id: "deployments", label: "Deployments", order: 20 },
  { id: "dependencies", label: "Dependencies", order: 30 },
  { id: "resources", label: "Resources", order: 40 },
  { id: "errors", label: "Errors", order: 50 },
  { id: "slo", label: "SLO", order: 60 },
  { id: "traces", label: "Traces", order: 70 },
  { id: "logs", label: "Logs", order: 80 },
] as const;
