/**
 * Shared Constants
 * Single source of truth for all constant values used across the system
 */

// API Configuration
export const API_CONFIG = {
  PEACH_AI_BASE_URL: process.env.PEACHAI_API_URL || 'https://api.peach.ai',
  BACKEND_BASE_URL: process.env.BACKEND_URL || 'http://localhost:8000',
  API_TIMEOUT: 30000,
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000
};

// Common vendor list (unified from both systems)
export const VENDORS = [
  'AdTech Solutions',
  'MediaBuy Pro',
  'Email Dynamics',
  'SearchMax',
  'Partner Network',
  'Display Central',
  'Social Media Hub',
  'Peach AI Network',
  'Direct Traffic',
  'Organic Search',
  'Paid Search',
  'Social Media',
  'Email Marketing',
  'Affiliate Network'
];

// Targeting options (geographic)
export const TARGETING_OPTIONS = [
  'United States',
  'Canada',
  'United Kingdom',
  'Europe',
  'Asia Pacific',
  'Global',
  'North America',
  'Latin America',
  'Australia',
  'Middle East',
  'Africa'
];

// Ad placement domains
export const AD_PLACEMENT_DOMAINS = [
  'google.com',
  'facebook.com',
  'amazon.com',
  'youtube.com',
  'linkedin.com',
  'twitter.com',
  'reddit.com',
  'news.com',
  'instagram.com',
  'tiktok.com',
  'snapchat.com',
  'pinterest.com'
];

// Hierarchy tiers (from data warehouse)
export const HIERARCHY_TIERS = {
  NETWORK: 'network',
  DOMAIN: 'domain',
  PLACEMENT: 'placement',
  TARGETING: 'targeting',
  SPECIAL: 'special'
};

// Default hierarchy values
export const DEFAULT_HIERARCHY = {
  [HIERARCHY_TIERS.NETWORK]: 'Unknown Network',
  [HIERARCHY_TIERS.DOMAIN]: 'Unknown Domain',
  [HIERARCHY_TIERS.PLACEMENT]: 'Unknown Placement',
  [HIERARCHY_TIERS.TARGETING]: 'Unknown Targeting',
  [HIERARCHY_TIERS.SPECIAL]: 'None'
};

// Manager options
export const MANAGERS = [
  'Unassigned',
  'John Doe',
  'Jane Smith',
  'Marketing Team',
  'Sales Team',
  'Product Team',
  'Analytics Team'
];

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy',
  INPUT: 'yyyy-MM-dd',
  DATETIME: 'MMM dd, yyyy HH:mm',
  ISO: "yyyy-MM-dd'T'HH:mm:ss'Z'"
};

// Metric thresholds
export const METRIC_THRESHOLDS = {
  GOOD_ROAS: 3.0,      // ROAS above this is considered good
  WARNING_ROAS: 1.5,    // ROAS below this is warning
  DANGER_ROAS: 1.0,     // ROAS below this is danger
  
  GOOD_REG_RATE: 15,    // Registration % above this is good
  WARNING_REG_RATE: 10, // Registration % below this is warning
  DANGER_REG_RATE: 5,   // Registration % below this is danger
  
  GOOD_CC_CONV: 20,     // CC conversion % above this is good
  WARNING_CC_CONV: 10,  // CC conversion % below this is warning
  DANGER_CC_CONV: 5     // CC conversion % below this is danger
};

// Status colors
export const STATUS_COLORS = {
  Live: '#10B981',      // Green
  Paused: '#F59E0B',    // Amber
  Ended: '#EF4444',     // Red
  Serving: '#10B981',   // Green
  'Not Serving': '#6B7280' // Gray
};

// Action types for history tracking
export const ACTION_TYPES = {
  CREATE: 'Campaign Created',
  UPDATE: 'Campaign Updated',
  STATUS_CHANGE: 'Status Changed',
  NOTE_ADDED: 'Note Added',
  DOCUMENT_UPLOADED: 'Document Uploaded',
  VISUAL_ADDED: 'Visual Media Added',
  METRICS_UPDATED: 'Metrics Updated',
  HIERARCHY_MAPPED: 'Hierarchy Mapped',
  SYNC_COMPLETED: 'Data Synced',
  EXPORT_GENERATED: 'Export Generated'
};

// Error messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
  API_ERROR: 'API request failed. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  AUTH_ERROR: 'Authentication failed. Please check your credentials.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error occurred. Please contact support.',
  TIMEOUT_ERROR: 'Request timed out. Please try again.',
  PERMISSION_ERROR: 'You do not have permission to perform this action.'
};

// Success messages
export const SUCCESS_MESSAGES = {
  CAMPAIGN_CREATED: 'Campaign created successfully',
  CAMPAIGN_UPDATED: 'Campaign updated successfully',
  CAMPAIGN_DELETED: 'Campaign deleted successfully',
  NOTE_ADDED: 'Note added successfully',
  DOCUMENT_UPLOADED: 'Document uploaded successfully',
  EXPORT_COMPLETED: 'Export completed successfully',
  SYNC_COMPLETED: 'Data synchronized successfully'
};

// Batch sizes
export const BATCH_SIZES = {
  CAMPAIGNS_PER_PAGE: 20,
  METRICS_BATCH: 100,
  EXPORT_BATCH: 500,
  SYNC_BATCH: 200
};

// Cache durations (in milliseconds)
export const CACHE_DURATIONS = {
  CAMPAIGNS: 5 * 60 * 1000,    // 5 minutes
  METRICS: 2 * 60 * 1000,       // 2 minutes
  HIERARCHY: 10 * 60 * 1000,    // 10 minutes
  STATIC_DATA: 60 * 60 * 1000   // 1 hour
};

// Export formats
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  EXCEL: 'xlsx',
  GOOGLE_SHEETS: 'google_sheets'
};

// Sort options
export const SORT_OPTIONS = {
  NAME_ASC: { field: 'name', order: 'asc' },
  NAME_DESC: { field: 'name', order: 'desc' },
  DATE_ASC: { field: 'created_at', order: 'asc' },
  DATE_DESC: { field: 'created_at', order: 'desc' },
  ROAS_ASC: { field: 'roas', order: 'asc' },
  ROAS_DESC: { field: 'roas', order: 'desc' },
  COST_ASC: { field: 'cost', order: 'asc' },
  COST_DESC: { field: 'cost', order: 'desc' }
};

// Database configuration
export const DATABASE_CONFIG = {
  SQLITE_PATH: './datawarehouse.db',
  BACKUP_PATH: './backups/',
  MAX_CONNECTIONS: 10,
  TIMEOUT: 30000
};

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_REAL_TIME_SYNC: true,
  ENABLE_GOOGLE_SHEETS_EXPORT: true,
  ENABLE_HIERARCHY_EDITOR: true,
  ENABLE_BULK_OPERATIONS: true,
  ENABLE_ADVANCED_FILTERS: true,
  ENABLE_PERFORMANCE_MONITORING: false
};