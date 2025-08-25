// Chart data generation utilities

export const generateRevenueByDayData = (campaigns, dateRange = 'Last 30 Days') => {
  if (!campaigns || campaigns.length === 0) return [];
  
  // Calculate date range
  const now = new Date();
  let days = 30;
  
  switch (dateRange) {
    case 'Last 7 Days':
      days = 7;
      break;
    case 'Last 30 Days':
      days = 30;
      break;
    case 'Last 90 Days':
      days = 90;
      break;
    default:
      days = 30;
  }
  
  // Generate date array
  const dates = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dates.push({
      date: date.toISOString().split('T')[0],
      revenue: 0,
      cost: 0
    });
  }
  
  // Distribute campaign revenue across date range
  campaigns.forEach(campaign => {
    const startDate = new Date(campaign.startDate);
    const endDate = new Date(campaign.endDate);
    const revenue = campaign.metrics?.revenue || 0;
    const cost = campaign.metrics?.cost || 0;
    
    // Calculate campaign duration in days
    const durationMs = endDate.getTime() - startDate.getTime();
    const durationDays = Math.max(1, Math.ceil(durationMs / (24 * 60 * 60 * 1000)));
    
    // Daily revenue/cost for this campaign
    const dailyRevenue = revenue / durationDays;
    const dailyCost = cost / durationDays;
    
    // Add to each date that falls within campaign period
    dates.forEach(dateItem => {
      const currentDate = new Date(dateItem.date);
      if (currentDate >= startDate && currentDate <= endDate) {
        dateItem.revenue += dailyRevenue;
        dateItem.cost += dailyCost;
      }
    });
  });
  
  // Format for chart display
  return dates.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: Math.round(item.revenue),
    cost: Math.round(item.cost)
  }));
};

export const generateRevenueByVendorData = (campaigns) => {
  if (!campaigns || campaigns.length === 0) return [];
  
  // Group by vendor
  const vendorData = {};
  
  campaigns.forEach(campaign => {
    const vendor = campaign.adPlacementDomain || 'Unknown';
    const revenue = campaign.metrics?.revenue || 0;
    const cost = campaign.metrics?.cost || 0;
    
    if (!vendorData[vendor]) {
      vendorData[vendor] = {
        vendor,
        revenue: 0,
        cost: 0,
        campaignCount: 0
      };
    }
    
    vendorData[vendor].revenue += revenue;
    vendorData[vendor].cost += cost;
    vendorData[vendor].campaignCount += 1;
  });
  
  // Convert to array and sort by revenue
  return Object.values(vendorData)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10) // Top 10 vendors
    .map(item => ({
      ...item,
      revenue: Math.round(item.revenue),
      cost: Math.round(item.cost)
    }));
};