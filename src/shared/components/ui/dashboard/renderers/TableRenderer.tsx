import { Table } from 'antd'; // NOTE: antd Table kept — too complex to replace inline
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

import type {
  DashboardComponentSpec,
  DashboardDataSources,
  DashboardExtraContext,
} from '@/types/dashboardConfig';

import LatencyHistogram from '@shared/components/ui/charts/distributions/LatencyHistogram';
import LogHistogram from '@shared/components/ui/charts/distributions/LogHistogram';
import GaugeChart from '@shared/components/ui/charts/micro/GaugeChart';
import LatencyHeatmapChart from '@shared/components/ui/charts/specialized/LatencyHeatmapChart';
import ServiceGraph from '@shared/components/ui/charts/specialized/ServiceGraph';
import WaterfallChart from '@shared/components/ui/charts/specialized/WaterfallChart';

import {
  createBarDataset,
  createChartOptions,
  createLineDataset,
  getChartColor,
} from '@shared/utils/chartHelpers';

import { APP_COLORS } from '@config/colorLiterals';
import { buildInterpolatedPath } from '@shared/utils/placeholderInterpolation';

import { useDashboardData } from '../hooks/useDashboardData';
import { buildAiTimeseries, resolveDataSourceId } from '../utils/dashboardUtils';

/**
 *
 */
export function TableRenderer({
  chartConfig,
  dataSources,
}: {
  chartConfig: DashboardComponentSpec;
  dataSources: DashboardDataSources;
}) {
  const { rawData, data: rows } = useDashboardData(chartConfig, dataSources);

  const columns = useMemo(() => {
    if (rows.length === 0) return [];
    const baseColumns = Object.keys(rows[0]).slice(0, 8).map((key) => ({
      title: key.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1').trim(),
      dataIndex: key,
      key,
      ellipsis: true,
      render: (val: any) => {
        if (val == null) return '—';
        if (typeof val === 'number') return Number.isInteger(val) ? val : Number(val).toFixed(2);
        return String(val);
      },
    }));
    if (!chartConfig.drilldownRoute) {
      return baseColumns;
    }

    return [
      ...baseColumns,
      {
        title: 'Details',
        key: '__details',
        align: 'right' as const,
        render: (_val: unknown, row: Record<string, unknown>) => {
          const href = buildInterpolatedPath(chartConfig.drilldownRoute as string, row);
          return href ? <Link to={href}>View</Link> : '—';
        },
      },
    ];
  }, [chartConfig.drilldownRoute, rows]);
  if (rows.length === 0) {
    return <div className="text-muted" style={{ textAlign: 'center', padding: 32 }}>No data</div>;
  }
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      <Table
        dataSource={rows.map((r: any, i: number) => ({ ...r, _rowKey: r.id ?? r.key ?? i }))}
        columns={columns}
        rowKey="_rowKey"
        size="small"
        pagination={false}
      />
    </div>
  );
}
