import { useFiltersStore } from '../stores/filtersStore';
import { validateDateRange } from '../utils/dateHelpers';

export const useFilters = () => {
  const store = useFiltersStore();
  
  const {
    selectedVendors,
    dateRange,
    customStartDate,
    customEndDate,
    statusFilter,
    searchTerm,
    sortConfig,
    setVendorFilter,
    setDateRange,
    setCustomDates,
    setStatusFilter,
    setSearchTerm,
    setSort,
    resetFilters
  } = store;
  
  // Validation helpers
  const isValidDateRange = () => {
    if (dateRange !== 'Custom') return true;
    return validateDateRange(customStartDate, customEndDate);
  };
  
  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedVendors.length > 0) count++;
    if (statusFilter !== 'All') count++;
    if (searchTerm.length > 0) count++;
    if (dateRange !== 'Last 30 Days') count++;
    return count;
  };
  
  // Enhanced actions with validation
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    // Clear custom dates when switching away from custom
    if (range !== 'Custom') {
      setCustomDates('', '');
    }
  };
  
  const handleCustomDatesChange = (startDate, endDate) => {
    if (validateDateRange(startDate, endDate)) {
      setCustomDates(startDate, endDate);
    }
  };
  
  const handleSortChange = (key) => {
    const currentDirection = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    setSort(key, currentDirection);
  };
  
  return {
    // State
    selectedVendors,
    dateRange,
    customStartDate,
    customEndDate,
    statusFilter,
    searchTerm,
    sortConfig,
    
    // Computed values
    isValidDateRange: isValidDateRange(),
    activeFilterCount: getActiveFilterCount(),
    
    // Actions
    setVendorFilter,
    handleDateRangeChange,
    handleCustomDatesChange,
    setStatusFilter,
    setSearchTerm,
    handleSortChange,
    resetFilters
  };
};