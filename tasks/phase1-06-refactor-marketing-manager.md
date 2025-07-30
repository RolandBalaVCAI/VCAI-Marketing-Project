# Phase 1 Task 6: Refactor MarketingManagerV4 to Use Zustand Store

## Objective
Refactor the MarketingManagerV4 component to use the new Zustand stores instead of local React state, implementing proper separation of concerns and one-way data flow.

## Current State
- MarketingManagerV4 manages all state locally with React hooks
- Data generation happens inline within the component
- Complex filtering and sorting logic mixed with UI code
- No separation between data fetching and presentation

## Target State
- Component consumes data from Zustand stores only
- Clean separation between data logic and presentation
- Simplified component focused on UI rendering
- All business logic moved to stores and custom hooks

## Implementation Steps

### 1. Create Custom Hooks
Create `src/hooks/useCampaigns.js`:
- Combine campaign store and filters store
- Provide computed values for filtered/sorted data
- Handle pagination calculations
- Abstract business logic from components

### 2. Create Utility Hooks
Create `src/hooks/useFilters.js`:
- Manage filter state and actions
- Provide filter validation and defaults
- Handle URL synchronization (future enhancement)

### 3. Refactor MarketingManagerV4
Remove all local state and replace with store consumption:
- Remove useState and useEffect hooks
- Replace with store selectors and actions
- Simplify component to focus on rendering
- Extract complex calculations to utilities

### 4. Update Component Structure
Reorganize component for better maintainability:
- Separate concerns into smaller functions
- Extract inline functions to module level
- Improve prop drilling and component hierarchy

## Detailed Implementation

### Custom Hooks (`src/hooks/useCampaigns.js`)
```javascript
import { useEffect, useMemo } from 'react'
import { useCampaignStore } from '../stores/campaignStore'
import { useFiltersStore } from '../stores/filtersStore'
import { applyFilters, applySorting, calculateAggregatedMetrics } from '../utils/calculations'

export const useCampaigns = () => {
  const {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    clearError
  } = useCampaignStore()
  
  const {
    getFilters,
    currentPage,
    itemsPerPage
  } = useFiltersStore()
  
  // Fetch campaigns when filters change
  useEffect(() => {
    const filters = getFilters()
    fetchCampaigns(filters)
  }, [getFilters, fetchCampaigns])
  
  // Apply filters and sorting
  const filteredCampaigns = useMemo(() => {
    const filters = getFilters()
    const filtered = applyFilters(campaigns, filters)
    return applySorting(filtered, filters.sort)
  }, [campaigns, getFilters])
  
  // Calculate pagination
  const paginationData = useMemo(() => {
    const totalCampaigns = filteredCampaigns.length
    const totalPages = Math.ceil(totalCampaigns / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex)
    
    return {
      currentCampaigns,
      totalCampaigns,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    }
  }, [filteredCampaigns, currentPage, itemsPerPage])
  
  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    return calculateAggregatedMetrics(filteredCampaigns)
  }, [filteredCampaigns])
  
  return {
    // Data
    campaigns: filteredCampaigns,
    ...paginationData,
    aggregatedMetrics,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch: () => fetchCampaigns(getFilters()),
    clearError
  }
}

export const useCampaignActions = () => {
  const {
    updateCampaign,
    deleteCampaign,
    selectCampaign
  } = useCampaignStore()
  
  const { setCurrentView } = useUIStore()
  
  const handleCampaignClick = (campaign) => {
    selectCampaign(campaign)
    setCurrentView('detail')
  }
  
  const handleCampaignUpdate = async (id, updates) => {
    try {
      await updateCampaign(id, updates)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  const handleCampaignDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return { success: false, cancelled: true }
    }
    
    try {
      await deleteCampaign(id)
      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }
  
  return {
    handleCampaignClick,
    handleCampaignUpdate,
    handleCampaignDelete
  }
}
```

### Filters Hook (`src/hooks/useFilters.js`)
```javascript
import { useFiltersStore } from '../stores/filtersStore'
import { validateDateRange } from '../utils/dateHelpers'

export const useFilters = () => {
  const store = useFiltersStore()
  
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
  } = store
  
  // Validation helpers
  const isValidDateRange = () => {
    if (dateRange !== 'Custom') return true
    return validateDateRange(customStartDate, customEndDate)
  }
  
  const getActiveFilterCount = () => {
    let count = 0
    if (selectedVendors.length > 0) count++
    if (statusFilter !== 'All') count++
    if (searchTerm.length > 0) count++
    if (dateRange !== 'Last 30 Days') count++
    return count
  }
  
  // Enhanced actions with validation
  const handleDateRangeChange = (range) => {
    setDateRange(range)
    // Clear custom dates when switching away from custom
    if (range !== 'Custom') {
      setCustomDates('', '')
    }
  }
  
  const handleCustomDatesChange = (startDate, endDate) => {
    if (validateDateRange(startDate, endDate)) {
      setCustomDates(startDate, endDate)
    }
  }
  
  const handleSortChange = (key) => {
    const currentDirection = sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    setSort(key, currentDirection)
  }
  
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
  }
}
```

### Refactored MarketingManagerV4 (`src/components/MarketingManagerV4.jsx`)
```javascript
import React from 'react'
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3, Download
} from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

import { useCampaigns, useCampaignActions } from '../hooks/useCampaigns'
import { useFilters } from '../hooks/useFilters'
import { useUIStore } from '../stores/uiStore'
import { useResponsive } from '../hooks/useResponsive'
import { generateRevenueByDayData, generateRevenueByVendorData } from '../utils/chartHelpers'
import { exportToCSV } from '../utils/csvExport'

import CampaignDetail from './CampaignDetail'
import ErrorBoundary from './common/ErrorBoundary'
import LoadingSpinner from './common/LoadingSpinner'
import KPICards from './dashboard/KPICards'
import FilterPanel from './dashboard/FilterPanel'
import CampaignTable from './dashboard/CampaignTable'
import Charts from './dashboard/Charts'

const MarketingManagerV4 = () => {
  // Hooks
  const { 
    currentCampaigns, 
    aggregatedMetrics, 
    isLoading, 
    error,
    totalCampaigns,
    totalPages,
    refetch,
    clearError
  } = useCampaigns()
  
  const filters = useFilters()
  const { handleCampaignClick } = useCampaignActions()
  const { currentView, selectedCampaign, addNotification } = useUIStore()
  const responsive = useResponsive()
  
  // Generate chart data
  const revenueByDayData = generateRevenueByDayData(currentCampaigns, filters.dateRange)
  const revenueByVendorData = generateRevenueByVendorData(currentCampaigns)
  
  // Handlers
  const handleExportCSV = () => {
    try {
      exportToCSV(currentCampaigns, aggregatedMetrics)
      addNotification('Campaign data exported successfully', 'success')
    } catch (error) {
      addNotification('Failed to export data', 'error')
    }
  }
  
  const handleRetry = () => {
    clearError()
    refetch()
  }
  
  // Render campaign detail view if selected
  if (currentView === 'detail' && selectedCampaign) {
    return (
      <ErrorBoundary>
        <CampaignDetail campaign={selectedCampaign} />
      </ErrorBoundary>
    )
  }
  
  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        padding: responsive.getContainerPadding(),
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ maxWidth: responsive.getMaxWidth(), margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: responsive.getHeaderPadding(),
            borderRadius: '8px',
            marginBottom: responsive.getMarginBottom(),
            textAlign: 'center',
            border: '1px solid #e0e0e0'
          }}>
            <h1 style={{
              margin: 0,
              color: '#1a1a1a',
              fontSize: responsive.getFontSize('1.8rem', '2.5rem'),
              fontWeight: '600',
              marginBottom: responsive.getMargin('6px', '8px'),
              letterSpacing: '-0.02em'
            }}>
              ERS Interactive Marketing Manager
            </h1>
          </div>
          
          {/* Error State */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: responsive.getMarginBottom(),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#dc2626' }}>{error}</span>
              <button
                onClick={handleRetry}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {/* Filters */}
          <FilterPanel filters={filters} responsive={responsive} />
          
          {/* Loading State */}
          {isLoading && <LoadingSpinner />}
          
          {/* KPI Cards */}
          <KPICards 
            metrics={aggregatedMetrics} 
            responsive={responsive} 
          />
          
          {/* Charts */}
          <Charts
            revenueByDayData={revenueByDayData}
            revenueByVendorData={revenueByVendorData}
            responsive={responsive}
          />
          
          {/* Campaign Table */}
          <CampaignTable
            campaigns={currentCampaigns}
            totalCampaigns={totalCampaigns}
            totalPages={totalPages}
            onCampaignClick={handleCampaignClick}
            onExportCSV={handleExportCSV}
            filters={filters}
            responsive={responsive}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default MarketingManagerV4
```

### Responsive Hook (`src/hooks/useResponsive.js`)
```javascript
import { useState, useEffect } from 'react'

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  )
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])
  
  return {
    windowWidth,
    isMobile: windowWidth < 768,
    isTablet: windowWidth >= 768 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    
    // Responsive helpers
    getGridColumns: () => windowWidth >= 768 ? 'repeat(3, 1fr)' : windowWidth >= 480 ? 'repeat(2, 1fr)' : '1fr',
    getGap: () => windowWidth >= 768 ? '16px' : '12px',
    getPadding: () => windowWidth >= 768 ? '24px' : '16px',
    getChartHeight: () => windowWidth >= 768 ? '300px' : '250px',
    getFontSize: (mobile, desktop = null) => windowWidth >= 768 ? (desktop || mobile) : mobile,
    getMargin: (mobile, desktop = null) => windowWidth >= 768 ? (desktop || mobile) : mobile,
    getFilterGrid: () => windowWidth >= 768 ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
    getChartGrid: () => windowWidth >= 768 ? 'repeat(auto-fit, minmax(480px, 1fr))' : '1fr',
    getHeaderPadding: () => windowWidth >= 768 ? '32px' : '20px',
    getTableMinWidth: () => windowWidth >= 768 ? 'auto' : '1200px',
    getTableBorder: () => windowWidth >= 768 ? 'none' : '1px solid #e0e0e0',
    getFilterGap: () => windowWidth >= 768 ? '20px' : '16px',
    getMaxWidth: () => {
      if (windowWidth >= 1400) return '1400px'
      if (windowWidth >= 768) return '100%'
      return '100%'
    },
    getContainerPadding: () => {
      if (windowWidth >= 1024) return '16px'
      if (windowWidth >= 768) return '12px'
      return '8px'
    },
    getMarginBottom: () => windowWidth >= 768 ? '24px' : '16px'
  }
}
```

## Testing Criteria
- [ ] Component renders without errors after refactoring
- [ ] All filtering functionality works correctly
- [ ] Sorting and pagination work as expected
- [ ] KPI calculations are accurate
- [ ] Charts display correct data
- [ ] CSV export functionality works
- [ ] Error states display properly
- [ ] Loading states show during data fetching
- [ ] Campaign selection and navigation work
- [ ] Responsive design maintains functionality

## Definition of Done
- MarketingManagerV4 completely refactored to use Zustand stores
- All local state removed in favor of store consumption
- Custom hooks abstract business logic from UI
- Component focused purely on presentation
- Error handling and loading states properly implemented
- All existing functionality preserved
- Code is cleaner and more maintainable
- Responsive behavior maintained

## Files to Create/Modify
- `src/hooks/useCampaigns.js`
- `src/hooks/useFilters.js`
- `src/hooks/useResponsive.js`
- Update `src/components/MarketingManagerV4.jsx`
- Create helper components in `src/components/dashboard/`

## Dependencies
- Completed Phase 1 Task 5 (API Client)
- All Zustand stores implemented

## Estimated Time
6-8 hours