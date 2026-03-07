import type { ReactNode } from 'react';
import type { 
  BoardColumn, 
  RenderRowContext, 
  BoardPaginationState 
} from './ObservabilityDataBoard';
import { BoardLoadMoreFooter } from '@components/ui/data-board';

export interface BoardTableProps<RowType> {
  rows: RowType[];
  fixedColumns: BoardColumn[];
  flexColumn?: BoardColumn;
  colWidths: Record<string, number>;
  rowKey: (row: RowType, index: number) => string | number;
  renderRow: (row: RowType, context: RenderRowContext) => ReactNode;
  visibleCols: Record<string, boolean>;
  onAddFilter?: (filter: any) => void;
  handleResizeMouseDown: (event: React.MouseEvent<HTMLDivElement>, columnKey: string) => void;
  entityName: string;
  pagination: BoardPaginationState;
}

export function BoardTable<RowType extends Record<string, unknown>>({
  rows,
  fixedColumns,
  flexColumn,
  colWidths,
  rowKey,
  renderRow,
  visibleCols,
  onAddFilter,
  handleResizeMouseDown,
  entityName,
  pagination,
}: BoardTableProps<RowType>): JSX.Element {
  const { hasNextPage = false, isFetchingNextPage = false, fetchNextPage } = pagination;

  return (
    <div className="oboard__tbody">
      <div className="oboard__thead">
        {fixedColumns.map((column) => (
          <div key={column.key} className="oboard__th" style={{ width: colWidths[column.key] }}>
            {column.label}
            <div
              className="oboard__resizer"
              onMouseDown={(event) => handleResizeMouseDown(event, column.key)}
            />
          </div>
        ))}
        {flexColumn && <div className="oboard__th oboard__th--flex">{flexColumn.label}</div>}
      </div>

      {rows.map((row, index) => (
        <div key={rowKey(row, index)} className="oboard__row">
          {renderRow(row, { colWidths, visibleCols, onAddFilter })}
        </div>
      ))}

      <BoardLoadMoreFooter
        entityName={entityName}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        onFetchNextPage={fetchNextPage}
      />
    </div>
  );
}
