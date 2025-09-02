// CSV export utilities
import { formatCurrency, formatPercentage, calculateROAS } from './calculations';

// Calculation functions for CSV export
const calculateCPCRaw = (cost, rawClicks) => rawClicks > 0 ? (cost / rawClicks).toFixed(2) : '0.00';
const calculateCPCUnique = (cost, uniqueClicks) => uniqueClicks > 0 ? (cost / uniqueClicks).toFixed(2) : '0.00';
const calculateCPRRaw = (cost, rawReg) => rawReg > 0 ? (cost / rawReg).toFixed(2) : '0.00';
const calculateCPRConfirm = (cost, confirmReg) => confirmReg > 0 ? (cost / confirmReg).toFixed(2) : '0.00';
const calculateCPS = (cost, sales) => sales > 0 ? (cost / sales).toFixed(2) : '0.00';
const calculateRevPerSale = (revenue, sales) => sales > 0 ? (revenue / sales).toFixed(2) : '0.00';

export const exportToCSV = (campaigns, aggregatedMetrics) => {
  if (!campaigns || campaigns.length === 0) {
    throw new Error('No campaign data to export');
  }
  
  // CSV headers - matching all 20+ dashboard columns
  const headers = [
    'Campaign Name',
    'Vendor',
    'Status',
    'Cost',
    'Revenue',
    'Raw Clicks',
    'Unique Clicks',
    'Raw Reg',
    'Confirm Reg', 
    'Sales',
    'LT Rev',
    'CPC Raw',
    'CPC Unique',
    'CPR Raw',
    'CPR Confirm',
    'CPS',
    'Rev/Sale',
    'ROAS',
    'Start Date',
    'End Date'
  ];
  
  // Convert campaigns to CSV rows
  const rows = campaigns.map(campaign => {
    const metrics = campaign.metrics || {};
    const cost = metrics.cost || 0;
    const revenue = metrics.revenue || 0;
    const rawClicks = metrics.rawClicks || 0;
    const uniqueClicks = metrics.uniqueClicks || 0;
    const rawReg = metrics.rawReg || 0;
    const confirmReg = metrics.confirmReg || 0;
    const sales = metrics.sales || 0;
    const ltrev = metrics.ltrev || 0;
    
    return [
      campaign.name || '',
      campaign.vendor || '',
      campaign.status || '',
      cost,
      revenue,
      rawClicks,
      uniqueClicks,
      rawReg,
      confirmReg,
      sales,
      ltrev,
      calculateCPCRaw(cost, rawClicks),
      calculateCPCUnique(cost, uniqueClicks),
      calculateCPRRaw(cost, rawReg),
      calculateCPRConfirm(cost, confirmReg),
      calculateCPS(cost, sales),
      calculateRevPerSale(revenue, sales),
      calculateROAS(revenue, cost),
      campaign.startDate || '',
      campaign.endDate || ''
    ];
  });
  
  // Add summary row
  if (aggregatedMetrics) {
    const totalCost = aggregatedMetrics.totalCost || 0;
    const totalRevenue = aggregatedMetrics.totalRevenue || 0;
    const totalRawClicks = aggregatedMetrics.totalRawClicks || 0;
    const totalUniqueClicks = aggregatedMetrics.totalUniqueClicks || 0;
    const totalRawReg = aggregatedMetrics.totalRawReg || 0;
    const totalConfirmReg = aggregatedMetrics.totalConfirmReg || 0;
    const totalSales = aggregatedMetrics.totalSales || 0;
    
    rows.push([
      '--- TOTALS ---',
      '',
      '',
      totalCost,
      totalRevenue,
      totalRawClicks,
      totalUniqueClicks,
      totalRawReg,
      totalConfirmReg,
      totalSales,
      aggregatedMetrics.totalLTRev || 0,
      calculateCPCRaw(totalCost, totalRawClicks),
      calculateCPCUnique(totalCost, totalUniqueClicks),
      calculateCPRRaw(totalCost, totalRawReg),
      calculateCPRConfirm(totalCost, totalConfirmReg),
      calculateCPS(totalCost, totalSales),
      calculateRevPerSale(totalRevenue, totalSales),
      calculateROAS(totalRevenue, totalCost),
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