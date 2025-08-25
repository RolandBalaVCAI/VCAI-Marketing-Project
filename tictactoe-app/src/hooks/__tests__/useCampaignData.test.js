import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCampaignData } from '../useCampaignData';
import { createMockCampaigns } from '../../test/utils';


// Mock the store modules
vi.mock('../../stores/campaignsStore', () => ({
  useCampaignsStore: vi.fn()
}));

vi.mock('../../stores/filtersStore', () => ({
  useFiltersStore: vi.fn()
}));

vi.mock('../../utils/calculations', () => ({
  calculateCPCRaw: vi.fn((cost, clicks) => clicks > 0 ? (cost / clicks).toFixed(2) : '0.00'),
  calculateCPCUnique: vi.fn((cost, clicks) => clicks > 0 ? (cost / clicks).toFixed(2) : '0.00'),
  calculateCPRConfirm: vi.fn((cost, confirms) => confirms > 0 ? (cost / confirms).toFixed(2) : '0.00'),
  calculateCPS: vi.fn((cost, sales) => sales > 0 ? (cost / sales).toFixed(2) : '0.00'),
  calculateROAS: vi.fn((revenue, cost) => cost > 0 ? ((revenue / cost) * 100).toFixed(2) : '0.00'),
  aggregateMetrics: vi.fn((campaigns) => ({
    totalCost: campaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0),
    totalRevenue: campaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0),
    totalCampaigns: campaigns.length
  }))
}));

describe('useCampaignData', () => {
  const mockCampaigns = createMockCampaigns(10);
  
  const mockCampaignsStore = {
    campaigns: mockCampaigns,
    isLoading: false,
    error: null
  };

  const mockFiltersStore = {
    selectedVendors: [],
    statusFilter: 'All',
    dateRange: 'Last 30 Days',
    customStartDate: null,
    customEndDate: null,
    searchTerm: '',
    sortConfig: { key: null, direction: 'asc' },
    currentPage: 1,
    itemsPerPage: 20
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mocks to return expected values
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useCampaignsStore.mockReturnValue(mockCampaignsStore);
    useFiltersStore.mockReturnValue(mockFiltersStore);
  });

  it('should return all campaigns when no filters are applied', () => {
    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(10);
    expect(result.current.totalCampaigns).toBe(10);
    expect(result.current.hasData).toBe(true);
    expect(result.current.isEmpty).toBe(false);
  });

  it('should filter campaigns by vendor', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      selectedVendors: ['Google Ads']
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(10); // All mock campaigns use 'Google Ads'
  });

  it('should filter campaigns by status', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      statusFilter: 'Paused'
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(0); // No campaigns with 'Paused' status
  });

  it('should search campaigns by name', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      searchTerm: 'Campaign 1'
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(2); // Campaign 1 and Campaign 10
    expect(result.current.campaigns[0].name).toContain('Campaign 1');
  });

  it('should sort campaigns by cost ascending', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      sortConfig: { key: 'cost', direction: 'asc' }
    });

    const { result } = renderHook(() => useCampaignData());

    const costs = result.current.campaigns.map(c => c.metrics.cost);
    expect(costs).toEqual([...costs].sort((a, b) => a - b));
  });

  it('should sort campaigns by ROAS descending', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      sortConfig: { key: 'roas', direction: 'desc' }
    });

    const { result } = renderHook(() => useCampaignData());

    // Verify ROAS calculation was called
    const { calculateROAS } = require('../../utils/calculations');
    expect(calculateROAS).toHaveBeenCalled();
  });

  it('should handle pagination correctly', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      currentPage: 1,
      itemsPerPage: 5
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(5);
    expect(result.current.totalPages).toBe(2);
    expect(result.current.hasNextPage).toBe(true);
    expect(result.current.hasPreviousPage).toBe(false);
    expect(result.current.startIndex).toBe(1);
    expect(result.current.endIndex).toBe(5);
  });

  it('should handle second page pagination', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      currentPage: 2,
      itemsPerPage: 5
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(5);
    expect(result.current.currentPage).toBe(2);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.hasPreviousPage).toBe(true);
    expect(result.current.startIndex).toBe(6);
    expect(result.current.endIndex).toBe(10);
  });

  it('should calculate aggregated metrics', () => {
    const { result } = renderHook(() => useCampaignData());

    expect(result.current.aggregatedMetrics).toBeDefined();
    expect(result.current.aggregatedMetrics.totalCampaigns).toBe(10);
    
    const { aggregateMetrics } = require('../../utils/calculations');
    expect(aggregateMetrics).toHaveBeenCalledWith(expect.any(Array));
  });

  it('should generate performance insights', () => {
    const { result } = renderHook(() => useCampaignData());

    expect(result.current.performanceInsights).toBeDefined();
    expect(Array.isArray(result.current.performanceInsights)).toBe(true);
    
    // Should have best and worst performer insights
    const insightTypes = result.current.performanceInsights.map(insight => insight.type);
    expect(insightTypes).toContain('best_performer');
    expect(insightTypes).toContain('worst_performer');
  });

  it('should handle empty campaigns list', () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      campaigns: [],
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.campaigns).toHaveLength(0);
    expect(result.current.isEmpty).toBe(true);
    expect(result.current.hasData).toBe(false);
    expect(result.current.performanceInsights).toBeNull();
  });

  it('should handle loading state', () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      campaigns: [],
      isLoading: true,
      error: null
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.isLoading).toBe(true);
  });

  it('should handle error state', () => {
    const mockError = new Error('Failed to load campaigns');
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      campaigns: [],
      isLoading: false,
      error: mockError
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.error).toBe(mockError);
  });

  it('should identify campaigns with active filters', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      selectedVendors: ['Google Ads'],
      searchTerm: 'test'
    });

    const { result } = renderHook(() => useCampaignData());

    expect(result.current.hasFilters).toBe(true);
  });

  it('should detect underperforming campaigns', () => {
    // Create campaigns with high cost but low ROAS
    const underperformingCampaigns = createMockCampaigns(3).map(campaign => ({
      ...campaign,
      metrics: {
        ...campaign.metrics,
        cost: 2000, // High cost
        revenue: 1000 // Low revenue (ROAS = 50%)
      }
    }));

    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      campaigns: underperformingCampaigns,
      isLoading: false,
      error: null
    });

    const { result } = renderHook(() => useCampaignData());

    const underperformerInsight = result.current.performanceInsights.find(
      insight => insight.type === 'underperformers'
    );
    
    expect(underperformerInsight).toBeDefined();
    expect(underperformerInsight.count).toBe(3);
  });

  it('should handle date range filtering', () => {
    const { useFiltersStore } = require('../../stores/filtersStore');
    
    const today = new Date();
    const pastDate = new Date();
    pastDate.setDate(today.getDate() - 60); // 60 days ago

    // Create campaigns with old dates
    const oldCampaigns = createMockCampaigns(5).map(campaign => ({
      ...campaign,
      startDate: pastDate.toISOString()
    }));

    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      campaigns: oldCampaigns,
      isLoading: false,
      error: null
    });

    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      dateRange: 'Last 30 Days'
    });

    const { result } = renderHook(() => useCampaignData());

    // Should filter out campaigns older than 30 days
    expect(result.current.campaigns).toHaveLength(0);
  });
});