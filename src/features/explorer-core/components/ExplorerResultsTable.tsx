import { Pagination, SimpleTable, Skeleton } from '@/components/ui';
import { PageSurface } from '@shared/components/ui';

import type {
  SimpleTableColumn,
  SimpleTableProps,
} from '@/components/ui';

interface ExplorerResultsTableProps<RowType extends Record<string, unknown>> {
  title: string;
  subtitle?: string;
  rows: RowType[];
  columns: SimpleTableColumn<RowType>[];
  rowKey: SimpleTableProps<RowType>['rowKey'];
  isLoading?: boolean;
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onRow?: SimpleTableProps<RowType>['onRow'];
  rowClassName?: SimpleTableProps<RowType>['rowClassName'];
  toolbar?: React.ReactNode;
}

export function ExplorerResultsTable<RowType extends Record<string, unknown>>({
  title,
  subtitle,
  rows,
  columns,
  rowKey,
  isLoading,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onRow,
  rowClassName,
  toolbar,
}: ExplorerResultsTableProps<RowType>): JSX.Element {
  return (
    <PageSurface
      padding="lg"
      className="min-h-0"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h3>
          {subtitle ? (
            <p className="mt-1 text-xs text-[var(--text-muted)]">{subtitle}</p>
          ) : null}
        </div>
        {toolbar}
      </div>

      {isLoading ? (
        <Skeleton paragraph={{ rows: 8 }} />
      ) : (
        <SimpleTable
          columns={columns}
          dataSource={rows}
          rowKey={rowKey}
          pagination={false}
          onRow={onRow}
          rowClassName={rowClassName}
          className="[&_td]:align-top [&_td]:py-2.5 [&_th]:py-2.5"
        />
      )}

      {total > 0 ? (
        <div className="mt-4 border-t border-[rgba(255,255,255,0.06)] pt-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            total={total}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
          />
        </div>
      ) : null}
    </PageSurface>
  );
}
