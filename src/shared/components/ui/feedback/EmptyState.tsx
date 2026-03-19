import { Inbox } from 'lucide-react';

import type { EmptyStateProps } from './types';

export default function EmptyState({
  icon,
  title,
  description = 'No data found',
  action,
}: EmptyStateProps): JSX.Element {
  return (
    <div className="flex-col items-center" style={{ padding: '40px 0', textAlign: 'center' }}>
      {icon || <Inbox size={40} className="text-muted" style={{ opacity: 0.4 }} />}
      {title && (
        <h3 className="text-primary mt-md mb-xs m-0">{title}</h3>
      )}
      <p className="text-secondary" style={{ margin: '8px 0 16px' }}>{description}</p>
      {action}
    </div>
  );
}
