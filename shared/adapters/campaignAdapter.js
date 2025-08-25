/**
 * Campaign Data Adapters
 * Convert data between Peach AI format and React format
 * Ensures DRY principle by handling all transformations in one place
 */

import { createCampaign, createNote, createHistoryEntry } from '../models/campaign.js';
import { CAMPAIGN_STATUSES } from '../models/campaign.js';

/**
 * Convert Peach AI campaign data to unified format
 * @param {object} peachCampaign - Campaign data from Peach AI API
 * @param {object} metricsData - Optional metrics data from hourly_data table
 * @param {object} hierarchyData - Optional hierarchy mapping
 * @returns {object} Unified campaign object
 */
export const adaptPeachAIToUnified = (peachCampaign, metricsData = {}, hierarchyData = {}) => {
  const unifiedCampaign = createCampaign({
    // Core fields from Peach AI
    id: peachCampaign.id,
    name: peachCampaign.name || '',
    description: peachCampaign.description || '',
    slug: peachCampaign.slug || '',
    path: peachCampaign.path || '',
    
    // Status mapping
    status: mapPeachAIStatus(peachCampaign.is_serving),
    is_serving: peachCampaign.is_serving || false,
    serving_url: peachCampaign.serving_url || '',
    traffic_weight: peachCampaign.traffic_weight || 0,
    
    // Dates
    created_at: peachCampaign.created_at || new Date().toISOString(),
    updated_at: peachCampaign.updated_at || new Date().toISOString(),
    deleted_at: peachCampaign.deleted_at || null,
    startDate: peachCampaign.created_at || new Date().toISOString(),
    endDate: '', // Not provided by Peach AI, can be set manually
    
    // URLs
    tracking_url: peachCampaign.tracking_url || '',
    
    // Default React-specific fields
    vendor: 'Peach AI Network',
    manager: 'Unassigned',
    repContactInfo: '',
    adPlacementDomain: extractDomainFromUrl(peachCampaign.serving_url),
    device: 'Both',
    targeting: 'Global',
    
    // Hierarchy data
    hierarchy: {
      network: hierarchyData.network || 'Peach AI',
      domain: hierarchyData.domain || extractDomainFromUrl(peachCampaign.serving_url) || 'Unknown',
      placement: hierarchyData.placement || 'Unknown',
      targeting: hierarchyData.targeting || 'Unknown',
      special: hierarchyData.special || 'None',
      mapping_confidence: hierarchyData.mapping_confidence || 1.0
    },
    
    // Metrics from hourly data
    metrics: {
      // Peach AI specific metrics
      sessions: metricsData.sessions || 0,
      registrations: metricsData.registrations || 0,
      credit_cards: metricsData.credit_cards || 0,
      email_accounts: metricsData.email_accounts || 0,
      google_accounts: metricsData.google_accounts || 0,
      total_accounts: metricsData.total_accounts || 0,
      messages: metricsData.messages || 0,
      companion_chats: metricsData.companion_chats || 0,
      chat_room_user_chats: metricsData.chat_room_user_chats || 0,
      total_user_chats: metricsData.total_user_chats || 0,
      media: metricsData.media || 0,
      payment_methods: metricsData.payment_methods || 0,
      converted_users: metricsData.converted_users || 0,
      terms_acceptances: metricsData.terms_acceptances || 0,
      
      // Default React metrics (to be populated from other sources)
      rawClicks: 0,
      uniqueClicks: 0,
      cost: 0,
      rawReg: metricsData.registrations || 0,
      confirmReg: metricsData.registrations || 0,
      sales: metricsData.converted_users || 0,
      orderValue: 0,
      revenue: 0,
      ltrev: 0
    },
    
    // Sync metadata
    sync_timestamp: new Date().toISOString(),
    modified_locally: false
  });
  
  return unifiedCampaign;
};

/**
 * Convert unified campaign data back to Peach AI format
 * @param {object} unifiedCampaign - Unified campaign object
 * @returns {object} Peach AI compatible object
 */
export const adaptUnifiedToPeachAI = (unifiedCampaign) => {
  return {
    id: unifiedCampaign.id,
    name: unifiedCampaign.name,
    description: unifiedCampaign.description,
    tracking_url: unifiedCampaign.tracking_url,
    is_serving: unifiedCampaign.is_serving,
    serving_url: unifiedCampaign.serving_url,
    traffic_weight: unifiedCampaign.traffic_weight,
    deleted_at: unifiedCampaign.deleted_at,
    created_at: unifiedCampaign.created_at,
    updated_at: unifiedCampaign.updated_at,
    slug: unifiedCampaign.slug,
    path: unifiedCampaign.path
  };
};

/**
 * Convert React legacy campaign to unified format
 * @param {object} reactCampaign - Campaign from React system
 * @returns {object} Unified campaign object
 */
export const adaptReactToUnified = (reactCampaign) => {
  return createCampaign({
    // Use existing data
    ...reactCampaign,
    
    // Ensure proper structure
    hierarchy: reactCampaign.hierarchy || {
      network: 'Unknown',
      domain: reactCampaign.adPlacementDomain || 'Unknown',
      placement: 'Unknown',
      targeting: reactCampaign.targeting || 'Unknown',
      special: 'None',
      mapping_confidence: 0.5
    },
    
    // Map metrics to unified structure
    metrics: {
      // React metrics
      rawClicks: reactCampaign.metrics?.rawClicks || 0,
      uniqueClicks: reactCampaign.metrics?.uniqueClicks || 0,
      cost: reactCampaign.metrics?.cost || 0,
      rawReg: reactCampaign.metrics?.rawReg || 0,
      confirmReg: reactCampaign.metrics?.confirmReg || 0,
      sales: reactCampaign.metrics?.sales || 0,
      orderValue: reactCampaign.metrics?.orderValue || 0,
      revenue: reactCampaign.metrics?.revenue || 0,
      ltrev: reactCampaign.metrics?.ltrev || 0,
      
      // Map to Peach AI equivalents
      sessions: reactCampaign.metrics?.uniqueClicks || 0,
      registrations: reactCampaign.metrics?.confirmReg || 0,
      credit_cards: Math.floor((reactCampaign.metrics?.sales || 0) * 0.8), // Estimate
      converted_users: reactCampaign.metrics?.sales || 0,
      
      // Default Peach AI metrics
      email_accounts: 0,
      google_accounts: 0,
      total_accounts: reactCampaign.metrics?.confirmReg || 0,
      messages: 0,
      companion_chats: 0,
      chat_room_user_chats: 0,
      total_user_chats: 0,
      media: 0,
      payment_methods: 0,
      terms_acceptances: 0
    },
    
    // Default Peach AI fields if not present
    slug: reactCampaign.slug || generateSlug(reactCampaign.name),
    path: reactCampaign.path || `/${generateSlug(reactCampaign.name)}`,
    is_serving: reactCampaign.status === 'Live',
    serving_url: reactCampaign.serving_url || '',
    traffic_weight: reactCampaign.traffic_weight || 100,
    tracking_url: reactCampaign.tracking_url || '',
    
    // Mark as locally modified
    modified_locally: true
  });
};

/**
 * Convert unified campaign back to React legacy format
 * @param {object} unifiedCampaign - Unified campaign object
 * @returns {object} React compatible campaign object
 */
export const adaptUnifiedToReact = (unifiedCampaign) => {
  return {
    id: unifiedCampaign.id?.toString() || Date.now().toString(),
    name: unifiedCampaign.name,
    vendor: unifiedCampaign.vendor,
    status: unifiedCampaign.status,
    startDate: unifiedCampaign.startDate,
    endDate: unifiedCampaign.endDate,
    manager: unifiedCampaign.manager,
    adPlacementDomain: unifiedCampaign.adPlacementDomain,
    device: unifiedCampaign.device,
    targeting: unifiedCampaign.targeting,
    repContactInfo: unifiedCampaign.repContactInfo,
    
    metrics: {
      rawClicks: unifiedCampaign.metrics.rawClicks,
      uniqueClicks: unifiedCampaign.metrics.uniqueClicks,
      cost: unifiedCampaign.metrics.cost,
      rawReg: unifiedCampaign.metrics.rawReg,
      confirmReg: unifiedCampaign.metrics.confirmReg,
      sales: unifiedCampaign.metrics.sales,
      orderValue: unifiedCampaign.metrics.orderValue,
      revenue: unifiedCampaign.metrics.revenue,
      ltrev: unifiedCampaign.metrics.ltrev
    },
    
    notes: unifiedCampaign.notes || [],
    documents: unifiedCampaign.documents || [],
    visualMedia: unifiedCampaign.visualMedia || [],
    history: unifiedCampaign.history || [],
    
    createdAt: unifiedCampaign.created_at,
    modifiedAt: unifiedCampaign.updated_at
  };
};

/**
 * Batch convert array of campaigns
 * @param {array} campaigns - Array of campaigns
 * @param {function} adapterFunction - Adapter function to use
 * @returns {array} Converted campaigns
 */
export const batchAdapt = (campaigns, adapterFunction) => {
  return campaigns.map(campaign => adapterFunction(campaign));
};

/**
 * Convert database row to unified campaign
 * @param {object} dbRow - Database row with joined data
 * @returns {object} Unified campaign object
 */
export const adaptDatabaseToUnified = (dbRow) => {
  return adaptPeachAIToUnified(
    {
      id: dbRow.id,
      name: dbRow.name,
      description: dbRow.description,
      tracking_url: dbRow.tracking_url,
      is_serving: dbRow.is_serving,
      serving_url: dbRow.serving_url,
      traffic_weight: dbRow.traffic_weight,
      deleted_at: dbRow.deleted_at,
      created_at: dbRow.created_at,
      updated_at: dbRow.updated_at,
      slug: dbRow.slug,
      path: dbRow.path
    },
    {
      sessions: dbRow.sessions,
      registrations: dbRow.registrations,
      credit_cards: dbRow.credit_cards,
      email_accounts: dbRow.email_accounts,
      google_accounts: dbRow.google_accounts,
      total_accounts: dbRow.total_accounts,
      messages: dbRow.messages,
      companion_chats: dbRow.companion_chats,
      chat_room_user_chats: dbRow.chat_room_user_chats,
      total_user_chats: dbRow.total_user_chats,
      media: dbRow.media,
      payment_methods: dbRow.payment_methods,
      converted_users: dbRow.converted_users,
      terms_acceptances: dbRow.terms_acceptances
    },
    {
      network: dbRow.network,
      domain: dbRow.domain,
      placement: dbRow.placement,
      targeting: dbRow.hierarchy_targeting,
      special: dbRow.special,
      mapping_confidence: dbRow.mapping_confidence
    }
  );
};

// Helper functions

/**
 * Map Peach AI serving status to unified status
 * @param {boolean} isServing - Peach AI is_serving flag
 * @returns {string} Unified status
 */
const mapPeachAIStatus = (isServing) => {
  return isServing ? CAMPAIGN_STATUSES.LIVE : CAMPAIGN_STATUSES.PAUSED;
};

/**
 * Extract domain from URL
 * @param {string} url - URL string
 * @returns {string} Domain or empty string
 */
const extractDomainFromUrl = (url) => {
  if (!url) return '';
  
  try {
    return new URL(url).hostname;
  } catch {
    // If invalid URL, try to extract manually
    const match = url.match(/https?:\/\/(www\.)?([^\/]+)/);
    return match ? match[2] : '';
  }
};

/**
 * Generate slug from campaign name
 * @param {string} name - Campaign name
 * @returns {string} URL-safe slug
 */
const generateSlug = (name) => {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Create history entry for data sync
 * @param {string} source - Data source (e.g., 'Peach AI', 'Manual')
 * @param {object} changes - Changes made
 * @returns {object} History entry
 */
export const createSyncHistoryEntry = (source, changes = {}) => {
  return createHistoryEntry(
    `Data synced from ${source}`,
    'System',
    {
      source,
      changes,
      sync_timestamp: new Date().toISOString()
    }
  );
};

// Export all functions
export default {
  adaptPeachAIToUnified,
  adaptUnifiedToPeachAI,
  adaptReactToUnified,
  adaptUnifiedToReact,
  adaptDatabaseToUnified,
  batchAdapt,
  createSyncHistoryEntry
};