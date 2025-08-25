import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders, createMockCampaigns, createMockAPIClient } from '../utils';
import MarketingManagerV4 from '../../components/MarketingManagerV4';

// Mock API client
const mockAPIClient = createMockAPIClient();

vi.mock('../../api/client', () => ({
  apiClient: mockAPIClient
}));

// Mock stores
vi.mock('../../stores/campaignsStore', () => ({
  useCampaignsStore: vi.fn()
}));

vi.mock('../../stores/filtersStore', () => ({
  useFiltersStore: vi.fn()
}));

vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn()
}));

describe('Campaign Management Integration', () => {
  const mockCampaigns = createMockCampaigns(5);

  const mockCampaignsStore = {
    campaigns: mockCampaigns,
    isLoading: false,
    error: null,
    fetchCampaigns: vi.fn(),
    createCampaign: vi.fn(),
    updateCampaign: vi.fn(),
    deleteCampaign: vi.fn()
  };

  const mockFiltersStore = {
    selectedVendors: [],
    statusFilter: 'All',
    dateRange: 'Last 30 Days',
    searchTerm: '',
    sortConfig: { key: null, direction: 'asc' },
    currentPage: 1,
    itemsPerPage: 20,
    setSelectedVendors: vi.fn(),
    setStatusFilter: vi.fn(),
    setSearchTerm: vi.fn(),
    setSortConfig: vi.fn(),
    setCurrentPage: vi.fn()
  };

  const mockUIStore = {
    sidebarOpen: false,
    selectedCampaignId: null,
    currentView: 'dashboard',
    notifications: [],
    setSidebarOpen: vi.fn(),
    setSelectedCampaignId: vi.fn(),
    setCurrentView: vi.fn(),
    addNotification: vi.fn()
  };

  beforeEach(() => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    const { useFiltersStore } = require('../../stores/filtersStore');
    const { useUIStore } = require('../../stores/uiStore');

    useCampaignsStore.mockReturnValue(mockCampaignsStore);
    useFiltersStore.mockReturnValue(mockFiltersStore);
    useUIStore.mockReturnValue(mockUIStore);

    mockAPIClient.getCampaigns.mockResolvedValue({
      success: true,
      data: {
        campaigns: mockCampaigns,
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: mockCampaigns.length
        }
      }
    });

    vi.clearAllMocks();
  });

  it('should render campaign dashboard with campaigns list', async () => {
    renderWithProviders(<MarketingManagerV4 />);

    // Check if dashboard is rendered
    expect(screen.getByText('Marketing Campaign Manager')).toBeInTheDocument();
    
    // Check if campaigns are displayed
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    expect(screen.getByText('Campaign 2')).toBeInTheDocument();
    expect(screen.getByText('Campaign 3')).toBeInTheDocument();
  });

  it('should filter campaigns by status', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Find and click status filter
    const statusFilter = screen.getByDisplayValue('All');
    await user.selectOptions(statusFilter, 'Active');

    expect(mockFiltersStore.setStatusFilter).toHaveBeenCalledWith('Active');
  });

  it('should search campaigns by name', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Find search input
    const searchInput = screen.getByPlaceholderText(/search campaigns/i);
    await user.type(searchInput, 'Campaign 1');

    expect(mockFiltersStore.setSearchTerm).toHaveBeenCalledWith('Campaign 1');
  });

  it('should sort campaigns by clicking column headers', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Find and click a sortable column header (e.g., Revenue)
    const revenueHeader = screen.getByText('Revenue');
    await user.click(revenueHeader);

    expect(mockFiltersStore.setSortConfig).toHaveBeenCalledWith({
      key: 'revenue',
      direction: 'asc'
    });
  });

  it('should navigate to campaign detail view', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Click on a campaign to view details
    const campaignRow = screen.getByText('Campaign 1');
    await user.click(campaignRow);

    expect(mockUIStore.setSelectedCampaignId).toHaveBeenCalledWith('camp_1');
    expect(mockUIStore.setCurrentView).toHaveBeenCalledWith('detail');
  });

  it('should handle campaign creation', async () => {
    const user = userEvent.setup();
    
    // Mock successful campaign creation
    mockAPIClient.createCampaign.mockResolvedValue({
      success: true,
      data: {
        campaign: {
          id: 'camp_new',
          name: 'New Campaign',
          status: 'Draft'
        }
      }
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Find and click create campaign button
    const createButton = screen.getByText(/create campaign/i);
    await user.click(createButton);

    // Should navigate to campaign creation
    expect(mockUIStore.setCurrentView).toHaveBeenCalledWith('create');
  });

  it('should handle pagination', async () => {
    const user = userEvent.setup();
    
    // Mock pagination response
    const { useFiltersStore } = require('../../stores/filtersStore');
    useFiltersStore.mockReturnValue({
      ...mockFiltersStore,
      itemsPerPage: 2 // Show only 2 items per page
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Find pagination controls
    const nextButton = screen.getByText('Next');
    await user.click(nextButton);

    expect(mockFiltersStore.setCurrentPage).toHaveBeenCalledWith(2);
  });

  it('should handle loading state', () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      ...mockCampaignsStore,
      isLoading: true,
      campaigns: []
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Should show loading spinner or skeleton
    expect(screen.getByText(/loading/i) || screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('should handle error state', () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      ...mockCampaignsStore,
      error: new Error('Failed to fetch campaigns'),
      campaigns: []
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Should show error message
    expect(screen.getByText(/error/i) || screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it('should handle empty campaigns list', () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    useCampaignsStore.mockReturnValue({
      ...mockCampaignsStore,
      campaigns: []
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Should show empty state
    expect(screen.getByText(/no campaigns/i) || screen.getByText(/get started/i)).toBeInTheDocument();
  });

  it('should update campaign metrics', async () => {
    const user = userEvent.setup();
    
    // Mock campaign update
    mockAPIClient.updateCampaign.mockResolvedValue({
      success: true,
      data: {
        campaign: {
          ...mockCampaigns[0],
          metrics: {
            ...mockCampaigns[0].metrics,
            cost: 2000
          }
        }
      }
    });

    // Mock detail view
    const { useUIStore } = require('../../stores/uiStore');
    useUIStore.mockReturnValue({
      ...mockUIStore,
      currentView: 'detail',
      selectedCampaignId: 'camp_1'
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Should be in detail view
    await waitFor(() => {
      expect(screen.getByText(/campaign details/i)).toBeInTheDocument();
    });

    // Find and update cost field
    const costInput = screen.getByDisplayValue('1000');
    await user.clear(costInput);
    await user.type(costInput, '2000');

    // Save changes
    const saveButton = screen.getByText(/save/i);
    await user.click(saveButton);

    expect(mockCampaignsStore.updateCampaign).toHaveBeenCalledWith(
      'camp_1',
      expect.objectContaining({
        metrics: expect.objectContaining({
          cost: 2000
        })
      })
    );
  });

  it('should delete campaign with confirmation', async () => {
    const user = userEvent.setup();
    
    // Mock successful deletion
    mockAPIClient.deleteCampaign.mockResolvedValue({
      success: true,
      data: { message: 'Campaign deleted successfully' }
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Find delete button for first campaign
    const deleteButtons = screen.getAllByText(/delete/i);
    await user.click(deleteButtons[0]);

    // Should show confirmation dialog
    expect(screen.getByText(/are you sure/i)).toBeInTheDocument();

    // Confirm deletion
    const confirmButton = screen.getByText(/confirm/i);
    await user.click(confirmButton);

    expect(mockCampaignsStore.deleteCampaign).toHaveBeenCalledWith('camp_1');
  });

  it('should handle vendor filter selection', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Find vendor filter checkboxes
    const googleAdsCheckbox = screen.getByLabelText(/google ads/i);
    await user.click(googleAdsCheckbox);

    expect(mockFiltersStore.setSelectedVendors).toHaveBeenCalledWith(['Google Ads']);
  });

  it('should display campaign metrics and KPIs', async () => {
    renderWithProviders(<MarketingManagerV4 />);

    // Wait for campaigns to load
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Check if KPI cards are displayed
    expect(screen.getByText(/total campaigns/i)).toBeInTheDocument();
    expect(screen.getByText(/total revenue/i)).toBeInTheDocument();
    expect(screen.getByText(/total cost/i)).toBeInTheDocument();
    expect(screen.getByText(/average roas/i)).toBeInTheDocument();
  });

  it('should handle real-time updates', async () => {
    const { useCampaignsStore } = require('../../stores/campaignsStore');
    
    const { rerender } = renderWithProviders(<MarketingManagerV4 />);

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('Campaign 1')).toBeInTheDocument();
    });

    // Simulate real-time update with new campaign
    const updatedCampaigns = [
      ...mockCampaigns,
      {
        id: 'camp_new',
        name: 'New Campaign',
        status: 'Active',
        vendor: 'Facebook Ads',
        metrics: { cost: 500, revenue: 1500 }
      }
    ];

    useCampaignsStore.mockReturnValue({
      ...mockCampaignsStore,
      campaigns: updatedCampaigns
    });

    rerender(<MarketingManagerV4 />);

    // Should show new campaign
    await waitFor(() => {
      expect(screen.getByText('New Campaign')).toBeInTheDocument();
    });
  });

  it('should handle responsive design', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 500
    });

    renderWithProviders(<MarketingManagerV4 />);

    // Check if mobile-specific elements are rendered
    // This would depend on your responsive implementation
    expect(screen.getByText('Marketing Campaign Manager')).toBeInTheDocument();
  });

  it('should persist filter state across navigation', async () => {
    const user = userEvent.setup();
    renderWithProviders(<MarketingManagerV4 />);

    // Set a filter
    const statusFilter = screen.getByDisplayValue('All');
    await user.selectOptions(statusFilter, 'Active');

    // Navigate to detail view
    const campaignRow = screen.getByText('Campaign 1');
    await user.click(campaignRow);

    // Navigate back to dashboard
    const backButton = screen.getByText(/back/i);
    await user.click(backButton);

    // Filter should still be applied
    expect(screen.getByDisplayValue('Active')).toBeInTheDocument();
  });
});