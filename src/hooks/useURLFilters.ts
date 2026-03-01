import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/* ─── Types ──────────────────────────────────────────────────────────────── */

/** A structured filter chip from ObservabilityQueryBar */
export interface StructuredFilter {
  field: string;
  operator: string;
  value: string;
}

/** Configuration for a single URL-synced filter parameter */
export interface URLFilterParam {
  /** URL search-param key (e.g. "service", "search") */
  key: string;
  /** How to parse / serialise the value */
  type: 'string' | 'string[]' | 'number' | 'boolean';
  /** Default value when the param is absent from the URL */
  defaultValue?: any;
}

/** Configuration for syncing the ObservabilityQueryBar structured filters */
export interface URLFilterConfig {
  /** Simple key-value params to sync */
  params: URLFilterParam[];
  /**
   * If true the hook will also sync the structured `filters` array
   * (field:operator:value chips) via a `filters` search param.
   */
  syncStructuredFilters?: boolean;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */

function parseParamValue(raw: string | null, type: URLFilterParam['type'], defaultValue: any): any {
  if (raw === null || raw === undefined) return defaultValue;
  switch (type) {
    case 'string':
      return raw;
    case 'string[]':
      return raw ? raw.split(',').filter(Boolean) : defaultValue ?? [];
    case 'number': {
      const n = Number(raw);
      return Number.isFinite(n) ? n : defaultValue ?? 0;
    }
    case 'boolean':
      return raw === 'true' || raw === '1';
    default:
      return raw;
  }
}

function serialiseParamValue(value: any, type: URLFilterParam['type']): string | null {
  if (value === null || value === undefined) return null;
  switch (type) {
    case 'string':
      return value || null;
    case 'string[]':
      return Array.isArray(value) && value.length > 0 ? value.join(',') : null;
    case 'number':
      return value !== 0 ? String(value) : null;
    case 'boolean':
      return value ? 'true' : null;
    default:
      return value ? String(value) : null;
  }
}

/**
 * Encode an array of StructuredFilter objects into a compact URL string.
 * Format: field:operator:value separated by semicolons.
 * Values are URI-encoded so colons / semicolons inside values are safe.
 */
function encodeStructuredFilters(filters: StructuredFilter[]): string | null {
  if (!filters || filters.length === 0) return null;
  return filters
    .map((f) => `${f.field}:${f.operator}:${encodeURIComponent(f.value)}`)
    .join(';');
}

function decodeStructuredFilters(raw: string | null): StructuredFilter[] {
  if (!raw) return [];
  return raw.split(';').map((chunk) => {
    const [field, operator, ...rest] = chunk.split(':');
    return { field, operator, value: decodeURIComponent(rest.join(':')) };
  }).filter((f) => f.field && f.operator);
}

/* ─── Hook ───────────────────────────────────────────────────────────────── */

/**
 * useURLFilters — syncs filter state to/from URL search params.
 *
 * Returns a `[values, setters]` style API:
 *  - `values`  — an object keyed by each param's `key`, with the current value
 *  - `setters` — an object keyed by `set<Key>` (camelCase), each a setState-style setter
 *  - `structuredFilters` / `setStructuredFilters` — for the ObservabilityQueryBar chips
 *  - `clearAll` — resets every param to its default and clears the URL
 *
 * URL updates are debounced by 300 ms so rapid typing does not spam the
 * browser history.
 */
export function useURLFilters(config: URLFilterConfig) {
  const [searchParams, setSearchParams] = useSearchParams();

  /* ── Parse initial values from URL ── */
  const initialValues = useMemo(() => {
    const vals: Record<string, any> = {};
    for (const p of config.params) {
      vals[p.key] = parseParamValue(searchParams.get(p.key), p.type, p.defaultValue ?? getTypeDefault(p.type));
    }
    return vals;
  // Only run on mount — subsequent URL changes are handled by the effect below
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [values, setValues] = useState<Record<string, any>>(initialValues);

  /* ── Parse structured filters from URL ── */
  const initialStructured = useMemo(() => {
    if (!config.syncStructuredFilters) return [];
    return decodeStructuredFilters(searchParams.get('filters'));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [structuredFilters, setStructuredFilters] = useState<StructuredFilter[]>(initialStructured);

  /* ── Debounced URL write-back ── */
  const pendingRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const flushToURL = useCallback(
    (nextValues: Record<string, any>, nextFilters: StructuredFilter[]) => {
      if (pendingRef.current) clearTimeout(pendingRef.current);

      pendingRef.current = setTimeout(() => {
        const next = new URLSearchParams();

        // Preserve any params we do NOT manage (e.g. `tab` from metrics)
        searchParams.forEach((v, k) => {
          const managed = config.params.some((p) => p.key === k) || k === 'filters';
          if (!managed) next.set(k, v);
        });

        // Set managed params
        for (const p of config.params) {
          const serialised = serialiseParamValue(nextValues[p.key], p.type);
          if (serialised !== null) {
            next.set(p.key, serialised);
          }
        }

        // Set structured filters
        if (config.syncStructuredFilters) {
          const encoded = encodeStructuredFilters(nextFilters);
          if (encoded) next.set('filters', encoded);
        }

        setSearchParams(next, { replace: true });
      }, 300);
    },
    // searchParams is intentionally read fresh inside the timeout
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [config.params, config.syncStructuredFilters, setSearchParams]
  );

  /* ── Sync state -> URL whenever values or structured filters change ── */
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Skip the first render — values already came from the URL
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    flushToURL(values, structuredFilters);
  }, [values, structuredFilters, flushToURL]);

  /* ── Cleanup pending timeout on unmount ── */
  useEffect(() => {
    return () => {
      if (pendingRef.current) clearTimeout(pendingRef.current);
    };
  }, []);

  /* ── Individual setters (set<Key>) ── */
  const setters = useMemo(() => {
    const s: Record<string, (v: any) => void> = {};
    for (const p of config.params) {
      s[p.key] = (v: any) => {
        setValues((prev) => ({ ...prev, [p.key]: typeof v === 'function' ? v(prev[p.key]) : v }));
      };
    }
    return s;
  }, [config.params]);

  /* ── clearAll ── */
  const clearAll = useCallback(() => {
    const defaults: Record<string, any> = {};
    for (const p of config.params) {
      defaults[p.key] = p.defaultValue ?? getTypeDefault(p.type);
    }
    setValues(defaults);
    setStructuredFilters([]);
  }, [config.params]);

  return {
    values,
    setters,
    structuredFilters,
    setStructuredFilters,
    clearAll,
  };
}

/* ── Sensible default per type ── */
function getTypeDefault(type: URLFilterParam['type']): any {
  switch (type) {
    case 'string': return '';
    case 'string[]': return [];
    case 'number': return 0;
    case 'boolean': return false;
    default: return '';
  }
}
