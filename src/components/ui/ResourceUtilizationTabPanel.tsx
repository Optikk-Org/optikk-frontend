import { ResourceUtilizationPageView as ResourceUtilizationPage } from '@/domains/metrics';

/**
 * Shared wrapper used by hub pages to embed resource utilization tab content.
 */
export default function ResourceUtilizationTabPanel(): JSX.Element {
  return <ResourceUtilizationPage />;
}
