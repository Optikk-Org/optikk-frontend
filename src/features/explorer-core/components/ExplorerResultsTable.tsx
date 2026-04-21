import { CursorPagination, SimpleTable, Skeleton } from "@/components/ui";
import { PageSurface } from "@shared/components/ui";
import { FeatureErrorBoundary } from "@shared/components/ui/feedback";

import type { SimpleTableColumn, SimpleTableProps } from "@/components/ui";

import { VirtualizedResultsTable } from "./VirtualizedResultsTable";

export interface CursorPaginationConfig {
  hasMore: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
  pageSize: number;
  onPageSizeChange?: (size: number) => void;
}

interface ExplorerResultsTableProps<RowType extends Record<string, unknown>> {
  title: string;
  subtitle?: string;
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: SimpleTableProps<RowType>["rowKey"];
  isLoading?: boolean;
  /** Cursor pagination config. Omit to disable the pager. */
  pagination?: CursorPaginationConfig;
  onRow?: SimpleTableProps<RowType>["onRow"];
  rowClassName?: SimpleTableProps<RowType>["rowClassName"];
  toolbar?: React.ReactNode;
  /** Opt-in virtualization. Automatic when pager is omitted and rows exceed the threshold. */
  virtualized?: boolean;
  /** Rendered in place of the table (and pagination) when rows is empty and not loading. */
  emptyState?: React.ReactNode;
}

const VIRTUALIZE_AUTO_THRESHOLD = 50;

export function ExplorerResultsTable<RowType extends Record<string, unknown>>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  isLoading,
  pagination,
  onRow,
  rowClassName,
  toolbar,
  virtualized,
  emptyState,
}: ExplorerResultsTableProps<RowType>): JSX.Element {
  const useVirtual = virtualized ?? (!pagination && rows.length > VIRTUALIZE_AUTO_THRESHOLD);
  const showEmptyState = !isLoading && emptyState !== undefined && rows.length === 0;

  return (
    <PageSurface padding="lg" className="min-h-0 w-full min-w-0">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)] text-sm">{title}</h3>
          {subtitle ? (
            <p
              aria-live={pagination ? undefined : "polite"}
              aria-atomic="true"
              className="mt-1 text-[var(--text-muted)] text-xs"
            >
              {subtitle}
            </p>
          ) : null}
        </div>
        {toolbar}
      </div>

      <FeatureErrorBoundary featureName={`results-table:${title}`}>
        {isLoading ? (
          <Skeleton paragraph={{ rows: 8 }} />
        ) : showEmptyState ? (
          emptyState
        ) : useVirtual ? (
          <VirtualizedResultsTable
            rows={rows}
            columns={columns}
            rowKey={rowKey}
            onRow={onRow}
            rowClassName={rowClassName}
          />
        ) : (
          <SimpleTable
            columns={columns}
            dataSource={rows}
            rowKey={rowKey}
            pagination={false}
            onRow={onRow}
            rowClassName={rowClassName}
            className="[&_td]:py-2.5 [&_td]:align-top [&_th]:py-2.5"
          />
        )}
      </FeatureErrorBoundary>

      {pagination && !showEmptyState ? (
        <div className="mt-3 border-[var(--border-color)] border-t px-1 pt-3">
          <CursorPagination
            hasMore={pagination.hasMore}
            hasPrev={pagination.hasPrev}
            onNext={pagination.onNext}
            onPrev={pagination.onPrev}
            pageSize={pagination.pageSize}
            onPageSizeChange={pagination.onPageSizeChange}
          />
        </div>
      ) : null}
    </PageSurface>
  );
}
