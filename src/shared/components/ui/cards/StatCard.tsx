import React from 'react';
import { Surface, Skeleton } from '@/components/ui';
import { TrendIndicator } from '@shared/components/ui';
import { APP_COLORS } from '@config/colorLiterals';
import SparklineChart from '../charts/micro/SparklineChart';

export interface StatCardMetric {
  title: string;
  value: string | number;
  formatter?: (val: string | number) => string | number;
  suffix?: string;
  description?: string;
}

export interface StatCardTrend {
  value?: number | null;
  inverted?: boolean;
}

export interface StatCardVisuals {
  icon?: React.ReactNode;
  iconColor?: string;
  sparklineData?: number[];
  sparklineColor?: string;
  loading?: boolean;
}

export interface StatCardProps {
  metric: StatCardMetric;
  trend?: StatCardTrend;
  visuals?: StatCardVisuals;
}

/**
 * Reusable metric card for displaying a single statistic with trend.
 */
const StatCard = React.memo(function StatCard({
  metric,
  trend = {},
  visuals = {},
}: StatCardProps) {
  const { title, value, formatter, suffix, description } = metric;
  const { value: trendValue, inverted: trendInverted = false } = trend;
  const { icon, iconColor, sparklineData, sparklineColor, loading = false } = visuals;

  const displayValue = formatter ? formatter(value) : value;

  return (
    <Surface
      elevation={1}
      padding="sm"
      className="h-full"
    >
      {loading ? (
        <div className="min-h-[80px] py-1">
          <Skeleton count={2} />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[color:var(--text-secondary)] text-[11px] font-medium uppercase tracking-[0.5px]">
              {title}
            </span>
            {icon && (
              <span className="flex items-center opacity-80" style={{ color: iconColor }}>
                {React.isValidElement(icon) ? icon : React.createElement(icon as any, { size: 20 })}
              </span>
            )}
          </div>
          <div className="text-foreground text-xl font-light tabular-nums leading-[1.2]">
            {displayValue}
            {suffix && (
              <span className="text-base font-normal ml-1 text-[color:var(--text-secondary)]">
                {suffix}
              </span>
            )}
          </div>
          {description && (
            <div className="text-muted-foreground text-xs mt-1">{description}</div>
          )}
          {sparklineData && sparklineData.length > 1 && (
            <div className="mt-2">
              <SparklineChart
                data={sparklineData}
                color={sparklineColor || iconColor || APP_COLORS.hex_5e60ce}
                width={120}
                height={28}
              />
            </div>
          )}
          {trendValue != null && (
            <TrendIndicator value={trendValue} inverted={trendInverted} />
          )}
        </>
      )}
    </Surface>
  );
});

export default StatCard;
