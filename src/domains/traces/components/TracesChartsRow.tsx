import React from 'react';
import { BarChart3, Server } from 'lucide-react';
import { Spin } from 'antd';
import LatencyHistogram from '@components/charts/distributions/LatencyHistogram';
import { TopServicesPanel } from '../index';

import { TraceRecord, ServiceBadge } from '../types';

interface TracesChartsRowProps {
  traces: TraceRecord[];
  serviceBadges: ServiceBadge[];
  isLoading: boolean;
}

export const TracesChartsRow: React.FC<TracesChartsRowProps> = ({
  traces,
  serviceBadges,
  isLoading,
}) => {
  return (
    <div className="traces-charts-row">
      <div className="traces-chart-card">
        <div className="traces-chart-card-header">
          <span className="traces-chart-card-title">
            <BarChart3 size={15} />
            Latency Distribution
          </span>
        </div>
        <div className="traces-chart-card-body" style={{ padding: '8px 12px' }}>
          {traces.length > 0 ? (
            <LatencyHistogram traces={traces} height={110} />
          ) : (
            <div className="traces-histogram-empty">
              {isLoading ? <Spin size="small" /> : 'No trace data for this time range'}
            </div>
          )}
        </div>
      </div>

      <div className="traces-chart-card">
        <div className="traces-chart-card-header">
          <span className="traces-chart-card-title">
            <Server size={15} />
            Services Breakdown
          </span>
        </div>
        <div className="traces-chart-card-body">
          <TopServicesPanel serviceBadges={serviceBadges} />
        </div>
      </div>
    </div>
  );
};
