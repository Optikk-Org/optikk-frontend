import { Users } from 'lucide-react';
import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { PageHeader } from '@shared/components/ui';
import DashboardPage from '@shared/components/ui/dashboard/DashboardPage';

import { ROUTES } from '@/shared/constants/routes';

export default function KafkaGroupDetailPage() {
  const params = useParams();
  const groupId = params.groupId ?? '';

  const pathParams = useMemo(
    () => (groupId ? { groupId } : undefined),
    [groupId],
  );

  return (
    <div>
      <PageHeader
        title={groupId ? `Consumer Group: ${groupId}` : 'Kafka Consumer Group Detail'}
        icon={<Users size={24} />}
        subtitle="Lag, partitions, and processing metrics for a single Kafka consumer group"
        breadcrumbs={[
          { label: 'Saturation', path: `${ROUTES.saturation}?tab=mq` },
          { label: 'Message Queue', path: `${ROUTES.saturation}?tab=mq` },
          { label: groupId || 'Consumer Group Detail' },
        ]}
      />
      <DashboardPage pageId="kafka-group-detail" pathParams={pathParams} />
    </div>
  );
}
