/**
 * Shared Calculation Utilities
 * Single source of truth for all metric calculations
 * Used by both React frontend and Python backend
 */

/**
 * Calculate Return on Ad Spend (ROAS)
 * @param {number} spend - Total ad spend
 * @param {number} revenue - Total revenue generated
 * @returns {number} ROAS value
 */
export const calculateROAS = (spend, revenue) => {
  if (!spend || spend <= 0) return 0;
  return parseFloat((revenue / spend).toFixed(2));
};

/**
 * Calculate Registration Percentage
 * @param {number} sessions - Total sessions/visits
 * @param {number} registrations - Total registrations
 * @returns {number} Registration percentage
 */
export const calculateRegPercentage = (sessions, registrations) => {
  if (!sessions || sessions <= 0) return 0;
  return parseFloat(((registrations / sessions) * 100).toFixed(2));
};

/**
 * Calculate Credit Card Conversion Percentage
 * @param {number} registrations - Total registrations
 * @param {number} creditCards - Total credit card submissions
 * @returns {number} CC conversion percentage
 */
export const calculateCCConversionPercentage = (registrations, creditCards) => {
  if (!registrations || registrations <= 0) return 0;
  return parseFloat(((creditCards / registrations) * 100).toFixed(2));
};

/**
 * Calculate Clicks to Registration Ratio
 * @param {number} clicks - Total clicks
 * @param {number} registrations - Total registrations
 * @returns {number} Clicks per registration
 */
export const calculateClicksToRegRatio = (clicks, registrations) => {
  if (!registrations || registrations <= 0) return 0;
  return parseFloat((clicks / registrations).toFixed(2));
};

/**
 * Calculate Registration to Credit Card Ratio
 * @param {number} registrations - Total registrations
 * @param {number} creditCards - Total credit card submissions
 * @returns {number} Registrations per credit card
 */
export const calculateRegToCCRatio = (registrations, creditCards) => {
  if (!creditCards || creditCards <= 0) return 0;
  return parseFloat((registrations / creditCards).toFixed(2));
};

/**
 * Calculate Click-Through Rate (CTR)
 * @param {number} impressions - Total impressions
 * @param {number} clicks - Total clicks
 * @returns {number} CTR percentage
 */
export const calculateCTR = (impressions, clicks) => {
  if (!impressions || impressions <= 0) return 0;
  return parseFloat(((clicks / impressions) * 100).toFixed(2));
};

/**
 * Calculate Cost Per Click (CPC)
 * @param {number} cost - Total cost
 * @param {number} clicks - Total clicks
 * @returns {number} Cost per click
 */
export const calculateCPC = (cost, clicks) => {
  if (!clicks || clicks <= 0) return 0;
  return parseFloat((cost / clicks).toFixed(2));
};

/**
 * Calculate Cost Per Acquisition (CPA)
 * @param {number} cost - Total cost
 * @param {number} conversions - Total conversions
 * @returns {number} Cost per acquisition
 */
export const calculateCPA = (cost, conversions) => {
  if (!conversions || conversions <= 0) return 0;
  return parseFloat((cost / conversions).toFixed(2));
};

/**
 * Calculate Lifetime Value (LTV)
 * @param {number} revenue - Total revenue
 * @param {number} customers - Total customers
 * @returns {number} Average lifetime value
 */
export const calculateLTV = (revenue, customers) => {
  if (!customers || customers <= 0) return 0;
  return parseFloat((revenue / customers).toFixed(2));
};

/**
 * Calculate Conversion Rate
 * @param {number} visitors - Total visitors
 * @param {number} conversions - Total conversions
 * @returns {number} Conversion rate percentage
 */
export const calculateConversionRate = (visitors, conversions) => {
  if (!visitors || visitors <= 0) return 0;
  return parseFloat(((conversions / visitors) * 100).toFixed(2));
};

/**
 * Estimate clicks from sessions (using default click rate)
 * @param {number} sessions - Total sessions
 * @param {number} clickRate - Click rate (default 0.15)
 * @returns {number} Estimated clicks
 */
export const estimateClicksFromSessions = (sessions, clickRate = 0.15) => {
  return Math.round(sessions / clickRate);
};

/**
 * Calculate campaign performance score (0-100)
 * @param {object} metrics - Campaign metrics object
 * @returns {number} Performance score
 */
export const calculatePerformanceScore = (metrics) => {
  let score = 0;
  let factors = 0;
  
  // ROAS contribution (40% weight)
  if (metrics.cost && metrics.revenue) {
    const roas = calculateROAS(metrics.cost, metrics.revenue);
    if (roas >= 3) score += 40;
    else if (roas >= 2) score += 30;
    else if (roas >= 1.5) score += 20;
    else if (roas >= 1) score += 10;
    factors++;
  }
  
  // Registration rate contribution (30% weight)
  if (metrics.sessions && metrics.registrations) {
    const regRate = calculateRegPercentage(metrics.sessions, metrics.registrations);
    if (regRate >= 15) score += 30;
    else if (regRate >= 10) score += 20;
    else if (regRate >= 5) score += 10;
    else if (regRate > 0) score += 5;
    factors++;
  }
  
  // CC conversion contribution (30% weight)
  if (metrics.registrations && metrics.credit_cards) {
    const ccConv = calculateCCConversionPercentage(metrics.registrations, metrics.credit_cards);
    if (ccConv >= 20) score += 30;
    else if (ccConv >= 15) score += 20;
    else if (ccConv >= 10) score += 10;
    else if (ccConv > 0) score += 5;
    factors++;
  }
  
  // Normalize score if not all factors are present
  if (factors > 0 && factors < 3) {
    score = Math.round(score * (3 / factors));
  }
  
  return Math.min(100, Math.max(0, score));
};

/**
 * Format currency value
 * @param {number} value - Numeric value
 * @param {string} currency - Currency code (default USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(value || 0);
};

/**
 * Format percentage value
 * @param {number} value - Numeric value
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

/**
 * Format large numbers with abbreviations
 * @param {number} value - Numeric value
 * @returns {string} Formatted string (e.g., 1.2K, 3.4M)
 */
export const formatLargeNumber = (value) => {
  if (!value) return '0';
  
  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';
  
  if (absValue >= 1e9) {
    return sign + (absValue / 1e9).toFixed(1) + 'B';
  } else if (absValue >= 1e6) {
    return sign + (absValue / 1e6).toFixed(1) + 'M';
  } else if (absValue >= 1e3) {
    return sign + (absValue / 1e3).toFixed(1) + 'K';
  }
  
  return sign + absValue.toString();
};

/**
 * Calculate daily average from total and days
 * @param {number} total - Total value
 * @param {number} days - Number of days
 * @returns {number} Daily average
 */
export const calculateDailyAverage = (total, days) => {
  if (!days || days <= 0) return 0;
  return parseFloat((total / days).toFixed(2));
};

/**
 * Calculate growth rate between two values
 * @param {number} oldValue - Previous value
 * @param {number} newValue - Current value
 * @returns {number} Growth rate percentage
 */
export const calculateGrowthRate = (oldValue, newValue) => {
  if (!oldValue || oldValue <= 0) {
    return newValue > 0 ? 100 : 0;
  }
  return parseFloat((((newValue - oldValue) / oldValue) * 100).toFixed(2));
};

/**
 * Aggregate metrics from multiple campaigns
 * @param {array} campaigns - Array of campaign objects
 * @returns {object} Aggregated metrics
 */
export const aggregateMetrics = (campaigns) => {
  const totals = {
    cost: 0,
    revenue: 0,
    clicks: 0,
    sessions: 0,
    registrations: 0,
    credit_cards: 0,
    sales: 0
  };
  
  campaigns.forEach(campaign => {
    if (campaign.metrics) {
      totals.cost += campaign.metrics.cost || 0;
      totals.revenue += campaign.metrics.revenue || 0;
      totals.clicks += campaign.metrics.uniqueClicks || campaign.metrics.rawClicks || 0;
      totals.sessions += campaign.metrics.sessions || 0;
      totals.registrations += campaign.metrics.registrations || campaign.metrics.confirmReg || 0;
      totals.credit_cards += campaign.metrics.credit_cards || 0;
      totals.sales += campaign.metrics.sales || 0;
    }
  });
  
  // Calculate derived metrics
  totals.roas = calculateROAS(totals.cost, totals.revenue);
  totals.reg_percentage = calculateRegPercentage(totals.sessions, totals.registrations);
  totals.cc_conv_percentage = calculateCCConversionPercentage(totals.registrations, totals.credit_cards);
  totals.cpa = calculateCPA(totals.cost, totals.registrations);
  
  return totals;
};

// Export for Python compatibility
export default {
  calculateROAS,
  calculateRegPercentage,
  calculateCCConversionPercentage,
  calculateClicksToRegRatio,
  calculateRegToCCRatio,
  calculateCTR,
  calculateCPC,
  calculateCPA,
  calculateLTV,
  calculateConversionRate,
  estimateClicksFromSessions,
  calculatePerformanceScore,
  formatCurrency,
  formatPercentage,
  formatLargeNumber,
  calculateDailyAverage,
  calculateGrowthRate,
  aggregateMetrics
};