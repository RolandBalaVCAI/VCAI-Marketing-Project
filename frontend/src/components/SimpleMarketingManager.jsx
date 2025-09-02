import React, { useEffect, useMemo, useState } from 'react';
import { 
  MousePointer, DollarSign, Users, ShoppingCart, TrendingUp, BarChart3,
  Filter, X, ChevronUp, ChevronDown, Search, Download
} from 'lucide-react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';
import { useUIStore } from '../stores/uiStore';
import { getDateRangeForFilter, isCampaignInDateRange } from '../utils/dateHelpers';
import { exportToCSV } from '../utils/csvExport';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ErrorBoundary from './common/ErrorBoundary';
import LoadingSpinner from './common/LoadingSpinner';
import { KPICardsSkeleton, CampaignTableSkeleton } from './common/skeletons';
import { usePerformanceProfiler, PerformanceMonitor } from '../hooks/usePerformanceProfiler.jsx';
import { useResponsive } from '../hooks/useResponsive';
import { useToast, ToastContainer } from './common/Toast';
import CampaignDetail from './CampaignDetail';

const SimpleMarketingManager = () => {
  const { campaigns, isLoading, error, fetchCampaigns, selectedCampaign, selectCampaign, addCampaign } = useCampaignsStore();
  
  // Performance monitoring (temporarily disabled to fix re-render loop)
  // const performanceMetrics = usePerformanceProfiler('SimpleMarketingManager');
  
  // Responsive design system
  const responsive = useResponsive();
  
  // Toast notifications
  const toast = useToast();
  const { 
    searchTerm, statusFilter, selectedVendors, setSearchTerm, setStatusFilter,
    dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate,
    showVendorDropdown, vendorSearchTerm, setVendorDropdown, setVendorSearchTerm,
    toggleVendorFilter, setVendorFilter, resetFilters, hasActiveFilters, getFilterSummary
  } = useFiltersStore();
  const { currentView, setCurrentView } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Get unique vendors from campaigns
  const allVendors = useMemo(() => {
    return [...new Set(campaigns.map(c => c.vendor))].sort();
  }, [campaigns]);
  
  // Filter vendors based on search term
  const filteredVendors = useMemo(() => {
    if (!vendorSearchTerm) return allVendors;
    return allVendors.filter(vendor => 
      vendor.toLowerCase().includes(vendorSearchTerm.toLowerCase())
    );
  }, [allVendors, vendorSearchTerm]);
  
  useEffect(() => {
    if (campaigns.length === 0 && !isLoading) {
      console.log('🔄 Loading campaigns...');
      fetchCampaigns().catch(err => console.error('Dashboard error:', err));
    }
  }, []);
  
  // Advanced filtering with date range and sorting
  const filteredCampaigns = useMemo(() => {
    let filtered = campaigns.filter(campaign => {
      const matchesSearch = !searchTerm || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
      const matchesVendor = selectedVendors.length === 0 || selectedVendors.includes(campaign.vendor);
      
      // Date range filtering
      const { start: startDate, end: endDate } = getDateRangeForFilter(dateRange, customStartDate, customEndDate);
      const matchesDateRange = isCampaignInDateRange(campaign, startDate, endDate);
      
      return matchesSearch && matchesStatus && matchesVendor && matchesDateRange;
    });

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        if (sortConfig.key === 'cpcRaw') {
          aValue = parseFloat(calculateCPCRaw(a.metrics?.cost || 0, a.metrics?.rawClicks || 0));
          bValue = parseFloat(calculateCPCRaw(b.metrics?.cost || 0, b.metrics?.rawClicks || 0));
        } else if (sortConfig.key === 'cpcUnique') {
          aValue = parseFloat(calculateCPCUnique(a.metrics?.cost || 0, a.metrics?.uniqueClicks || 0));
          bValue = parseFloat(calculateCPCUnique(b.metrics?.cost || 0, b.metrics?.uniqueClicks || 0));
        } else if (sortConfig.key === 'cprRaw') {
          aValue = parseFloat(calculateCPRRaw(a.metrics?.cost || 0, a.metrics?.rawReg || 0));
          bValue = parseFloat(calculateCPRRaw(b.metrics?.cost || 0, b.metrics?.rawReg || 0));
        } else if (sortConfig.key === 'cprConfirm') {
          aValue = parseFloat(calculateCPRConfirm(a.metrics?.cost || 0, a.metrics?.confirmReg || 0));
          bValue = parseFloat(calculateCPRConfirm(b.metrics?.cost || 0, b.metrics?.confirmReg || 0));
        } else if (sortConfig.key === 'cps') {
          aValue = parseFloat(calculateCPS(a.metrics?.cost || 0, a.metrics?.sales || 0));
          bValue = parseFloat(calculateCPS(b.metrics?.cost || 0, b.metrics?.sales || 0));
        } else if (sortConfig.key === 'revPerSale') {
          aValue = parseFloat(calculateRevPerSale(a.metrics?.revenue || 0, a.metrics?.sales || 0));
          bValue = parseFloat(calculateRevPerSale(b.metrics?.revenue || 0, b.metrics?.sales || 0));
        } else if (sortConfig.key === 'roas') {
          aValue = parseFloat(calculateROAS(a.metrics?.revenue || 0, a.metrics?.cost || 0));
          bValue = parseFloat(calculateROAS(b.metrics?.revenue || 0, b.metrics?.cost || 0));
        } else if (sortConfig.key in (a.metrics || {})) {
          aValue = a.metrics[sortConfig.key] || 0;
          bValue = b.metrics[sortConfig.key] || 0;
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [campaigns, searchTerm, statusFilter, selectedVendors, dateRange, customStartDate, customEndDate, sortConfig]);
  
  // Enhanced aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
    const totalCost = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0);
    const totalRawClicks = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.rawClicks || 0), 0);
    const totalUniqueClicks = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.uniqueClicks || 0), 0);
    const totalRawReg = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.rawReg || 0), 0);
    const totalConfirmReg = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.confirmReg || 0), 0);
    const totalSales = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.sales || 0), 0);
    const totalLTRev = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.ltrev || 0), 0);
    const totalROAS = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 10000) / 100 : 0;
    const overallROI = totalCost > 0 ? Math.round(((totalRevenue - totalCost) / totalCost) * 100) : 0;
    
    return {
      totalRevenue,
      totalCost,
      totalRawClicks,
      totalUniqueClicks,
      totalRawReg,
      totalConfirmReg,
      totalSales,
      totalLTRev,
      totalROAS,
      overallROI
    };
  }, [filteredCampaigns]);

  // Advanced calculation functions
  const calculateCPCRaw = (cost, rawClicks) => rawClicks > 0 ? (cost / rawClicks).toFixed(2) : '0.00';
  const calculateCPCUnique = (cost, uniqueClicks) => uniqueClicks > 0 ? (cost / uniqueClicks).toFixed(2) : '0.00';
  const calculateCPRRaw = (cost, rawReg) => rawReg > 0 ? (cost / rawReg).toFixed(2) : '0.00';
  const calculateCPRConfirm = (cost, confirmReg) => confirmReg > 0 ? (cost / confirmReg).toFixed(2) : '0.00';
  const calculateCPS = (cost, sales) => sales > 0 ? (cost / sales).toFixed(2) : '0.00';
  const calculateRevPerSale = (revenue, sales) => sales > 0 ? (revenue / sales).toFixed(2) : '0.00';
  const calculateROAS = (revenue, cost) => cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';

  // CSV Export handler
  const handleCSVExport = () => {
    try {
      exportToCSV(filteredCampaigns, aggregatedMetrics);
      toast.success(
        'Export Successful',
        `Successfully exported ${filteredCampaigns.length} campaigns to CSV`,
        { duration: 4000 }
      );
      console.log(`✅ CSV export successful: ${filteredCampaigns.length} campaigns exported`);
    } catch (error) {
      console.error('❌ CSV export failed:', error);
      toast.error(
        'Export Failed',
        'Unable to export campaigns. Please try again.',
        { duration: 6000 }
      );
    }
  };

  // Chart data preparation
  const chartData = useMemo(() => {
    if (!filteredCampaigns.length) return [];
    
    try {
      return filteredCampaigns
        .filter(campaign => campaign.metrics && (campaign.metrics.cost > 0 || campaign.metrics.revenue > 0))
        .map(campaign => ({
          name: campaign.name.length > 15 ? `${campaign.name.substring(0, 15)}...` : campaign.name,
          fullName: campaign.name,
          cost: campaign.metrics?.cost || 0,
          revenue: campaign.metrics?.revenue || 0,
          roas: campaign.metrics?.revenue && campaign.metrics?.cost 
            ? Number(((campaign.metrics.revenue / campaign.metrics.cost) * 100).toFixed(1))
            : 0,
          clicks: campaign.metrics?.uniqueClicks || 0,
          sales: campaign.metrics?.sales || 0,
          vendor: campaign.vendor
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 10); // Top 10 campaigns for better chart readability
    } catch (error) {
      console.error('Chart data preparation error:', error);
      return [];
    }
  }, [filteredCampaigns]);

  // Sorting function
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, selectedVendors, dateRange, customStartDate, customEndDate]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / itemsPerPage);
  const indexOfLastCampaign = currentPage * itemsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - itemsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Create campaign handler
  const handleCreateCampaign = (formData) => {
    const newCampaign = {
      id: `CMP-${Date.now()}`,
      name: formData.name,
      vendor: formData.vendor || 'Test Vendor',
      status: 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: 'Marketing Manager',
      adPlacementDomain: formData.vendor || 'example.com',
      device: 'Both',
      targeting: 'Global',
      repContactInfo: 'contact@example.com',
      metrics: {
        rawClicks: 0,
        uniqueClicks: 0,
        cost: 0,
        rawReg: 0,
        confirmReg: 0,
        sales: 0,
        orderValue: 0,
        revenue: 0,
        ltrev: 0
      },
      notes: [],
      documents: [],
      visualMedia: [],
      changeHistory: [{
        id: `hist_${Date.now()}`,
        action: 'Campaign created',
        user: 'Marketing Manager',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    try {
      addCampaign(newCampaign);
      setShowCreateForm(false);
      
      toast.success(
        'Campaign Created',
        `Successfully created "${newCampaign.name}" campaign`,
        { duration: 4000 }
      );
      console.log('✅ Campaign created:', newCampaign.name);
    } catch (error) {
      console.error('❌ Campaign creation failed:', error);
      toast.error(
        'Creation Failed', 
        'Unable to create campaign. Please try again.',
        { duration: 5000 }
      );
    }
  };
  
  // Handle navigation to campaign detail view
  if (currentView === 'detail' && selectedCampaign) {
    return (
      <ErrorBoundary
        level="page"
        name="CampaignDetail"
        customMessage="Unable to load campaign details"
        onRetry={() => fetchCampaigns()}
        onNavigateHome={() => setCurrentView('dashboard')}
      >
        <CampaignDetail 
          campaign={selectedCampaign}
          onBack={() => setCurrentView('dashboard')} 
        />
      </ErrorBoundary>
    );
  }
  
  if (isLoading) {
    return (
      <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Marketing Dashboard</h1>
        <p>Campaign Management System</p>
        <KPICardsSkeleton />
        <CampaignTableSkeleton />
        <LoadingSpinner message="Loading campaign data..." />
      </div>
    );
  }
  
  if (error) {
    return (
      <ErrorBoundary
        level="page"
        name="Dashboard"
        customMessage="Failed to load marketing dashboard"
        onRetry={() => fetchCampaigns()}
        allowNavigation={false}
      >
        <div style={{ padding: '20px', color: 'red' }}>Error: {error.message || error}</div>
      </ErrorBoundary>
    );
  }
  
  return (
    <div style={{ 
      padding: responsive.getPadding(), 
      fontFamily: 'Arial, sans-serif',
      maxWidth: responsive.getMaxWidth(),
      margin: '0 auto'
    }}>
      {/* Performance Monitor - Development Only */}
      <PerformanceMonitor enabled={false} position="top-right" />
      
      {/* Toast Notifications */}
      <ToastContainer toasts={toast.toasts} onClose={toast.removeToast} position="top-right" />
      
      <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Marketing Dashboard</h1>
      <p>Campaign Management System</p>
      
      {/* Enhanced KPI Cards */}
      <ErrorBoundary
        level="component"
        name="KPICards"
        customMessage="Unable to load KPI metrics"
        allowNavigation={false}
      >
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: responsive.getGridColumns(), 
          gap: responsive.getGap(), 
          marginBottom: responsive.getMarginBottom() 
        }}>
        {/* Total Clicks */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #2563eb'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <MousePointer size={20} style={{ marginRight: '8px', color: '#2563eb' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Clicks</span>
          </div>
          <div style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: '600' }}>
            {aggregatedMetrics.totalUniqueClicks.toLocaleString()}
          </div>
        </div>

        {/* Total Cost */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #059669'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <DollarSign size={20} style={{ marginRight: '8px', color: '#059669' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Cost</span>
          </div>
          <div style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: '600' }}>
            ${aggregatedMetrics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Total Confirm Reg */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #7c3aed'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <Users size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Confirm Reg</span>
          </div>
          <div style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: '600' }}>
            {aggregatedMetrics.totalConfirmReg.toLocaleString()}
          </div>
        </div>

        {/* Total Sales */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: '4px solid #dc2626'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <ShoppingCart size={20} style={{ marginRight: '8px', color: '#dc2626' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Sales</span>
          </div>
          <div style={{ color: '#1a1a1a', fontSize: '24px', fontWeight: '600' }}>
            {aggregatedMetrics.totalSales.toLocaleString()}
          </div>
        </div>

        {/* Total Revenue */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: aggregatedMetrics.totalRevenue >= 0 ? '4px solid #059669' : '4px solid #dc2626'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <DollarSign size={20} style={{ marginRight: '8px', color: aggregatedMetrics.totalRevenue >= 0 ? '#059669' : '#dc2626' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Revenue</span>
          </div>
          <div style={{ color: aggregatedMetrics.totalRevenue >= 0 ? '#059669' : '#dc2626', fontSize: '24px', fontWeight: '600' }}>
            ${aggregatedMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        {/* Overall ROI */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          borderLeft: aggregatedMetrics.overallROI >= 0 ? '4px solid #059669' : '4px solid #dc2626'
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            marginBottom: '12px'
          }}>
            <TrendingUp size={20} style={{ marginRight: '8px', color: aggregatedMetrics.overallROI >= 0 ? '#059669' : '#dc2626' }} />
            <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Overall ROI</span>
          </div>
          <div style={{ color: aggregatedMetrics.overallROI >= 0 ? '#059669' : '#dc2626', fontSize: '24px', fontWeight: '600' }}>
            {aggregatedMetrics.overallROI}%
          </div>
        </div>
      </div>
      </ErrorBoundary>

      {/* Interactive Charts Section */}
      {chartData.length > 0 ? (
        <div style={{
          marginBottom: '30px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} style={{ color: '#2563eb' }} />
            Revenue & Cost Overview (Top {chartData.length} Campaigns)
          </h3>
          
          {/* Revenue vs Cost Bar Chart */}
          <div style={{ marginBottom: '30px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4b5563', fontSize: '16px' }}>Revenue vs Cost Analysis</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                  stroke="#6b7280"
                />
                <YAxis 
                  fontSize={11}
                  stroke="#6b7280"
                  tickFormatter={(value) => `$${(value/1000).toFixed(0)}k`}
                />
                <Tooltip 
                  formatter={(value, name, props) => [
                    `$${Number(value).toLocaleString()}`,
                    name === 'cost' ? 'Cost' : name === 'revenue' ? 'Revenue' : name
                  ]}
                  labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Legend />
                <Bar dataKey="cost" fill="#ef4444" name="Cost" radius={[2, 2, 0, 0]} />
                <Bar dataKey="revenue" fill="#10b981" name="Revenue" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* ROAS Performance Line Chart */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 15px 0', color: '#4b5563', fontSize: '16px' }}>ROAS Performance</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={11}
                  stroke="#6b7280"
                />
                <YAxis 
                  fontSize={11}
                  stroke="#6b7280"
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(1)}%`, 'ROAS']}
                  labelFormatter={(label) => chartData.find(d => d.name === label)?.fullName || label}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="roas" 
                  stroke="#2563eb" 
                  strokeWidth={3}
                  dot={{ fill: '#2563eb', r: 4 }}
                  activeDot={{ r: 6, fill: '#1d4ed8' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ 
            fontSize: '12px', 
            color: '#6b7280', 
            textAlign: 'center',
            marginTop: '10px'
          }}>
            💡 Showing top {chartData.length} campaigns by revenue. Hover over chart elements for detailed information.
          </div>
        </div>
      ) : (
        <div style={{
          marginBottom: '30px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '20px'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Revenue & Cost Overview</h3>
          <div style={{ 
            height: '200px', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            color: '#6b7280',
            textAlign: 'center'
          }}>
            📊 No chart data available<br/>
            <small style={{ marginTop: '8px', display: 'block' }}>
              Revenue: ${aggregatedMetrics.totalRevenue.toLocaleString()} | Cost: ${aggregatedMetrics.totalCost.toLocaleString()} | ROAS: {aggregatedMetrics.totalROAS}%
            </small>
          </div>
        </div>
      )}
      
      {/* Enhanced Search and Filter Controls */}
      <ErrorBoundary
        level="component"
        name="FiltersAndSearch"
        customMessage="Unable to load search and filter controls"
        allowNavigation={false}
      >
      <div style={{ 
        display: 'flex', 
        gap: responsive.getFilterGap(), 
        marginBottom: responsive.getMarginBottom(),
        alignItems: responsive.isMobile ? 'stretch' : 'center',
        flexDirection: responsive.isMobile ? 'column' : 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <div style={{ 
          display: 'flex', 
          gap: responsive.getFilterGap(), 
          alignItems: responsive.isMobile ? 'stretch' : 'center', 
          flexDirection: responsive.isMobile ? 'column' : 'row',
          flexWrap: 'wrap',
          width: responsive.isMobile ? '100%' : 'auto'
        }}>
          <input
            type="text"
            placeholder="Search campaigns or vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '220px',
              color: '#1f2937'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#1f2937'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
          </select>
          
          {/* Advanced Vendor Multi-Select Dropdown */}
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <button
              onClick={() => setVendorDropdown(!showVendorDropdown)}
              onBlur={(e) => {
                // Keep dropdown open when clicking inside
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setTimeout(() => setVendorDropdown(false), 150);
                }
              }}
              style={{
                padding: '10px 15px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                backgroundColor: 'white',
                color: '#1f2937',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '180px',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} />
                <span>
                  {selectedVendors.length === 0 
                    ? 'All Vendors' 
                    : selectedVendors.length === 1
                    ? selectedVendors[0]
                    : `${selectedVendors.length} vendors`
                  }
                </span>
              </div>
              {showVendorDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {showVendorDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                maxHeight: '300px',
                overflowY: 'auto'
              }}>
                {/* Search input */}
                <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
                    <input
                      type="text"
                      placeholder="Search vendors..."
                      value={vendorSearchTerm}
                      onChange={(e) => setVendorSearchTerm(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        width: '100%',
                        padding: '8px 12px 8px 32px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        fontSize: '14px',
                        color: '#1f2937'
                      }}
                    />
                  </div>
                </div>
                
                {/* Select All / Clear All */}
                <div style={{ padding: '8px', borderBottom: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVendorFilter(allVendors);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      Select All
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setVendorFilter([]);
                      }}
                      style={{
                        padding: '4px 8px',
                        background: '#6b7280',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        flex: 1
                      }}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
                
                {/* Vendor options */}
                {filteredVendors.map(vendor => (
                  <div
                    key={vendor}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleVendorFilter(vendor);
                    }}
                    style={{
                      padding: '10px 12px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: selectedVendors.includes(vendor) ? '#eff6ff' : 'white',
                      borderBottom: '1px solid #f3f4f6',
                      color: '#1f2937'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = selectedVendors.includes(vendor) ? '#dbeafe' : '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = selectedVendors.includes(vendor) ? '#eff6ff' : 'white';
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedVendors.includes(vendor)}
                      onChange={() => {}} // Controlled by parent click
                      style={{ margin: 0 }}
                    />
                    <span style={{ fontSize: '14px' }}>{vendor}</span>
                  </div>
                ))}
                
                {filteredVendors.length === 0 && (
                  <div style={{ padding: '12px', textAlign: 'center', color: '#6b7280' }}>
                    No vendors found matching "{vendorSearchTerm}"
                  </div>
                )}
              </div>
            )}
          </div>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#1f2937'
            }}
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 14 Days">Last 14 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Current Day">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Custom">Custom Range</option>
          </select>
          {dateRange === 'Custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </>
          )}
          {(searchTerm || statusFilter !== 'All' || selectedVendors.length > 0 || dateRange !== 'Last 30 Days') && (
            <button
              onClick={() => {
                resetFilters();
                toast.info('Filters Reset', 'All filters have been cleared', { duration: 3000 });
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '10px',
          flexDirection: responsive.isMobile ? 'column' : 'row',
          width: responsive.isMobile ? '100%' : 'auto'
        }}>
          <button
            onClick={handleCSVExport}
            disabled={filteredCampaigns.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 15px',
              backgroundColor: filteredCampaigns.length === 0 ? '#f3f4f6' : '#059669',
              color: filteredCampaigns.length === 0 ? '#9ca3af' : 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: filteredCampaigns.length === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            <Download size={16} />
            Export CSV ({filteredCampaigns.length})
          </button>
          
          <button
            onClick={() => setShowCreateForm(true)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
          >
            + Create Campaign
          </button>
        </div>
      </div>
      </ErrorBoundary>

      {/* Campaign Table Section */}
      <ErrorBoundary
        level="component"
        name="CampaignTable"
        customMessage="Unable to load campaign table data"
        allowNavigation={false}
      >
      {filteredCampaigns.length > 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: responsive.getTableBorder(),
          overflow: 'hidden',
          minWidth: responsive.getTableMinWidth()
        }}>
          <h3 style={{ 
            margin: 0, 
            padding: responsive.getHeaderPadding(), 
            borderBottom: '1px solid #e2e8f0', 
            color: '#1f2937',
            fontSize: responsive.getFontSize('16px', '20px')
          }}>
            Recent Campaigns ({filteredCampaigns.length})
          </h3>
          
          {/* Sortable Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.7fr',
            gap: '8px',
            padding: '15px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '11px',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            minWidth: '2000px'
          }}>
            {[
              { label: 'Campaign', key: 'name' },
              { label: 'Vendor', key: 'vendor' },
              { label: 'Status', key: 'status' },
              { label: 'Start Date', key: 'startDate' },
              { label: 'End Date', key: 'endDate' },
              { label: 'Raw Clicks', key: 'rawClicks' },
              { label: 'Unique Clicks', key: 'uniqueClicks' },
              { label: 'Cost', key: 'cost' },
              { label: 'CPC (Raw)', key: 'cpcRaw' },
              { label: 'CPC (Unique)', key: 'cpcUnique' },
              { label: 'Raw Reg', key: 'rawReg' },
              { label: 'CPR (Raw)', key: 'cprRaw' },
              { label: 'Confirm Reg', key: 'confirmReg' },
              { label: 'CPR (Confirm)', key: 'cprConfirm' },
              { label: 'Sales', key: 'sales' },
              { label: 'CPS', key: 'cps' },
              { label: 'Revenue', key: 'revenue' },
              { label: 'Rev/Sale', key: 'revPerSale' },
              { label: 'LTRev', key: 'ltrev' },
              { label: 'ROAS', key: 'roas' }
            ].map(({ label, key }) => (
              <div 
                key={key}
                onClick={() => handleSort(key)}
                style={{
                  cursor: 'pointer',
                  color: sortConfig.key === key ? '#2563eb' : '#374151',
                  userSelect: 'none',
                  padding: '4px 0',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => {
                  if (sortConfig.key !== key) e.target.style.color = '#1f2937';
                }}
                onMouseLeave={(e) => {
                  if (sortConfig.key !== key) e.target.style.color = '#374151';
                }}
              >
                {label} {sortConfig.key === key && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </div>
            ))}
          </div>
          
          {/* Comprehensive Table Body */}
          <div style={{ maxHeight: '400px', overflowY: 'auto', overflowX: 'auto' }}>
            {currentCampaigns.map(campaign => {
              const metrics = campaign.metrics || {};
              const cost = metrics.cost || 0;
              const revenue = metrics.revenue || 0;
              const rawClicks = metrics.rawClicks || 0;
              const uniqueClicks = metrics.uniqueClicks || 0;
              const rawReg = metrics.rawReg || 0;
              const confirmReg = metrics.confirmReg || 0;
              const sales = metrics.sales || 0;
              const ltrev = metrics.ltrev || 0;
              
              return (
                <div 
                  key={campaign.id} 
                  onClick={() => {
                    selectCampaign(campaign);
                    setCurrentView('detail');
                  }}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 0.8fr 0.8fr 0.8fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.7fr 0.8fr 0.8fr 0.7fr',
                    gap: '8px',
                    padding: '12px 20px', 
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '13px',
                    minWidth: '2000px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {/* Campaign Name */}
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px', fontSize: '14px' }}>
                      {campaign.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#6b7280' }}>
                      {campaign.id}
                    </div>
                  </div>
                  
                  {/* Vendor */}
                  <div style={{ color: '#1f2937' }}>{campaign.vendor}</div>
                  
                  {/* Status */}
                  <div>
                    <span style={{
                      padding: '3px 6px',
                      borderRadius: '10px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        campaign.status === 'Active' ? '#dcfce7' :
                        campaign.status === 'Paused' ? '#fef3c7' :
                        campaign.status === 'Completed' ? '#dbeafe' : '#f3f4f6',
                      color:
                        campaign.status === 'Active' ? '#166534' :
                        campaign.status === 'Paused' ? '#92400e' :
                        campaign.status === 'Completed' ? '#1e40af' : '#6b7280'
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  
                  {/* Start Date */}
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>
                    {new Date(campaign.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </div>
                  
                  {/* End Date */}
                  <div style={{ color: '#6b7280', fontSize: '12px' }}>
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric', 
                      year: '2-digit'
                    }) : '-'}
                  </div>
                  
                  {/* Raw Clicks */}
                  <div style={{ color: '#1f2937' }}>{rawClicks.toLocaleString()}</div>
                  
                  {/* Unique Clicks */}
                  <div style={{ color: '#1f2937' }}>{uniqueClicks.toLocaleString()}</div>
                  
                  {/* Cost */}
                  <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                    ${cost.toLocaleString()}
                  </div>
                  
                  {/* CPC (Raw) */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateCPCRaw(cost, rawClicks)}
                  </div>
                  
                  {/* CPC (Unique) */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateCPCUnique(cost, uniqueClicks)}
                  </div>
                  
                  {/* Raw Reg */}
                  <div style={{ color: '#7c3aed' }}>{rawReg.toLocaleString()}</div>
                  
                  {/* CPR (Raw) */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateCPRRaw(cost, rawReg)}
                  </div>
                  
                  {/* Confirm Reg */}
                  <div style={{ color: '#7c3aed', fontWeight: 'bold' }}>{confirmReg.toLocaleString()}</div>
                  
                  {/* CPR (Confirm) */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateCPRConfirm(cost, confirmReg)}
                  </div>
                  
                  {/* Sales */}
                  <div style={{ color: '#dc2626', fontWeight: 'bold' }}>{sales.toLocaleString()}</div>
                  
                  {/* CPS */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateCPS(cost, sales)}
                  </div>
                  
                  {/* Revenue */}
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${revenue.toLocaleString()}
                  </div>
                  
                  {/* Rev/Sale */}
                  <div style={{ color: '#6b7280' }}>
                    ${calculateRevPerSale(revenue, sales)}
                  </div>
                  
                  {/* LTRev */}
                  <div style={{ color: '#10b981' }}>
                    ${ltrev.toLocaleString()}
                  </div>
                  
                  {/* ROAS */}
                  <div style={{ 
                    color: parseFloat(calculateROAS(revenue, cost)) >= 100 ? '#10b981' : '#6b7280',
                    fontWeight: 'bold' 
                  }}>
                    {calculateROAS(revenue, cost)}%
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px',
              borderTop: '1px solid #e2e8f0',
              backgroundColor: '#f8fafc'
            }}>
              {/* Items per page selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '6px 8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    fontSize: '14px',
                    backgroundColor: 'white'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                <span style={{ fontSize: '14px', color: '#6b7280' }}>
                  Showing {indexOfFirstCampaign + 1}-{Math.min(indexOfLastCampaign, filteredCampaigns.length)} of {filteredCampaigns.length}
                </span>
              </div>
              
              {/* Page navigation */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === 1 ? '#f9fafb' : '#ffffff',
                    color: currentPage === 1 ? '#9ca3af' : '#374151',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Previous
                </button>
                
                {/* Page numbers */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        backgroundColor: currentPage === pageNum ? '#2563eb' : '#ffffff',
                        color: currentPage === pageNum ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPage === pageNum ? 'bold' : 'normal'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '4px',
                    backgroundColor: currentPage === totalPages ? '#f9fafb' : '#ffffff',
                    color: currentPage === totalPages ? '#9ca3af' : '#374151',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    fontSize: '14px'
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#9ca3af' }}>No campaigns found</h3>
          <p>
            {searchTerm || statusFilter !== 'All' || selectedVendors.length > 0
              ? 'Try adjusting your search or filter criteria.' 
              : 'No campaigns available in the system.'}
          </p>
        </div>
      )}
      </ErrorBoundary>
      
      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Create New Campaign</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateCampaign({
                name: formData.get('name'),
                vendor: formData.get('vendor')
              });
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}
                  placeholder="Enter campaign name..."
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                  Vendor/Domain
                </label>
                <input
                  type="text"
                  name="vendor"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}
                  placeholder="Enter vendor or domain..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMarketingManager;