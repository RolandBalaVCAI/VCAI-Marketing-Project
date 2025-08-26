/**
 * Utility to reset mock data and ensure campaigns are visible
 */

import { getInitialCampaigns } from '../api/mock/data/campaigns';

const STORAGE_KEY = 'marketing_dashboard_campaigns';

export const resetMockData = () => {
  try {
    console.log('🔄 Resetting mock data...');
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Generate fresh campaigns
    const campaigns = getInitialCampaigns();
    console.log(`✅ Generated ${campaigns.length} sample campaigns`);
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(campaigns));
    
    // Log first few campaigns for debugging
    campaigns.slice(0, 3).forEach((campaign, index) => {
      console.log(`Campaign ${index + 1}:`, {
        id: campaign.id,
        name: campaign.name,
        vendor: campaign.vendor,
        status: campaign.status
      });
    });
    
    return campaigns;
  } catch (error) {
    console.error('❌ Failed to reset mock data:', error);
    return [];
  }
};

export const getMockDataStatus = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { exists: false, count: 0 };
    }
    
    const campaigns = JSON.parse(stored);
    return {
      exists: true,
      count: campaigns.length,
      campaigns: campaigns.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        vendor: c.vendor
      }))
    };
  } catch (error) {
    return { exists: false, count: 0, error: error.message };
  }
};

// Auto-run on import in development
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  const status = getMockDataStatus();
  console.log('📊 Mock Data Status:', status);
  
  if (!status.exists || status.count === 0) {
    console.log('⚠️ No mock data found, generating...');
    resetMockData();
  }
}