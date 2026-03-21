import { SimpleTable } from '@/components/ui';
import { EmptyState } from '@shared/components/ui/feedback';
import { UI_CONFIG } from '@config/constants';

export interface DataTableData<RowType = any> {
  columns: any[];
  rows: RowType[];
  loading?: boolean;
  rowKey?: string | ((row: RowType) => string);
}

export interface DataTablePagination {
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  showPagination?: boolean;
}

export interface DataTableConfig<RowType = any> {
  emptyText?: string;
  scroll?: { x?: number; y?: number };
  onRow?: (record: RowType, index?: number) => Record<string, any>;
  expandable?: any;
}

export interface DataTableProps<RowType = any> {
  data: DataTableData<RowType>;
  pagination?: DataTablePagination;
  config?: DataTableConfig<RowType>;
}

/**
 * Shared table wrapper with consistent pagination and empty states.
 */
export default function DataTable<RowType extends Record<string, any> = any>({
  data,
  pagination = {},
  config = {},
}: DataTableProps<RowType>): JSX.Element {
  const { columns, rows, loading = false, rowKey = 'id' } = data;
  const { page, pageSize, total, onPageChange, showPagination = true } = pagination;
  const { emptyText = 'No data found', scroll, onRow } = config;

  const paginationConfig =
    showPagination && onPageChange
    ? {
      current: page,
      pageSize: pageSize || UI_CONFIG.DEFAULT_PAGE_SIZE,
      total: total || 0,
      onChange: (newPage: number, newPageSize: number) => onPageChange(newPage, newPageSize),
    }
    : showPagination
      ? { pageSize: UI_CONFIG.DEFAULT_PAGE_SIZE }
      : false;

  if (loading) {
    return <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>Loading...</div>;
  }

  if (rows.length === 0) {
    return <EmptyState icon={null} title="No Data" description={emptyText} action={null} />;
  }

  return (
    <SimpleTable
      columns={columns as any}
      dataSource={rows}
      rowKey={rowKey as any}
      pagination={paginationConfig ? paginationConfig as any : undefined}
      scroll={scroll}
      onRow={onRow as any}
      size="small"
    />
  );
}
