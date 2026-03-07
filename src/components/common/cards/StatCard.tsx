import { Card, Skeleton } from 'antd';
import React from 'react';
import { TrendIndicator } from '@components/common';
import { APP_COLORS } from '@config/colorLiterals';
import SparklineChart from '../../charts/micro/SparklineChart';
import './StatCard.css';

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
    <Card className="stat-card">
      {loading ? (
        <div className="stat-card-loading">
          <Skeleton active title={{ width: '50%' }} paragraph={{ rows: 1, width: '70%' }} />
        </div>
      ) : (
        <>
          <div className="stat-card-header">
            <span className="stat-card-title">{title}</span>
            {icon && (
              <span className="stat-card-icon" style={{ color: iconColor }}>
                {React.isValidElement(icon) ? icon : React.createElement(icon as any, { size: 20 })}
              </span>
            )}
          </div>
          <div className="stat-card-value">
            {displayValue}
            {suffix && <span className="stat-card-suffix">{suffix}</span>}
          </div>
          {description && (
            <div className="stat-card-description">{description}</div>
          )}
          {sparklineData && sparklineData.length > 1 && (
            <div className="stat-card-sparkline">
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
    </Card>
  );
});

export default StatCard;
