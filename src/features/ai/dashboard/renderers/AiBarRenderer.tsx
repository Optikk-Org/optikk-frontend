import { BarRenderer } from '@shared/components/ui/dashboard/renderers/BarRenderer';
import type { DashboardPanelRendererProps } from '@shared/components/ui/dashboard/dashboardPanelRegistry';

/**
 *
 */
export function AiBarRenderer(props: DashboardPanelRendererProps) {
  return <BarRenderer {...props} />;
}
