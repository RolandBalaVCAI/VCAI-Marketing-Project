// CSV export utilities
import { formatCurrency, formatPercentage, calculateROAS } from './calculations';

export const exportToCSV = (campaigns, aggregatedMetrics) => {
  if (!campaigns || campaigns.length === 0) {
    throw new Error('No campaign data to export');
  }
  
  // CSV headers
  const headers = [
    'Campaign Name',
    'Status',
    'Manager',
    'Vendor',
    'Device',
    'Start Date',
    'End Date',
    'Cost',
    'Revenue',
    'ROAS (%)',
    'Raw Clicks',
    'Unique Clicks',
    'Raw Registrations',
    'Confirmed Registrations',
    'Sales',
    'Rep Contact',
    'Rep Email'
  ];
  
  // Convert campaigns to CSV rows
  const rows = campaigns.map(campaign => {
    const metrics = campaign.metrics || {};
    const rep = campaign.repContactInfo || {};
    
    return [
      campaign.name || '',
      campaign.status || '',
      campaign.manager || '',
      campaign.adPlacementDomain || '',
      campaign.device || '',
      campaign.startDate || '',
      campaign.endDate || '',
      metrics.cost || 0,
      metrics.revenue || 0,
      calculateROAS(metrics.revenue || 0, metrics.cost || 0),
      metrics.rawClicks || 0,
      metrics.uniqueClicks || 0,
      metrics.rawReg || 0,
      metrics.confirmReg || 0,
      metrics.sales || 0,
      rep.name || '',
      rep.email || ''
    ];
  });
  
  // Add summary row
  if (aggregatedMetrics) {
    rows.push([
      '--- TOTALS ---',
      '',
      '',
      '',
      '',
      '',
      '',
      aggregatedMetrics.totalCost || 0,
      aggregatedMetrics.totalRevenue || 0,
      aggregatedMetrics.averageROAS || 0,
      aggregatedMetrics.totalClicks || 0,
      aggregatedMetrics.totalUniqueClicks || 0,
      '',
      aggregatedMetrics.totalRegistrations || 0,
      aggregatedMetrics.totalSales || 0,
      '',
      ''
    ]);
  }
  
  // Convert to CSV string
  const csvContent = [headers, ...rows]
    .map(row => row.map(field => {
      // Handle fields that might contain commas or quotes
      const fieldStr = String(field);
      if (fieldStr.includes(',') || fieldStr.includes('"') || fieldStr.includes('\n')) {
        return `"${fieldStr.replace(/"/g, '""')}"`;
      }
      return fieldStr;
    }).join(','))
    .join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campaigns_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } else {
    throw new Error('CSV download not supported in this browser');
  }
};