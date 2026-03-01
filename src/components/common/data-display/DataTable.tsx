import { Table } from 'antd';
import { EmptyState } from '@components/common';
import { UI_CONFIG } from '@config/constants';

/**
 * Wrapper around Ant Design Table with consistent pagination, loading, and empty state.
 * Replaces the 5+ Table usages with inconsistent pagination configs.
 */
interface DataTableProps {
  columns: any[];
  data: any[];
  loading?: boolean;
  rowKey?: string | ((record: any, index: any) => string);
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (page: number, pageSize?: number) => void;
  emptyText?: string;
  scroll?: any;
  onRow?: (record: any) => any;
  showPagination?: boolean;
  expandable?: any;
}

export default function DataTable({
  columns,
  data,
  loading = false,
  rowKey = 'id',
  page,
  pageSize,
  total,
  onPageChange,
  emptyText = 'No data found',
  scroll,
  onRow,
  showPagination = true,
  expandable,
}: DataTableProps) {
  const paginationConfig = showPagination && onPageChange
    ? {
      current: page,
      pageSize: pageSize || UI_CONFIG.DEFAULT_PAGE_SIZE,
      total: total || 0,
      onChange: (newPage, newPageSize) => onPageChange(newPage, newPageSize),
      showSizeChanger: true,
      showTotal: (t) => `Total ${t} records`,
      pageSizeOptions: UI_CONFIG.PAGE_SIZES,
    }
    : showPagination
      ? { pageSize: UI_CONFIG.DEFAULT_PAGE_SIZE, showSizeChanger: true }
      : false;

  return (
    <Table
      columns={columns}
      dataSource={data}
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
