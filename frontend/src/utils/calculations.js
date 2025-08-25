// Campaign metric calculation utilities

export const calculateCPC = (cost, clicks) => 
  clicks > 0 ? (cost / clicks).toFixed(2) : '0.00';

export const calculateCPCRaw = (cost, rawClicks) => 
  rawClicks > 0 ? (cost / rawClicks).toFixed(2) : '0.00';

export const calculateCPCUnique = (cost, uniqueClicks) => 
  uniqueClicks > 0 ? (cost / uniqueClicks).toFixed(2) : '0.00';

export const calculateCPRRaw = (cost, rawReg) => 
  rawReg > 0 ? (cost / rawReg).toFixed(2) : '0.00';

export const calculateCPRConfirm = (cost, confirmReg) => 
  confirmReg > 0 ? (cost / confirmReg).toFixed(2) : '0.00';

export const calculateCPS = (cost, sales) => 
  sales > 0 ? (cost / sales).toFixed(2) : '0.00';

export const calculateROI = (revenue, cost) => 
  cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';

export const calculateROAS = (revenue, cost) => 
  cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';

// Aggregate metrics calculation
export const aggregateMetrics = (campaigns) => {
  if (!campaigns || campaigns.length === 0) {
    return {
      totalCost: 0,
      totalRevenue: 0,
      totalSales: 0,
      totalClicks: 0,
      totalUniqueClicks: 0,
      totalRegistrations: 0,
      averageROAS: 0,
      campaignCount: 0
    };
  }

  const totals = campaigns.reduce((acc, campaign) => {
    const metrics = campaign.metrics || {};
    return {
      totalCost: acc.totalCost + (metrics.cost || 0),
      totalRevenue: acc.totalRevenue + (metrics.revenue || 0),
      totalSales: acc.totalSales + (metrics.sales || 0),
      totalClicks: acc.totalClicks + (metrics.rawClicks || 0),
      totalUniqueClicks: acc.totalUniqueClicks + (metrics.uniqueClicks || 0),
      totalRegistrations: acc.totalRegistrations + (metrics.confirmReg || 0),
    };
  }, {
    totalCost: 0,
    totalRevenue: 0,
    totalSales: 0,
    totalClicks: 0,
    totalUniqueClicks: 0,
    totalRegistrations: 0,
  });

  return {
    ...totals,
    averageROAS: parseFloat(calculateROAS(totals.totalRevenue, totals.totalCost)),
    campaignCount: campaigns.length,
    totalCampaigns: campaigns.length
  };
};

// Format currency values
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value || 0);
};

// Format percentage values
export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

// Format large numbers with appropriate suffixes
export const formatNumber = (value) => {
  if (!value) return '0';
  
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M';
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K';
  }
  
  return value.toLocaleString();
};

// Apply filters to campaigns array
export const applyFilters = (campaigns, filters) => {
  if (!campaigns || !Array.isArray(campaigns)) return [];
  
  return campaigns.filter(campaign => {
    // Vendor filter
    if (filters.vendors && filters.vendors.length > 0) {
      if (!filters.vendors.includes(campaign.adPlacementDomain)) {
        return false;
      }
    }
    
    // Status filter
    if (filters.status && filters.status !== 'All') {
      if (campaign.status !== filters.status) {
        return false;
      }
    }
    
    // Search term filter
    if (filters.search && filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      const searchableFields = [
        campaign.name,
        campaign.manager,
        campaign.adPlacementDomain,
        campaign.repContactInfo?.name,
        campaign.repContactInfo?.email
      ].filter(Boolean);
      
      const matches = searchableFields.some(field => 
        field.toLowerCase().includes(searchTerm)
      );
      
      if (!matches) return false;
    }
    
    // Date range filter
    if (filters.dateRange) {
      const campaignStart = new Date(campaign.startDate);
      const campaignEnd = new Date(campaign.endDate);
      const now = new Date();
      
      let filterStart, filterEnd;
      
      switch (filters.dateRange) {
        case 'Last 7 Days':
          filterStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          filterEnd = now;
          break;
        case 'Last 30 Days':
          filterStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          filterEnd = now;
          break;
        case 'Last 90 Days':
          filterStart = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          filterEnd = now;
          break;
        case 'Custom':
          if (filters.customStartDate && filters.customEndDate) {
            filterStart = new Date(filters.customStartDate);
            filterEnd = new Date(filters.customEndDate);
          } else {
            return true; // No custom dates set, don't filter
          }
          break;
        default:
          return true; // No date filter
      }
      
      // Check if campaign overlaps with filter date range
      if (campaignEnd < filterStart || campaignStart > filterEnd) {
        return false;
      }
    }
    
    return true;
  });
};

// Apply sorting to campaigns array
export const applySorting = (campaigns, sortConfig) => {
  if (!campaigns || !Array.isArray(campaigns) || !sortConfig) return campaigns;
  
  const { key, direction } = sortConfig;
  if (!key) return campaigns;
  
  return [...campaigns].sort((a, b) => {
    let aValue, bValue;
    
    // Handle nested properties and special cases
    switch (key) {
      case 'spend':
        aValue = a.metrics?.cost || 0;
        bValue = b.metrics?.cost || 0;
        break;
      case 'revenue':
        aValue = a.metrics?.revenue || 0;
        bValue = b.metrics?.revenue || 0;
        break;
      case 'roas':
        aValue = parseFloat(calculateROAS(a.metrics?.revenue || 0, a.metrics?.cost || 0));
        bValue = parseFloat(calculateROAS(b.metrics?.revenue || 0, b.metrics?.cost || 0));
        break;
      case 'clicks':
        aValue = a.metrics?.rawClicks || 0;
        bValue = b.metrics?.rawClicks || 0;
        break;
      case 'sales':
        aValue = a.metrics?.sales || 0;
        bValue = b.metrics?.sales || 0;
        break;
      case 'startDate':
      case 'endDate':
        aValue = new Date(a[key]);
        bValue = new Date(b[key]);
        break;
      default:
        aValue = a[key];
        bValue = b[key];
    }
    
    // Handle null/undefined values
    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return 1;
    if (bValue == null) return -1;
    
    // Sort logic
    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else {
      comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    }
    
    return direction === 'desc' ? -comparison : comparison;
  });
};

// Calculate aggregated metrics (alias for backward compatibility)
export const calculateAggregatedMetrics = aggregateMetrics;