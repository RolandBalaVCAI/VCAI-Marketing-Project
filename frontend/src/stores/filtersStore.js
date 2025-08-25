import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { createSelector, logStoreState } from './index';

// Initial state
const initialState = {
  // Filter states
  selectedVendors: [],
  dateRange: 'Last 30 Days',
  customStartDate: '',
  customEndDate: '',
  statusFilter: 'All',
  searchTerm: '',
  
  // Pagination
  currentPage: 1,
  itemsPerPage: 10,
  
  // Sorting
  sortConfig: { 
    key: 'metrics.revenue', 
    direction: 'desc' 
  },
  
  // UI state for filters
  showVendorDropdown: false,
  vendorSearchTerm: '',
  isFiltersExpanded: false,
  
  // Filter history for quick access
  recentFilters: [],
  savedFilters: []
};

// Computed selectors with memoization
const createFilterSelectors = () => {
  return {
    // Get active filters count
    getActiveFiltersCount: createSelector((state) => {
      let count = 0;
      if (state.selectedVendors.length > 0) count++;
      if (state.statusFilter !== 'All') count++;
      if (state.dateRange !== 'Last 30 Days') count++;
      if (state.searchTerm.trim().length > 0) count++;
      return count;
    }),
    
    // Check if filters are applied
    hasActiveFilters: createSelector((state) => {
      return state.selectedVendors.length > 0 || 
             state.statusFilter !== 'All' || 
             state.dateRange !== 'Last 30 Days' || 
             state.searchTerm.trim().length > 0;
    }),
    
    // Get filter summary for display
    getFilterSummary: createSelector((state) => {
      const summary = [];
      
      if (state.selectedVendors.length > 0) {
        summary.push(`${state.selectedVendors.length} vendor${state.selectedVendors.length > 1 ? 's' : ''}`);
      }
      
      if (state.statusFilter !== 'All') {
        summary.push(`Status: ${state.statusFilter}`);
      }
      
      if (state.dateRange !== 'Last 30 Days') {
        summary.push(`Date: ${state.dateRange}`);
      }
      
      if (state.searchTerm.trim().length > 0) {
        summary.push(`Search: "${state.searchTerm}"`);
      }
      
      return summary.join(', ');
    }),
    
    // Get pagination info
    getPaginationInfo: createSelector((totalItems) => (state) => {
      const { currentPage, itemsPerPage } = state;
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage + 1;
      const endIndex = Math.min(currentPage * itemsPerPage, totalItems);
      
      return {
        currentPage,
        totalPages,
        itemsPerPage,
        startIndex,
        endIndex,
        totalItems,
        hasNextPage: currentPage < totalPages,
        hasPreviousPage: currentPage > 1
      };
    })
  };
};

// Create filters store with persistence
export const useFiltersStore = create(
  persist(
    devtools(
      (set, get) => {
        const selectors = createFilterSelectors();
        
        return {
          ...initialState,
          ...selectors,
          
          // Vendor filter actions
          setVendorFilter: (vendors) => {
            const vendorArray = Array.isArray(vendors) ? vendors : [vendors];
            set({ 
              selectedVendors: vendorArray,
              currentPage: 1 // Reset to first page when filters change
            }, false, 'SET_VENDOR_FILTER');
          },
          
          addVendorFilter: (vendor) => {
            const { selectedVendors } = get();
            if (!selectedVendors.includes(vendor)) {
              set({ 
                selectedVendors: [...selectedVendors, vendor],
                currentPage: 1
              }, false, 'ADD_VENDOR_FILTER');
            }
          },
          
          removeVendorFilter: (vendor) => {
            const { selectedVendors } = get();
            set({ 
              selectedVendors: selectedVendors.filter(v => v !== vendor),
              currentPage: 1
            }, false, 'REMOVE_VENDOR_FILTER');
          },
          
          toggleVendorFilter: (vendor) => {
            const { selectedVendors } = get();
            if (selectedVendors.includes(vendor)) {
              get().removeVendorFilter(vendor);
            } else {
              get().addVendorFilter(vendor);
            }
          },
          
          // Date range actions
          setDateRange: (range, customStart = '', customEnd = '') => {
            set({ 
              dateRange: range,
              customStartDate: customStart,
              customEndDate: customEnd,
              currentPage: 1
            }, false, 'SET_DATE_RANGE');
          },
          
          setCustomDateRange: (startDate, endDate) => {
            set({ 
              dateRange: 'Custom',
              customStartDate: startDate,
              customEndDate: endDate,
              currentPage: 1
            }, false, 'SET_CUSTOM_DATE_RANGE');
          },
          
          // Status filter actions
          setStatusFilter: (status) => {
            set({ 
              statusFilter: status,
              currentPage: 1
            }, false, 'SET_STATUS_FILTER');
          },
          
          // Search actions
          setSearchTerm: (term) => {
            set({ 
              searchTerm: term,
              currentPage: 1
            }, false, 'SET_SEARCH_TERM');
          },
          
          clearSearch: () => {
            set({ 
              searchTerm: '',
              currentPage: 1
            }, false, 'CLEAR_SEARCH');
          },
          
          // Sorting actions
          setSort: (key, direction = 'desc') => {
            set({ 
              sortConfig: { key, direction },
              currentPage: 1
            }, false, 'SET_SORT');
          },
          
          toggleSort: (key) => {
            const { sortConfig } = get();
            const newDirection = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc';
            get().setSort(key, newDirection);
          },
          
          // Pagination actions
          setCurrentPage: (page) => {
            set({ currentPage: page }, false, 'SET_CURRENT_PAGE');
          },
          
          setItemsPerPage: (itemsPerPage) => {
            set({ 
              itemsPerPage,
              currentPage: 1 // Reset to first page when changing page size
            }, false, 'SET_ITEMS_PER_PAGE');
          },
          
          nextPage: () => {
            const { currentPage } = get();
            set({ currentPage: currentPage + 1 }, false, 'NEXT_PAGE');
          },
          
          previousPage: () => {
            const { currentPage } = get();
            if (currentPage > 1) {
              set({ currentPage: currentPage - 1 }, false, 'PREVIOUS_PAGE');
            }
          },
          
          goToFirstPage: () => {
            set({ currentPage: 1 }, false, 'GO_TO_FIRST_PAGE');
          },
          
          goToLastPage: (totalPages) => {
            set({ currentPage: totalPages }, false, 'GO_TO_LAST_PAGE');
          },
          
          // UI state actions
          toggleVendorDropdown: () => {
            const { showVendorDropdown } = get();
            set({ showVendorDropdown: !showVendorDropdown }, false, 'TOGGLE_VENDOR_DROPDOWN');
          },
          
          setVendorDropdown: (show) => {
            set({ showVendorDropdown: show }, false, 'SET_VENDOR_DROPDOWN');
          },
          
          setVendorSearchTerm: (term) => {
            set({ vendorSearchTerm: term }, false, 'SET_VENDOR_SEARCH_TERM');
          },
          
          toggleFiltersExpanded: () => {
            const { isFiltersExpanded } = get();
            set({ isFiltersExpanded: !isFiltersExpanded }, false, 'TOGGLE_FILTERS_EXPANDED');
          },
          
          // Filter presets and history
          saveCurrentFilter: (name) => {
            const { selectedVendors, dateRange, customStartDate, customEndDate, statusFilter, searchTerm, savedFilters } = get();
            
            const filterPreset = {
              id: Date.now().toString(),
              name,
              selectedVendors,
              dateRange,
              customStartDate,
              customEndDate,
              statusFilter,
              searchTerm,
              createdAt: new Date().toISOString()
            };
            
            const updatedSavedFilters = [...savedFilters, filterPreset];
            set({ savedFilters: updatedSavedFilters }, false, 'SAVE_FILTER_PRESET');
          },
          
          loadFilterPreset: (presetId) => {
            const { savedFilters } = get();
            const preset = savedFilters.find(f => f.id === presetId);
            
            if (preset) {
              set({
                selectedVendors: preset.selectedVendors,
                dateRange: preset.dateRange,
                customStartDate: preset.customStartDate,
                customEndDate: preset.customEndDate,
                statusFilter: preset.statusFilter,
                searchTerm: preset.searchTerm,
                currentPage: 1
              }, false, 'LOAD_FILTER_PRESET');
            }
          },
          
          deleteFilterPreset: (presetId) => {
            const { savedFilters } = get();
            const updatedSavedFilters = savedFilters.filter(f => f.id !== presetId);
            set({ savedFilters: updatedSavedFilters }, false, 'DELETE_FILTER_PRESET');
          },
          
          // Reset actions
          resetFilters: () => {
            set({
              selectedVendors: [],
              dateRange: 'Last 30 Days',
              customStartDate: '',
              customEndDate: '',
              statusFilter: 'All',
              searchTerm: '',
              currentPage: 1
            }, false, 'RESET_FILTERS');
          },
          
          resetPagination: () => {
            set({
              currentPage: 1,
              itemsPerPage: 10
            }, false, 'RESET_PAGINATION');
          },
          
          resetUI: () => {
            set({
              showVendorDropdown: false,
              vendorSearchTerm: '',
              isFiltersExpanded: false
            }, false, 'RESET_UI');
          },
          
          resetAll: () => {
            set(initialState, false, 'RESET_ALL_FILTERS');
          },
          
          // Bulk actions
          applyFilters: (filters) => {
            const {
              selectedVendors = get().selectedVendors,
              dateRange = get().dateRange,
              customStartDate = get().customStartDate,
              customEndDate = get().customEndDate,
              statusFilter = get().statusFilter,
              searchTerm = get().searchTerm,
              sortConfig = get().sortConfig
            } = filters;
            
            set({
              selectedVendors,
              dateRange,
              customStartDate,
              customEndDate,
              statusFilter,
              searchTerm,
              sortConfig,
              currentPage: 1
            }, false, 'APPLY_FILTERS');
          },
          
          // Get current filter state for API calls
          getFiltersForAPI: () => {
            const { 
              selectedVendors, 
              dateRange, 
              customStartDate, 
              customEndDate, 
              statusFilter, 
              searchTerm,
              sortConfig,
              currentPage,
              itemsPerPage 
            } = get();
            
            return {
              vendor: selectedVendors.length > 0 ? selectedVendors : undefined,
              status: statusFilter !== 'All' ? statusFilter : undefined,
              startDate: dateRange === 'Custom' ? customStartDate : undefined,
              endDate: dateRange === 'Custom' ? customEndDate : undefined,
              dateRange: dateRange !== 'Custom' ? dateRange : undefined,
              search: searchTerm.trim() || undefined,
              sortBy: sortConfig.key,
              sortOrder: sortConfig.direction,
              page: currentPage,
              limit: itemsPerPage
            };
          },
          
          // Development helpers
          _debugState: () => {
            const state = get();
            logStoreState('Filters', state);
            return state;
          }
        };
      },
      { 
        name: 'filters-store',
        serialize: true 
      }
    ),
    {
      name: 'marketing-dashboard-filters',
      // Only persist filter preferences, not UI state
      partialize: (state) => ({
        selectedVendors: state.selectedVendors,
        dateRange: state.dateRange,
        customStartDate: state.customStartDate,
        customEndDate: state.customEndDate,
        statusFilter: state.statusFilter,
        itemsPerPage: state.itemsPerPage,
        sortConfig: state.sortConfig,
        savedFilters: state.savedFilters
      })
    }
  )
);

export default useFiltersStore;