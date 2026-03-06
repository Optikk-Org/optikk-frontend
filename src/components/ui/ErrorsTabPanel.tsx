import { ErrorDashboardPageView as ErrorDashboardPage } from '@/domains/overview';

/**
 * Shared wrapper used by hub pages to embed the Errors dashboard tab content.
 */
export default function ErrorsTabPanel(): JSX.Element {
  return <ErrorDashboardPage />;
}
