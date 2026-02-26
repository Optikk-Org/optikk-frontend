import { useState, useCallback } from 'react';

/**
 * Custom hook for managing filter state
 * Follows DRY principle - eliminates duplicate filter logic across pages
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and handlers
 * 
 * @example
 * const { filters, setFilter, resetFilters, clearFilter } = useFilters({
 *   status: null,
 *   service: null,
 *   search: ''
 * });
 */
export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const setMultipleFilters = useCallback((updates) => {
    setFilters(prev => ({ ...prev, ...updates }));
  }, []);

  const clearFilter = useCallback((key) => {
    setFilters(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilter,
    setMultipleFilters,
    clearFilter,
    resetFilters,
  };
}

