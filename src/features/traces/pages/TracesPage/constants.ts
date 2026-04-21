export const TRACE_STATUS_SORT_ORDER: Record<string, number> = {
  UNSET: 0,
  OK: 1,
  ERROR: 2,
};

export const TRACE_METRIC_FIELDS = [
  { value: "duration_nano", label: "duration (ns)" },
  { value: "duration", label: "duration" },
];
