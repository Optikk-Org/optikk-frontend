
import { useMemo, memo } from 'react';
import uPlot from 'uplot';

import { useChartTimeBuckets } from '@shared/hooks/useChartTimeBuckets';
import { tsKey, tsMs, firstValue } from '@shared/utils/chartDataUtils';
import { CHART_COLORS } from '@config/constants';
import { APP_COLORS } from '@config/colorLiterals';

import UPlotChart, { defaultAxes, uLine } from '../UPlotChart';

function getChartColor(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length];
}

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.endpoints
 * @param root0.selectedEndpoints
 * @param root0.serviceTimeseriesMap
 * @param root0.targetThreshold
 * @param root0.datasetLabel
 * @param root0.color
 */
export default memo(function ErrorRateChart({
  data = [],
  endpoints = [],
  selectedEndpoints = [],
  serviceTimeseriesMap = {},
  targetThreshold = null,
  datasetLabel = 'Error Rate %',
  color = APP_COLORS.hex_f04438,
}: any) {
  const hasServiceData = Object.keys(serviceTimeseriesMap).length > 0;
  const { timeBuckets } = useChartTimeBuckets();

  const buildServiceDatasets = (endpointList: any[]) => {
    const targetMap: Record<string, any> = {};
    for (const ep of endpointList) {
      const key = ep.key || firstValue(ep, ['service_name'], '');
      const label = ep.endpoint || firstValue(ep, ['service_name'], '') || key;
      if (!targetMap[key]) targetMap[key] = { label };
    }
    const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;

    return Object.entries(targetMap).map(([key, info]: [string, any], idx) => {
      const tsData = (serviceTimeseriesMap)[key] || [];
      const tsMap: Record<string, { total: number, errors: number }> = {};
      for (const row of tsData) {
        const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket'], '');
        if (!rowTimestamp) continue;
        const rowTime = tsMs(rowTimestamp);
        if (Number.isNaN(rowTime)) continue;
        const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
        const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

        const total = Number(firstValue(row, ['request_count'], 0));
        const errors = Number(firstValue(row, ['error_count'], 0));

        if (!tsMap[bucketKey]) {
          tsMap[bucketKey] = { total: 0, errors: 0 };
        }
        tsMap[bucketKey].total += total;
        tsMap[bucketKey].errors += errors;
      }

      const values = timeBuckets.map((d) => {
        const bucket = tsMap[tsKey(d)];
        if (!bucket || bucket.total === 0) return 0;
        return (bucket.errors / bucket.total) * 100;
      });
      return { label: info.label, values, color: getChartColor(idx), fill: false };
    });
  };

  const chartData = useMemo(() => {
    type SeriesEntry = { label: string; values: number[]; color: string; fill: boolean; dash?: number[] };
    let seriesList: SeriesEntry[];

    if (endpoints.length > 0) {
      const list = selectedEndpoints.length > 0
        ? (endpoints as any[]).filter((ep) => {
          const key = ep.key || (() => {
            const method = String(firstValue(ep, ['http_method', 'httpMethod'], '')).toUpperCase();
            const op = String(firstValue(ep, ['operation_name', 'endpoint_name'], 'Unknown'));
            const cleanOp = op.startsWith(method + ' ') ? op.substring(method.length + 1) : op;
            const serviceName = firstValue(ep, ['service_name'], '');
            return `${method} ${cleanOp}_${serviceName}`;
          })();
          return selectedEndpoints.includes(key);
        })
        : endpoints;

      if (hasServiceData) {
        seriesList = buildServiceDatasets(list);
      } else {
        seriesList = (list as any[]).map((ep, idx) => {
          const method = firstValue(ep, ['http_method'], 'N/A');
          const operation = firstValue(ep, ['operation_name', 'endpoint_name'], 'Unknown');
          return {
            label: `${method} ${operation}`,
            values: timeBuckets.map(() => 0),
            color: getChartColor(idx),
            fill: false,
          };
        });
      }
    } else if (hasServiceData) {
      const stepMs = timeBuckets.length >= 2 ? new Date(timeBuckets[1]).getTime() - new Date(timeBuckets[0]).getTime() : 60000;
      seriesList = Object.entries(serviceTimeseriesMap).slice(0, 10).map(([svcName, rows]: [string, any], idx) => {
        const tsMap: Record<string, { total: number, errors: number }> = {};
        for (const row of rows as any[]) {
          const rowTimestamp = firstValue(row, ['timestamp', 'time_bucket'], '');
          if (!rowTimestamp) continue;
          const rowTime = tsMs(rowTimestamp);
          if (Number.isNaN(rowTime)) continue;
          const alignedTimeMs = Math.floor(rowTime / stepMs) * stepMs;
          const bucketKey = tsKey(new Date(alignedTimeMs).toISOString());

          const total = Number(firstValue(row, ['request_count'], 0));
          const errors = Number(firstValue(row, ['error_count'], 0));

          if (!tsMap[bucketKey]) {
            tsMap[bucketKey] = { total: 0, errors: 0 };
          }
          tsMap[bucketKey].total += total;
          tsMap[bucketKey].errors += errors;
        }

        const values = timeBuckets.map((d) => {
          const bucket = tsMap[tsKey(d)];
          if (!bucket || bucket.total === 0) return 0;
          return (bucket.errors / bucket.total) * 100;
        });
        return { label: svcName, values, color: getChartColor(idx), fill: false };
      });
    } else {
      const dataMap: Record<string, number> = {};
      for (const d of data as any[]) {
        const ts = firstValue(d, ['timestamp', 'time_bucket'], '');
        dataMap[tsKey(ts)] = Number(firstValue(d, ['value', 'error_rate'], 0));
      }
      seriesList = [{ label: datasetLabel, values: timeBuckets.map((ts) => dataMap[tsKey(ts)] ?? 0), color, fill: true }];
    }

    if (targetThreshold !== null) {
      const formattedLimit = Number.isInteger(Number(targetThreshold)) ? targetThreshold : Number(targetThreshold).toFixed(2).replace(/\.?0+$/, '');
      seriesList.push({
        label: `Limit (${formattedLimit}%)`,
        values: timeBuckets.map(() => targetThreshold),
        color: APP_COLORS.hex_f79009,
        fill: false,
        dash: [5, 5],
      });
    }

    seriesList.push({
      label: '100% Error',
      values: timeBuckets.map(() => 100),
      color: APP_COLORS.rgba_240_68_56_0p5,
      fill: false,
      dash: [5, 5],
    });

    return seriesList;
  }, [data, endpoints, selectedEndpoints, serviceTimeseriesMap, hasServiceData, targetThreshold, timeBuckets]);

  const timestamps = useMemo(
    () => timeBuckets.map((t) => tsMs(t) / 1000),
    [timeBuckets],
  );

  const uplotData = useMemo<uPlot.AlignedData>(() => {
    return [
      timestamps,
      ...chartData.map((s) => s.values),
    ] as uPlot.AlignedData;
  }, [timestamps, chartData]);

  const allDataValues = useMemo(() => {
    const vals: number[] = (data as any[]).map((d) => Number(firstValue(d, ['value', 'error_rate'], 0)));
    if (Object.keys(serviceTimeseriesMap).length > 0) {
      Object.values(serviceTimeseriesMap).forEach((rows: any) => {
        rows.forEach((r: any) => {
          const total = Number(firstValue(r, ['request_count'], 0));
          const errors = Number(firstValue(r, ['error_count'], 0));
          if (total > 0) vals.push((errors / total) * 100);
        });
      });
    }
    (endpoints as any[]).forEach((ep) => {
      const requestCount = Number(firstValue(ep, ['request_count'], 0));
      const errorCount = Number(firstValue(ep, ['error_count'], 0));
      const explicitRate = firstValue(ep, ['error_rate'], null);
      const rate = explicitRate != null ? Number(explicitRate)
        : (requestCount > 0 ? (errorCount / requestCount) * 100 : 0);
      if (rate > 0) vals.push(rate);
    });
    return vals;
  }, [data, serviceTimeseriesMap, endpoints]);

  const maxDataVal = Math.max(...allDataValues, targetThreshold || 0, 0);
  const yAxisMax = Math.min(Math.max(Math.ceil(maxDataVal * 1.2), 1), 100);

  const effectiveYMax = targetThreshold && targetThreshold > yAxisMax
    ? Math.min(targetThreshold * 1.2, 100)
    : yAxisMax;

  const opts = useMemo<Omit<uPlot.Options, 'width' | 'height'>>(() => ({
    axes: [
      ...defaultAxes().slice(0, 1),
      {
        ...defaultAxes()[1],
        values: (_u: uPlot, vals: number[]) =>
          vals.map((v) => (Number.isInteger(v) ? `${v}%` : `${v.toFixed(1)}%`)),
        range: [0, effectiveYMax],
      },
    ],
    scales: {
      y: { min: 0, max: effectiveYMax },
    },
    series: [
      {},
      ...chartData.map((s) =>
        uLine(s.label, s.color, { fill: s.fill, dash: s.dash }),
      ),
    ],
  }), [chartData, effectiveYMax]);

  if (data.length === 0 && timeBuckets.length === 0) {
    return (
      <div style={{ height: '100%', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>No error data in selected time range</div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', height: '100%', minHeight: '200px' }}>
      <UPlotChart options={opts} data={uplotData} />
    </div>
  );
});
