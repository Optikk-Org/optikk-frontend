import type { ReactNode } from 'react';
import type { 
  BoardColumn, 
  RenderRowContext, 
  BoardPaginationState,
  BoardFilter
} from './ObservabilityDataBoard';
import { Virtuoso } from 'react-virtuoso';
import BoardLoadMoreFooter from './BoardLoadMoreFooter';

export interface BoardTableProps<RowType> {
  rows: RowType[];
  fixedColumns: BoardColumn[];
  flexColumn: BoardColumn | undefined;
  colWidths: Record<string, number>;
  rowKey: (row: RowType, index: number) => string | number;
  renderRow: (row: RowType, context: RenderRowContext) => ReactNode;
  visibleCols: Record<string, boolean>;
  onAddFilter: ((filter: BoardFilter) => void) | undefined;
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
    <div className="oboard__tbody" style={{ display: 'flex', flexDirection: 'column', height: '100%', paddingBottom: 0 }}>
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

      <div style={{ flex: 1, minHeight: 0 }}>
        <Virtuoso
          style={{ height: '100%' }}
          data={rows}
          endReached={() => {
            if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
              fetchNextPage();
            }
          }}
          itemContent={(index, row) => (
            <div key={rowKey(row, index)} className="oboard__row">
              {renderRow(row, { colWidths, visibleCols, onAddFilter })}
            </div>
          )}
          components={{
            Footer: () => (
              <BoardLoadMoreFooter
                entityName={entityName}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onFetchNextPage={fetchNextPage}
              />
            )
          }}
        />
      </div>
    </div>
  );
}
