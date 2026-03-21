import { ReactNode } from 'react';

import BoardColumnSettingsPopover from './BoardColumnSettingsPopover';
import BoardExportMenu from './BoardExportMenu';

interface BoardActionBarProps {
  entityName: string;
  displayCount: number;
  total: number;
  extraActions?: ReactNode;
  rowsLength: number;
  columns: Array<{ key: string; label: string }>;
  visibleCols: Record<string, boolean>;
  onToggleColumn: (columnKey: string) => void;
  onExportCSV: () => void;
  onExportJSON: () => void;
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.displayCount
 * @param root0.total
 * @param root0.extraActions
 * @param root0.rowsLength
 * @param root0.columns
 * @param root0.visibleCols
 * @param root0.onToggleColumn
 * @param root0.onExportCSV
 * @param root0.onExportJSON
 */
export default function BoardActionBar({
  entityName,
  displayCount,
  total,
  extraActions,
  rowsLength,
  columns,
  visibleCols,
  onToggleColumn,
  onExportCSV,
  onExportJSON,
}: BoardActionBarProps) {
  return (
    <div className="flex items-center justify-between px-4 py-[7px] bg-transparent border-b border-[color:var(--glass-border)] shrink-0 gap-[10px]">
      <div className="flex items-center gap-[7px] text-xs text-muted-foreground">
        <span className="w-1.5 h-1.5 rounded-full bg-success inline-block shrink-0" />
        <span className="text-[color:var(--text-secondary)] font-medium">
          {displayCount.toLocaleString()} {entityName}{displayCount !== 1 ? 's' : ''}
        </span>
        {total > 0 && total !== displayCount && (
          <span className="text-muted-foreground">of {total.toLocaleString()}</span>
        )}
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {extraActions}

        <BoardExportMenu
          entityName={entityName}
          rowsLength={rowsLength}
          onExportCSV={onExportCSV}
          onExportJSON={onExportJSON}
        />

        <BoardColumnSettingsPopover
          columns={columns}
          visibleCols={visibleCols}
          onToggle={onToggleColumn}
        />
      </div>
    </div>
  );
}
