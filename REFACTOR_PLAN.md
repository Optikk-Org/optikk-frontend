# REFACTOR_PLAN.md

## 0. Current Execution Status (March 6, 2026)

- Domain-internal migration completed for:
  - `traces`
  - `logs`
  - `services`
  - `metrics`
  - `overview`
  - `infrastructure`
  - `ai`
  - `settings`
- Feature folders for migrated domains are now bridge-only (`src/features/*/index.ts` re-exporting from `src/domains/*`).
- Shared wrappers updated to domain-owned imports:
  - `src/components/ui/ErrorsTabPanel.tsx`
  - `src/components/ui/ResourceUtilizationTabPanel.tsx`
- Current verification status:
  - `npm run type-check`: passing
  - `npm run build`: passing

## 1. VIOLATION AUDIT

### 1.1 Domain importing from another domain
Current code uses `src/features/*` (not `src/domains/*`). Using feature folders as domain-equivalents, the cross-domain import violation is:

- `src/features/overview/pages/OverviewPage/index.tsx` imports `../../../metrics/utils/metricNormalizers` [overview -> metrics]

### 1.2 Components/pages doing data fetching directly instead of domain hooks
The following components/pages call `useQuery` / `useMutation` / `useTimeRangeQuery` and directly depend on service-layer calls. These should be moved behind domain-level hooks (`domains/<n>/hooks/*`) so components stay presentational:

- `src/features/ai/pages/AiObservabilityPage/index.tsx` (hooks at lines: 32, 36, 40, 44, 48, 53, 57, 61, 65, 69, 73; services: @services/v1Service)
- `src/features/errors/pages/ErrorDashboardPage/index.tsx` (hooks at lines: 71, 78, 85, 92, 100; services: @services/overviewService)
- `src/features/infrastructure/pages/NodesPage/index.tsx` (hooks at lines: 26, 33; services: @services/v1Service)
- `src/features/log/pages/LogsHubPage/index.tsx` (hooks at lines: 142, 149, 156; services: @services/v1Service)
- `src/features/metrics/pages/DatabaseCachePerformancePage/index.tsx` (hooks at lines: 25, 30, 35, 40, 45; services: @services/v1Service)
- `src/features/metrics/pages/LatencyAnalysisPage/index.tsx` (hooks at lines: 54, 64; services: @services/v1Service)
- `src/features/metrics/pages/MessagingQueueMonitoringPage/index.tsx` (hooks at lines: 22, 27, 32, 37, 42; services: @services/v1Service)
- `src/features/metrics/pages/ResourceUtilizationPage/index.tsx` (hooks at lines: 21; services: @services/v1Service)
- `src/features/metrics/pages/SaturationPage/index.tsx` (hooks at lines: 58, 64, 70, 81, 85, 89; services: @services/v1Service)
- `src/features/overview/pages/OverviewPage/index.tsx` (hooks at lines: 34, 40, 46, 52, 58; services: @services/overviewService)
- `src/features/overview/pages/SloSliDashboardPage/index.tsx` (hooks at lines: 27, 41; services: @services/overviewService)
- `src/features/services/pages/ServiceDetailPage/index.tsx` (hooks at lines: 88, 98, 108, 119, 134; services: @services/v1Service)
- `src/features/services/pages/ServiceMapPage/index.tsx` (hooks at lines: 29; services: @services/serviceMapService)
- `src/features/settings/pages/SettingsPage/index.tsx` (hooks at lines: 36, 44; services: @services/settingsService)
- `src/features/traces/pages/TraceDetailPage/index.tsx` (hooks at lines: 80, 100; services: @services/v1Service)
- `src/features/traces/pages/TracesPage/index.tsx` (hooks at lines: 269, 274, 280; services: @services/v1Service, @services/service-types)

### 1.3 Hooks doing more than one thing
These hooks are multi-responsibility (data orchestration + transformation + sorting/filtering + presentation shaping), exceeding the prompt's modularity rule:

- `src/features/services/hooks/useServicesData.ts` (284 lines): summary queries + metrics queries + topology graph transformation + risk scoring + filtering + sorting + view model assembly.
- `src/features/metrics/hooks/useMetricsQueries.ts` (88 lines): mixed summary/services/timeseries/endpoint query orchestration and time-range construction.
- `src/hooks/useURLFilters.ts` (246 lines): URL state parser/serializer + debounced syncing + structured filter encoding/decoding + setter factory.
- `src/hooks/useSSE.ts` (169 lines): connection lifecycle + reconnection policy + event dispatching + state handling.
- `src/hooks/useRealtimeRefresh.ts` (119 lines): refresh scheduling + browser visibility behavior + app store integration.
- `src/hooks/useInfiniteLogs.ts` (114 lines): pagination state + fetch orchestration + merge/accumulation logic.

### 1.4 Logic that belongs in a domain but currently lives in shared/global layers

- `src/components/ui/ErrorsTabPanel.tsx` imports `@features/errors` directly.
- `src/components/ui/ResourceUtilizationTabPanel.tsx` imports `@features/metrics` directly.
- `src/components/ui/dashboard/SpecializedRendererRegistry.tsx` contains AI-specific renderer implementations (`ai-line`, `ai-bar`) inside shared chart infrastructure.
- `src/components/ui/dashboard/ConfigurableChartCard.tsx` contains domain semantics (endpoint/service/queue/table grouping and ranking logic) in a shared component.

### 1.5 Logic duplicated across 2+ domains that should be in shared

- Metric normalizers reused cross-domain:
  - `src/features/metrics/utils/metricNormalizers.ts`
  - Imported by `src/features/overview/pages/OverviewPage/index.tsx`
  - Similar endpoint normalization reimplemented in `src/features/traces/pages/TracesPage/index.tsx`
- Service metric normalization duplicated:
  - `src/features/services/utils/servicesUtils.ts` (`normalizeServiceMetric`)
  - `src/features/errors/pages/ErrorDashboardPage/index.tsx` (`normalizeServiceMetric` inline)
- Error-rate threshold/status logic repeated across services, overview, metrics, infrastructure pages/components.
- List-rendering patterns duplicated (`TopEndpointsList`, `EndpointList`, `QueueMetricsList`, `DatabaseTopTablesList`, `TopQueuesTable`) and should converge on shared list primitives.

### 1.6 Files over 100 lines (split candidates)

-  814 `src/features/traces/pages/TracesPage/index.tsx`
-  494 `src/features/services/pages/ServiceDetailPage/index.tsx`
-  489 `src/components/common/data-display/ObservabilityDataBoard.tsx`
-  412 `src/features/traces/pages/TraceDetailPage/index.tsx`
-  405 `src/components/charts/specialized/ServiceGraph.tsx`
-  402 `src/components/ui/dashboard/ConfigurableChartCard.tsx`
-  369 `src/components/common/forms/ObservabilityQueryBar.tsx`
-  364 `src/services/metricsService.ts`
-  346 `src/features/metrics/pages/SaturationPage/index.tsx`
-  345 `src/features/log/pages/LogsHubPage/index.tsx`
-  336 `src/features/services/pages/ServicesPage/index.tsx`
-  317 `src/utils/logUtils.ts`
-  312 `src/components/common/forms/TimeRangePicker.tsx`
-  303 `src/features/overview/pages/OverviewPage/index.tsx`
-  293 `src/features/errors/pages/ErrorDashboardPage/index.tsx`
-  291 `src/components/ui/dashboard/SpecializedRendererRegistry.tsx`
-  284 `src/features/services/hooks/useServicesData.ts`
-  283 `src/components/charts/distributions/LogHistogram.tsx`
-  261 `src/features/services/components/services-page/ServiceOverviewTab.tsx`
-  258 `src/components/charts/time-series/LatencyChart.tsx`
-  249 `src/components/charts/time-series/ErrorRateChart.tsx`
-  246 `src/hooks/useURLFilters.ts`
-  233 `src/components/charts/time-series/RequestChart.tsx`
-  226 `src/components/common/data-display/QueueMetricsList.tsx`
-  215 `src/features/metrics/pages/LatencyAnalysisPage/index.tsx`
-  213 `src/components/common/data-display/DatabaseTopTablesList.tsx`
-  203 `src/features/services/components/services-page/ServiceTopologyTab.tsx`
-  201 `src/components/layout/Sidebar.tsx`
-  200 `src/components/charts/micro/EndpointList.tsx`
-  199 `src/features/services/pages/ServiceMapPage/index.tsx`
-  198 `src/components/common/data-display/TopEndpointsList.tsx`
-  197 `src/features/overview/components/slo/SloHealthGauges.tsx`
-  192 `src/components/charts/specialized/WaterfallChart.tsx`
-  187 `src/features/log/components/table/LogsTableSection.tsx`
-  181 `src/features/metrics/components/database/DatabaseSystemBreakdown.tsx`
-  180 `src/features/ai/pages/AiObservabilityPage/index.tsx`
-  179 `src/services/authService.ts`
-  170 `src/utils/chartHelpers.ts`
-  169 `src/hooks/useSSE.ts`
-  169 `src/features/metrics/pages/MetricsPage/index.tsx`
-  166 `src/utils/formatters.ts`
-  163 `src/services/api.ts`
-  163 `src/features/auth/pages/LoginPage/index.tsx`
-  160 `src/features/log/components/log/LogRow.tsx`
-  159 `src/store/appStore.ts`
-  159 `src/config/constants.ts`
-  151 `src/App.tsx`
-  148 `src/features/settings/pages/SettingsPage/index.tsx`
-  146 `src/features/log/components/log/LogVolumeChart.tsx`
-  143 `src/features/metrics/pages/ResourceUtilizationPage/index.tsx`
-  143 `src/components/common/overlay/CommandPalette.tsx`
-  141 `src/features/traces/components/table/TracesTableRow.tsx`
-  139 `src/features/overview/components/slo/SloComplianceTable.tsx`
-  138 `src/features/metrics/pages/DatabaseCachePerformancePage/index.tsx`
-  137 `src/features/overview/pages/SloSliDashboardPage/index.tsx`
-  137 `src/components/charts/specialized/PodLifecycleGantt.tsx`
-  136 `src/store/authStore.test.ts`
-  135 `src/features/ai/components/tabs/AiOverviewTab.tsx`
-  131 `src/store/authStore.ts`
-  129 `src/components/layout/Header.tsx`
-  123 `src/features/infrastructure/pages/NodesPage/index.tsx`
-  122 `src/components/charts/specialized/N1QueryDetector.tsx`
-  119 `src/hooks/useRealtimeRefresh.ts`
-  118 `src/components/common/feedback/ErrorBoundary.tsx`
-  114 `src/hooks/useInfiniteLogs.ts`
-  114 `src/features/metrics/components/messaging/TopQueuesTable.tsx`
-  114 `src/components/charts/specialized/GoldenSignalsHeatmap.tsx`
-  112 `src/features/settings/components/tabs/SettingsPreferencesTab.tsx`
-  109 `src/services/aiService.ts`
-  108 `src/components/charts/specialized/BurnRateChart.tsx`
-  107 `src/services/overviewService.ts`
-  107 `src/features/metrics/pages/MessagingQueueMonitoringPage/index.tsx`
-  107 `src/features/infrastructure/components/nodes/NodesTable.tsx`
-  106 `src/services/saturationService.ts`
-  104 `src/components/charts/specialized/LatencyHeatmapChart.tsx`
-  102 `src/features/services/utils/servicesUtils.test.ts`
-  102 `src/features/metrics/utils/metricNormalizers.test.ts`
-  101 `src/store/appStore.test.ts`

### 1.7 Components receiving more than 5 props

- LogsTableSectionProps (20 props) — `src/features/log/components/table/LogsTableSection.tsx`
- DataTableProps (13 props) — `src/components/common/data-display/DataTable.tsx`
- StatCardProps (12 props) — `src/components/common/cards/StatCard.tsx`
- SloHealthGaugesProps (12 props) — `src/features/overview/components/slo/SloHealthGauges.tsx`
- ObservabilityDetailPanelProps (11 props) — `src/components/common/data-display/ObservabilityDataBoard.tsx`
- BoardActionBarProps (10 props) — `src/components/ui/data-board/BoardActionBar.tsx`
- ObservabilityQueryBarProps (9 props) — `src/components/common/forms/ObservabilityQueryBar.tsx`
- BoardSkeletonProps (9 props) — `src/components/ui/data-board/BoardSkeleton.tsx`
- LatencyChartProps (8 props) — `src/components/charts/time-series/LatencyChart.tsx`
- DetailDrawerProps (7 props) — `src/components/common/layout/DetailDrawer.tsx`
- KpiCardProps (7 props) — `src/features/log/components/log/KpiCard.tsx`
- TracesTableRowProps (7 props) — `src/features/traces/components/table/TracesTableRow.tsx`
- PageHeaderProps (6 props) — `src/components/common/layout/PageHeader.tsx`
- QueryFieldPickerProps (6 props) — `src/components/ui/query-bar/QueryFieldPicker.tsx`
- ServiceDetailStatsRowProps (6 props) — `src/features/services/components/detail/ServiceDetailStatsRow.tsx`
- ServiceDetailOverviewTabProps (6 props) — `src/features/services/components/detail/tabs/ServiceDetailOverviewTab.tsx`
- SettingsPreferencesTabProps (6 props) — `src/features/settings/components/tabs/SettingsPreferencesTab.tsx`
- SettingsProfileTabProps (6 props) — `src/features/settings/components/tabs/SettingsProfileTab.tsx`
- TracesKpiCardProps (6 props) — `src/features/traces/components/kpi/TracesKpiCard.tsx`

### 1.8 Types defined inline instead of `types.ts`
Top offenders (by count of inline `type`/`interface` declarations outside `types.ts`):

-  11 inline types in `src/components/common/data-display/ObservabilityDataBoard.tsx`
-   8 inline types in `src/components/common/forms/ObservabilityQueryBar.tsx`
-   6 inline types in `src/features/traces/pages/TracesPage/index.tsx`
-   4 inline types in `src/hooks/useTimeRangeQuery.ts`
-   4 inline types in `src/components/common/forms/FilterBar.tsx`
-   4 inline types in `src/components/common/data-display/TopEndpointsList.tsx`
-   4 inline types in `src/components/common/data-display/QueueMetricsList.tsx`
-   4 inline types in `src/components/charts/micro/EndpointList.tsx`
-   3 inline types in `src/utils/logUtils.ts`
-   3 inline types in `src/store/authStore.ts`
-   3 inline types in `src/store/appStore.ts`
-   3 inline types in `src/hooks/useURLFilters.ts`
-   3 inline types in `src/hooks/useSSE.ts`
-   3 inline types in `src/components/ui/query-bar/QueryOperatorPicker.tsx`
-   3 inline types in `src/components/common/layout/DetailDrawer.tsx`
-   3 inline types in `src/components/common/data-display/Timeline.tsx`
-   3 inline types in `src/components/common/data-display/DatabaseTopTablesList.tsx`
-   3 inline types in `src/components/charts/time-series/LatencyChart.tsx`
-   2 inline types in `src/services/api.ts`
-   2 inline types in `src/hooks/useUrlSyncedTab.ts`
-   2 inline types in `src/hooks/useResizableColumns.ts`
-   2 inline types in `src/hooks/useRealtimeRefresh.ts`
-   2 inline types in `src/hooks/useAutoRefresh.ts`
-   2 inline types in `src/features/traces/components/kpi/TracesKpiCard.tsx`
-   2 inline types in `src/features/settings/components/tabs/SettingsTeamTab.tsx`
-   2 inline types in `src/features/services/components/detail/tabs/ServiceDetailDependenciesTab.tsx`
-   2 inline types in `src/features/services/components/detail/ServiceDetailStatsRow.tsx`
-   2 inline types in `src/features/overview/components/slo/SloHealthGauges.tsx`
-   2 inline types in `src/components/ui/query-bar/QueryFieldPicker.tsx`
-   2 inline types in `src/components/ui/metric-lists/UnifiedMetricList.tsx`
-   2 inline types in `src/components/ui/data-board/BoardSkeleton.tsx`
-   2 inline types in `src/components/ui/data-board/BoardEmptyState.tsx`
-   2 inline types in `src/components/common/layout/PageHeader.tsx`
-   2 inline types in `src/components/common/feedback/ErrorBoundary.tsx`
-   2 inline types in `src/components/charts/specialized/LatencyHeatmapChart.tsx`
-   2 inline types in `src/components/charts/specialized/GoldenSignalsHeatmap.tsx`
-   2 inline types in `src/components/charts/distributions/LatencyHistogram.tsx`
-   1 inline types in `src/test/setupTests.ts`
-   1 inline types in `src/services/settingsService.ts`
-   1 inline types in `src/services/metricsService.ts`

---

## 2. MISSING PIECES AUDIT

### Domain-structure baseline mismatch
- Expected by prompt: `src/domains/{traces,logs,services,overview,metrics,infrastructure,ai,settings}`.
- Current: `src/features/{traces,log,services,overview,metrics,infrastructure,ai,settings}`.
- `logs` is currently named `log` and must be normalized.

### Required scaffold check per domain-equivalent folder

| Domain | Current Folder | `index.ts` | `types.ts` | `constants.ts` | `services/` | `utils/` | Result |
|---|---|---:|---:|---:|---:|---:|---|
| traces | `src/features/traces` | yes | yes | no | no | no | Missing 3 required pieces |
| logs | `src/features/log` | yes | no | no | no | no | Missing 4 + folder rename to `logs` |
| services | `src/features/services` | yes | no | no | no | yes | Missing 3 required pieces |
| overview | `src/features/overview` | yes | no | no | no | no | Missing 4 required pieces |
| metrics | `src/features/metrics` | yes | no | no | no | yes | Missing 3 required pieces |
| infrastructure | `src/features/infrastructure` | yes | no | no | no | no | Missing 4 required pieces |
| ai | `src/features/ai` | yes | no | no | no | no | Missing 4 required pieces |
| settings | `src/features/settings` | yes | no | no | no | no | Missing 4 required pieces |

Additional missing core architecture pieces from target:
- `src/app/registry/domainRegistry.ts` (missing)
- `src/app/registry/permissionRegistry.ts` (missing)
- `src/app/routes/appRoutes.tsx` (missing; routing currently embedded in `src/App.tsx`)
- `src/app/routes/ProtectedRoute.tsx` (missing as standalone file; currently inline in `src/App.tsx`)
- `src/services/api/interceptors/*` (missing)
- `src/services/auth/authStorage.ts` (missing)
- `src/shared/types/{api,pagination,filters,common}.ts` (missing)
- `src/shared/constants/routes.ts` (missing)

---

## 3. SHARED/ PROMOTION CANDIDATES

Promote these to `shared/` because they are already used across domains or are clear second-use candidates:

1. `src/features/metrics/utils/metricNormalizers.ts` -> `src/shared/utils/metricNormalizers.ts`
2. `normalizeServiceMetric` duplication (`servicesUtils.ts` + `ErrorDashboardPage`) -> `src/shared/utils/serviceMetrics.ts`
3. Error-rate/status thresholds repeated across domains -> `src/shared/utils/thresholds.ts`
4. Endpoint/service/queue ranking builders inside `ConfigurableChartCard.tsx` -> `src/shared/utils/listBuilders.ts`
5. AI timeseries builder in `SpecializedRendererRegistry.tsx` -> `src/shared/utils/chartSeries.ts`
6. Domain wrappers in shared UI (`ErrorsTabPanel`, `ResourceUtilizationTabPanel`) -> move into owning domain components
7. Reused list/table presentation logic (`TopEndpointsList`, `EndpointList`, `QueueMetricsList`, `TopQueuesTable`) -> consolidate under `src/shared/components/metric-lists/`
8. Time relative-formatting duplication (`src/utils/time.ts` and `src/utils/formatters.ts`) -> one shared formatter module
9. Common query-param sync patterns (`useURLFilters`, `useUrlSyncedTab`) -> unify via `src/shared/hooks/useQueryState.ts`
10. Reused chart render primitives in dashboard components -> promote/normalize under `src/shared/components/charts/`

---

## 4. COMPLETE TARGET FILE TREE

The tree below is the complete planned post-refactor file set (current files mapped into `app/shared/domains/services` plus required new files).

```text
src/app/App.tsx
src/app/auth/index.ts
src/app/auth/pages/LoginPage/LoginPage.css
src/app/auth/pages/LoginPage/index.tsx
src/app/layout/Header.css
src/app/layout/Header.tsx
src/app/layout/MainLayout.css
src/app/layout/MainLayout.tsx
src/app/layout/Sidebar.css
src/app/layout/Sidebar.tsx
src/app/providers/AuthExpiryListener.tsx
src/app/providers/QueryClientProvider.tsx
src/app/providers/ThemeProvider.tsx
src/app/registry/domainRegistry.ts
src/app/registry/permissionRegistry.ts
src/app/routes/ProtectedRoute.tsx
src/app/routes/appRoutes.tsx
src/app/store/appStore.test.ts
src/app/store/appStore.ts
src/app/store/authStore.test.ts
src/app/store/authStore.ts
src/app/styles/index.css
src/domains/ai/components/index.ts
src/domains/ai/components/tabs/AiCostTab.tsx
src/domains/ai/components/tabs/AiGuideTab.tsx
src/domains/ai/components/tabs/AiOverviewTab.tsx
src/domains/ai/components/tabs/AiPerformanceTab.tsx
src/domains/ai/components/tabs/AiSecurityTab.tsx
src/domains/ai/components/tabs/index.ts
src/domains/ai/components/tabs/tabHelpers.tsx
src/domains/ai/constants.ts
src/domains/ai/index.ts
src/domains/ai/pages/AiObservabilityPage/AiObservabilityPage.css
src/domains/ai/pages/AiObservabilityPage/index.tsx
src/domains/ai/services/aiApi.ts
src/domains/ai/services/aiKeys.ts
src/domains/ai/types.ts
src/domains/ai/utils/index.ts
src/domains/infrastructure/components/index.ts
src/domains/infrastructure/components/nodes/NodeDetailDrawer.tsx
src/domains/infrastructure/components/nodes/NodeServicesTable.tsx
src/domains/infrastructure/components/nodes/NodesTable.tsx
src/domains/infrastructure/components/nodes/index.ts
src/domains/infrastructure/components/nodes/nodeConstants.tsx
src/domains/infrastructure/components/tabs/ResourceUtilizationTabPanel.tsx
src/domains/infrastructure/constants.ts
src/domains/infrastructure/index.ts
src/domains/infrastructure/pages/InfrastructureHubPage/index.tsx
src/domains/infrastructure/pages/NodesPage/index.tsx
src/domains/infrastructure/services/deploymentsApi.ts
src/domains/infrastructure/services/infrastructureApi.ts
src/domains/infrastructure/services/infrastructureKeys.ts
src/domains/infrastructure/types.ts
src/domains/infrastructure/utils/index.ts
src/domains/logs/components/charts/LogsLevelDistributionCard.tsx
src/domains/logs/components/charts/LogsVolumeSection.tsx
src/domains/logs/components/index.ts
src/domains/logs/components/kpi/LogsKpiRow.tsx
src/domains/logs/components/log/KpiCard.tsx
src/domains/logs/components/log/LevelDistribution.tsx
src/domains/logs/components/log/LogRow.tsx
src/domains/logs/components/log/LogVolumeChart.tsx
src/domains/logs/components/log/ServicePills.tsx
src/domains/logs/components/table/LogsTableSection.tsx
src/domains/logs/constants.ts
src/domains/logs/index.ts
src/domains/logs/pages/LogsHubPage/LogsHubPage.css
src/domains/logs/pages/LogsHubPage/index.tsx
src/domains/logs/services/logsApi.ts
src/domains/logs/services/logsKeys.ts
src/domains/logs/types.ts
src/domains/logs/utils/index.ts
src/domains/metrics/components/MetricsFilterBar.tsx
src/domains/metrics/components/ServiceMetricsGrid.tsx
src/domains/metrics/components/database/DatabaseSystemBreakdown.tsx
src/domains/metrics/components/database/index.ts
src/domains/metrics/components/index.ts
src/domains/metrics/components/messaging/MessagingSystemsPills.tsx
src/domains/metrics/components/messaging/TopQueuesTable.tsx
src/domains/metrics/components/messaging/index.ts
src/domains/metrics/components/messaging/messagingMeta.ts
src/domains/metrics/constants.ts
src/domains/metrics/hooks/useMetricsQueries.ts
src/domains/metrics/hooks/useMetricsState.test.tsx
src/domains/metrics/hooks/useMetricsState.ts
src/domains/metrics/index.ts
src/domains/metrics/pages/DatabaseCachePerformancePage/index.tsx
src/domains/metrics/pages/LatencyAnalysisPage/index.tsx
src/domains/metrics/pages/MessagingQueueMonitoringPage/index.tsx
src/domains/metrics/pages/MetricsPage/index.tsx
src/domains/metrics/pages/ResourceUtilizationPage/ResourceUtilizationStyle.css
src/domains/metrics/pages/ResourceUtilizationPage/index.tsx
src/domains/metrics/pages/SaturationHubPage/index.tsx
src/domains/metrics/pages/SaturationPage/SaturationPage.css
src/domains/metrics/pages/SaturationPage/index.tsx
src/domains/metrics/services/latencyApi.ts
src/domains/metrics/services/metricsApi.ts
src/domains/metrics/services/metricsKeys.ts
src/domains/metrics/services/saturationApi.ts
src/domains/metrics/types.ts
src/domains/metrics/utils/index.ts
src/domains/metrics/utils/metricNormalizers.test.ts
src/domains/metrics/utils/metricNormalizers.ts
src/domains/metrics/utils/trendCalculators.test.ts
src/domains/metrics/utils/trendCalculators.ts
src/domains/overview/components/index.ts
src/domains/overview/components/slo/SloComplianceTable.tsx
src/domains/overview/components/slo/SloHealthGauges.tsx
src/domains/overview/components/slo/index.ts
src/domains/overview/components/tabs/ErrorsTabPanel.tsx
src/domains/overview/constants.ts
src/domains/overview/index.ts
src/domains/overview/pages/ErrorDashboardPage/ErrorDashboardPage.css
src/domains/overview/pages/ErrorDashboardPage/index.ts
src/domains/overview/pages/ErrorDashboardPage/index.tsx
src/domains/overview/pages/OverviewHubPage/index.tsx
src/domains/overview/pages/OverviewPage/OverviewPage.css
src/domains/overview/pages/OverviewPage/index.tsx
src/domains/overview/pages/SloSliDashboardPage/index.tsx
src/domains/overview/services/overviewApi.ts
src/domains/overview/services/overviewKeys.ts
src/domains/overview/types.ts
src/domains/overview/utils/index.ts
src/domains/services/components/detail/ServiceDetailStatsRow.tsx
src/domains/services/components/detail/index.ts
src/domains/services/components/detail/tabs/ServiceDetailDependenciesTab.tsx
src/domains/services/components/detail/tabs/ServiceDetailErrorsTab.tsx
src/domains/services/components/detail/tabs/ServiceDetailLogsTab.tsx
src/domains/services/components/detail/tabs/ServiceDetailOverviewTab.tsx
src/domains/services/components/detail/tabs/index.ts
src/domains/services/components/services-page/ServiceOverviewTab.tsx
src/domains/services/components/services-page/ServiceTopologyTab.tsx
src/domains/services/constants.ts
src/domains/services/hooks/useServicesData.ts
src/domains/services/index.ts
src/domains/services/pages/ServiceDetailPage/index.tsx
src/domains/services/pages/ServiceMapPage/ServiceMapPage.css
src/domains/services/pages/ServiceMapPage/index.tsx
src/domains/services/pages/ServicesPage/ServicesPage.css
src/domains/services/pages/ServicesPage/index.tsx
src/domains/services/services/serviceMapApi.ts
src/domains/services/services/servicesApi.ts
src/domains/services/services/servicesKeys.ts
src/domains/services/types.ts
src/domains/services/utils/index.ts
src/domains/services/utils/servicesUtils.test.ts
src/domains/services/utils/servicesUtils.ts
src/domains/settings/components/tabs/SettingsPreferencesTab.tsx
src/domains/settings/components/tabs/SettingsProfileTab.tsx
src/domains/settings/components/tabs/SettingsTeamTab.tsx
src/domains/settings/components/tabs/index.ts
src/domains/settings/constants.ts
src/domains/settings/index.ts
src/domains/settings/pages/SettingsPage/SettingsPage.css
src/domains/settings/pages/SettingsPage/index.tsx
src/domains/settings/services/settingsApi.ts
src/domains/settings/services/settingsKeys.ts
src/domains/settings/types.ts
src/domains/settings/utils/index.ts
src/domains/traces/components/charts/TopServicesPanel.tsx
src/domains/traces/components/filters/TracesServicePills.tsx
src/domains/traces/components/index.ts
src/domains/traces/components/kpi/TracesKpiCard.tsx
src/domains/traces/components/table/TraceMethodBadge.tsx
src/domains/traces/components/table/TraceStatusBadge.tsx
src/domains/traces/components/table/TracesTableRow.tsx
src/domains/traces/constants.ts
src/domains/traces/index.ts
src/domains/traces/pages/TraceDetailPage/TraceDetailPage.css
src/domains/traces/pages/TraceDetailPage/index.tsx
src/domains/traces/pages/TracesPage/TracesPage.css
src/domains/traces/pages/TracesPage/index.tsx
src/domains/traces/services/tracesApi.ts
src/domains/traces/services/tracesKeys.ts
src/domains/traces/types.ts
src/domains/traces/utils/index.ts
src/main.tsx
src/services/api/client.ts
src/services/api/interceptors/authInterceptor.ts
src/services/api/interceptors/errorInterceptor.ts
src/services/api/interceptors/retryInterceptor.ts
src/services/api/service-types.ts
src/services/api/v1Service.ts
src/services/auth/authService.ts
src/services/auth/authStorage.ts
src/shared/components/charts/BarChart.tsx
src/shared/components/charts/ConfigurableDashboard.tsx
src/shared/components/charts/TimeSeriesChart.tsx
src/shared/components/charts/dashboard/ConfigurableChartCard.tsx
src/shared/components/charts/dashboard/SpecializedRendererRegistry.tsx
src/shared/components/charts/dashboard/index.ts
src/shared/components/charts/distributions/LatencyHistogram.tsx
src/shared/components/charts/distributions/LogHistogram.tsx
src/shared/components/charts/micro/EndpointList.tsx
src/shared/components/charts/micro/GaugeChart.tsx
src/shared/components/charts/micro/SparklineChart.tsx
src/shared/components/charts/specialized/BurnRateChart.tsx
src/shared/components/charts/specialized/GoldenSignalsHeatmap.tsx
src/shared/components/charts/specialized/LatencyHeatmapChart.css
src/shared/components/charts/specialized/LatencyHeatmapChart.tsx
src/shared/components/charts/specialized/N1QueryDetector.tsx
src/shared/components/charts/specialized/PodLifecycleGantt.tsx
src/shared/components/charts/specialized/ServiceGraph.css
src/shared/components/charts/specialized/ServiceGraph.tsx
src/shared/components/charts/specialized/WaterfallChart.css
src/shared/components/charts/specialized/WaterfallChart.tsx
src/shared/components/charts/time-series/ErrorRateChart.tsx
src/shared/components/charts/time-series/LatencyChart.tsx
src/shared/components/charts/time-series/RequestChart.tsx
src/shared/components/data-board/BoardActionBar.tsx
src/shared/components/data-board/BoardColumnSettingsPopover.tsx
src/shared/components/data-board/BoardEmptyState.tsx
src/shared/components/data-board/BoardExportMenu.tsx
src/shared/components/data-board/BoardLoadMoreFooter.tsx
src/shared/components/data-board/BoardSkeleton.tsx
src/shared/components/data-board/DataTable.tsx
src/shared/components/data-board/DatabaseTopTablesList.tsx
src/shared/components/data-board/ObservabilityDataBoard.css
src/shared/components/data-board/ObservabilityDataBoard.tsx
src/shared/components/data-board/QueueMetricsList.tsx
src/shared/components/data-board/Timeline.css
src/shared/components/data-board/Timeline.tsx
src/shared/components/data-board/TopEndpointsList.tsx
src/shared/components/data-board/index.ts
src/shared/components/feedback/EmptyState.tsx
src/shared/components/feedback/ErrorBoundary.tsx
src/shared/components/feedback/Loading.tsx
src/shared/components/feedback/Skeleton.tsx
src/shared/components/feedback/StatusBadge.tsx
src/shared/components/feedback/TrendIndicator.tsx
src/shared/components/index.ts
src/shared/components/metric-lists/UnifiedMetricList.tsx
src/shared/components/metric-lists/index.ts
src/shared/components/query-bar/FilterBar.css
src/shared/components/query-bar/FilterBar.tsx
src/shared/components/query-bar/ObservabilityQueryBar.css
src/shared/components/query-bar/ObservabilityQueryBar.tsx
src/shared/components/query-bar/QueryFieldPicker.tsx
src/shared/components/query-bar/QueryKeyboardHints.tsx
src/shared/components/query-bar/QueryOperatorPicker.tsx
src/shared/components/query-bar/SearchInput.tsx
src/shared/components/query-bar/TimeRangePicker.tsx
src/shared/components/query-bar/index.ts
src/shared/components/ui/Badge.tsx
src/shared/components/ui/Button.tsx
src/shared/components/ui/Tooltip.tsx
src/shared/components/ui/cards/HealthIndicator.tsx
src/shared/components/ui/cards/StatCard.css
src/shared/components/ui/cards/StatCard.tsx
src/shared/components/ui/cards/StatCardsGrid.tsx
src/shared/components/ui/layout/DetailDrawer.css
src/shared/components/ui/layout/DetailDrawer.tsx
src/shared/components/ui/layout/PageHeader.css
src/shared/components/ui/layout/PageHeader.tsx
src/shared/components/ui/overlay/CommandPalette.css
src/shared/components/ui/overlay/CommandPalette.tsx
src/shared/constants/chartColors.ts
src/shared/constants/routes.ts
src/shared/constants/telemetry.ts
src/shared/constants/ui.ts
src/shared/hooks/useAutoRefresh.ts
src/shared/hooks/useChartTimeBuckets.ts
src/shared/hooks/useDashboardConfig.ts
src/shared/hooks/useDebouncedValue.test.tsx
src/shared/hooks/useDebouncedValue.ts
src/shared/hooks/useFeatureFlag.ts
src/shared/hooks/useInfiniteLogs.ts
src/shared/hooks/useKeyboardShortcut.test.tsx
src/shared/hooks/useKeyboardShortcut.ts
src/shared/hooks/usePersistedColumns.ts
src/shared/hooks/useQueryState.ts
src/shared/hooks/useRealtimeRefresh.ts
src/shared/hooks/useResizableColumns.ts
src/shared/hooks/useSSE.ts
src/shared/hooks/useTimeRangeQuery.ts
src/shared/hooks/useURLFilters.ts
src/shared/hooks/useUrlSyncedTab.ts
src/shared/services/dashboardConfigService.ts
src/shared/types/api.ts
src/shared/types/common.ts
src/shared/types/filters.ts
src/shared/types/pagination.ts
src/shared/utils/chartHelpers.ts
src/shared/utils/chartSetup.ts
src/shared/utils/formatters.test.ts
src/shared/utils/formatters.ts
src/shared/utils/logUtils.test.ts
src/shared/utils/logUtils.ts
src/shared/utils/storage.test.ts
src/shared/utils/storage.ts
src/shared/utils/time.ts
src/shared/utils/validators.ts
src/test/setupTests.ts
```
