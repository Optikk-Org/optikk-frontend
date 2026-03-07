import { Line } from 'react-chartjs-2';

import { APP_COLORS } from '@config/colorLiterals';

const sparklineOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { enabled: false },
  },
  scales: {
    x: { display: false },
    y: { display: false },
  },
  elements: {
    point: { radius: 0 },
    line: { borderWidth: 1.5 },
  },
};

const calmSparklineOptions = {
  ...sparklineOptions,
  elements: {
    point: { radius: 0 },
    line: { borderWidth: 1, tension: 0.3 },
  },
};

interface SparklineChartProps {
  data?: number[];
  color?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  calm?: boolean;
}

/**
 *
 * @param root0
 * @param root0.data
 * @param root0.color
 * @param root0.fill
 * @param root0.width
 * @param root0.height
 * @param root0.calm
 */
export default function SparklineChart({
  data = [],
  color = APP_COLORS.hex_7c7ff2,
  fill = true,
  width = 60,
  height = 24,
  calm = false,
}: SparklineChartProps) {
  if (!data || data.length < 2) return null;

  const effectiveFill = calm ? false : fill;
  const effectiveHeight = calm ? Math.min(height, 36) : height;
  const options = calm ? calmSparklineOptions : sparklineOptions;

  const chartData = {
    labels: data.map((_, i) => i),
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: effectiveFill ? `${color}26` : 'transparent',
        fill: effectiveFill,
        tension: calm ? 0.3 : 0.4,
      },
    ],
  };

  return (
    <div style={{ width, height: effectiveHeight }}>
      <Line data={chartData} options={options} />
    </div>
  );
}
