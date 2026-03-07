import { Table, type TableProps } from 'antd';
import { EmptyState } from '@shared/components/ui/feedback';
import { UI_CONFIG } from '@config/constants';

export interface DataTableData<RowType = any> {
  columns: NonNullable<TableProps<RowType>['columns']>;
  rows: RowType[];
  loading?: boolean;
  rowKey?: TableProps<RowType>['rowKey'];
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
  scroll?: TableProps<RowType>['scroll'];
  onRow?: TableProps<RowType>['onRow'];
  expandable?: TableProps<RowType>['expandable'];
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
  const { emptyText = 'No data found', scroll, onRow, expandable } = config;

  const paginationConfig: TableProps<RowType>['pagination'] =
    showPagination && onPageChange
    ? {
      current: page,
      pageSize: pageSize || UI_CONFIG.DEFAULT_PAGE_SIZE,
      total: total || 0,
      onChange: (newPage: number, newPageSize: number) => onPageChange(newPage, newPageSize),
      showSizeChanger: true,
      showTotal: (totalCount: number) => `Total ${totalCount} records`,
      pageSizeOptions: UI_CONFIG.PAGE_SIZES.map(String),
    }
    : showPagination
      ? { pageSize: UI_CONFIG.DEFAULT_PAGE_SIZE, showSizeChanger: true }
      : false;

  return (
    <Table
      columns={columns as any}
      dataSource={rows}
      loading={loading}
      rowKey={rowKey}
      pagination={paginationConfig}
      scroll={scroll}
      onRow={onRow}
      expandable={expandable}
      locale={{ emptyText: <EmptyState icon={null} title="No Data" description={emptyText} action={null} /> }}
    />
  );
}
