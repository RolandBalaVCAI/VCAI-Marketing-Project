/**
 * Unified Campaign Model
 * Single source of truth for campaign data structure
 * Used by both React frontend and Python backend
 */

// Campaign status options (used by both systems)
export const CAMPAIGN_STATUSES = {
  LIVE: 'Live',
  PAUSED: 'Paused',
  ENDED: 'Ended',
  SERVING: 'Serving',
  NOT_SERVING: 'Not Serving'
};

// Device targeting options
export const DEVICE_OPTIONS = {
  DESKTOP: 'Desktop',
  MOBILE: 'Mobile',
  BOTH: 'Both'
};

// Unified campaign structure combining both systems
export const CampaignModel = {
  // Core fields (from both systems)
  id: null,                     // Integer (from Peach AI)
  name: '',                      // Text
  description: '',               // Text (from Peach AI)
  vendor: '',                    // Text (React specific)
  slug: '',                      // Text (from Peach AI)
  path: '',                      // Text (from Peach AI)
  
  // Status and serving
  status: CAMPAIGN_STATUSES.PAUSED,
  is_serving: false,             // Boolean (from Peach AI)
  serving_url: '',               // Text (from Peach AI)
  traffic_weight: 0,             // Integer (from Peach AI)
  
  // Dates
  startDate: '',                 // ISO string
  endDate: '',                   // ISO string
  created_at: '',                // ISO string (from Peach AI)
  updated_at: '',                // ISO string (from Peach AI)
  deleted_at: null,              // ISO string or null (from Peach AI)
  
  // Management
  manager: 'Unassigned',         // Text (React specific)
  repContactInfo: '',            // Text (React specific)
  
  // Targeting
  adPlacementDomain: '',         // Text (React specific)
  device: DEVICE_OPTIONS.BOTH,   // Text (React specific)
  targeting: 'Global',           // Text (React specific)
  tracking_url: '',              // Text (from Peach AI)
  
  // Hierarchy (from data warehouse)
  hierarchy: {
    network: '',
    domain: '',
    placement: '',
    targeting: '',
    special: '',
    mapping_confidence: 1.0
  },
  
  // Metrics (combined from both systems)
  metrics: {
    // React metrics
    rawClicks: 0,
    uniqueClicks: 0,
    cost: 0,
    rawReg: 0,
    confirmReg: 0,
    sales: 0,
    orderValue: 0,
    revenue: 0,
    ltrev: 0,
    
    // Peach AI metrics (from hourly_data)
    sessions: 0,
    registrations: 0,
    credit_cards: 0,
    email_accounts: 0,
    google_accounts: 0,
    total_accounts: 0,
    messages: 0,
    companion_chats: 0,
    chat_room_user_chats: 0,
    total_user_chats: 0,
    media: 0,
    payment_methods: 0,
    converted_users: 0,
    terms_acceptances: 0,
    
    // Calculated metrics
    roas: 0,
    reg_percentage: 0,
    cc_conv_percentage: 0,
    clicks_to_reg_ratio: 0,
    reg_to_cc_ratio: 0
  },
  
  // Related data
  notes: [],                     // Array of note objects
  documents: [],                 // Array of document objects
  visualMedia: [],               // Array of visual media objects
  history: [],                   // Array of history entries
  
  // Sync metadata
  sync_timestamp: '',            // Last sync from Peach AI
  modified_locally: false        // Whether modified in React
};

// Note structure (shared)
export const NoteModel = {
  id: '',
  text: '',
  user: '',
  timestamp: '',
  campaign_id: null
};

// Document structure (shared)
export const DocumentModel = {
  id: '',
  name: '',
  type: '',
  size: 0,
  uploadDate: '',
  uploadedBy: '',
  data: '',
  isImage: false,
  campaign_id: null
};

// Visual media structure (shared)
export const VisualMediaModel = {
  id: '',
  url: '',
  description: '',
  addedDate: '',
  addedBy: '',
  campaign_id: null
};

// History entry structure (shared)
export const HistoryEntryModel = {
  id: '',
  action: '',
  user: '',
  timestamp: '',
  details: {},
  campaign_id: null
};

// Factory functions for creating new instances
export const createCampaign = (data = {}) => ({
  ...CampaignModel,
  ...data,
  metrics: {
    ...CampaignModel.metrics,
    ...(data.metrics || {})
  },
  hierarchy: {
    ...CampaignModel.hierarchy,
    ...(data.hierarchy || {})
  }
});

export const createNote = (text, user, campaignId = null) => ({
  ...NoteModel,
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  text,
  user,
  timestamp: new Date().toISOString(),
  campaign_id: campaignId
});

export const createDocument = (name, type, size, data, user, campaignId = null) => ({
  ...DocumentModel,
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  name,
  type,
  size,
  data,
  uploadDate: new Date().toISOString(),
  uploadedBy: user,
  isImage: type ? type.startsWith('image/') : false,
  campaign_id: campaignId
});

export const createVisualMedia = (url, description, user, campaignId = null) => ({
  ...VisualMediaModel,
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  url,
  description,
  addedDate: new Date().toISOString(),
  addedBy: user,
  campaign_id: campaignId
});

export const createHistoryEntry = (action, user, details = {}, campaignId = null) => ({
  ...HistoryEntryModel,
  id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  action,
  user,
  timestamp: new Date().toISOString(),
  details,
  campaign_id: campaignId
});

// Export for Python compatibility (JSON schema)
export const getCampaignSchema = () => {
  return {
    type: 'object',
    properties: {
      id: { type: ['integer', 'null'] },
      name: { type: 'string' },
      description: { type: 'string' },
      vendor: { type: 'string' },
      status: { type: 'string', enum: Object.values(CAMPAIGN_STATUSES) },
      is_serving: { type: 'boolean' },
      metrics: { type: 'object' },
      hierarchy: { type: 'object' },
      notes: { type: 'array' },
      documents: { type: 'array' },
      visualMedia: { type: 'array' },
      history: { type: 'array' }
    },
    required: ['name']
  };
};