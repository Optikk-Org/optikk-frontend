import { Search } from 'lucide-react';
import { ReactNode } from 'react';

interface EmptyTip {
  num?: number;
  text: ReactNode;
}

interface BoardEmptyStateProps {
  entityName: string;
  tips: EmptyTip[];
}

/**
 *
 * @param root0
 * @param root0.entityName
 * @param root0.tips
 */
export default function BoardEmptyState({ entityName, tips }: BoardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-[60px] px-8 text-center flex-1">
      <div className="text-muted-foreground opacity-25 mb-[18px]">
        <Search size={44} strokeWidth={1} />
      </div>
      <div className="text-[15px] font-semibold text-foreground mb-1.5">No {entityName}s found</div>
      <div className="text-[13px] text-muted-foreground max-w-[360px] leading-[1.6] mb-5">
        No {entityName}s matched your current filters and time range.
      </div>
      <div className="flex flex-col gap-2 text-left max-w-[320px]">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="flex items-start gap-[10px] text-[12.5px] text-[color:var(--text-secondary)] leading-[1.5]"
          >
            <span className="w-5 h-5 rounded-full bg-muted border border-border text-[11px] font-bold flex items-center justify-center shrink-0 text-primary">
              {tip.num ?? index + 1}
            </span>
            <span>{tip.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
