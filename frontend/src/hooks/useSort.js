import { useState, useCallback, useMemo } from 'react';

export const useSort = (data = [], options = {}) => {
  const {
    initialSortField = null,
    initialSortDirection = 'asc',
    multiSort = false,
    onSortChange
  } = options;
  
  const [sortConfig, setSortConfig] = useState({
    field: initialSortField,
    direction: initialSortDirection
  });
  
  const [sortStack, setSortStack] = useState([]);
  
  // Get nested value from object
  const getNestedValue = useCallback((obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }, []);
  
  // Compare values for sorting
  const compareValues = useCallback((a, b, direction = 'asc') => {
    // Handle null/undefined values
    if (a === null || a === undefined) return direction === 'asc' ? -1 : 1;
    if (b === null || b === undefined) return direction === 'asc' ? 1 : -1;
    
    // Handle numbers
    if (typeof a === 'number' && typeof b === 'number') {
      return direction === 'asc' ? a - b : b - a;
    }
    
    // Handle dates
    if (a instanceof Date && b instanceof Date) {
      return direction === 'asc' ? a - b : b - a;
    }
    
    // Handle strings (case-insensitive)
    const aStr = String(a).toLowerCase();
    const bStr = String(b).toLowerCase();
    
    if (aStr < bStr) return direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return direction === 'asc' ? 1 : -1;
    return 0;
  }, []);
  
  // Single field sort
  const sortByField = useCallback((field, direction = 'asc') => {
    const newSortConfig = { field, direction };
    setSortConfig(newSortConfig);
    onSortChange?.(newSortConfig);
  }, [onSortChange]);
  
  // Toggle sort direction for field
  const toggleSort = useCallback((field) => {
    let newDirection = 'asc';
    
    if (sortConfig.field === field) {
      // If same field, toggle direction
      newDirection = sortConfig.direction === 'asc' ? 'desc' : 'asc';
    }
    
    sortByField(field, newDirection);
  }, [sortConfig, sortByField]);
  
  // Clear sort
  const clearSort = useCallback(() => {
    const newSortConfig = { field: null, direction: 'asc' };
    setSortConfig(newSortConfig);
    setSortStack([]);
    onSortChange?.(newSortConfig);
  }, [onSortChange]);
  
  // Multi-sort functionality
  const addSort = useCallback((field, direction = 'asc') => {
    if (!multiSort) {
      sortByField(field, direction);
      return;
    }
    
    setSortStack(prev => {
      // Remove existing sort for this field
      const filtered = prev.filter(sort => sort.field !== field);
      // Add new sort to the end
      const newStack = [...filtered, { field, direction }];
      onSortChange?.(newStack);
      return newStack;
    });
  }, [multiSort, sortByField, onSortChange]);
  
  // Remove field from multi-sort
  const removeSort = useCallback((field) => {
    if (!multiSort) return;
    
    setSortStack(prev => {
      const newStack = prev.filter(sort => sort.field !== field);
      onSortChange?.(newStack);
      return newStack;
    });
  }, [multiSort, onSortChange]);
  
  // Apply sorting to data
  const sortedData = useMemo(() => {
    if (!data.length) return data;
    
    return [...data].sort((a, b) => {
      // Multi-sort logic
      if (multiSort && sortStack.length > 0) {
        for (const { field, direction } of sortStack) {
          const aValue = getNestedValue(a, field);
          const bValue = getNestedValue(b, field);
          const comparison = compareValues(aValue, bValue, direction);
          
          if (comparison !== 0) return comparison;
        }
        return 0;
      }
      
      // Single sort logic
      if (!sortConfig.field) return 0;
      
      const aValue = getNestedValue(a, sortConfig.field);
      const bValue = getNestedValue(b, sortConfig.field);
      
      return compareValues(aValue, bValue, sortConfig.direction);
    });
  }, [data, sortConfig, sortStack, multiSort, getNestedValue, compareValues]);
  
  // Get sort state for a field
  const getSortState = useCallback((field) => {
    if (multiSort) {
      const sortIndex = sortStack.findIndex(sort => sort.field === field);
      if (sortIndex === -1) {
        return { active: false, direction: null, index: null };
      }
      return {
        active: true,
        direction: sortStack[sortIndex].direction,
        index: sortIndex + 1
      };
    }
    
    return {
      active: sortConfig.field === field,
      direction: sortConfig.field === field ? sortConfig.direction : null,
      index: null
    };
  }, [sortConfig, sortStack, multiSort]);
  
  // Check if field is sorted
  const isSorted = useCallback((field) => {
    if (multiSort) {
      return sortStack.some(sort => sort.field === field);
    }
    return sortConfig.field === field;
  }, [sortConfig, sortStack, multiSort]);
  
  // Get sort direction for field
  const getSortDirection = useCallback((field) => {
    if (multiSort) {
      const sort = sortStack.find(sort => sort.field === field);
      return sort?.direction || null;
    }
    return sortConfig.field === field ? sortConfig.direction : null;
  }, [sortConfig, sortStack, multiSort]);
  
  // Predefined sort functions
  const sortFunctions = useMemo(() => ({
    // Sort by name alphabetically
    byName: (direction = 'asc') => sortByField('name', direction),
    
    // Sort by date
    byDate: (field = 'startDate', direction = 'desc') => sortByField(field, direction),
    
    // Sort by status
    byStatus: (direction = 'asc') => sortByField('status', direction),
    
    // Sort by vendor
    byVendor: (direction = 'asc') => sortByField('vendor', direction),
    
    // Sort by revenue (descending by default)
    byRevenue: (direction = 'desc') => sortByField('metrics.revenue', direction),
    
    // Sort by cost (descending by default)
    byCost: (direction = 'desc') => sortByField('metrics.cost', direction),
    
    // Sort by ROAS (descending by default)
    byROAS: (direction = 'desc') => sortByField('metrics.roas', direction),
    
    // Sort by conversion rate
    byConversionRate: (direction = 'desc') => sortByField('metrics.conversionRate', direction),
    
    // Custom sort with comparator function
    custom: (comparatorFn) => {
      return [...data].sort(comparatorFn);
    }
  }), [data, sortByField]);
  
  // Sort statistics
  const sortStats = useMemo(() => ({
    isActive: multiSort ? sortStack.length > 0 : sortConfig.field !== null,
    fieldCount: multiSort ? sortStack.length : (sortConfig.field ? 1 : 0),
    activeSorts: multiSort ? sortStack : (sortConfig.field ? [sortConfig] : [])
  }), [sortConfig, sortStack, multiSort]);
  
  return {
    // Sorted data
    data: sortedData,
    originalData: data,
    
    // Sort configuration
    sortConfig,
    sortStack: multiSort ? sortStack : [],
    
    // Actions
    sortByField,
    toggleSort,
    clearSort,
    
    // Multi-sort actions
    addSort,
    removeSort,
    
    // Utilities
    getSortState,
    isSorted,
    getSortDirection,
    
    // Predefined sorts
    sortFunctions,
    
    // Statistics
    ...sortStats,
    
    // Configuration
    multiSort
  };
};