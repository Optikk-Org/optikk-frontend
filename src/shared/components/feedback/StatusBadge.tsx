import { Tag } from 'antd';

import { getHealthColor } from '@utils/formatters';

import { STATUS_COLORS } from '@config/constants';

import type { StatusBadgeProps } from './types';

const TRACE_STATUS_COLORS = STATUS_COLORS as Record<string, string>;

const STATUS_MAPS = {
  service: (status: string) => ({
    color: getHealthColor(status),
    label: status?.toUpperCase() || 'UNKNOWN',
  }),
  trace: (status: string) => ({
    color: TRACE_STATUS_COLORS[status] || TRACE_STATUS_COLORS.UNKNOWN,
    label: status || 'UNKNOWN',
  }),
};

export default function StatusBadge({ status, type = 'service' }: StatusBadgeProps): JSX.Element {
  const resolver = STATUS_MAPS[type];
  const { color, label } = resolver(status);

  return (
    <Tag color={color} style={{ borderColor: color }}>
      {label}
    </Tag>
  );
}
