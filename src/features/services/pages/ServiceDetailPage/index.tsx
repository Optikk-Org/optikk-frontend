import { Button } from '@/components/ui';
import { ArrowLeft } from 'lucide-react';
import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import PageHeader from '@shared/components/ui/layout/PageHeader';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

export default function ServiceDetailPage() {
  const { serviceName: serviceNameParam } = useParams();
  const serviceName = serviceNameParam ?? '';
  const navigate = useNavigate();

  const pathParams = useMemo(
    () => (serviceName ? { serviceName } : undefined),
    [serviceName],
  );

  const breadcrumbs = [
    { label: 'Services', path: '/services' },
    { label: serviceName },
  ];

  const headerActions = (
    <Button variant="secondary" size="sm" onClick={() => navigate('/services')}>
      <ArrowLeft size={16} /> Back to Services
    </Button>
  );

  return (
    <div>
      <PageHeader title={serviceName} breadcrumbs={breadcrumbs} actions={headerActions} />
      <DashboardPage pageId="service-detail" pathParams={pathParams} />
    </div>
  );
}
