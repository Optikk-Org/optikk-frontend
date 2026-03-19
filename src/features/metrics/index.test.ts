import { describe, expect, it } from 'vitest';

import { ROUTES } from '@/shared/constants/routes';

import { metricsConfig } from './index';

describe('metricsConfig', () => {
  it('registers Kafka detail routes without adding them to sidebar navigation', () => {
    expect(metricsConfig.routes.map((route) => route.path)).toEqual(
      expect.arrayContaining([ROUTES.kafkaTopicDetail, ROUTES.kafkaGroupDetail]),
    );
    expect(metricsConfig.navigation.map((item) => item.path)).not.toEqual(
      expect.arrayContaining([ROUTES.kafkaTopicDetail, ROUTES.kafkaGroupDetail]),
    );
  });
});
