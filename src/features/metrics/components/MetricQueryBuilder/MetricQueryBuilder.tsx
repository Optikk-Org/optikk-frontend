import { Plus } from 'lucide-react';

import { Button } from '@/components/ui';

import { MAX_QUERIES } from '../../constants/metricsExplorerConstants';
import type {
  MetricAggregation,
  MetricQueryDefinition,
  MetricTagFilter,
} from '../../types';
import { MetricQueryRow } from './MetricQueryRow';

interface MetricQueryBuilderProps {
  readonly queries: MetricQueryDefinition[];
  readonly onAddQuery: () => void;
  readonly onRemoveQuery: (id: string) => void;
  readonly onAggregationChange: (id: string, agg: MetricAggregation) => void;
  readonly onMetricChange: (id: string, metricName: string) => void;
  readonly onWhereChange: (id: string, filters: MetricTagFilter[]) => void;
  readonly onGroupByChange: (id: string, groupBy: string[]) => void;
}

export function MetricQueryBuilder({
  queries,
  onAddQuery,
  onRemoveQuery,
  onAggregationChange,
  onMetricChange,
  onWhereChange,
  onGroupByChange,
}: MetricQueryBuilderProps) {
  const canAdd = queries.length < MAX_QUERIES;
  const canRemove = queries.length > 1;

  return (
    <div className="flex flex-col gap-2">
      {queries.map((query) => (
        <MetricQueryRow
          key={query.id}
          query={query}
          canRemove={canRemove}
          onAggregationChange={(agg) => onAggregationChange(query.id, agg)}
          onMetricChange={(name) => onMetricChange(query.id, name)}
          onWhereChange={(filters) => onWhereChange(query.id, filters)}
          onGroupByChange={(gb) => onGroupByChange(query.id, gb)}
          onRemove={() => onRemoveQuery(query.id)}
        />
      ))}

      {canAdd && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={<Plus size={14} />}
            onClick={onAddQuery}
          >
            Query
          </Button>
        </div>
      )}
    </div>
  );
}
