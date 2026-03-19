import { describe, expect, it } from 'vitest';

import {
  buildInterpolatedPath,
  interpolateTemplate,
  interpolateValue,
} from './placeholderInterpolation';

describe('placeholderInterpolation', () => {
  it('interpolates route placeholders in strings', () => {
    expect(
      interpolateTemplate('/saturation/kafka/topics/{topic}', { topic: 'orders' }),
    ).toBe('/saturation/kafka/topics/orders');
  });

  it('interpolates nested query params without changing non-placeholder values', () => {
    expect(
      interpolateValue(
        {
          topic: '{topic}',
          interval: '5m',
          filters: ['{topic}', 'stable'],
        },
        { topic: 'orders' },
      ),
    ).toEqual({
      topic: 'orders',
      interval: '5m',
      filters: ['orders', 'stable'],
    });
  });

  it('returns null when a drilldown route still has unresolved placeholders', () => {
    expect(buildInterpolatedPath('/saturation/kafka/groups/{consumer_group}', {})).toBeNull();
  });
});
