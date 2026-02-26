import { useState, useCallback, useMemo } from 'react';

/**
 * Custom hook for managing table sorting state
 * Follows DRY principle - eliminates duplicate sorting logic across pages
 * 
 * @param {Array} data - The data array to sort
 * @param {string} defaultField - Default sort field
 * @param {string} defaultOrder - Default sort order ('ascend' | 'descend')
 * @returns {Object} Sorted data and sort handlers
 * 
 * @example
 * const { sortedData, sortField, sortOrder, handleSort, createSortHandler } = useTableSort(
 *   tableData,
 *   'createdAt',
 *   'descend'
 * );
 */
export function useTableSort(data = [], defaultField = null, defaultOrder = null) {
  const [sortField, setSortField] = useState(defaultField);
  const [sortOrder, setSortOrder] = useState(defaultOrder);

  const handleSort = useCallback((field, order) => {
    setSortField(field);
    setSortOrder(order);
  }, []);

  const toggleSort = useCallback((field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'ascend' ? 'descend' : 'ascend');
    } else {
      setSortField(field);
      setSortOrder('ascend');
    }
  }, [sortField, sortOrder]);

  const resetSort = useCallback(() => {
    setSortField(defaultField);
    setSortOrder(defaultOrder);
  }, [defaultField, defaultOrder]);

  const sortedData = useMemo(() => {
    if (!sortField || !sortOrder || !Array.isArray(data)) {
      return data;
    }

    return [...data].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      // Handle null/undefined values
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      
      // Compare values
      const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      return sortOrder === 'ascend' ? comparison : -comparison;
    });
  }, [data, sortField, sortOrder]);

  /**
   * Creates a sort handler for table column headers
   * @param {string} field - The field to sort by
   * @returns {Object} Column header props
   */
  const createSortHandler = useCallback((field) => ({
    onClick: () => toggleSort(field),
  }), [toggleSort]);

  return {
    sortedData,
    sortField,
    sortOrder,
    handleSort,
    toggleSort,
    resetSort,
    createSortHandler,
  };
}

