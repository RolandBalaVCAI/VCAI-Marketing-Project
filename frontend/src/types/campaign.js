// Campaign data type definitions and validation

// Campaign status options
export const CAMPAIGN_STATUSES = ['Live', 'Paused', 'Ended'];

// Device targeting options
export const DEVICE_OPTIONS = ['Desktop', 'Mobile', 'Both'];

// Default campaign structure
export const createCampaignTemplate = () => ({
  id: '',
  name: '',
  vendor: '',
  status: 'Paused',
  startDate: '',
  endDate: '',
  manager: 'Unassigned',
  adPlacementDomain: '',
  device: 'Both',
  targeting: 'Global',
  repContactInfo: '',
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
  history: [],
  createdAt: new Date().toISOString(),
  modifiedAt: new Date().toISOString()
});

// Note structure
export const createNoteTemplate = (text, user) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text: text || '',
  user: user || 'Current User',
  timestamp: new Date().toISOString()
});

// Document structure
export const createDocumentTemplate = (name, type, size, data, user) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name: name || '',
  type: type || '',
  size: size || 0,
  uploadDate: new Date().toISOString(),
  uploadedBy: user || 'Current User',
  data: data || '',
  isImage: type ? type.startsWith('image/') : false
});

// Visual media structure
export const createVisualMediaTemplate = (url, description, user) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  url: url || '',
  description: description || '',
  addedDate: new Date().toISOString(),
  addedBy: user || 'Current User'
});

// History entry structure
export const createHistoryEntry = (action, user, details = {}) => ({
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  action: action || '',
  user: user || 'System',
  timestamp: new Date().toISOString(),
  details
});

// Validation functions
export const validateCampaign = (campaign) => {
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
  
  if (!CAMPAIGN_STATUSES.includes(campaign.status)) {
    errors.status = 'Invalid campaign status';
  }
  
  if (!DEVICE_OPTIONS.includes(campaign.device)) {
    errors.device = 'Invalid device option';
  }
  
  // Validate metrics if present
  if (campaign.metrics) {
    const { metrics } = campaign;
    if (metrics.cost < 0) errors.cost = 'Cost cannot be negative';
    if (metrics.rawClicks < 0) errors.rawClicks = 'Raw clicks cannot be negative';
    if (metrics.uniqueClicks < 0) errors.uniqueClicks = 'Unique clicks cannot be negative';
    if (metrics.uniqueClicks > metrics.rawClicks) {
      errors.clicks = 'Unique clicks cannot exceed raw clicks';
    }
    if (metrics.sales < 0) errors.sales = 'Sales cannot be negative';
    if (metrics.revenue && typeof metrics.revenue !== 'number') {
      errors.revenue = 'Revenue must be a number';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Data transformation utilities
export const normalizeCampaign = (campaign) => {
  return {
    ...createCampaignTemplate(),
    ...campaign,
    metrics: {
      ...createCampaignTemplate().metrics,
      ...(campaign.metrics || {})
    },
    notes: campaign.notes || [],
    documents: campaign.documents || [],
    visualMedia: campaign.visualMedia || [],
    history: campaign.history || []
  };
};

// Common vendor list (for dropdowns, etc.)
export const COMMON_VENDORS = [
  'AdTech Solutions',
  'MediaBuy Pro', 
  'Email Dynamics',
  'SearchMax',
  'Partner Network',
  'Display Central',
  'Social Media Hub'
];

// Common targeting options
export const TARGETING_OPTIONS = [
  'United States',
  'Canada', 
  'United Kingdom',
  'Europe',
  'Asia Pacific',
  'Global',
  'North America',
  'Latin America'
];

// Common ad placement domains
export const AD_PLACEMENT_DOMAINS = [
  'google.com',
  'facebook.com',
  'amazon.com',
  'youtube.com',
  'linkedin.com',
  'twitter.com',
  'reddit.com',
  'news.com'
];