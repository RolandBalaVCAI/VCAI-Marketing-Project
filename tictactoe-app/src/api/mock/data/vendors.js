// Vendor-related data and utilities

export const VENDORS_DATA = [
  {
    id: 'adtech-solutions',
    name: 'AdTech Solutions',
    contactEmail: 'contact@adtechsolutions.com',
    tier: 'premium',
    specialties: ['Display Advertising', 'Programmatic', 'Video Ads'],
    performanceRating: 4.2,
    activeCampaigns: 0, // Will be updated dynamically
    totalSpend: 0, // Will be updated dynamically
    avgROAS: 0 // Will be updated dynamically
  },
  {
    id: 'mediabuy-pro',
    name: 'MediaBuy Pro',
    contactEmail: 'support@mediabuypro.com',
    tier: 'standard',
    specialties: ['Social Media', 'Search Ads', 'Mobile'],
    performanceRating: 3.8,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  },
  {
    id: 'email-dynamics',
    name: 'Email Dynamics',
    contactEmail: 'rep@emaildynamics.com',
    tier: 'premium',
    specialties: ['Email Marketing', 'Lead Generation', 'CRM Integration'],
    performanceRating: 4.5,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  },
  {
    id: 'searchmax',
    name: 'SearchMax',
    contactEmail: 'contact@searchmax.com',
    tier: 'enterprise',
    specialties: ['Search Engine Marketing', 'SEO', 'Analytics'],
    performanceRating: 4.7,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  },
  {
    id: 'partner-network',
    name: 'Partner Network',
    contactEmail: 'rep@partnernetwork.com',
    tier: 'standard',
    specialties: ['Affiliate Marketing', 'Partnership Programs', 'Influencer'],
    performanceRating: 3.9,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  },
  {
    id: 'display-central',
    name: 'Display Central',
    contactEmail: 'contact@displaycentral.com',
    tier: 'basic',
    specialties: ['Banner Ads', 'Rich Media', 'Retargeting'],
    performanceRating: 3.4,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  },
  {
    id: 'social-media-hub',
    name: 'Social Media Hub',
    contactEmail: 'support@socialmediahub.com',
    tier: 'standard',
    specialties: ['Social Media Marketing', 'Content Creation', 'Community Management'],
    performanceRating: 4.1,
    activeCampaigns: 0,
    totalSpend: 0,
    avgROAS: 0
  }
];

// Get vendor by name
export const getVendorByName = (name) => {
  return VENDORS_DATA.find(vendor => vendor.name === name);
};

// Get vendor statistics based on campaigns data
export const calculateVendorStats = (campaigns) => {
  const vendorStats = new Map();
  
  // Initialize all vendors
  VENDORS_DATA.forEach(vendor => {
    vendorStats.set(vendor.name, {
      ...vendor,
      activeCampaigns: 0,
      totalSpend: 0,
      totalRevenue: 0,
      totalCampaigns: 0,
      avgROAS: 0
    });
  });
  
  // Calculate stats from campaigns
  campaigns.forEach(campaign => {
    const vendorName = campaign.vendor;
    if (vendorStats.has(vendorName)) {
      const stats = vendorStats.get(vendorName);
      stats.totalCampaigns += 1;
      stats.totalSpend += campaign.metrics.cost || 0;
      stats.totalRevenue += campaign.metrics.revenue || 0;
      
      if (campaign.status === 'Live') {
        stats.activeCampaigns += 1;
      }
      
      // Calculate ROAS
      stats.avgROAS = stats.totalSpend > 0 
        ? Math.round((stats.totalRevenue / stats.totalSpend) * 100 * 10) / 10
        : 0;
        
      vendorStats.set(vendorName, stats);
    }
  });
  
  return Array.from(vendorStats.values());
};

// Vendor tier colors for UI
export const VENDOR_TIER_COLORS = {
  basic: '#94a3b8',      // gray
  standard: '#3b82f6',   // blue
  premium: '#8b5cf6',    // purple  
  enterprise: '#f59e0b'  // amber
};

// Vendor performance thresholds
export const VENDOR_PERFORMANCE_THRESHOLDS = {
  excellent: 4.5,
  good: 4.0,
  average: 3.5,
  poor: 0
};