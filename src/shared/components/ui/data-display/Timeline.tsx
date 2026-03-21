import { formatRelativeTime } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';

interface TimelineTag {
  color: string;
  label: string;
}

interface TimelineItemData {
  color?: string;
  title?: string;
  timestamp?: string | number;
  description?: string;
  tags?: TimelineTag[];
}

interface TimelineProps {
  items?: TimelineItemData[];
}

/**
 * Renders timeline entries with optional tags and relative timestamps.
 * @param props Component props.
 * @returns Timeline component or null when empty.
 */
export default function Timeline({ items = [] }: TimelineProps): JSX.Element | null {
  if (items.length === 0) return null;

  return (
    <div className="py-2">
      <div className="flex flex-col relative pl-5">
        {items.map((item, index) => (
          <div key={index} className="relative pb-6">
            {/* Dot */}
            <div
              className="absolute -left-5 top-1 w-2.5 h-2.5 rounded-full z-[1]"
              style={{ background: item.color || `var(--color-primary, ${APP_COLORS.hex_5e60ce})` }}
            />
            {/* Line */}
            {index < items.length - 1 && (
              <div
                className="absolute -left-4 top-3.5 w-0.5 bg-border"
                style={{ height: 'calc(100% - 10px)' }}
              />
            )}
            {/* Content */}
            <div className="pb-1">
              <div className="flex items-center justify-between gap-3">
                <span className="font-semibold text-[13px] text-foreground">{item.title}</span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {item.timestamp ? formatRelativeTime(item.timestamp) : ''}
                </span>
              </div>
              {item.description && (
                <div className="text-xs text-[color:var(--text-secondary)] mt-1 leading-[1.5]">
                  {item.description}
                </div>
              )}
              {item.tags && (
                <div className="flex gap-1.5 mt-1.5 flex-wrap">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="text-[11px] px-2 py-px border rounded"
                      style={{ borderColor: tag.color, color: tag.color }}
                    >
                      {tag.label}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
