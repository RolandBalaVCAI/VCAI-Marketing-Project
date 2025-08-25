/**
 * Shared Metrics Module
 * Centralized metric calculations and aggregations
 * Used by both React frontend and Python backend (via JSON export)
 */

import { 
  calculateROAS, 
  calculateRegPercentage, 
  calculateCCConversionPercentage,
  calculateClicksToRegRatio,
  calculateRegToCCRatio,
  calculatePerformanceScore,
  aggregateMetrics 
} from '../utils/calculations.js';

/**
 * Calculate all derived metrics for a campaign
 * @param {object} campaign - Campaign object with base metrics
 * @returns {object} Campaign with calculated derived metrics
 */
export const calculateCampaignMetrics = (campaign) => {
  if (!campaign.metrics) return campaign;
  
  const metrics = { ...campaign.metrics };
  const { cost, revenue, sessions, registrations, credit_cards, rawClicks, uniqueClicks } = metrics;
  
  // Core calculated metrics
  metrics.roas = calculateROAS(cost, revenue);
  metrics.reg_percentage = calculateRegPercentage(sessions, registrations);
  metrics.cc_conv_percentage = calculateCCConversionPercentage(registrations, credit_cards);
  metrics.clicks_to_reg_ratio = calculateClicksToRegRatio(uniqueClicks || rawClicks, registrations);
  metrics.reg_to_cc_ratio = calculateRegToCCRatio(registrations, credit_cards);
  
  // Performance score
  metrics.performance_score = calculatePerformanceScore(metrics);
  
  // Efficiency metrics
  if (cost && registrations) {
    metrics.cost_per_registration = parseFloat((cost / registrations).toFixed(2));
  }
  
  if (cost && credit_cards) {
    metrics.cost_per_credit_card = parseFloat((cost / credit_cards).toFixed(2));
  }
  
  if (cost && sessions) {
    metrics.cost_per_session = parseFloat((cost / sessions).toFixed(2));
  }
  
  return {
    ...campaign,
    metrics
  };
};

/**
 * Calculate KPI summary for dashboard
 * @param {array} campaigns - Array of campaigns
 * @returns {object} KPI summary object
 */
export const calculateKPISummary = (campaigns) => {
  const totals = aggregateMetrics(campaigns);
  
  const activeCampaigns = campaigns.filter(c => 
    c.status === 'Live' || c.status === 'Serving' || c.is_serving
  );
  
  const pausedCampaigns = campaigns.filter(c => 
    c.status === 'Paused'
  );
  
  return {
    totalCampaigns: campaigns.length,
    activeCampaigns: activeCampaigns.length,
    pausedCampaigns: pausedCampaigns.length,
    totalSpend: totals.cost,
    totalRevenue: totals.revenue,
    totalROAS: totals.roas,
    totalRegistrations: totals.registrations,
    totalSessions: totals.sessions,
    averageRegRate: totals.reg_percentage,
    averageCCConv: totals.cc_conv_percentage,
    totalCreditCards: totals.credit_cards
  };
};

/**
 * Calculate performance trends
 * @param {array} campaigns - Array of campaigns with historical data
 * @returns {object} Trend analysis
 */
export const calculatePerformanceTrends = (campaigns) => {
  const trends = {
    roas_trend: 0,
    cost_trend: 0,
    revenue_trend: 0,
    registration_trend: 0,
    performance_trend: 0
  };
  
  if (campaigns.length < 2) return trends;
  
  // Sort by date
  const sorted = campaigns.sort((a, b) => 
    new Date(a.created_at) - new Date(b.created_at)
  );
  
  const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
  const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
  
  const firstMetrics = aggregateMetrics(firstHalf);
  const secondMetrics = aggregateMetrics(secondHalf);
  
  // Calculate trends
  trends.roas_trend = calculateGrowthRate(firstMetrics.roas, secondMetrics.roas);
  trends.cost_trend = calculateGrowthRate(firstMetrics.cost, secondMetrics.cost);
  trends.revenue_trend = calculateGrowthRate(firstMetrics.revenue, secondMetrics.revenue);
  trends.registration_trend = calculateGrowthRate(firstMetrics.registrations, secondMetrics.registrations);
  
  return trends;
};

/**
 * Calculate campaign comparison metrics
 * @param {array} campaigns - Array of campaigns to compare
 * @returns {object} Comparison analysis
 */
export const calculateCampaignComparison = (campaigns) => {
  if (!campaigns.length) return {};
  
  const campaignsWithMetrics = campaigns.map(calculateCampaignMetrics);
  
  // Find best and worst performers
  const sortedByROAS = [...campaignsWithMetrics].sort((a, b) => 
    (b.metrics.roas || 0) - (a.metrics.roas || 0)
  );
  
  const sortedByRegRate = [...campaignsWithMetrics].sort((a, b) => 
    (b.metrics.reg_percentage || 0) - (a.metrics.reg_percentage || 0)
  );
  
  const sortedByPerformance = [...campaignsWithMetrics].sort((a, b) => 
    (b.metrics.performance_score || 0) - (a.metrics.performance_score || 0)
  );
  
  return {
    bestROAS: sortedByROAS[0],
    worstROAS: sortedByROAS[sortedByROAS.length - 1],
    bestRegRate: sortedByRegRate[0],
    worstRegRate: sortedByRegRate[sortedByRegRate.length - 1],
    topPerformer: sortedByPerformance[0],
    bottomPerformer: sortedByPerformance[sortedByPerformance.length - 1],
    averageMetrics: aggregateMetrics(campaignsWithMetrics)
  };
};

/**
 * Calculate vendor performance analysis
 * @param {array} campaigns - Array of campaigns
 * @returns {object} Vendor performance breakdown
 */
export const calculateVendorPerformance = (campaigns) => {
  const vendorStats = {};
  
  campaigns.forEach(campaign => {
    const vendor = campaign.vendor || 'Unknown';
    
    if (!vendorStats[vendor]) {
      vendorStats[vendor] = {
        campaigns: [],
        totalSpend: 0,
        totalRevenue: 0,
        totalRegistrations: 0,
        totalSessions: 0
      };
    }
    
    vendorStats[vendor].campaigns.push(campaign);
    
    if (campaign.metrics) {
      vendorStats[vendor].totalSpend += campaign.metrics.cost || 0;
      vendorStats[vendor].totalRevenue += campaign.metrics.revenue || 0;
      vendorStats[vendor].totalRegistrations += campaign.metrics.registrations || 0;
      vendorStats[vendor].totalSessions += campaign.metrics.sessions || 0;
    }
  });
  
  // Calculate derived metrics for each vendor
  Object.keys(vendorStats).forEach(vendor => {
    const stats = vendorStats[vendor];
    stats.campaignCount = stats.campaigns.length;
    stats.averageROAS = calculateROAS(stats.totalSpend, stats.totalRevenue);
    stats.averageRegRate = calculateRegPercentage(stats.totalSessions, stats.totalRegistrations);
    stats.averageSpendPerCampaign = stats.totalSpend / stats.campaignCount;
    stats.averageRevenuePerCampaign = stats.totalRevenue / stats.campaignCount;
  });
  
  return vendorStats;
};

/**
 * Calculate hierarchy performance analysis
 * @param {array} campaigns - Array of campaigns with hierarchy data
 * @returns {object} Hierarchy performance breakdown
 */
export const calculateHierarchyPerformance = (campaigns) => {
  const hierarchyStats = {
    byNetwork: {},
    byDomain: {},
    byPlacement: {},
    byTargeting: {}
  };
  
  campaigns.forEach(campaign => {
    if (!campaign.hierarchy) return;
    
    const { network, domain, placement, targeting } = campaign.hierarchy;
    
    // Initialize if not exists
    [
      { key: network, obj: hierarchyStats.byNetwork },
      { key: domain, obj: hierarchyStats.byDomain },
      { key: placement, obj: hierarchyStats.byPlacement },
      { key: targeting, obj: hierarchyStats.byTargeting }
    ].forEach(({ key, obj }) => {
      if (!obj[key]) {
        obj[key] = {
          campaigns: [],
          totalSpend: 0,
          totalRevenue: 0,
          totalRegistrations: 0
        };
      }
      
      obj[key].campaigns.push(campaign);
      
      if (campaign.metrics) {
        obj[key].totalSpend += campaign.metrics.cost || 0;
        obj[key].totalRevenue += campaign.metrics.revenue || 0;
        obj[key].totalRegistrations += campaign.metrics.registrations || 0;
      }
    });
  });
  
  // Calculate derived metrics
  Object.values(hierarchyStats).forEach(category => {
    Object.keys(category).forEach(key => {
      const stats = category[key];
      stats.campaignCount = stats.campaigns.length;
      stats.averageROAS = calculateROAS(stats.totalSpend, stats.totalRevenue);
    });
  });
  
  return hierarchyStats;
};

/**
 * Generate metric alerts for campaigns
 * @param {array} campaigns - Array of campaigns
 * @param {object} thresholds - Alert thresholds
 * @returns {array} Array of alert objects
 */
export const generateMetricAlerts = (campaigns, thresholds = {}) => {
  const defaultThresholds = {
    lowROAS: 1.5,
    highSpend: 10000,
    lowRegRate: 5,
    lowCCConv: 10
  };
  
  const alertThresholds = { ...defaultThresholds, ...thresholds };
  const alerts = [];
  
  campaigns.forEach(campaign => {
    const campaignWithMetrics = calculateCampaignMetrics(campaign);
    const { metrics } = campaignWithMetrics;
    
    // Low ROAS alert
    if (metrics.roas && metrics.roas < alertThresholds.lowROAS) {
      alerts.push({
        type: 'warning',
        campaign: campaign.name,
        message: `Low ROAS: ${metrics.roas.toFixed(2)}`,
        metric: 'roas',
        value: metrics.roas
      });
    }
    
    // High spend alert
    if (metrics.cost && metrics.cost > alertThresholds.highSpend) {
      alerts.push({
        type: 'info',
        campaign: campaign.name,
        message: `High spend: $${metrics.cost.toLocaleString()}`,
        metric: 'cost',
        value: metrics.cost
      });
    }
    
    // Low registration rate alert
    if (metrics.reg_percentage && metrics.reg_percentage < alertThresholds.lowRegRate) {
      alerts.push({
        type: 'warning',
        campaign: campaign.name,
        message: `Low registration rate: ${metrics.reg_percentage}%`,
        metric: 'reg_percentage',
        value: metrics.reg_percentage
      });
    }
    
    // Low CC conversion alert
    if (metrics.cc_conv_percentage && metrics.cc_conv_percentage < alertThresholds.lowCCConv) {
      alerts.push({
        type: 'warning',
        campaign: campaign.name,
        message: `Low CC conversion: ${metrics.cc_conv_percentage}%`,
        metric: 'cc_conv_percentage',
        value: metrics.cc_conv_percentage
      });
    }
  });
  
  return alerts;
};

// Helper function for growth rate calculation
const calculateGrowthRate = (oldValue, newValue) => {
  if (!oldValue || oldValue <= 0) {
    return newValue > 0 ? 100 : 0;
  }
  return parseFloat((((newValue - oldValue) / oldValue) * 100).toFixed(2));
};

// Export all functions
export default {
  calculateCampaignMetrics,
  calculateKPISummary,
  calculatePerformanceTrends,
  calculateCampaignComparison,
  calculateVendorPerformance,
  calculateHierarchyPerformance,
  generateMetricAlerts
};