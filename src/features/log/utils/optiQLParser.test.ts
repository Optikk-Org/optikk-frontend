import { describe, expect, it } from 'vitest';

import { buildOptiQLString, parseOptiQL } from './optiQLParser';

describe('optiQLParser', () => {
  it('parses known include and exclude filters into backend params', () => {
    const { ast, backendParams } = parseOptiQL('service="api" -level:error trace_id=abc');

    expect(ast).toEqual([
      { type: 'key_value', key: 'service', value: 'api', operator: '=' },
      { type: 'key_value', key: 'level', value: 'error', operator: ':' },
      { type: 'key_value', key: 'trace_id', value: 'abc', operator: '=' },
    ]);
    expect(backendParams).toEqual({
      services: ['api'],
      excludeSeverities: ['error'],
      traceId: 'abc',
    });
  });

  it('collects free text and unknown fields without losing them', () => {
    const { ast, backendParams } = parseOptiQL('timeout connected pod=db-1 user_id=42');

    expect(ast).toEqual([
      { type: 'free_text', value: 'timeout' },
      { type: 'free_text', value: 'connected' },
      { type: 'key_value', key: 'pod', value: 'db-1', operator: '=' },
      { type: 'key_value', key: 'user_id', value: '42', operator: '=' },
    ]);
    expect(backendParams).toEqual({
      pods: ['db-1'],
      search: 'timeout connected',
      'attr.user_id': '42',
    });
  });

  it('serializes backend params back into an OptiQL string', () => {
    expect(
      buildOptiQLString({
        search: 'timeout connected',
        services: ['api'],
        excludeHosts: ['db-1'],
        traceId: 'trace-123',
        'attr.user_id': '42',
      }),
    ).toBe('"timeout connected" service="api" -host="db-1" traceId="trace-123" user_id="42"');
  });
});
