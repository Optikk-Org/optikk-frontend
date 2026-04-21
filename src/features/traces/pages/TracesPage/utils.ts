import type { StructuredFilter } from "@/shared/hooks/useURLFilters";

export function compareTraceText(left: unknown, right: unknown): number {
  return String(left ?? "").localeCompare(String(right ?? ""), undefined, {
    sensitivity: "base",
  });
}

export function compareTraceTimestamp(left: unknown, right: unknown): number {
  return new Date(String(left ?? 0)).getTime() - new Date(String(right ?? 0)).getTime();
}

export function upsertFacetFilter(
  filters: StructuredFilter[],
  nextField: string,
  nextValue: string | null
): StructuredFilter[] {
  const withoutField = filters.filter((filter) => filter.field !== nextField);
  if (!nextValue) {
    return withoutField;
  }

  return [
    ...withoutField,
    {
      field: nextField,
      operator: "equals",
      value: nextValue,
    },
  ];
}
