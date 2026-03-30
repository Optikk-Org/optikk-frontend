import { Badge, ScrollArea } from '@/components/ui';
import { PageSurface } from '@shared/components/ui';

import type { FacetGroup } from '../types';

interface FacetRailProps {
  groups: FacetGroup[];
  selected: Record<string, string | null>;
  onSelect: (groupKey: string, value: string | null) => void;
}

export function FacetRail({ groups, selected, onSelect }: FacetRailProps): JSX.Element {
  return (
    <PageSurface padding="lg" className="h-full min-h-0">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">Facet Rail</h3>
          <p className="mt-1 text-xs text-[var(--text-muted)]">
            Narrow results with top dimensions and keep the page dense.
          </p>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-360px)] pr-3">
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.key} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                  {group.label}
                </h4>
                <Badge variant="default">{group.buckets.length}</Badge>
              </div>
              <div className="space-y-1.5">
                {group.buckets.map((bucket) => {
                  const isSelected = selected[group.key] === bucket.value;
                  return (
                    <button
                      key={`${group.key}-${bucket.value}`}
                      type="button"
                      onClick={() => onSelect(group.key, isSelected ? null : bucket.value)}
                      className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left transition-all ${
                        isSelected
                          ? 'border-[rgba(94,96,206,0.45)] bg-[rgba(94,96,206,0.16)] text-[var(--text-primary)]'
                          : 'border-[rgba(255,255,255,0.06)] bg-[rgba(255,255,255,0.02)] text-[var(--text-secondary)] hover:border-[rgba(255,255,255,0.16)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <span className="truncate text-[13px]">{bucket.value || 'Unknown'}</span>
                      <span className="ml-3 text-[11px] font-semibold tabular-nums text-[var(--text-muted)]">
                        {bucket.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </ScrollArea>
    </PageSurface>
  );
}
