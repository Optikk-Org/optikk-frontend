import { useState, useCallback } from 'react';
import { UI_CONFIG } from '@config/constants';

/**
 * Custom hook for managing pagination state
 * Follows DRY principle - eliminates duplicate pagination logic across pages
 * 
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialPageSize - Initial page size (default: from UI_CONFIG)
 * @returns {Object} Pagination state and handlers
 * 
 * @example
 * const { page, pageSize, offset, handlePageChange, resetPagination } = usePagination();
 */
export function usePagination(initialPage = 1, initialPageSize = UI_CONFIG.DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const offset = (page - 1) * pageSize;

  const handlePageChange = useCallback((newPage, newPageSize) => {
    setPage(newPage);
    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      // Reset to page 1 when page size changes
      setPage(1);
    }
  }, [pageSize]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
  }, [initialPage, initialPageSize]);

  return {
    page,
    pageSize,
    offset,
    setPage,
    setPageSize,
    handlePageChange,
    resetPagination,
  };
}

