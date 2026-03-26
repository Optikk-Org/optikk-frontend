export interface FeatureFlags {
  enableNewTraceView: boolean;
  enableAdvancedMetrics: boolean;
  enableAiInsights: boolean;
}

export const defaultFeatureFlags: FeatureFlags = {
  enableNewTraceView: false,
  enableAdvancedMetrics: false,
  enableAiInsights: true,
};
