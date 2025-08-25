import React, { memo, useMemo, useCallback, lazy, Suspense } from 'react';
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3, Download
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

import { useCampaigns, useCampaignActions } from '../hooks/useCampaigns';
import { useFilters } from '../hooks/useFilters';
import { useUIStore } from '../stores/uiStore';
import { useResponsive } from '../hooks/useResponsive';
import { generateRevenueByDayData, generateRevenueByVendorData } from '../utils/chartHelpers';
import { exportToCSV } from '../utils/csvExport';
import { formatCurrency } from '../utils/calculations';

import { ErrorBoundary, AsyncErrorBoundary } from './common';
import MemoizedKPICards from './optimized/MemoizedKPICards';
import VirtualizedCampaignTable from './optimized/VirtualizedCampaignTable';
import PerformanceMonitor, { usePerformanceProfiler } from './optimized/PerformanceMonitor';

// Lazy load heavy components
const CampaignDetail = lazy(() => import('./CampaignDetail'));

const MarketingManagerV4 = memo(() => {
  // Performance profiling
  usePerformanceProfiler('MarketingManagerV4');
  
  // Hooks
  const { 
    currentCampaigns, 
    aggregatedMetrics, 
    isLoading, 
    error,
    totalCampaigns,
    refetch,
    clearError
  } = useCampaigns();
  
  const filters = useFilters();
  const { handleCampaignClick } = useCampaignActions();
  const { currentView, selectedCampaign, addNotification } = useUIStore();
  const responsive = useResponsive();
  
  // Memoize chart data generation
  const revenueByDayData = useMemo(() => 
    generateRevenueByDayData(currentCampaigns, filters.dateRange),
    [currentCampaigns, filters.dateRange]
  );
  
  const revenueByVendorData = useMemo(() => 
    generateRevenueByVendorData(currentCampaigns),
    [currentCampaigns]
  );
  
  // Memoized handlers
  const handleExportCSV = useCallback(() => {
    try {
      exportToCSV(currentCampaigns, aggregatedMetrics);
      addNotification('Campaign data exported successfully', 'success');
    } catch (exportError) {
      addNotification('Failed to export data', 'error');
    }
  }, [currentCampaigns, aggregatedMetrics, addNotification]);
  
  const handleRetry = useCallback(() => {
    clearError();
    refetch();
  }, [clearError, refetch]);
  
  // Render campaign detail view if selected
  if (currentView === 'detail' && selectedCampaign) {
    return (
      <ErrorBoundary 
        level="page" 
        name="CampaignDetail"
        customMessage="Unable to load campaign details"
        onRetry={() => {
          // Refresh campaign data on retry
          refetch();
        }}
        onNavigateHome={() => useUIStore.getState().setCurrentView('dashboard')}
      >
        <Suspense fallback={<LoadingSpinner />}>
          <CampaignDetail campaign={selectedCampaign} />
        </Suspense>
      </ErrorBoundary>
    );
  }
  
  return (
    <ErrorBoundary 
      level="page" 
      name="Dashboard"
      customMessage="Unable to load marketing dashboard"
      onRetry={() => {
        // Refresh all data on retry
        clearError();
        fetchCampaigns();
      }}
      allowNavigation={false}
    >
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
          <ErrorBoundary
            level="component"
            name="KPICards"
            customMessage="Unable to load KPI cards"
            allowNavigation={false}
            allowReset={false}
          >
            <MemoizedKPICards 
              metrics={aggregatedMetrics} 
              responsive={responsive} 
            />
          </ErrorBoundary>
          
          {/* Charts */}
          <Charts
            revenueByDayData={revenueByDayData}
            revenueByVendorData={revenueByVendorData}
            responsive={responsive}
          />
          
          {/* Campaign Table */}
          <AsyncErrorBoundary
            onRetry={() => {
              // Retry fetching campaigns on async errors
              clearError();
              fetchCampaigns();
            }}
          >
            <ErrorBoundary
              level="component"
              name="CampaignTable"
              customMessage="Unable to load campaign table"
              allowNavigation={false}
              allowReset={false}
            >
              <VirtualizedCampaignTable
                campaigns={currentCampaigns}
                totalCampaigns={totalCampaigns}
                onCampaignClick={handleCampaignClick}
                onExportCSV={handleExportCSV}
                responsive={responsive}
              />
            </ErrorBoundary>
          </AsyncErrorBoundary>
        </div>
        
        {/* Performance Monitor (development only) */}
        {typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && (
          <PerformanceMonitor 
            enabled={true}
            showMetrics={false} // Set to true to show metrics overlay
          />
        )}
      </div>
    </ErrorBoundary>
  );
});

// Loading Spinner Component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    marginBottom: '24px',
    border: '1px solid #e0e0e0'
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #0066cc',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite'
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Memoized Filter Panel Component
const FilterPanel = memo(({ filters, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getMarginBottom(),
    border: '1px solid #e0e0e0'
  }}>
    <h3 style={{ margin: '0 0 16px 0', color: '#1a1a1a', fontWeight: '600' }}>
      <Filter size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
      Filters {filters.activeFilterCount > 0 && (
        <span style={{
          backgroundColor: '#0066cc',
          color: '#ffffff',
          padding: '2px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          marginLeft: '8px'
        }}>
          {filters.activeFilterCount}
        </span>
      )}
    </h3>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: responsive.getFilterGrid(),
      gap: responsive.getFilterGap()
    }}>
      {/* Vendor Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Vendor
        </label>
        <select
          multiple
          value={filters.selectedVendors}
          onChange={(e) => {
            const values = Array.from(e.target.selectedOptions, option => option.value);
            filters.setVendorFilter(values);
          }}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px',
            minHeight: '80px'
          }}
        >
          <option value="AdTech Solutions">AdTech Solutions</option>
          <option value="MediaBuy Pro">MediaBuy Pro</option>
          <option value="Email Dynamics">Email Dynamics</option>
          <option value="SearchMax">SearchMax</option>
          <option value="Partner Network">Partner Network</option>
          <option value="Display Central">Display Central</option>
          <option value="Social Media Hub">Social Media Hub</option>
        </select>
      </div>
      
      {/* Status Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Status
        </label>
        <select
          value={filters.statusFilter}
          onChange={(e) => filters.setStatusFilter(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="All">All Statuses</option>
          <option value="Live">Live</option>
          <option value="Paused">Paused</option>
          <option value="Ended">Ended</option>
        </select>
      </div>
      
      {/* Date Range Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Date Range
        </label>
        <select
          value={filters.dateRange}
          onChange={(e) => filters.handleDateRangeChange(e.target.value)}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="Last 7 Days">Last 7 Days</option>
          <option value="Last 30 Days">Last 30 Days</option>
          <option value="Last 90 Days">Last 90 Days</option>
          <option value="Custom">Custom Range</option>
        </select>
      </div>
      
      {/* Search Filter */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Search
        </label>
        <input
          type="text"
          value={filters.searchTerm}
          onChange={(e) => filters.setSearchTerm(e.target.value)}
          placeholder="Search campaigns, managers..."
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
      </div>
    </div>
    
    {/* Custom Date Inputs */}
    {filters.dateRange === 'Custom' && (
      <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
            Start Date
          </label>
          <input
            type="date"
            value={filters.customStartDate}
            onChange={(e) => filters.handleCustomDatesChange(e.target.value, filters.customEndDate)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
            End Date
          </label>
          <input
            type="date"
            value={filters.customEndDate}
            onChange={(e) => filters.handleCustomDatesChange(filters.customStartDate, e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>
    )}
    
    {/* Reset Filters Button */}
    {filters.activeFilterCount > 0 && (
      <div style={{ marginTop: '16px' }}>
        <button
          onClick={filters.resetFilters}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Reset Filters
        </button>
      </div>
    )}
  </div>
));

FilterPanel.displayName = 'FilterPanel';


// Memoized Charts Component
const Charts = memo(({ revenueByDayData, revenueByVendorData, responsive }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: responsive.getChartGrid(),
    gap: responsive.getGap(),
    marginBottom: responsive.getMarginBottom()
  }}>
    <ErrorBoundary
      level="component"
      name="RevenueChart"
      customMessage="Unable to load revenue chart"
      allowNavigation={false}
      allowReset={false}
    >
      <div style={{
        backgroundColor: '#ffffff',
        padding: responsive.getPadding(),
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1a1a1a', fontWeight: '600' }}>
          Revenue Trend
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={revenueByDayData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Line type="monotone" dataKey="revenue" stroke="#0066cc" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ErrorBoundary>
    
    <ErrorBoundary
      level="component"
      name="VendorChart"
      customMessage="Unable to load vendor chart"
      allowNavigation={false}
      allowReset={false}
    >
      <div style={{
        backgroundColor: '#ffffff',
        padding: responsive.getPadding(),
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }}>
        <h3 style={{ margin: '0 0 16px 0', color: '#1a1a1a', fontWeight: '600' }}>
          Revenue by Vendor
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={revenueByVendorData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="vendor" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Bar dataKey="revenue" fill="#0066cc" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ErrorBoundary>
  </div>
));

Charts.displayName = 'Charts';

MarketingManagerV4.displayName = 'MarketingManagerV4';
export default MarketingManagerV4;