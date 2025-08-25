import { useState, useCallback, useMemo } from 'react';

export const usePagination = (data = [], options = {}) => {
  const {
    initialPage = 1,
    initialPageSize = 10,
    pageSizeOptions = [5, 10, 25, 50, 100],
    onPageChange,
    onPageSizeChange
  } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  
  // Calculate pagination values
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  
  // Get current page data
  const paginatedData = useMemo(() => {
    return data.slice(startIndex, endIndex);
  }, [data, startIndex, endIndex]);
  
  // Navigation helpers
  const canGoNext = currentPage < totalPages;
  const canGoPrevious = currentPage > 1;
  const hasPreviousPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  
  // Page range for pagination controls
  const pageRange = useMemo(() => {
    const range = [];
    const maxPagesToShow = 5;
    const sidePages = Math.floor(maxPagesToShow / 2);
    
    let startPage = Math.max(1, currentPage - sidePages);
    let endPage = Math.min(totalPages, currentPage + sidePages);
    
    // Adjust if we're near the beginning or end
    if (endPage - startPage + 1 < maxPagesToShow) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }
    }
    
    for (let i = startPage; i <= endPage; i++) {
      range.push(i);
    }
    
    return range;
  }, [currentPage, totalPages]);
  
  // Go to specific page
  const goToPage = useCallback((page) => {
    const newPage = Math.max(1, Math.min(page, totalPages));
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
      onPageChange?.(newPage);
    }
  }, [currentPage, totalPages, onPageChange]);
  
  // Go to next page
  const goToNext = useCallback(() => {
    if (canGoNext) {
      goToPage(currentPage + 1);
    }
  }, [canGoNext, currentPage, goToPage]);
  
  // Go to previous page
  const goToPrevious = useCallback(() => {
    if (canGoPrevious) {
      goToPage(currentPage - 1);
    }
  }, [canGoPrevious, currentPage, goToPage]);
  
  // Go to first page
  const goToFirst = useCallback(() => {
    goToPage(1);
  }, [goToPage]);
  
  // Go to last page
  const goToLast = useCallback(() => {
    goToPage(totalPages);
  }, [goToPage, totalPages]);
  
  // Change page size
  const changePageSize = useCallback((newPageSize) => {
    if (newPageSize !== pageSize) {
      setPageSize(newPageSize);
      
      // Adjust current page to maintain data continuity
      const newTotalPages = Math.ceil(totalItems / newPageSize);
      const newCurrentPage = Math.min(currentPage, newTotalPages || 1);
      
      if (newCurrentPage !== currentPage) {
        setCurrentPage(newCurrentPage);
        onPageChange?.(newCurrentPage);
      }
      
      onPageSizeChange?.(newPageSize);
    }
  }, [pageSize, totalItems, currentPage, onPageChange, onPageSizeChange]);
  
  // Jump to page containing specific item index
  const jumpToItem = useCallback((itemIndex) => {
    const targetPage = Math.ceil((itemIndex + 1) / pageSize);
    goToPage(targetPage);
  }, [pageSize, goToPage]);
  
  // Get page info for item at index
  const getPageForItem = useCallback((itemIndex) => {
    return Math.ceil((itemIndex + 1) / pageSize);
  }, [pageSize]);
  
  // Reset pagination
  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSize(initialPageSize);
    onPageChange?.(initialPage);
    onPageSizeChange?.(initialPageSize);
  }, [initialPage, initialPageSize, onPageChange, onPageSizeChange]);
  
  // Get pagination summary text
  const getSummaryText = useCallback(() => {
    if (totalItems === 0) {
      return 'No items to display';
    }
    
    const start = startIndex + 1;
    const end = endIndex;
    
    return `Showing ${start}-${end} of ${totalItems} items`;
  }, [startIndex, endIndex, totalItems]);
  
  // Get current page info
  const pageInfo = useMemo(() => ({
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex: startIndex + 1,
    endIndex,
    itemsOnCurrentPage: paginatedData.length,
    hasItems: totalItems > 0,
    isEmpty: totalItems === 0,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages,
    summaryText: getSummaryText()
  }), [
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    paginatedData.length,
    getSummaryText
  ]);
  
  // Navigation controls data
  const navigationControls = useMemo(() => ({
    canGoFirst: currentPage > 1,
    canGoPrevious,
    canGoNext,
    canGoLast: currentPage < totalPages,
    pageRange,
    isPageActive: (page) => page === currentPage
  }), [currentPage, totalPages, canGoPrevious, canGoNext, pageRange]);
  
  // Page size controls
  const pageSizeControls = useMemo(() => ({
    options: pageSizeOptions,
    current: pageSize,
    isOptionSelected: (size) => size === pageSize
  }), [pageSizeOptions, pageSize]);
  
  return {
    // Current data
    data: paginatedData,
    
    // Page information
    ...pageInfo,
    
    // Navigation
    goToPage,
    goToNext,
    goToPrevious,
    goToFirst,
    goToLast,
    jumpToItem,
    
    // Page size
    changePageSize,
    
    // Utilities
    getPageForItem,
    reset,
    
    // Navigation state
    ...navigationControls,
    
    // Page size state
    ...pageSizeControls,
    
    // Legacy compatibility
    hasPreviousPage,
    hasNextPage
  };
};