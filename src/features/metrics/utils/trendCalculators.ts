interface TrendSnapshot {
  requestTrend: number;
  errorTrend: number;
}

interface TrendPoint {
  request_count: number;
  error_count: number;
}

const EMPTY_TRENDS: TrendSnapshot = { requestTrend: 0, errorTrend: 0 };
const WINDOW_SIZE = 10;

export /**
 *
 */
const calculateTrends = (metricsPoints: readonly TrendPoint[] = []): TrendSnapshot => {
  if (metricsPoints.length < 2) {
    return EMPTY_TRENDS;
  }

  const recent = metricsPoints.slice(-WINDOW_SIZE);
  const older = metricsPoints.slice(0, WINDOW_SIZE);

  const recentAvg =
    recent.reduce((sum: number, metric) => sum + metric.request_count, 0) / recent.length;
  const olderAvg =
    older.reduce((sum: number, metric) => sum + metric.request_count, 0) / older.length;
  const requestTrend = olderAvg > 0 ? ((recentAvg - olderAvg) / olderAvg) * 100 : 0;

  const recentErrorRate =
    recent.reduce((sum: number, metric) => {
      const total = metric.request_count;
      const errors = metric.error_count;
      return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / recent.length;

  const olderErrorRate =
    older.reduce((sum: number, metric) => {
      const total = metric.request_count;
      const errors = metric.error_count;
      return sum + (total > 0 ? (errors / total) * 100 : 0);
    }, 0) / older.length;

  const errorTrend =
    olderErrorRate > 0 ? ((recentErrorRate - olderErrorRate) / olderErrorRate) * 100 : 0;

  return { requestTrend, errorTrend };
};
