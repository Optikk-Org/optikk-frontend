import { Radio } from 'lucide-react';

import { PageHeader } from '@shared/components/ui';
import ConfiguredTabPanel from '@shared/components/ui/dashboard/ConfiguredTabPanel';

export default function MessagingQueueMonitoringPage() {
  return (
    <div>
      <PageHeader
        title="Messaging Queue Monitoring"
        icon={<Radio size={24} />}
        subtitle="Produce/consume rates, consumer lag, rebalancing, latency, and error rates across Kafka topics and consumer groups"
      />
      <ConfiguredTabPanel pageId="saturation" tabId="queue" />
    </div>
  );
}
