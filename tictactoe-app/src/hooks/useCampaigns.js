import { useEffect, useMemo } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';
import { useUIStore } from '../stores/uiStore';
import { applyFilters, applySorting, calculateAggregatedMetrics } from '../utils/calculations';

export const useCampaigns = () => {
  const {
    campaigns,
    isLoading,
    error,
    fetchCampaigns,
    clearError
  } = useCampaignsStore();
  
  const {
    getApiFilters,
    currentPage,
    itemsPerPage
  } = useFiltersStore();
  
  // Fetch campaigns when filters change
  useEffect(() => {
    const filters = getApiFilters();
    fetchCampaigns(filters);
  }, [getApiFilters, fetchCampaigns]);
  
  // Apply filters and sorting
  const filteredCampaigns = useMemo(() => {
    const filters = getApiFilters();
    const filtered = applyFilters(campaigns, filters);
    return applySorting(filtered, filters.sort);
  }, [campaigns, getApiFilters]);
  
  // Calculate pagination
  const paginationData = useMemo(() => {
    const totalCampaigns = filteredCampaigns.length;
    const totalPages = Math.ceil(totalCampaigns / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentCampaigns = filteredCampaigns.slice(startIndex, endIndex);
    
    return {
      currentCampaigns,
      totalCampaigns,
      totalPages,
      startIndex,
      endIndex,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1
    };
  }, [filteredCampaigns, currentPage, itemsPerPage]);
  
  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    return calculateAggregatedMetrics(filteredCampaigns);
  }, [filteredCampaigns]);
  
  return {
    // Data
    campaigns: filteredCampaigns,
    ...paginationData,
    aggregatedMetrics,
    
    // State
    isLoading,
    error,
    
    // Actions
    refetch: () => fetchCampaigns(getApiFilters()),
    clearError
  };
};

export const useCampaignActions = () => {
  const {
    updateCampaign,
    deleteCampaign,
    selectCampaign
  } = useCampaignsStore();
  
  const { setCurrentView } = useUIStore();
  
  const handleCampaignClick = (campaign) => {
    selectCampaign(campaign);
    setCurrentView('detail');
  };
  
  const handleCampaignUpdate = async (id, updates) => {
    try {
      await updateCampaign(id, updates);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  const handleCampaignDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this campaign?')) {
      return { success: false, cancelled: true };
    }
    
    try {
      await deleteCampaign(id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  return {
    handleCampaignClick,
    handleCampaignUpdate,
    handleCampaignDelete
  };
};