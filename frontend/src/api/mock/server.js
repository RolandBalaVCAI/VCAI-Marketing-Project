import { getInitialCampaigns, generateCampaignTemplate } from './data/campaigns';
import { createNoteTemplate, createDocumentTemplate, createVisualMediaTemplate, createHistoryEntry } from '../../types/campaign';

// Storage key for localStorage
const STORAGE_KEY = 'marketing_dashboard_campaigns';

// Mock server class to simulate API behavior
class MockAPIServer {
  constructor() {
    this.campaigns = this.loadCampaigns();
    this.requestCount = 0;
  }

  // Load campaigns from localStorage or generate initial data
  loadCampaigns() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load campaigns from localStorage:', error);
    }
    
    // Generate initial data and save it
    const initialCampaigns = getInitialCampaigns();
    this.saveCampaigns(initialCampaigns);
    return initialCampaigns;
  }

  // Save campaigns to localStorage
  saveCampaigns(campaigns = this.campaigns) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    } catch (error) {
      console.warn('Failed to save campaigns to localStorage:', error);
    }
  }

  // Simulate network delay and potential errors
  async simulateNetworkRequest(operation = 'read') {
    this.requestCount++;
    
    // Random delay between 100-500ms
    const delay = Math.random() * 400 + 100;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate errors (small chance)
    const errorChance = Math.random();
    
    // Network timeout (5% chance)
    if (errorChance < 0.05) {
      throw {
        code: 'NETWORK_ERROR',
        message: 'Request timeout',
        status: 408
      };
    }
    
    // Server error (1% chance)
    if (errorChance < 0.01) {
      throw {
        code: 'SERVER_ERROR',
        message: 'Internal server error',
        status: 500
      };
    }
    
    // Simulate higher error rate for write operations
    if (operation === 'write' && errorChance < 0.03) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Data validation failed',
        status: 400
      };
    }
  }

  // Filter campaigns based on query parameters
  filterCampaigns(campaigns, filters = {}) {
    let filtered = [...campaigns];
    
    // Vendor filter
    if (filters.vendor && filters.vendor.length > 0) {
      const vendors = Array.isArray(filters.vendor) ? filters.vendor : [filters.vendor];
      filtered = filtered.filter(campaign => vendors.includes(campaign.vendor));
    }
    
    // Status filter
    if (filters.status && filters.status !== 'All') {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      filtered = filtered.filter(campaign => statuses.includes(campaign.status));
    }
    
    // Date range filter
    if (filters.startDate || filters.endDate) {
      filtered = filtered.filter(campaign => {
        const campaignStart = new Date(campaign.startDate);
        const campaignEnd = new Date(campaign.endDate);
        
        if (filters.startDate) {
          const filterStart = new Date(filters.startDate);
          if (campaignEnd < filterStart) return false;
        }
        
        if (filters.endDate) {
          const filterEnd = new Date(filters.endDate);
          if (campaignStart > filterEnd) return false;
        }
        
        return true;
      });
    }
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(campaign =>
        campaign.name.toLowerCase().includes(searchTerm) ||
        campaign.vendor.toLowerCase().includes(searchTerm) ||
        campaign.id.toLowerCase().includes(searchTerm) ||
        campaign.manager.toLowerCase().includes(searchTerm)
      );
    }
    
    return filtered;
  }

  // Sort campaigns
  sortCampaigns(campaigns, sortBy = 'createdAt', sortOrder = 'desc') {
    return [...campaigns].sort((a, b) => {
      let aValue, bValue;
      
      // Handle nested metric fields
      if (sortBy.includes('.')) {
        const [parent, child] = sortBy.split('.');
        aValue = a[parent]?.[child];
        bValue = b[parent]?.[child];
      } else {
        aValue = a[sortBy];
        bValue = b[sortBy];
      }
      
      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = 0;
      if (bValue === null || bValue === undefined) bValue = 0;
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Numeric comparison
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  // Paginate results
  paginateResults(items, page = 1, limit = 10) {
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);
    
    return {
      data: paginatedItems,
      meta: {
        total: items.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(items.length / limit),
        hasNext: offset + limit < items.length,
        hasPrev: page > 1
      }
    };
  }

  // Validate campaign data
  validateCampaign(campaign) {
    const errors = {};
    
    if (!campaign.name || campaign.name.trim() === '') {
      errors.name = 'Campaign name is required';
    }
    
    if (!campaign.vendor || campaign.vendor.trim() === '') {
      errors.vendor = 'Vendor is required';
    }
    
    if (!campaign.startDate) {
      errors.startDate = 'Start date is required';
    }
    
    if (!campaign.endDate) {
      errors.endDate = 'End date is required';
    }
    
    if (campaign.startDate && campaign.endDate) {
      const start = new Date(campaign.startDate);
      const end = new Date(campaign.endDate);
      if (start >= end) {
        errors.dateRange = 'End date must be after start date';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      throw {
        code: 'VALIDATION_ERROR',
        message: 'Campaign validation failed',
        status: 400,
        details: errors
      };
    }
  }

  // Get campaigns with filtering, sorting, and pagination
  async getCampaigns(query = {}) {
    await this.simulateNetworkRequest('read');
    
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      ...filters
    } = query;
    
    let campaigns = this.filterCampaigns(this.campaigns, filters);
    campaigns = this.sortCampaigns(campaigns, sortBy, sortOrder);
    
    return this.paginateResults(campaigns, page, limit);
  }

  // Get single campaign by ID
  async getCampaignById(id) {
    await this.simulateNetworkRequest('read');
    
    const campaign = this.campaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    return {
      data: campaign,
      meta: {
        lastModified: campaign.modifiedAt
      }
    };
  }

  // Create new campaign
  async createCampaign(campaignData) {
    await this.simulateNetworkRequest('write');
    
    this.validateCampaign(campaignData);
    
    const newCampaign = generateCampaignTemplate({
      ...campaignData,
      id: `CMP-2024-${String(Date.now()).slice(-6)}`,
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    });
    
    this.campaigns.unshift(newCampaign);
    this.saveCampaigns();
    
    return {
      data: newCampaign,
      meta: {
        created: true
      }
    };
  }

  // Update existing campaign
  async updateCampaign(id, updates) {
    await this.simulateNetworkRequest('write');
    
    const campaignIndex = this.campaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    const updatedCampaign = {
      ...this.campaigns[campaignIndex],
      ...updates,
      modifiedAt: new Date().toISOString()
    };
    
    this.validateCampaign(updatedCampaign);
    
    // Add history entry for update
    updatedCampaign.history = updatedCampaign.history || [];
    updatedCampaign.history.unshift(createHistoryEntry(
      'Campaign updated',
      updates.updatedBy || 'Current User',
      { fields: Object.keys(updates) }
    ));
    
    this.campaigns[campaignIndex] = updatedCampaign;
    this.saveCampaigns();
    
    return {
      data: updatedCampaign,
      meta: {
        updated: true
      }
    };
  }

  // Delete campaign
  async deleteCampaign(id) {
    await this.simulateNetworkRequest('write');
    
    const campaignIndex = this.campaigns.findIndex(c => c.id === id);
    
    if (campaignIndex === -1) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    this.campaigns.splice(campaignIndex, 1);
    this.saveCampaigns();
    
    return {
      data: null,
      meta: {
        deleted: true
      }
    };
  }

  // Add note to campaign
  async addNoteToCampaign(id, noteData) {
    await this.simulateNetworkRequest('write');
    
    const campaign = this.campaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    const note = createNoteTemplate(noteData.text, noteData.user);
    campaign.notes = campaign.notes || [];
    campaign.notes.unshift(note);
    
    // Add history entry
    const historyEntry = createHistoryEntry(
      'Note added',
      noteData.user || 'Current User'
    );
    campaign.history = campaign.history || [];
    campaign.history.unshift(historyEntry);
    
    campaign.modifiedAt = new Date().toISOString();
    this.saveCampaigns();
    
    return {
      data: { note, historyEntry },
      meta: {
        added: true
      }
    };
  }

  // Upload document to campaign
  async uploadDocumentToCampaign(id, documentData) {
    await this.simulateNetworkRequest('write');
    
    const campaign = this.campaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    const document = createDocumentTemplate(
      documentData.name,
      documentData.type,
      documentData.size,
      documentData.data,
      documentData.user
    );
    
    campaign.documents = campaign.documents || [];
    campaign.documents.unshift(document);
    
    // Add history entry
    const historyEntry = createHistoryEntry(
      `Document uploaded: ${documentData.name}`,
      documentData.user || 'Current User'
    );
    campaign.history = campaign.history || [];
    campaign.history.unshift(historyEntry);
    
    campaign.modifiedAt = new Date().toISOString();
    this.saveCampaigns();
    
    return {
      data: { document, historyEntry },
      meta: {
        uploaded: true
      }
    };
  }

  // Add visual media to campaign
  async addVisualMediaToCampaign(id, mediaData) {
    await this.simulateNetworkRequest('write');
    
    const campaign = this.campaigns.find(c => c.id === id);
    
    if (!campaign) {
      throw {
        code: 'NOT_FOUND',
        message: 'Campaign not found',
        status: 404
      };
    }
    
    const media = createVisualMediaTemplate(
      mediaData.url,
      mediaData.description,
      mediaData.user
    );
    
    campaign.visualMedia = campaign.visualMedia || [];
    campaign.visualMedia.unshift(media);
    
    // Add history entry
    const historyEntry = createHistoryEntry(
      `Visual media added: ${mediaData.description}`,
      mediaData.user || 'Current User'
    );
    campaign.history = campaign.history || [];
    campaign.history.unshift(historyEntry);
    
    campaign.modifiedAt = new Date().toISOString();
    this.saveCampaigns();
    
    return {
      data: { media, historyEntry },
      meta: {
        added: true
      }
    };
  }

  // Get server stats (for debugging/monitoring)
  getServerStats() {
    return {
      totalCampaigns: this.campaigns.length,
      requestCount: this.requestCount,
      lastUpdated: new Date().toISOString()
    };
  }

  // Reset data (for testing)
  async resetData() {
    await this.simulateNetworkRequest('write');
    
    this.campaigns = getInitialCampaigns();
    this.saveCampaigns();
    this.requestCount = 0;
    
    return {
      data: null,
      meta: {
        reset: true,
        campaignCount: this.campaigns.length
      }
    };
  }
}

// Create and export singleton instance
export const mockAPIServer = new MockAPIServer();
export default mockAPIServer;