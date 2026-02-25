import { useMemo, useState, useCallback } from 'react';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { v1Service } from '@services/v1Service';
import { useAppStore } from '@store/appStore';
import { useDashboardConfig } from '@hooks/useDashboardConfig';
import { useTimeRangeQuery, useTimeRange } from '@hooks/useTimeRangeQuery';
import ConfigurableDashboard from '@components/dashboard/ConfigurableDashboard';


import LogsTopNav from '@components/logs/LogsTopNav';
import LogsQueryBar from '@components/logs/LogsQueryBar';
import LogsRawView from '@components/logs/LogsRawView';
import LogHistogram from '@components/charts/LogHistogram';
import LogRow, { LogDetailPanel } from '@components/logs/LogRow';

import './LogsPage.css';


export default function LogsPage() {
  const { selectedTeamId, timeRange, refreshKey } = useAppStore();
  const navigate = useNavigate();

  const { config: dashboardConfig } = useDashboardConfig('logs');

  // ── filter state — structured filters from the query bar
  const [filters, setFilters] = useState([]);
  const [searchText, setSearchText] = useState('');

  // ── ui state
  const [liveTail, setLiveTail] = useState(false);
  const [collapsedKeys, setCollapsedKeys] = useState(new Set());
  const [selectedLog, setSelectedLog] = useState(null);
  const [chartCollapsed, setChartCollapsed] = useState(false);
  const pageSize = 100;

  // ── Build backend params from structured filters
  const backendParams = useMemo(() => {
    const params = {};
    const levels = [];
    const services = [];

    filters.forEach((f) => {
      if (f.field === 'level') {
        levels.push(f.value);
      } else if (f.field === 'service_name') {
        services.push(f.value);
      } else if (f.field === 'trace_id') {
        params.traceId = f.value;
      } else if (f.field === 'span_id') {
        params.spanId = f.value;
      } else if (f.field === 'host') {
        params.host = f.value;
      } else if (f.field === 'container') {
        params.container = f.value;
      } else if (f.field === 'message') {
        params.search = f.value;
      }
    });

    if (levels.length > 0) params.levels = levels;
    if (services.length > 0) params.services = services;
    if (searchText) params.search = searchText;

    return params;
  }, [filters, searchText]);

  // ── data fetch: logs
  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch
  } = useInfiniteQuery({
    queryKey: [
      'logs-v2-infinite',
      selectedTeamId, timeRange.value,
      pageSize, backendParams,
      refreshKey,
    ],
    queryFn: ({ pageParam = 0 }) => {
      const endTime = Date.now();
      const startTime = endTime - timeRange.minutes * 60 * 1000;
      return v1Service.getLogs(selectedTeamId, startTime, endTime, {
        ...backendParams,
        limit: pageSize,
        cursor: pageParam || undefined
      });
    },
    getNextPageParam: (lastPage) => lastPage.hasMore ? lastPage.nextCursor : undefined,
    enabled: !!selectedTeamId,
    refetchInterval: liveTail ? 3000 : false,
  });

  // ── data fetch: histogram — uses same time range as all other charts
  const { selectedTeamId: histTeamId, refreshKey: histRefresh, timeRange: histTimeRange, getTimeRange } = useTimeRange();

  const { histStart, histEnd } = useMemo(() => {
    const { startTime, endTime } = getTimeRange();
    return { histStart: startTime, histEnd: endTime };
  }, [histTimeRange, histRefresh, getTimeRange]);

  const histInterval = (() => {
    const mins = (histEnd - histStart) / 60000;
    // Target ~50 bars; pick the finest interval that achieves this
    if (mins <= 60) return '1m';   // up to 60 bars for 1h window
    if (mins <= 360) return '5m';   // up to 72 bars for 6h window
    if (mins <= 1440) return '15m';  // up to 96 bars for 24h window
    if (mins <= 10080) return '1h';  // up to 168 bars for 7d window
    return '6h';
  })();

  const { data: histData } = useQuery({
    queryKey: ['log-histogram', histTeamId, histTimeRange.value, histRefresh, histInterval],
    queryFn: () => v1Service.getLogHistogram(histTeamId, histStart, histEnd, histInterval),
    enabled: !!histTeamId,
  });

  const histogramData = histData?.histogram || histData?.buckets || histData || [];

  const chartDataSources = useMemo(() => ({
    'log-histogram': Array.isArray(histogramData) ? histogramData : [],
    _meta: { startTime: histStart, endTime: histEnd, interval: histInterval },
  }), [histogramData, histStart, histEnd, histInterval]);


  // ── derived data
  const allLogs = data?.pages ? data.pages.flatMap((page) => page.logs || []) : [];
  const serverTotal = Number(data?.pages?.[0]?.total || 0);

  const rowKey = (log, i) =>
    log.trace_id && log.span_id
      ? `${log.trace_id}-${log.span_id}-${log.timestamp}`
      : `log-${i}-${log.timestamp}`;

  const handleRowClick = useCallback((log) => {
    setSelectedLog(log);
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setFilters([]);
    setSearchText('');
    setSelectedLog(null);
  }, []);

  return (
    <div className="logs-page" style={{ flexDirection: 'column' }}>
      <div className="logs-main">

        {/* Top Navbar — no more Chart tab */}
        <LogsTopNav
          liveTail={liveTail} setLiveTail={setLiveTail}
          refresh={refetch} isLoading={isLoading}
        />

        {/* Query Filter Bar */}
        <LogsQueryBar
          filters={filters} setFilters={setFilters}
          searchText={searchText} setSearchText={setSearchText}
          onClearAll={handleClearAll}
        />

        {/* Configurable Charts — powered by backend YAML config */}
        {dashboardConfig && (
          <div style={{ marginBottom: 16 }}>
            <ConfigurableDashboard
              config={dashboardConfig}
              dataSources={chartDataSources}
            />
          </div>
        )}

        {/* Raw Log Rows */}
        <LogsRawView
          filteredLogs={allLogs}
          isLoading={isLoading}
          serverTotal={serverTotal}
          wrap={false}
          onRowClick={handleRowClick}
          navigate={navigate}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          fetchNextPage={fetchNextPage}
          rowKey={rowKey}
          LogRow={LogRow}
        />
      </div>

      {/* Log Detail Panel */}
      {selectedLog && (
        <LogDetailPanel
          log={selectedLog}
          onClose={handleCloseDetail}
          navigate={navigate}
        />
      )}
    </div>
  );
}
