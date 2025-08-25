/**
 * Shared Validation Utilities
 * Single source of truth for all validation logic
 */

import { CAMPAIGN_STATUSES, DEVICE_OPTIONS } from '../models/campaign.js';
import { VENDORS, TARGETING_OPTIONS, AD_PLACEMENT_DOMAINS } from '../constants/index.js';

/**
 * Validate campaign data
 * @param {object} campaign - Campaign object to validate
 * @returns {object} Validation result with isValid flag and errors
 */
export const validateCampaign = (campaign) => {
  const errors = {};
  
  // Required fields
  if (!campaign.name || campaign.name.trim() === '') {
    errors.name = 'Campaign name is required';
  } else if (campaign.name.length > 255) {
    errors.name = 'Campaign name must be less than 255 characters';
  }
  
  // Vendor validation
  if (!campaign.vendor || campaign.vendor.trim() === '') {
    errors.vendor = 'Vendor is required';
  }
  
  // Date validation
  if (!campaign.startDate) {
    errors.startDate = 'Start date is required';
  }
  
  if (!campaign.endDate) {
    errors.endDate = 'End date is required';
  }
  
  if (campaign.startDate && campaign.endDate) {
    const start = new Date(campaign.startDate);
    const end = new Date(campaign.endDate);
    if (isNaN(start.getTime())) {
      errors.startDate = 'Invalid start date format';
    }
    if (isNaN(end.getTime())) {
      errors.endDate = 'Invalid end date format';
    }
    if (start >= end) {
      errors.dateRange = 'End date must be after start date';
    }
  }
  
  // Status validation
  if (campaign.status && !Object.values(CAMPAIGN_STATUSES).includes(campaign.status)) {
    errors.status = 'Invalid campaign status';
  }
  
  // Device validation
  if (campaign.device && !Object.values(DEVICE_OPTIONS).includes(campaign.device)) {
    errors.device = 'Invalid device option';
  }
  
  // URL validations
  if (campaign.tracking_url && !isValidUrl(campaign.tracking_url)) {
    errors.tracking_url = 'Invalid tracking URL';
  }
  
  if (campaign.serving_url && !isValidUrl(campaign.serving_url)) {
    errors.serving_url = 'Invalid serving URL';
  }
  
  // Domain validation
  if (campaign.adPlacementDomain && !isValidDomain(campaign.adPlacementDomain)) {
    errors.adPlacementDomain = 'Invalid domain format';
  }
  
  // Metrics validation
  if (campaign.metrics) {
    const metricErrors = validateMetrics(campaign.metrics);
    if (Object.keys(metricErrors).length > 0) {
      errors.metrics = metricErrors;
    }
  }
  
  // Hierarchy validation
  if (campaign.hierarchy) {
    const hierarchyErrors = validateHierarchy(campaign.hierarchy);
    if (Object.keys(hierarchyErrors).length > 0) {
      errors.hierarchy = hierarchyErrors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate metrics object
 * @param {object} metrics - Metrics object to validate
 * @returns {object} Validation errors
 */
export const validateMetrics = (metrics) => {
  const errors = {};
  
  // Numeric validations
  const numericFields = [
    'cost', 'revenue', 'rawClicks', 'uniqueClicks', 'sessions',
    'registrations', 'credit_cards', 'sales', 'orderValue'
  ];
  
  numericFields.forEach(field => {
    if (metrics[field] !== undefined) {
      if (typeof metrics[field] !== 'number') {
        errors[field] = `${field} must be a number`;
      } else if (metrics[field] < 0) {
        errors[field] = `${field} cannot be negative`;
      }
    }
  });
  
  // Logical validations
  if (metrics.uniqueClicks > metrics.rawClicks) {
    errors.clicks = 'Unique clicks cannot exceed raw clicks';
  }
  
  if (metrics.confirmReg > metrics.rawReg) {
    errors.registrations = 'Confirmed registrations cannot exceed raw registrations';
  }
  
  if (metrics.credit_cards > metrics.registrations) {
    errors.credit_cards = 'Credit cards cannot exceed registrations';
  }
  
  return errors;
};

/**
 * Validate hierarchy object
 * @param {object} hierarchy - Hierarchy object to validate
 * @returns {object} Validation errors
 */
export const validateHierarchy = (hierarchy) => {
  const errors = {};
  
  const requiredFields = ['network', 'domain', 'placement', 'targeting', 'special'];
  
  requiredFields.forEach(field => {
    if (!hierarchy[field] || hierarchy[field].trim() === '') {
      errors[field] = `${field} is required in hierarchy`;
    }
  });
  
  if (hierarchy.mapping_confidence !== undefined) {
    if (typeof hierarchy.mapping_confidence !== 'number') {
      errors.mapping_confidence = 'Mapping confidence must be a number';
    } else if (hierarchy.mapping_confidence < 0 || hierarchy.mapping_confidence > 1) {
      errors.mapping_confidence = 'Mapping confidence must be between 0 and 1';
    }
  }
  
  return errors;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Validate domain format
 * @param {string} domain - Domain to validate
 * @returns {boolean} Is valid domain
 */
export const isValidDomain = (domain) => {
  const domainRegex = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainRegex.test(domain);
};

/**
 * Validate date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} Is valid date
 */
export const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate note object
 * @param {object} note - Note object to validate
 * @returns {object} Validation result
 */
export const validateNote = (note) => {
  const errors = {};
  
  if (!note.text || note.text.trim() === '') {
    errors.text = 'Note text is required';
  } else if (note.text.length > 5000) {
    errors.text = 'Note text must be less than 5000 characters';
  }
  
  if (!note.user || note.user.trim() === '') {
    errors.user = 'User is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate document object
 * @param {object} document - Document object to validate
 * @returns {object} Validation result
 */
export const validateDocument = (document) => {
  const errors = {};
  
  if (!document.name || document.name.trim() === '') {
    errors.name = 'Document name is required';
  }
  
  if (!document.type) {
    errors.type = 'Document type is required';
  }
  
  if (!document.size || document.size <= 0) {
    errors.size = 'Invalid document size';
  } else if (document.size > 10 * 1024 * 1024) { // 10MB limit
    errors.size = 'Document size exceeds 10MB limit';
  }
  
  if (!document.data) {
    errors.data = 'Document data is required';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate visual media object
 * @param {object} media - Visual media object to validate
 * @returns {object} Validation result
 */
export const validateVisualMedia = (media) => {
  const errors = {};
  
  if (!media.url || media.url.trim() === '') {
    errors.url = 'Media URL is required';
  } else if (!isValidUrl(media.url)) {
    errors.url = 'Invalid media URL';
  }
  
  if (media.description && media.description.length > 500) {
    errors.description = 'Description must be less than 500 characters';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate batch of campaigns
 * @param {array} campaigns - Array of campaigns to validate
 * @returns {object} Validation results
 */
export const validateBatch = (campaigns) => {
  const results = {
    valid: [],
    invalid: [],
    totalValid: 0,
    totalInvalid: 0
  };
  
  campaigns.forEach((campaign, index) => {
    const validation = validateCampaign(campaign);
    if (validation.isValid) {
      results.valid.push({ index, campaign });
      results.totalValid++;
    } else {
      results.invalid.push({ index, campaign, errors: validation.errors });
      results.totalInvalid++;
    }
  });
  
  return results;
};

/**
 * Sanitize input string
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');
  
  // Remove script tags content
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Trim whitespace
  sanitized = sanitized.trim();
  
  return sanitized;
};

/**
 * Validate API response
 * @param {object} response - API response to validate
 * @returns {boolean} Is valid response
 */
export const validateApiResponse = (response) => {
  if (!response) return false;
  
  // Check for error indicators
  if (response.error || response.errors) return false;
  
  // Check for success indicators
  if (response.success === false) return false;
  
  // Check for data presence
  if (response.data === null || response.data === undefined) return false;
  
  return true;
};

// Export for Python compatibility
export default {
  validateCampaign,
  validateMetrics,
  validateHierarchy,
  validateNote,
  validateDocument,
  validateVisualMedia,
  validateBatch,
  isValidEmail,
  isValidUrl,
  isValidDomain,
  isValidDate,
  isValidPhone,
  sanitizeInput,
  validateApiResponse
};