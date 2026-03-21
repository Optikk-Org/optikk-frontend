interface BoardColumn {
  key: string;
  label: string;
  defaultWidth?: number;
}

interface BoardSkeletonProps {
  fixedColumns: BoardColumn[];
  flexColumn: BoardColumn | undefined;
  colWidths: Record<string, number>;
  rowCount: number;
  randomWidth: (basePercent: number, rangePercent: number) => string;
  skeletonBaseWidth: number;
  skeletonWidthRange: number;
  skeletonFlexBaseWidth: number;
  skeletonFlexWidthRange: number;
}

/**
 *
 * @param root0
 * @param root0.fixedColumns
 * @param root0.flexColumn
 * @param root0.colWidths
 * @param root0.rowCount
 * @param root0.randomWidth
 * @param root0.skeletonBaseWidth
 * @param root0.skeletonWidthRange
 * @param root0.skeletonFlexBaseWidth
 * @param root0.skeletonFlexWidthRange
 */
export default function BoardSkeleton({
  fixedColumns,
  flexColumn,
  colWidths,
  rowCount,
  randomWidth,
  skeletonBaseWidth,
  skeletonWidthRange,
  skeletonFlexBaseWidth,
  skeletonFlexWidthRange,
}: BoardSkeletonProps) {
  const fixedWidth = fixedColumns.reduce(
    (total, column) => total + (colWidths[column.key] ?? 0),
    0,
  );
  const flexColumnWidth = flexColumn
    ? (colWidths[flexColumn.key] ?? flexColumn.defaultWidth ?? 480)
    : 0;
  const tableMinWidth = fixedWidth + flexColumnWidth;

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0">
      {/* scroll wrapper */}
      <div className="h-full min-w-0 overflow-auto">
        <div className="min-w-full" style={{ width: 'max-content', minWidth: tableMinWidth }}>
          {/* header */}
          <div
            className="flex p-0 border-b border-[color:var(--glass-border)] text-[11px] font-semibold uppercase tracking-[0.05em] text-muted-foreground sticky top-0 bg-[rgba(255,255,255,0.02)] z-20 select-none"
            style={{ width: 'max-content', minWidth: '100%' }}
          >
            {fixedColumns.map((column) => (
              <div
                key={column.key}
                className="relative flex items-center shrink-0 border-r border-[color:var(--glass-border)] px-3 py-[9px] whitespace-nowrap overflow-hidden text-ellipsis box-border"
                style={{ width: colWidths[column.key] }}
              >
                {column.label}
              </div>
            ))}
            {flexColumn && (
              <div
                className="relative flex items-center border-[color:var(--glass-border)] px-3 py-[9px] whitespace-nowrap overflow-hidden text-ellipsis box-border flex-1 border-r-0"
                style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}
              >
                {flexColumn.label}
              </div>
            )}
          </div>
          {/* rows */}
          <div className="flex-1 flex flex-col min-w-0 min-h-0">
            {Array.from({ length: rowCount }).map((_, index) => (
              <div
                key={index}
                className="flex items-baseline cursor-pointer border-b border-[color:var(--glass-border)] font-mono text-xs"
                style={{ minWidth: tableMinWidth, padding: '10px 12px', gap: 16, width: 'max-content' }}
              >
                {fixedColumns.map((column) => (
                  <div key={column.key} style={{ width: colWidths[column.key], flexShrink: 0 }}>
                    <div
                      className="h-[13px] rounded animate-oboard-shimmer"
                      style={{
                        width: randomWidth(skeletonBaseWidth, skeletonWidthRange),
                        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)',
                        backgroundSize: '1200px 100%',
                      }}
                    />
                  </div>
                ))}
                {flexColumn && (
                  <div style={{ flex: `1 0 ${flexColumnWidth}px`, minWidth: flexColumnWidth }}>
                    <div
                      className="h-[13px] rounded animate-oboard-shimmer"
                      style={{
                        width: randomWidth(skeletonFlexBaseWidth, skeletonFlexWidthRange),
                        background: 'linear-gradient(90deg, var(--bg-tertiary) 25%, var(--border-color) 50%, var(--bg-tertiary) 75%)',
                        backgroundSize: '1200px 100%',
                      }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
