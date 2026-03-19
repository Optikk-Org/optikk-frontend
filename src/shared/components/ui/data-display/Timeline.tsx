import { formatRelativeTime } from '@shared/utils/formatters';

import { APP_COLORS } from '@config/colorLiterals';
import './Timeline.css';

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
    <div className="custom-timeline">
      <div style={{ display: 'flex', flexDirection: 'column', position: 'relative', paddingLeft: 20 }}>
        {items.map((item, index) => (
          <div key={index} style={{ position: 'relative', paddingBottom: 24 }}>
            {/* Dot */}
            <div style={{
              position: 'absolute', left: -20, top: 4,
              width: 10, height: 10, borderRadius: '50%',
              background: item.color || `var(--color-primary, ${APP_COLORS.hex_5e60ce})`,
              zIndex: 1,
            }} />
            {/* Line */}
            {index < items.length - 1 && (
              <div style={{
                position: 'absolute', left: -16, top: 14,
                width: 2, height: 'calc(100% - 10px)',
                background: 'var(--border-color, #2d2d2d)',
              }} />
            )}
            <div className="timeline-item-content">
              <div className="timeline-item-header">
                <span className="timeline-item-title">{item.title}</span>
                <span className="timeline-item-time">
                  {item.timestamp ? formatRelativeTime(item.timestamp) : ''}
                </span>
              </div>
              {item.description && (
                <div className="timeline-item-description">{item.description}</div>
              )}
              {item.tags && (
                <div className="timeline-item-tags">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="timeline-tag"
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
