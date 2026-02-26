# Quick Reference Guide - Refactored Codebase

## 🎯 Quick Start

### Finding a Page
Pages are now organized by feature:
```
src/pages/
├── alerts/         → Alert & incident pages
├── traces/         → Tracing pages
├── services/       → Service monitoring pages
├── logs/           → Log management pages
├── metrics/        → Metrics & performance pages
├── infrastructure/ → Infrastructure monitoring pages
└── ... (7 more)
```

### Importing Pages
```javascript
// ✅ Use feature-based imports
import { TracesPage, TraceDetailPage } from '@pages/traces';
import { AlertsHubPage } from '@pages/alerts';
import { ServicesPage } from '@pages/services';

// ❌ Don't use direct file imports
import TracesPage from '@pages/traces/TracesPage';
```

## 🔧 Using Custom Hooks

### Tab Management
```javascript
import { useTabSync } from '@hooks';

const { activeTab, onTabChange } = useTabSync('overview');

<Tabs activeKey={activeTab} onChange={onTabChange} items={items} />
```

### Pagination
```javascript
import { usePagination } from '@hooks';

const { page, pageSize, offset, handlePageChange } = usePagination();

<DataTable 
  page={page} 
  pageSize={pageSize} 
  onPageChange={handlePageChange} 
/>
```

### Filters
```javascript
import { useFilters } from '@hooks';

const { filters, setFilter, resetFilters } = useFilters({
  status: null,
  service: null
});

<FilterBar 
  value={filters.status} 
  onChange={(v) => setFilter('status', v)} 
/>
```

### Table Sorting
```javascript
import { useTableSort } from '@hooks';

const { sortedData, toggleSort } = useTableSort(tableData);

const columns = [{
  title: 'Name',
  onHeaderCell: () => ({ onClick: () => toggleSort('name') })
}];

<DataTable columns={columns} data={sortedData} />
```

## 📁 Directory Structure

```
src/
├── pages/                    # Feature-based page organization
│   ├── alerts/              # Alert management
│   │   ├── AlertsPage.jsx
│   │   ├── AlertsHubPage.jsx
│   │   ├── IncidentsPage.jsx
│   │   └── index.js         # Exports all alert pages
│   ├── traces/              # Distributed tracing
│   ├── services/            # Service monitoring
│   └── ... (10 more)
│
├── hooks/                    # Reusable custom hooks (DRY)
│   ├── useTabSync.js        # Tab state + URL sync
│   ├── usePagination.js     # Pagination state
│   ├── useFilters.js        # Filter state
│   ├── useTableSort.js      # Table sorting
│   ├── usePageData.js       # Page data fetching
│   └── index.js             # Exports all hooks
│
├── components/
│   ├── common/              # Shared components
│   ├── charts/              # Chart components
│   ├── dashboard/           # Dashboard components
│   └── layout/              # Layout components
│
├── services/                # API services
├── store/                   # State management
└── utils/                   # Utility functions
```

## 🎨 Code Examples

### Creating a New Page

1. **Determine feature area** (e.g., alerts, traces, services)
2. **Create page file** in appropriate directory
3. **Use custom hooks** instead of duplicating logic
4. **Export from index.js**

Example:
```javascript
// src/pages/alerts/NewAlertPage.jsx
import { usePagination, useFilters } from '@hooks';
import { PageHeader, DataTable } from '@components/common';

export default function NewAlertPage() {
  const { page, pageSize, handlePageChange } = usePagination();
  const { filters, setFilter } = useFilters({ status: null });
  
  return (
    <div>
      <PageHeader title="New Alert Page" />
      <DataTable 
        page={page} 
        pageSize={pageSize} 
        onPageChange={handlePageChange} 
      />
    </div>
  );
}
```

```javascript
// src/pages/alerts/index.js
export { default as AlertsPage } from './AlertsPage';
export { default as AlertsHubPage } from './AlertsHubPage';
export { default as NewAlertPage } from './NewAlertPage'; // Add export
```

```javascript
// src/App.jsx
import { AlertsHubPage, NewAlertPage } from '@pages/alerts';

<Route path="alerts/new" element={<NewAlertPage />} />
```

## 🔍 Common Patterns

### Pattern 1: Page with Tabs
```javascript
import { useTabSync } from '@hooks';

const { activeTab, onTabChange } = useTabSync('overview');
```

### Pattern 2: Page with Pagination
```javascript
import { usePagination } from '@hooks';

const { page, pageSize, offset, handlePageChange } = usePagination();
```

### Pattern 3: Page with Filters
```javascript
import { useFilters } from '@hooks';

const { filters, setFilter } = useFilters({ status: null, service: null });
```

### Pattern 4: Page with Sorting
```javascript
import { useTableSort } from '@hooks';

const { sortedData, toggleSort } = useTableSort(data);
```

### Pattern 5: Combine Multiple Hooks
```javascript
import { usePagination, useFilters, useTableSort } from '@hooks';

const { page, pageSize, handlePageChange } = usePagination();
const { filters, setFilter } = useFilters({ status: null });
const { sortedData, toggleSort } = useTableSort(filteredData);
```

## 📚 Documentation

- **Pages:** See `src/pages/README.md`
- **Hooks:** See `src/hooks/README.md`
- **Summary:** See `REFACTORING_SUMMARY.md`

## ✅ Benefits

- ✅ **Organized:** Pages grouped by feature
- ✅ **DRY:** No duplicate code
- ✅ **Isolated:** Changes don't affect other features
- ✅ **Maintainable:** Easy to find and update code
- ✅ **Scalable:** Easy to add new features

## 🚀 Next Steps

1. Refactor remaining pages to use custom hooks
2. Add unit tests for hooks
3. Update team documentation
4. Share knowledge with team members

