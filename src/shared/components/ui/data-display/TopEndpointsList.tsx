import { Link } from 'react-router-dom';

import { formatNumber, formatDuration } from '@shared/utils/formatters';
import { buildInterpolatedPath } from '@shared/utils/placeholderInterpolation';

import { APP_COLORS } from '@config/colorLiterals';

const CHART_COLORS = [
  APP_COLORS.hex_5e60ce,
  APP_COLORS.hex_48cae4,
  APP_COLORS.hex_06d6a0,
  APP_COLORS.hex_ffd166,
  APP_COLORS.hex_ef476f,
  APP_COLORS.hex_118ab2,
  APP_COLORS.hex_073b4c,
  APP_COLORS.hex_f78c6b,
  APP_COLORS.hex_83d483,
  APP_COLORS.hex_5e35b1,
];

type TopEndpointsListType = 'requests' | 'errorRate' | 'latency' | 'count';

interface TopEndpointListItem {
  key?: string;
  endpoint?: string;
  service?: string;
  request_count?: number;
  errorRate?: number;
  value?: number;
  latency?: number;
  [key: string]: unknown;
}

interface TopEndpointsListProps {
  title?: string;
  endpoints?: TopEndpointListItem[];
  selectedEndpoints?: string[];
  onToggle?: (endpointKey: string) => void;
  type?: TopEndpointsListType;
  drilldownRouteTemplate?: string;
}

interface RowDisplayConfig {
  selectedBg: string;
  hoverBg: string;
  valueColor: string;
  displayValue: string;
}

function getRowDisplayConfig(
  type: TopEndpointsListType,
  endpoint: TopEndpointListItem,
): RowDisplayConfig {
  if (type === 'errorRate') {
    const rate = endpoint.errorRate ?? endpoint.value ?? 0;
    return {
      selectedBg: APP_COLORS.rgba_240_68_56_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: rate > 5 ? APP_COLORS.hex_f04438 : APP_COLORS.hex_e0e0e0,
      displayValue: `${Number(rate).toFixed(2)}%`,
    };
  }

  if (type === 'latency') {
    const latency = endpoint.latency ?? 0;
    return {
      selectedBg: APP_COLORS.rgba_247_144_9_0p2,
      hoverBg: APP_COLORS.rgba_255_255_255_0p05,
      valueColor: latency > 500 ? APP_COLORS.hex_f04438 : latency > 200 ? APP_COLORS.hex_f79009 : APP_COLORS.hex_e0e0e0,
      displayValue: formatDuration(latency),
    };
  }

  return {
    selectedBg: APP_COLORS.rgba_94_96_206_0p2,
    hoverBg: APP_COLORS.rgba_255_255_255_0p05,
    valueColor: APP_COLORS.hex_e0e0e0,
    displayValue: formatNumber(endpoint.request_count ?? 0),
  };
}

/**
 * Reusable component for displaying top endpoints below charts
 * @param props Component props.
 * @returns Rendered endpoint table for the selected metric.
 */
export default function TopEndpointsList({
  title,
  endpoints = [],
  selectedEndpoints = [],
  onToggle,
  type = 'requests', // 'requests', 'errorRate', 'latency'
  drilldownRouteTemplate,
}: TopEndpointsListProps): JSX.Element | null {
  if (endpoints.length === 0) return null;

  return (
    <div style={{ marginTop: 0, borderTop: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}` }}>
      <div
        style={{
          maxHeight: '180px',
          overflowY: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: `var(--border-color, ${APP_COLORS.hex_2d2d2d}) transparent`,
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '12px',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr
              style={{
                color: APP_COLORS.hex_8e8e8e,
                borderBottom: `1px solid ${APP_COLORS.rgba_255_255_255_0p05}`,
              }}
            >
              <th style={{ padding: '4px 8px', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                {title}
              </th>
              {drilldownRouteTemplate ? (
                <th style={{ padding: '4px 8px', fontWeight: 500, textAlign: 'right' }}>
                  Details
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {endpoints.map((endpoint, index) => {
              const endpointKey = endpoint.key ?? `${endpoint.endpoint ?? 'unknown'}-${index}`;
              const detailHref = buildInterpolatedPath(
                drilldownRouteTemplate,
                endpoint as Record<string, unknown>,
              );
              const isSelected = selectedEndpoints.includes(endpointKey);
              const isFaded = selectedEndpoints.length > 0 && !isSelected;
              const { selectedBg, hoverBg, valueColor, displayValue } = getRowDisplayConfig(
                type,
                endpoint,
              );
              
              // Find max value in list for proportional bar calculation
              const getVal = (ep: TopEndpointListItem) => (type === 'errorRate' ? (ep.errorRate ?? ep.value ?? 0) : type === 'latency' ? (ep.latency ?? 0) : (ep.request_count ?? 0));
              const maxValInList = Math.max(...endpoints.map(getVal), 1);
              const currentVal = getVal(endpoint);
              const pct = (currentVal / maxValInList) * 100;
              const barWidth = Math.max(Math.min(pct, 100), 2);
              
              // Gradient based on type (Error rate/Hotspot uses orange->red)
              const barBg = type === 'errorRate' 
                ? `linear-gradient(90deg, ${APP_COLORS.hex_f79009} 0%, ${APP_COLORS.hex_f04438} 100%)`
                : type === 'latency'
                  ? `linear-gradient(90deg, ${APP_COLORS.hex_ffd166} 0%, ${APP_COLORS.hex_f79009} 100%)`
                  : `linear-gradient(90deg, ${APP_COLORS.hex_48cae4} 0%, ${APP_COLORS.hex_5e60ce} 100%)`;

              return (
                <tr
                  key={endpointKey}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggle?.(endpointKey);
                  }}
                  style={{
                    background: isSelected ? selectedBg : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    opacity: isFaded ? 0.4 : 1,
                  }}
                  onMouseEnter={(event) => {
                    if (!isFaded) {
                      event.currentTarget.style.background = isSelected ? selectedBg : hoverBg;
                    }
                  }}
                  onMouseLeave={(event) => {
                    event.currentTarget.style.background = isSelected ? selectedBg : 'transparent';
                  }}
                >
                  <td
                    style={{
                      padding: '4px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ color: APP_COLORS.hex_e0e0e0, fontWeight: 500 }}>
                        {endpoint.endpoint}
                      </span>
                      {endpoint.service && endpoint.service !== 'unknown' && (
                        <span style={{ color: APP_COLORS.hex_8e8e8e, fontSize: '11px' }}>
                          {endpoint.service}
                        </span>
                      )}
                    </div>
                    {/* Proportional Gradient Intensity Bar */}
                    <div style={{ width: '100%', height: '3px', background: APP_COLORS.rgba_255_255_255_0p05, borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                      <div style={{ width: `${barWidth}%`, height: '100%', background: barBg, borderRadius: '2px' }} />
                    </div>
                  </td>
                  <td
                    className="font-mono"
                    style={{
                      padding: '4px 8px',
                      textAlign: 'right',
                      color: valueColor,
                    }}
                  >
                    {displayValue}
                  </td>
                  {drilldownRouteTemplate ? (
                    <td
                      style={{
                        padding: '4px 8px',
                        textAlign: 'right',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {detailHref ? (
                        <Link
                          to={detailHref}
                          onClick={(event) => event.stopPropagation()}
                          style={{ color: APP_COLORS.hex_48cae4, fontSize: '12px', fontWeight: 500 }}
                        >
                          View
                        </Link>
                      ) : (
                        <span style={{ color: APP_COLORS.hex_8e8e8e, fontSize: '12px' }}>—</span>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
