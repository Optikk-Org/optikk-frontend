# Pages Directory Structure

This directory has been refactored to follow **SOLID** and **DRY** principles with feature-based organization.

## Directory Structure

```
src/pages/
├── alerts/              # Alert and incident management
│   ├── AlertsPage.jsx
│   ├── AlertsHubPage.jsx
│   ├── IncidentsPage.jsx
│   └── index.js
├── traces/              # Distributed tracing
│   ├── TracesPage.jsx
│   ├── TraceDetailPage.jsx
│   └── index.js
├── services/            # Service monitoring and topology
│   ├── ServicesPage.jsx
│   ├── ServiceDetailPage.jsx
│   ├── ServiceMapPage.jsx
│   └── index.js
├── logs/                # Log management and analytics
│   ├── LogsPage.jsx
│   ├── LogsHubPage.jsx
│   ├── LogsAnalyticsPage.jsx
│   └── index.js
├── metrics/             # Metrics and performance monitoring
│   ├── MetricsPage.jsx
│   ├── LatencyAnalysisPage.jsx
│   ├── SloSliDashboardPage.jsx
│   └── index.js
├── infrastructure/      # Infrastructure monitoring
│   ├── InfrastructurePage.jsx
│   ├── InfrastructureHubPage.jsx
│   ├── NodesPage.jsx
│   ├── ResourceUtilizationPage.jsx
│   ├── DatabaseCachePerformancePage.jsx
│   ├── DeploymentTrackingPage.jsx
│   ├── HealthChecksPage.jsx
│   ├── MessagingQueueMonitoringPage.jsx
│   └── index.js
├── saturation/          # Resource saturation monitoring
│   ├── SaturationPage.jsx
│   ├── SaturationHubPage.jsx
│   └── index.js
├── ai-observability/    # AI/ML observability
│   ├── AiObservabilityPage.jsx
│   └── index.js
├── errors/              # Error tracking and dashboards
│   ├── ErrorDashboardPage.jsx
│   └── index.js
├── overview/            # Overview and summary dashboards
│   ├── OverviewPage.jsx
│   ├── OverviewHubPage.jsx
│   └── index.js
├── explore/             # Data exploration
│   ├── ExplorePage.jsx
│   └── index.js
├── settings/            # Application settings
│   ├── SettingsPage.jsx
│   └── index.js
└── login/               # Authentication
    ├── LoginPage.jsx
    └── index.js
```

## Benefits of This Structure

### 1. **Single Responsibility Principle (SOLID)**
- Each directory contains pages related to a single feature area
- Changes to one feature are isolated from others
- Easier to understand and maintain

### 2. **DRY (Don't Repeat Yourself)**
- Common patterns extracted to reusable hooks in `src/hooks/`
- Shared components in `src/components/common/`
- No duplicate code across pages

### 3. **Isolation of Changes**
- Modifications to alerts don't affect traces
- Each feature can be developed independently
- Easier code reviews and testing

### 4. **Better Imports**
- Clean, organized imports using index files
- Example: `import { TracesPage } from '@pages/traces'`
- No need to specify full file paths

## Custom Hooks (DRY Principle)

The following reusable hooks have been created to eliminate code duplication:

### `useTabSync(defaultTab, paramName)`
Manages tab state with URL synchronization. Eliminates duplicate tab management logic.

**Usage:**
```javascript
const { activeTab, onTabChange } = useTabSync('overview');
<Tabs activeKey={activeTab} onChange={onTabChange} items={items} />
```

### `usePagination(initialPage, initialPageSize)`
Manages pagination state. Eliminates duplicate pagination logic.

**Usage:**
```javascript
const { page, pageSize, offset, handlePageChange } = usePagination();
<DataTable page={page} pageSize={pageSize} onPageChange={handlePageChange} />
```

### `useFilters(initialFilters)`
Manages filter state. Eliminates duplicate filter logic.

**Usage:**
```javascript
const { filters, setFilter, resetFilters } = useFilters({ status: null, service: null });
<FilterBar value={filters.status} onChange={(v) => setFilter('status', v)} />
```

### `useTableSort(data, defaultField, defaultOrder)`
Manages table sorting state. Eliminates duplicate sorting logic.

**Usage:**
```javascript
const { sortedData, toggleSort } = useTableSort(tableData);
<Column onHeaderCell={() => ({ onClick: () => toggleSort('name') })} />
```

## Migration Guide

When creating a new page:

1. **Determine the feature area** (alerts, traces, services, etc.)
2. **Create the page** in the appropriate subdirectory
3. **Export it** from the subdirectory's `index.js`
4. **Import it** in `App.jsx` using the feature-based import
5. **Use custom hooks** instead of duplicating state management logic

Example:
```javascript
// ✅ Good - Feature-based import
import { TracesPage } from '@pages/traces';

// ❌ Bad - Direct file import
import TracesPage from '@pages/traces/TracesPage';
```

## See Also

- `/src/hooks/README.md` - Documentation for custom hooks
- `/src/components/common/` - Shared components
- `/src/App.jsx` - Routing configuration

