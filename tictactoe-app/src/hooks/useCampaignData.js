import { useMemo } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';
import { 
  calculateCPCRaw, 
  calculateCPCUnique, 
  calculateCPRConfirm, 
  calculateCPS, 
  calculateROAS,
  aggregateMetrics 
} from '../utils/calculations';

export const useCampaignData = () => {
  const { campaigns, isLoading, error } = useCampaignsStore();
  const filters = useFiltersStore();
  
  // Apply filters to campaigns
  const filteredCampaigns = useMemo(() => {
    let result = campaigns;
    
    // Vendor filter
    if (filters.selectedVendors.length > 0) {
      result = result.filter(campaign => 
        filters.selectedVendors.includes(campaign.vendor)
      );
    }
    
    // Status filter
    if (filters.statusFilter !== 'All') {
      result = result.filter(campaign => 
        campaign.status === filters.statusFilter
      );
    }
    
    // Date range filter
    const { start, end } = getDateRangeBounds(filters.dateRange, filters.customStartDate, filters.customEndDate);
    result = result.filter(campaign => {
      const campaignStart = new Date(campaign.startDate);
      return campaignStart >= start && campaignStart <= end;
    });
    
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      result = result.filter(campaign =>
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.vendor.toLowerCase().includes(searchLower) ||
        campaign.id.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [campaigns, filters]);
  
  // Apply sorting
  const sortedCampaigns = useMemo(() => {
    if (!filters.sortConfig.key) return filteredCampaigns;
    
    return [...filteredCampaigns].sort((a, b) => {
      let aValue, bValue;
      
      // Handle calculated fields
      switch (filters.sortConfig.key) {
        case 'cpcRaw':
          aValue = parseFloat(calculateCPCRaw(a.metrics.cost, a.metrics.rawClicks));
          bValue = parseFloat(calculateCPCRaw(b.metrics.cost, b.metrics.rawClicks));
          break;
        case 'cpcUnique':
          aValue = parseFloat(calculateCPCUnique(a.metrics.cost, a.metrics.uniqueClicks));
          bValue = parseFloat(calculateCPCUnique(b.metrics.cost, b.metrics.uniqueClicks));
          break;
        case 'cprConfirm':
          aValue = parseFloat(calculateCPRConfirm(a.metrics.cost, a.metrics.confirmReg));
          bValue = parseFloat(calculateCPRConfirm(b.metrics.cost, b.metrics.confirmReg));
          break;
        case 'cps':
          aValue = parseFloat(calculateCPS(a.metrics.cost, a.metrics.sales));
          bValue = parseFloat(calculateCPS(b.metrics.cost, b.metrics.sales));
          break;
        case 'roas':
          aValue = parseFloat(calculateROAS(a.metrics.revenue, a.metrics.cost));
          bValue = parseFloat(calculateROAS(b.metrics.revenue, b.metrics.cost));
          break;
        case 'revPerSale':
          aValue = a.metrics.sales > 0 ? a.metrics.revenue / a.metrics.sales : 0;
          bValue = b.metrics.sales > 0 ? b.metrics.revenue / b.metrics.sales : 0;
          break;
        default:
          // Handle direct field access
          if (filters.sortConfig.key in a.metrics) {
            aValue = a.metrics[filters.sortConfig.key];
            bValue = b.metrics[filters.sortConfig.key];
          } else {
            aValue = a[filters.sortConfig.key];
            bValue = b[filters.sortConfig.key];
          }
      }
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Numeric comparison
      if (aValue < bValue) return filters.sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return filters.sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredCampaigns, filters.sortConfig]);
  
  // Calculate pagination
  const paginatedData = useMemo(() => {
    const startIndex = (filters.currentPage - 1) * filters.itemsPerPage;
    const endIndex = startIndex + filters.itemsPerPage;
    const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex);
    
    return {
      campaigns: paginatedCampaigns,
      totalCampaigns: sortedCampaigns.length,
      totalPages: Math.ceil(sortedCampaigns.length / filters.itemsPerPage),
      currentPage: filters.currentPage,
      itemsPerPage: filters.itemsPerPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, sortedCampaigns.length),
      hasNextPage: filters.currentPage < Math.ceil(sortedCampaigns.length / filters.itemsPerPage),
      hasPreviousPage: filters.currentPage > 1
    };
  }, [sortedCampaigns, filters.currentPage, filters.itemsPerPage]);
  
  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    return aggregateMetrics(sortedCampaigns);
  }, [sortedCampaigns]);
  
  // Performance insights
  const performanceInsights = useMemo(() => {
    if (sortedCampaigns.length === 0) return null;
    
    const insights = [];
    
    // Best performing campaign by ROAS
    const bestCampaign = sortedCampaigns.reduce((best, current) => {
      const currentROAS = parseFloat(calculateROAS(current.metrics.revenue, current.metrics.cost));
      const bestROAS = parseFloat(calculateROAS(best.metrics.revenue, best.metrics.cost));
      return currentROAS > bestROAS ? current : best;
    });
    
    insights.push({
      type: 'best_performer',
      campaign: bestCampaign,
      metric: 'ROAS',
      value: calculateROAS(bestCampaign.metrics.revenue, bestCampaign.metrics.cost)
    });
    
    // Worst performing campaign by ROAS
    const worstCampaign = sortedCampaigns.reduce((worst, current) => {
      const currentROAS = parseFloat(calculateROAS(current.metrics.revenue, current.metrics.cost));
      const worstROAS = parseFloat(calculateROAS(worst.metrics.revenue, worst.metrics.cost));
      return currentROAS < worstROAS ? current : worst;
    });
    
    insights.push({
      type: 'worst_performer',
      campaign: worstCampaign,
      metric: 'ROAS',
      value: calculateROAS(worstCampaign.metrics.revenue, worstCampaign.metrics.cost)
    });
    
    // High spend, low return campaigns
    const underperformers = sortedCampaigns.filter(campaign => {
      const roas = parseFloat(calculateROAS(campaign.metrics.revenue, campaign.metrics.cost));
      return campaign.metrics.cost > 1000 && roas < 100; // Spent >$1000 but ROAS <100%
    });
    
    if (underperformers.length > 0) {
      insights.push({
        type: 'underperformers',
        count: underperformers.length,
        campaigns: underperformers
      });
    }
    
    return insights;
  }, [sortedCampaigns]);
  
  return {
    // Data
    ...paginatedData,
    filteredCampaigns: sortedCampaigns,
    allCampaigns: campaigns,
    aggregatedMetrics,
    performanceInsights,
    
    // State
    isLoading,
    error,
    isEmpty: sortedCampaigns.length === 0,
    
    // Computed values
    hasData: campaigns.length > 0,
    hasFilters: filters.selectedVendors.length > 0 || 
                filters.statusFilter !== 'All' || 
                filters.searchTerm.length > 0 ||
                filters.dateRange !== 'Last 30 Days'
  };
};

// Helper function for date range bounds
function getDateRangeBounds(dateRange, customStartDate, customEndDate) {
  const today = new Date();
  let start, end;
  
  switch (dateRange) {
    case 'Current Day':
      start = end = today;
      break;
    case 'Yesterday':
      start = end = new Date(today.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'Last 7 Days':
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = today;
      break;
    case 'Last 14 Days':
      start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
      end = today;
      break;
    case 'Last 30 Days':
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = today;
      break;
    case 'Last 90 Days':
      start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000);
      end = today;
      break;
    case 'Custom':
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate);
        end = new Date(customEndDate);
      } else {
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = today;
      }
      break;
    default:
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = today;
  }
  
  return { start, end };
}