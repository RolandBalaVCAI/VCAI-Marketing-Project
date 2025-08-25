import { useMemo } from 'react';
import { useCampaignData } from './useCampaignData';
import { calculateROAS } from '../utils/calculations';

export const useChartData = () => {
  const { filteredCampaigns } = useCampaignData();
  
  // Revenue trend data for line chart
  const revenueTrendData = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    // Group campaigns by date and sum revenue
    const revenueByDate = filteredCampaigns.reduce((acc, campaign) => {
      const date = new Date(campaign.startDate).toISOString().split('T')[0];
      acc[date] = (acc[date] || 0) + (campaign.metrics?.revenue || 0);
      return acc;
    }, {});
    
    // Sort dates and create chart data
    const sortedDates = Object.keys(revenueByDate).sort();
    
    return sortedDates.map(date => ({
      date,
      revenue: revenueByDate[date],
      formattedDate: new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    }));
  }, [filteredCampaigns]);
  
  // Vendor performance data for bar chart
  const vendorPerformanceData = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    const vendorMetrics = filteredCampaigns.reduce((acc, campaign) => {
      const vendor = campaign.vendor;
      if (!acc[vendor]) {
        acc[vendor] = {
          vendor,
          totalRevenue: 0,
          totalCost: 0,
          totalSales: 0,
          campaignCount: 0
        };
      }
      
      acc[vendor].totalRevenue += campaign.metrics?.revenue || 0;
      acc[vendor].totalCost += campaign.metrics?.cost || 0;
      acc[vendor].totalSales += campaign.metrics?.sales || 0;
      acc[vendor].campaignCount += 1;
      
      return acc;
    }, {});
    
    return Object.values(vendorMetrics).map(vendor => ({
      ...vendor,
      roas: calculateROAS(vendor.totalRevenue, vendor.totalCost),
      avgRevenuePerCampaign: vendor.totalRevenue / vendor.campaignCount,
      avgCostPerCampaign: vendor.totalCost / vendor.campaignCount
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);
  }, [filteredCampaigns]);
  
  // Campaign status distribution for pie chart
  const statusDistributionData = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    const statusCounts = filteredCampaigns.reduce((acc, campaign) => {
      const status = campaign.status;
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
    
    const colors = {
      'Active': '#10b981', // green
      'Paused': '#f59e0b', // yellow
      'Completed': '#3b82f6', // blue
      'Draft': '#6b7280' // gray
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
      status,
      count,
      percentage: ((count / filteredCampaigns.length) * 100).toFixed(1),
      color: colors[status] || '#6b7280'
    }));
  }, [filteredCampaigns]);
  
  // Performance metrics over time for multi-line chart
  const performanceMetricsData = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    // Group by date and calculate metrics
    const metricsByDate = filteredCampaigns.reduce((acc, campaign) => {
      const date = new Date(campaign.startDate).toISOString().split('T')[0];
      
      if (!acc[date]) {
        acc[date] = {
          date,
          totalRevenue: 0,
          totalCost: 0,
          totalSales: 0,
          totalClicks: 0,
          campaignCount: 0
        };
      }
      
      acc[date].totalRevenue += campaign.metrics?.revenue || 0;
      acc[date].totalCost += campaign.metrics?.cost || 0;
      acc[date].totalSales += campaign.metrics?.sales || 0;
      acc[date].totalClicks += campaign.metrics?.rawClicks || 0;
      acc[date].campaignCount += 1;
      
      return acc;
    }, {});
    
    const sortedDates = Object.keys(metricsByDate).sort();
    
    return sortedDates.map(date => {
      const metrics = metricsByDate[date];
      return {
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        revenue: metrics.totalRevenue,
        cost: metrics.totalCost,
        roas: calculateROAS(metrics.totalRevenue, metrics.totalCost),
        sales: metrics.totalSales,
        clicks: metrics.totalClicks,
        conversionRate: metrics.totalClicks > 0 
          ? ((metrics.totalSales / metrics.totalClicks) * 100).toFixed(2)
          : 0
      };
    });
  }, [filteredCampaigns]);
  
  // Top performing campaigns data
  const topPerformingCampaigns = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    return [...filteredCampaigns]
      .map(campaign => ({
        ...campaign,
        roas: parseFloat(calculateROAS(campaign.metrics?.revenue || 0, campaign.metrics?.cost || 0)),
        profit: (campaign.metrics?.revenue || 0) - (campaign.metrics?.cost || 0)
      }))
      .sort((a, b) => b.roas - a.roas)
      .slice(0, 10);
  }, [filteredCampaigns]);
  
  // Cost vs Revenue scatter plot data
  const costVsRevenueData = useMemo(() => {
    return filteredCampaigns.map(campaign => ({
      id: campaign.id,
      name: campaign.name,
      vendor: campaign.vendor,
      cost: campaign.metrics?.cost || 0,
      revenue: campaign.metrics?.revenue || 0,
      roas: parseFloat(calculateROAS(campaign.metrics?.revenue || 0, campaign.metrics?.cost || 0)),
      profit: (campaign.metrics?.revenue || 0) - (campaign.metrics?.cost || 0),
      status: campaign.status
    }));
  }, [filteredCampaigns]);
  
  // Monthly comparison data
  const monthlyComparisonData = useMemo(() => {
    if (filteredCampaigns.length === 0) return [];
    
    const monthlyData = filteredCampaigns.reduce((acc, campaign) => {
      const date = new Date(campaign.startDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!acc[monthKey]) {
        acc[monthKey] = {
          month: monthName,
          monthKey,
          revenue: 0,
          cost: 0,
          sales: 0,
          campaigns: 0
        };
      }
      
      acc[monthKey].revenue += campaign.metrics?.revenue || 0;
      acc[monthKey].cost += campaign.metrics?.cost || 0;
      acc[monthKey].sales += campaign.metrics?.sales || 0;
      acc[monthKey].campaigns += 1;
      
      return acc;
    }, {});
    
    return Object.values(monthlyData)
      .map(month => ({
        ...month,
        roas: calculateROAS(month.revenue, month.cost),
        profit: month.revenue - month.cost,
        avgRevenuePerCampaign: month.revenue / month.campaigns,
        avgCostPerCampaign: month.cost / month.campaigns
      }))
      .sort((a, b) => a.monthKey.localeCompare(b.monthKey));
  }, [filteredCampaigns]);
  
  // Chart configuration helpers
  const chartConfigs = useMemo(() => ({
    colors: {
      primary: '#3b82f6',
      secondary: '#10b981',
      accent: '#f59e0b',
      danger: '#ef4444',
      gray: '#6b7280'
    },
    gradients: {
      revenue: ['#3b82f6', '#1d4ed8'],
      cost: ['#ef4444', '#dc2626'],
      profit: ['#10b981', '#059669']
    },
    responsive: {
      mobile: { width: 300, height: 200 },
      tablet: { width: 500, height: 300 },
      desktop: { width: 700, height: 400 }
    }
  }), []);
  
  return {
    // Chart data
    revenueTrendData,
    vendorPerformanceData,
    statusDistributionData,
    performanceMetricsData,
    topPerformingCampaigns,
    costVsRevenueData,
    monthlyComparisonData,
    
    // Configuration
    chartConfigs,
    
    // Utility functions
    hasData: filteredCampaigns.length > 0,
    dataCount: filteredCampaigns.length,
    dateRange: {
      start: filteredCampaigns.length > 0 
        ? new Date(Math.min(...filteredCampaigns.map(c => new Date(c.startDate))))
        : null,
      end: filteredCampaigns.length > 0 
        ? new Date(Math.max(...filteredCampaigns.map(c => new Date(c.endDate || c.startDate))))
        : null
    }
  };
};