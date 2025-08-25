import { format, subDays } from 'date-fns';
import { COMMON_VENDORS, CAMPAIGN_STATUSES, DEVICE_OPTIONS, TARGETING_OPTIONS, AD_PLACEMENT_DOMAINS } from '../../../types/campaign';

// Vendor performance characteristics for realistic data generation
const VENDOR_PERFORMANCE = {
  'AdTech Solutions': { costMultiplier: 1.2, conversionMultiplier: 1.5, profitMultiplier: 1.3 },
  'MediaBuy Pro': { costMultiplier: 0.9, conversionMultiplier: 1.2, profitMultiplier: 1.1 },
  'Email Dynamics': { costMultiplier: 0.3, conversionMultiplier: 2.0, profitMultiplier: 2.5 },
  'SearchMax': { costMultiplier: 0.1, conversionMultiplier: 1.0, profitMultiplier: 3.0 },
  'Partner Network': { costMultiplier: 0.7, conversionMultiplier: 1.3, profitMultiplier: 1.4 },
  'Display Central': { costMultiplier: 0.6, conversionMultiplier: 0.8, profitMultiplier: 0.9 },
  'Social Media Hub': { costMultiplier: 1.0, conversionMultiplier: 1.1, profitMultiplier: 1.2 }
};

// Campaign name templates
const CAMPAIGN_TEMPLATES = [
  'Summer Sale', 'Holiday Promo', 'Flash Deal', 'New Product Launch', 
  'Brand Awareness', 'Retargeting', 'Lead Generation', 'Customer Retention',
  'Back to School', 'Black Friday', 'Cyber Monday', 'Spring Campaign',
  'Product Demo', 'Free Trial', 'Newsletter Signup', 'App Download'
];

// Manager pool
const MANAGERS = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Unassigned'];

// Generate mock campaigns data
export const generateMockCampaigns = (count = null) => {
  const campaigns = [];
  let campaignId = 1;

  COMMON_VENDORS.forEach(vendor => {
    const minCampaigns = 3;
    const maxCampaigns = 6;
    const numCampaigns = count ? Math.floor(count / COMMON_VENDORS.length) : 
                         Math.floor(Math.random() * (maxCampaigns - minCampaigns + 1)) + minCampaigns;
    
    for (let j = 0; j < numCampaigns; j++) {
      const perf = VENDOR_PERFORMANCE[vendor];
      const startDate = subDays(new Date(), Math.floor(Math.random() * 45));
      const endDate = subDays(startDate, -Math.floor(Math.random() * 30) - 7);
      
      // Generate realistic metrics based on vendor performance
      const baseCost = Math.floor(Math.random() * 4000) + 1000;
      const cost = Math.floor(baseCost * perf.costMultiplier);
      const rawClicks = Math.floor((Math.random() * 4000 + 500) * perf.conversionMultiplier);
      const uniqueClicks = Math.floor(rawClicks * (Math.random() * 0.4 + 0.6)); // 60-100% of raw clicks
      const rawReg = Math.floor(uniqueClicks * (Math.random() * 0.15 + 0.05) * perf.conversionMultiplier);
      const confirmReg = Math.floor(rawReg * (Math.random() * 0.3 + 0.7)); // 70-100% of raw registrations
      const sales = Math.floor(confirmReg * (Math.random() * 0.4 + 0.1) * perf.conversionMultiplier);
      const orderValue = sales * (Math.random() * 150 + 50) * perf.profitMultiplier;
      const revenue = Math.max(0, orderValue - cost); // Ensure revenue is never negative
      const ltrev = revenue * (Math.random() * 2.5 + 1.5); // LTRev is 1.5x to 4x of initial revenue

      // Generate sample visual media (some campaigns have media, some don't)
      const generateVisualMedia = () => {
        const mediaCount = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0;
        const mediaItems = [];
        const bannerSizes = ['728x90', '300x250', '336x280', '300x600', '320x50', '468x60'];
        const mediaTypes = ['Banner', 'Display Ad', 'Rich Media', 'Video Thumbnail'];
        
        for (let i = 0; i < mediaCount; i++) {
          mediaItems.push({
            id: Date.now() + i + Math.random(),
            url: `https://via.placeholder.com/${bannerSizes[Math.floor(Math.random() * bannerSizes.length)]}`,
            description: `${mediaTypes[Math.floor(Math.random() * mediaTypes.length)]} - ${bannerSizes[Math.floor(Math.random() * bannerSizes.length)]}`,
            addedDate: startDate.toISOString(),
            addedBy: 'System'
          });
        }
        return mediaItems;
      };

      const campaign = {
        id: `CMP-2024-${String(campaignId).padStart(3, '0')}`,
        name: `${vendor.split(' ')[0]} - ${CAMPAIGN_TEMPLATES[Math.floor(Math.random() * CAMPAIGN_TEMPLATES.length)]}`,
        vendor: vendor,
        status: CAMPAIGN_STATUSES[Math.floor(Math.random() * CAMPAIGN_STATUSES.length)],
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        metrics: { 
          rawClicks, 
          uniqueClicks, 
          cost, 
          rawReg, 
          confirmReg, 
          sales, 
          orderValue, 
          revenue, 
          ltrev 
        },
        manager: MANAGERS[Math.floor(Math.random() * MANAGERS.length)],
        adPlacementDomain: AD_PLACEMENT_DOMAINS[Math.floor(Math.random() * AD_PLACEMENT_DOMAINS.length)],
        device: DEVICE_OPTIONS[Math.floor(Math.random() * DEVICE_OPTIONS.length)],
        targeting: TARGETING_OPTIONS[Math.floor(Math.random() * TARGETING_OPTIONS.length)],
        repContactInfo: `${vendor} Rep - ${['rep@', 'contact@', 'support@'][Math.floor(Math.random() * 3)]}${vendor.toLowerCase().replace(/\s+/g, '')}.com`,
        notes: [],
        documents: [],
        visualMedia: generateVisualMedia(),
        history: [{
          id: Date.now() + Math.random(),
          action: 'Campaign created',
          user: 'System',
          timestamp: startDate.toISOString()
        }],
        createdAt: startDate.toISOString(),
        modifiedAt: startDate.toISOString()
      };
      
      campaigns.push(campaign);
      campaignId++;
    }
  });

  return campaigns.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

// Get initial dataset
export const getInitialCampaigns = () => {
  return generateMockCampaigns();
};

// Generate a single campaign template
export const generateCampaignTemplate = (overrides = {}) => {
  const vendor = overrides.vendor || COMMON_VENDORS[0];
  const startDate = overrides.startDate ? new Date(overrides.startDate) : new Date();
  const endDate = overrides.endDate ? new Date(overrides.endDate) : subDays(startDate, -30);
  
  return {
    id: overrides.id || `CMP-2024-${String(Date.now()).slice(-3)}`,
    name: overrides.name || `${vendor.split(' ')[0]} - New Campaign`,
    vendor: vendor,
    status: overrides.status || 'Paused',
    startDate: format(startDate, 'yyyy-MM-dd'),
    endDate: format(endDate, 'yyyy-MM-dd'),
    metrics: {
      rawClicks: 0,
      uniqueClicks: 0,
      cost: 0,
      rawReg: 0,
      confirmReg: 0,
      sales: 0,
      orderValue: 0,
      revenue: 0,
      ltrev: 0,
      ...overrides.metrics
    },
    manager: overrides.manager || 'Unassigned',
    adPlacementDomain: overrides.adPlacementDomain || AD_PLACEMENT_DOMAINS[0],
    device: overrides.device || 'Both',
    targeting: overrides.targeting || 'Global',
    repContactInfo: overrides.repContactInfo || `${vendor} Rep - contact@${vendor.toLowerCase().replace(/\s+/g, '')}.com`,
    notes: overrides.notes || [],
    documents: overrides.documents || [],
    visualMedia: overrides.visualMedia || [],
    history: overrides.history || [{
      id: Date.now(),
      action: 'Campaign created',
      user: overrides.createdBy || 'Current User',
      timestamp: new Date().toISOString()
    }],
    createdAt: overrides.createdAt || new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    ...overrides
  };
};