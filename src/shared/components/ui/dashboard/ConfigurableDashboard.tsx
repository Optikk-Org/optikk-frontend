import { Col, Row, Spin } from 'antd';

import type {
  DashboardDataSources,
  DashboardExtraContext,
  DashboardRenderConfig,
} from '@/types/dashboardConfig';

import ConfigurableChartCard from './ConfigurableChartCard';

interface ConfigurableDashboardProps {
  config: DashboardRenderConfig | null;
  dataSources?: DashboardDataSources;
  isLoading?: boolean;
  extraContext?: DashboardExtraContext;
}

/**
 * ConfigurableDashboard renders a grid of charts from a parsed YAML config object.
 * @param root0
 * @param root0.config
 * @param root0.dataSources
 * @param root0.isLoading
 * @param root0.extraContext
 */
export default function ConfigurableDashboard({
  config,
  dataSources = {},
  isLoading = false,
  extraContext = {},
}: ConfigurableDashboardProps) {
  if (!config || config.components.length === 0) return null;

  return (
    <Spin spinning={isLoading}>
      <Row gutter={[16, 16]}>
        {config.components.map((componentConfig) => {
          const colSpan = componentConfig.layout?.col || 12;
          return (
            <Col key={componentConfig.id} xs={24} lg={colSpan}>
              <ConfigurableChartCard
                componentConfig={componentConfig}
                dataSources={dataSources}
                extraContext={extraContext}
              />
            </Col>
          );
        })}
      </Row>
    </Spin>
  );
}
