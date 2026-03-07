import React from 'react';
import { Activity, AlertCircle, Zap, Clock } from 'lucide-react';
import { TracesKpiCard } from './index';
import { APP_COLORS } from '@config/colorLiterals';
import { formatNumber, formatDuration } from '@shared/utils/formatters';

interface TracesKpiRowProps {
  totalTraces: number;
  errorRate: number;
  p95: number;
  p99: number;
}

export const TracesKpiRow: React.FC<TracesKpiRowProps> = ({
  totalTraces,
  errorRate,
  p95,
  p99,
}) => {
  return (
    <div className="traces-kpi-row">
      <TracesKpiCard
        title="Total Traces"
        value={formatNumber(totalTraces || 0)}
        icon={Activity}
        accentColor={APP_COLORS.hex_5e60ce}
        accentBg={APP_COLORS.rgba_94_96_206_0p12_2}
        trend={0}
      />
      <TracesKpiCard
        title="Error Rate"
        value={`${(errorRate || 0).toFixed(2)}%`}
        icon={AlertCircle}
        accentColor={errorRate > 5 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_73c991}
        accentBg={errorRate > 5 ? APP_COLORS.rgba_240_68_56_0p12_2 : APP_COLORS.rgba_115_201_145_0p12_2}
        trend={0}
      />
      <TracesKpiCard
        title="P95 Latency"
        value={formatDuration(p95 || 0)}
        icon={Zap}
        accentColor={APP_COLORS.hex_10b981}
        accentBg={APP_COLORS.rgba_16_185_129_0p12}
        trend={0}
      />
      <TracesKpiCard
        title="P99 Latency"
        value={formatDuration(p99 || 0)}
        icon={Clock}
        accentColor={APP_COLORS.hex_f59e0b}
        accentBg={APP_COLORS.rgba_245_158_11_0p12}
        trend={0}
      />
    </div>
  );
};
