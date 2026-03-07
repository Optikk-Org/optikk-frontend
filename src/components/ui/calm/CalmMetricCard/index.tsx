import { Skeleton } from 'antd';
import { TrendingDown, TrendingUp } from 'lucide-react';

import SparklineChart from '@/components/charts/micro/SparklineChart';

import { APP_COLORS } from '@config/colorLiterals';

import type { HealthStatus } from '../HealthRing';
import './CalmMetricCard.css';

interface CalmMetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  trendInverted?: boolean;
  sparkline?: number[];
  sparklineColor?: string;
  status?: HealthStatus;
  loading?: boolean;
}

function TrendIndicator({ trend, inverted }: { trend: number; inverted?: boolean }) {
  const isPositive = inverted ? trend <= 0 : trend >= 0;
  const color = isPositive ? 'var(--color-healthy)' : 'var(--color-critical)';
  const Icon = trend >= 0 ? TrendingUp : TrendingDown;
  const sign = trend >= 0 ? '+' : '';
  return (
    <span className="cmcard__trend" style={{ color }}>
      <Icon size={11} />
      {sign}{trend.toFixed(1)}%
    </span>
  );
}

export default function CalmMetricCard({
  label,
  value,
  unit,
  trend,
  trendInverted,
  sparkline,
  sparklineColor = APP_COLORS.hex_7c7ff2,
  loading = false,
}: CalmMetricCardProps) {
  if (loading) {
    return (
      <div className="cmcard cmcard--loading">
        <Skeleton active paragraph={{ rows: 2 }} />
      </div>
    );
  }

  return (
    <div className="cmcard">
      <span className="cmcard__label">{label}</span>
      <div className="cmcard__value-row">
        <span className="cmcard__value">
          {value}
          {unit && <span className="cmcard__unit">{unit}</span>}
        </span>
        {trend !== undefined && (
          <TrendIndicator trend={trend} inverted={trendInverted} />
        )}
      </div>
      {sparkline && sparkline.length >= 2 && (
        <div className="cmcard__sparkline">
          <SparklineChart
            data={sparkline}
            color={sparklineColor}
            fill={false}
            width={undefined as any}
            height={36}
          />
        </div>
      )}
    </div>
  );
}
