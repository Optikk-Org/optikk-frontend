# Custom Hooks

This directory contains reusable custom hooks following the **DRY (Don't Repeat Yourself)** principle.

## Available Hooks

### State Management Hooks

#### `useTabSync(defaultTab, paramName = 'tab')`
Synchronizes tab state with URL query parameters.

**Purpose:** Eliminates duplicate tab management logic across pages.

**Returns:**
- `activeTab` - Current active tab key
- `setActiveTab` - Function to set active tab
- `onTabChange` - Handler for tab change events

**Example:**
```javascript
import { useTabSync } from '@hooks';

function MyPage() {
  const { activeTab, onTabChange } = useTabSync('overview');
  
  return (
    <Tabs activeKey={activeTab} onChange={onTabChange} items={items} />
  );
}
```

---

#### `usePagination(initialPage = 1, initialPageSize = 20)`
Manages pagination state for tables and lists.

**Purpose:** Eliminates duplicate pagination logic.

**Returns:**
- `page` - Current page number
- `pageSize` - Current page size
- `offset` - Calculated offset for API calls
- `setPage` - Function to set page
- `setPageSize` - Function to set page size
- `handlePageChange` - Handler for page change events
- `resetPagination` - Function to reset to initial state

**Example:**
```javascript
import { usePagination } from '@hooks';

function MyPage() {
  const { page, pageSize, offset, handlePageChange } = usePagination();
  
  // Use in API call
  const { data } = useQuery({
    queryKey: ['data', page, pageSize],
    queryFn: () => api.getData({ limit: pageSize, offset })
  });
  
  return (
    <DataTable 
      page={page} 
      pageSize={pageSize} 
      onPageChange={handlePageChange} 
    />
  );
}
```

---

#### `useFilters(initialFilters = {})`
Manages filter state for data filtering.

**Purpose:** Eliminates duplicate filter management logic.

**Returns:**
- `filters` - Current filter values object
- `setFilter(key, value)` - Set a single filter
- `setMultipleFilters(updates)` - Set multiple filters at once
- `clearFilter(key)` - Clear a specific filter
- `resetFilters()` - Reset all filters to initial state

**Example:**
```javascript
import { useFilters } from '@hooks';

function MyPage() {
  const { filters, setFilter, resetFilters } = useFilters({
    status: null,
    service: null,
    search: ''
  });
  
  return (
    <FilterBar
      filters={[
        {
          type: 'select',
          value: filters.status,
          onChange: (value) => setFilter('status', value)
        }
      ]}
    />
  );
}
```

---

#### `useTableSort(data, defaultField = null, defaultOrder = null)`
Manages table sorting state and returns sorted data.

**Purpose:** Eliminates duplicate sorting logic.

**Returns:**
- `sortedData` - Sorted data array
- `sortField` - Current sort field
- `sortOrder` - Current sort order ('ascend' | 'descend')
- `handleSort(field, order)` - Set sort field and order
- `toggleSort(field)` - Toggle sort for a field
- `resetSort()` - Reset to default sort
- `createSortHandler(field)` - Create column header click handler

**Example:**
```javascript
import { useTableSort } from '@hooks';

function MyPage() {
  const { sortedData, toggleSort } = useTableSort(tableData);
  
  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      sorter: true,
      onHeaderCell: () => ({
        onClick: () => toggleSort('name')
      })
    }
  ];
  
  return <DataTable columns={columns} data={sortedData} />;
}
```

---

### Data Fetching Hooks

#### `useTimeRangeQuery(key, queryFn, options)`
Wraps `useQuery` with automatic time range and team ID from app store.

**Purpose:** Standardizes data fetching with time ranges.

**Example:**
```javascript
import { useTimeRangeQuery } from '@hooks';

const { data, isLoading } = useTimeRangeQuery(
  'services-metrics',
  (teamId, startTime, endTime) => v1Service.getServiceMetrics(teamId, startTime, endTime)
);
```

---

#### `useDashboardConfig(pageKey)`
Fetches dashboard configuration for a specific page.

**Example:**
```javascript
import { useDashboardConfig } from '@hooks';

const { config: dashboardConfig } = useDashboardConfig('traces');
```

---

#### `usePageData(pageKey, dataQueries)`
Combines dashboard config and multiple data queries.

**Purpose:** Simplifies common page data fetching pattern.

**Example:**
```javascript
import { usePageData } from '@hooks';

const { dashboardConfig, chartDataSources, isLoading } = usePageData('traces', {
  'metrics-timeseries': (teamId, start, end) => v1Service.getMetricsTimeSeries(teamId, start, end),
  'endpoints-timeseries': (teamId, start, end) => v1Service.getEndpointTimeSeries(teamId, start, end)
});
```

---

## Best Practices

1. **Always use hooks** instead of duplicating state management logic
2. **Import from index** for cleaner imports: `import { useTabSync } from '@hooks'`
3. **Combine hooks** when needed - they're designed to work together
4. **Follow naming conventions** - hooks should start with `use`

## Adding New Hooks

When creating a new hook:

1. Create the hook file in `src/hooks/`
2. Add comprehensive JSDoc comments
3. Export it from `src/hooks/index.js`
4. Document it in this README
5. Include usage examples

## See Also

- `/src/pages/README.md` - Page organization documentation
- React Hooks Documentation: https://react.dev/reference/react

