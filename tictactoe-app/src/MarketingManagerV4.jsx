import React, { useState, useEffect } from 'react';
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3, Download
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import CampaignDetail from './CampaignDetail';

const MarketingManagerV4 = () => {
  // View state management
  const [currentView, setCurrentView] = useState('dashboard');
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  // Mock data generation (same as original)
  const generateMockData = () => {
    const vendors = ['AdTech Solutions', 'MediaBuy Pro', 'Email Dynamics', 'SearchMax', 'Partner Network', 'Display Central', 'Social Media Hub'];
    const statuses = ['Live', 'Paused', 'Ended'];
    const campaigns = [];

    const vendorPerformance = {
      'AdTech Solutions': { costMultiplier: 1.2, conversionMultiplier: 1.5, profitMultiplier: 1.3 },
      'MediaBuy Pro': { costMultiplier: 0.9, conversionMultiplier: 1.2, profitMultiplier: 1.1 },
      'Email Dynamics': { costMultiplier: 0.3, conversionMultiplier: 2.0, profitMultiplier: 2.5 },
      'SearchMax': { costMultiplier: 0.1, conversionMultiplier: 1.0, profitMultiplier: 3.0 },
      'Partner Network': { costMultiplier: 0.7, conversionMultiplier: 1.3, profitMultiplier: 1.4 },
      'Display Central': { costMultiplier: 0.6, conversionMultiplier: 0.8, profitMultiplier: 0.9 },
      'Social Media Hub': { costMultiplier: 1.0, conversionMultiplier: 1.1, profitMultiplier: 1.2 }
    };

    let campaignId = 1;
    vendors.forEach(vendor => {
      const minCampaigns = 3;
      const maxCampaigns = 6;
      const numCampaigns = Math.floor(Math.random() * (maxCampaigns - minCampaigns + 1)) + minCampaigns;
      
      for (let j = 0; j < numCampaigns; j++) {
        const perf = vendorPerformance[vendor];
        const startDate = subDays(new Date(), Math.floor(Math.random() * 45));
        const endDate = subDays(startDate, -Math.floor(Math.random() * 30) - 7);
        
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

        campaigns.push({
          id: `CMP-2024-${String(campaignId).padStart(3, '0')}`,
          name: `${vendor.split(' ')[0]} - ${['Summer Sale', 'Holiday Promo', 'Flash Deal', 'New Product Launch', 'Brand Awareness', 'Retargeting', 'Lead Generation', 'Customer Retention'][Math.floor(Math.random() * 8)]}`,
          vendor: vendor,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          metrics: { rawClicks, uniqueClicks, cost, rawReg, confirmReg, sales, orderValue, revenue, ltrev },
          manager: ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'Unassigned'][Math.floor(Math.random() * 5)],
          adPlacementDomain: ['google.com', 'facebook.com', 'amazon.com', 'youtube.com', 'linkedin.com', 'twitter.com', 'reddit.com', 'news.com'][Math.floor(Math.random() * 8)],
          device: ['Desktop', 'Mobile', 'Both'][Math.floor(Math.random() * 3)],
          targeting: ['United States', 'Canada', 'United Kingdom', 'Europe', 'Asia Pacific', 'Global', 'North America', 'Latin America'][Math.floor(Math.random() * 8)],
          repContactInfo: `${vendor} Rep - ${['rep@', 'contact@', 'support@'][Math.floor(Math.random() * 3)]}${vendor.toLowerCase().replace(' ', '')}.com`,
          notes: [],
          documents: [],
          visualMedia: (() => {
            // Generate 1-3 sample media items for some campaigns
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
          })(),
          history: [{
            id: Date.now(),
            action: 'Campaign created',
            user: 'System',
            timestamp: startDate.toISOString()
          }],
          createdAt: startDate.toISOString(),
          modifiedAt: startDate.toISOString()
        });
        
        campaignId++;
      }
    });

    return campaigns;
  };

  // State management (same as original)
  const [campaigns, setCampaigns] = useState(generateMockData());
  const [filteredCampaigns, setFilteredCampaigns] = useState(campaigns);
  const [selectedVendors, setSelectedVendors] = useState([]);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'revenue', direction: 'desc' });
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 10;
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const vendors = ['AdTech Solutions', 'MediaBuy Pro', 'Email Dynamics', 'SearchMax', 'Partner Network', 'Display Central', 'Social Media Hub'];
  const dateRangeOptions = ['Current Day', 'Yesterday', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'Custom'];

  // Mobile-first responsive functions
  const getResponsiveGridColumns = () => {
    // Mobile first: 1 column, 6 KPI cards in 2 rows x 3 columns layout
    if (windowWidth >= 768) return 'repeat(3, 1fr)'; // 3 columns on desktop/tablet
    if (windowWidth >= 480) return 'repeat(2, 1fr)'; // 2 columns on small tablets
    return '1fr'; // 1 column on mobile
  };

  const getResponsiveGap = () => {
    // Mobile first: smaller gap
    return windowWidth >= 768 ? '16px' : '12px';
  };

  const getResponsivePadding = () => {
    // Mobile first: smaller padding
    return windowWidth >= 768 ? '24px' : '16px';
  };

  const getResponsiveChartHeight = () => {
    // Mobile first: smaller height
    return windowWidth >= 768 ? '300px' : '250px';
  };

  const getResponsiveFontSize = (mobile, desktop = null) => {
    // Mobile first: mobile size first parameter
    return windowWidth >= 768 ? (desktop || mobile) : mobile;
  };

  const getResponsiveMargin = (mobile, desktop = null) => {
    // Mobile first: mobile size first parameter
    return windowWidth >= 768 ? (desktop || mobile) : mobile;
  };

  const getResponsiveFilterGrid = () => {
    // Mobile first: stack vertically on mobile
    return windowWidth >= 768 ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr';
  };

  const getResponsiveChartGrid = () => {
    // Mobile first: single column on mobile
    return windowWidth >= 768 ? 'repeat(auto-fit, minmax(480px, 1fr))' : '1fr';
  };

  const getResponsiveHeaderPadding = () => {
    // Mobile first: smaller padding
    return windowWidth >= 768 ? '32px' : '20px';
  };

  const getResponsiveTableMinWidth = () => {
    // Mobile first: force horizontal scroll on small screens
    return windowWidth >= 768 ? 'auto' : '1200px';
  };

  const getResponsiveTableBorder = () => {
    // Mobile first: add border on mobile for scroll container
    return windowWidth >= 768 ? 'none' : '1px solid #e0e0e0';
  };

  const getResponsiveFilterGap = () => {
    // Mobile first: smaller gap for filters
    return windowWidth >= 768 ? '20px' : '16px';
  };

  const getResponsiveMaxWidth = () => {
    // Mobile first: full width on mobile with some padding
    if (windowWidth >= 1400) return '1400px';
    if (windowWidth >= 768) return '100%';
    return '100%';
  };

  const getResponsiveContainerPadding = () => {
    // Mobile first: less padding on mobile
    if (windowWidth >= 1024) return '16px';
    if (windowWidth >= 768) return '12px';
    return '8px';
  };

  const getResponsiveMarginBottom = () => {
    // Mobile first: smaller margins on mobile
    return windowWidth >= 768 ? '24px' : '16px';
  };

  // CSV Export function
  const exportToCSV = () => {
    const headers = [
      'Vendor', 'Campaign', 'Status', 'Start Date', 'End Date', 
      'Raw Clicks', 'Unique Clicks', 'Cost', 'CPC (Raw)', 'CPC (Unique)', 
      'Raw Reg', 'CPR (Raw)', 'Confirm Reg', 'CPR (Confirm)', 
      'Sales', 'CPS', 'Revenue', 'Rev/Sale', 'LTRev', 'ROAS'
    ];

    const csvData = currentCampaigns.map(campaign => {
      const roi = calculateROI(campaign.metrics.revenue, campaign.metrics.cost);
      const revPerSale = campaign.metrics.sales > 0 ? (campaign.metrics.revenue / campaign.metrics.sales) : 0;
      
      return [
        campaign.vendor,
        campaign.name,
        campaign.status,
        campaign.startDate,
        campaign.endDate,
        campaign.metrics.rawClicks,
        campaign.metrics.uniqueClicks,
        campaign.metrics.cost.toFixed(2),
        calculateCPCRaw(campaign.metrics.cost, campaign.metrics.rawClicks),
        calculateCPCUnique(campaign.metrics.cost, campaign.metrics.uniqueClicks),
        campaign.metrics.rawReg,
        calculateCPRRaw(campaign.metrics.cost, campaign.metrics.rawReg),
        campaign.metrics.confirmReg,
        calculateCPRConfirm(campaign.metrics.cost, campaign.metrics.confirmReg),
        campaign.metrics.sales,
        calculateCPS(campaign.metrics.cost, campaign.metrics.sales),
        campaign.metrics.revenue.toFixed(2),
        revPerSale.toFixed(2),
        campaign.metrics.ltrev.toFixed(2),
        roi
      ];
    });

    // Add summary row
    const totalRevenue = currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
    const totalLTRev = currentCampaigns.reduce((sum, c) => sum + c.metrics.ltrev, 0);
    const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
    const totalSales = currentCampaigns.reduce((sum, c) => sum + c.metrics.sales, 0);
    const totalRawClicks = currentCampaigns.reduce((sum, c) => sum + c.metrics.rawClicks, 0);
    const totalUniqueClicks = currentCampaigns.reduce((sum, c) => sum + c.metrics.uniqueClicks, 0);
    const totalRawReg = currentCampaigns.reduce((sum, c) => sum + c.metrics.rawReg, 0);
    const totalConfirmReg = currentCampaigns.reduce((sum, c) => sum + c.metrics.confirmReg, 0);

    const summaryRow = [
      '',
      `Total (${currentCampaigns.length} campaigns)`,
      '',
      '',
      '',
      totalRawClicks,
      totalUniqueClicks,
      totalCost.toFixed(2),
      calculateCPCRaw(totalCost, totalRawClicks),
      calculateCPCUnique(totalCost, totalUniqueClicks),
      totalRawReg,
      calculateCPRRaw(totalCost, totalRawReg),
      totalConfirmReg,
      calculateCPRConfirm(totalCost, totalConfirmReg),
      totalSales,
      calculateCPS(totalCost, totalSales),
      totalRevenue.toFixed(2),
      totalSales > 0 ? (totalRevenue / totalSales).toFixed(2) : '0.00',
      totalLTRev.toFixed(2),
      calculateROI(totalRevenue, totalCost)
    ];

    csvData.push(summaryRow);

    // Convert to CSV format
    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `campaign-details-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // All calculation and data processing functions (same as original)
  const calculateCPC = (cost, clicks) => clicks > 0 ? (cost / clicks).toFixed(2) : '0.00';
  const calculateCPCRaw = (cost, rawClicks) => rawClicks > 0 ? (cost / rawClicks).toFixed(2) : '0.00';
  const calculateCPCUnique = (cost, uniqueClicks) => uniqueClicks > 0 ? (cost / uniqueClicks).toFixed(2) : '0.00';
  const calculateCPRRaw = (cost, rawReg) => rawReg > 0 ? (cost / rawReg).toFixed(2) : '0.00';
  const calculateCPRConfirm = (cost, confirmReg) => confirmReg > 0 ? (cost / confirmReg).toFixed(2) : '0.00';
  const calculateCPS = (cost, sales) => sales > 0 ? (cost / sales).toFixed(2) : '0.00';
  const calculateROI = (revenue, cost) => cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';

  const getDateRangeBounds = () => {
    const today = new Date();
    let start, end;

    switch (dateRange) {
      case 'Current Day':
        start = end = today;
        break;
      case 'Yesterday':
        start = end = subDays(today, 1);
        break;
      case 'Last 7 Days':
        start = subDays(today, 7);
        end = today;
        break;
      case 'Last 14 Days':
        start = subDays(today, 14);
        end = today;
        break;
      case 'Last 30 Days':
        start = subDays(today, 30);
        end = today;
        break;
      case 'Last 90 Days':
        start = subDays(today, 90);
        end = today;
        break;
      case 'Custom':
        if (customStartDate && customEndDate) {
          start = parseISO(customStartDate);
          end = parseISO(customEndDate);
        } else {
          start = subDays(today, 30);
          end = today;
        }
        break;
      default:
        start = subDays(today, 30);
        end = today;
    }

    return { start, end };
  };

  useEffect(() => {
    let filtered = campaigns;

    if (selectedVendors.length > 0) {
      filtered = filtered.filter(campaign => selectedVendors.includes(campaign.vendor));
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    const { start, end } = getDateRangeBounds();
    filtered = filtered.filter(campaign => {
      const campaignStart = parseISO(campaign.startDate);
      return isWithinInterval(campaignStart, { start, end });
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        // Handle calculated fields
        if (sortConfig.key === 'cpcRaw') {
          aValue = parseFloat(calculateCPCRaw(a.metrics.cost, a.metrics.rawClicks));
          bValue = parseFloat(calculateCPCRaw(b.metrics.cost, b.metrics.rawClicks));
        } else if (sortConfig.key === 'cpcUnique') {
          aValue = parseFloat(calculateCPCUnique(a.metrics.cost, a.metrics.uniqueClicks));
          bValue = parseFloat(calculateCPCUnique(b.metrics.cost, b.metrics.uniqueClicks));
        } else if (sortConfig.key === 'cprRaw') {
          aValue = parseFloat(calculateCPRRaw(a.metrics.cost, a.metrics.rawReg));
          bValue = parseFloat(calculateCPRRaw(b.metrics.cost, b.metrics.rawReg));
        } else if (sortConfig.key === 'cprConfirm') {
          aValue = parseFloat(calculateCPRConfirm(a.metrics.cost, a.metrics.confirmReg));
          bValue = parseFloat(calculateCPRConfirm(b.metrics.cost, b.metrics.confirmReg));
        } else if (sortConfig.key === 'cps') {
          aValue = parseFloat(calculateCPS(a.metrics.cost, a.metrics.sales));
          bValue = parseFloat(calculateCPS(b.metrics.cost, b.metrics.sales));
        } else if (sortConfig.key === 'revPerSale') {
          aValue = a.metrics.sales > 0 ? a.metrics.revenue / a.metrics.sales : 0;
          bValue = b.metrics.sales > 0 ? b.metrics.revenue / b.metrics.sales : 0;
        } else if (sortConfig.key === 'roas') {
          aValue = parseFloat(calculateROI(a.metrics.revenue, a.metrics.cost));
          bValue = parseFloat(calculateROI(b.metrics.revenue, b.metrics.cost));
        } else if (sortConfig.key in a.metrics) {
          aValue = a.metrics[sortConfig.key];
          bValue = b.metrics[sortConfig.key];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [campaigns, selectedVendors, dateRange, customStartDate, customEndDate, statusFilter, sortConfig]);

  const aggregatedMetrics = filteredCampaigns.reduce((acc, campaign) => {
    acc.totalRawClicks += campaign.metrics.rawClicks;
    acc.totalUniqueClicks += campaign.metrics.uniqueClicks;
    acc.totalCost += campaign.metrics.cost;
    acc.totalRawReg += campaign.metrics.rawReg;
    acc.totalConfirmReg += campaign.metrics.confirmReg;
    acc.totalSales += campaign.metrics.sales;
    acc.totalRevenue += campaign.metrics.revenue;
    acc.totalLTRev += campaign.metrics.ltrev;
    return acc;
  }, { totalRawClicks: 0, totalUniqueClicks: 0, totalCost: 0, totalRawReg: 0, totalConfirmReg: 0, totalSales: 0, totalRevenue: 0, totalLTRev: 0 });

  const overallROI = aggregatedMetrics.totalCost > 0 ? ((aggregatedMetrics.totalRevenue / aggregatedMetrics.totalCost) * 100).toFixed(1) : '0.0';

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleVendorToggle = (vendor) => {
    setSelectedVendors(prev => 
      prev.includes(vendor) 
        ? prev.filter(v => v !== vendor)
        : [...prev, vendor]
    );
  };

  const generateRevenueByDayData = () => {
    const { start, end } = getDateRangeBounds();
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const intervals = daysDiff <= 7 ? daysDiff : daysDiff <= 30 ? 7 : daysDiff <= 90 ? 15 : 30;
    const data = [];

    for (let i = intervals; i >= 0; i--) {
      const date = subDays(end, Math.floor((daysDiff * i) / intervals));
      
      // Get campaigns that were active on this specific date
      const campaignsOnDate = filteredCampaigns.filter(campaign => {
        const campaignStart = parseISO(campaign.startDate);
        const campaignEnd = parseISO(campaign.endDate);
        return campaignStart <= date && campaignEnd >= date;
      });

      // Calculate daily revenue by dividing total campaign revenue by campaign duration
      const dailyRevenue = campaignsOnDate.reduce((acc, campaign) => {
        const campaignStart = parseISO(campaign.startDate);
        const campaignEnd = parseISO(campaign.endDate);
        const campaignDuration = Math.ceil((campaignEnd - campaignStart) / (1000 * 60 * 60 * 24)) + 1;
        const dailyCampaignRevenue = campaign.metrics.revenue / campaignDuration;
        acc += dailyCampaignRevenue;
        return acc;
      }, 0);

      data.push({
        date: format(date, daysDiff <= 7 ? 'MMM dd' : daysDiff <= 30 ? 'MMM dd' : 'MMM yyyy'),
        revenue: parseFloat(dailyRevenue.toFixed(2))
      });
    }

    return data;
  };

  const generateRevenueByVendorData = () => {
    const vendorData = {};
    
    filteredCampaigns.forEach(campaign => {
      if (!vendorData[campaign.vendor]) {
        vendorData[campaign.vendor] = { revenue: 0, cost: 0 };
      }
      vendorData[campaign.vendor].revenue += campaign.metrics.revenue;
      vendorData[campaign.vendor].cost += campaign.metrics.cost;
    });

    return Object.entries(vendorData).map(([vendor, data]) => ({
      vendor: vendor,
      revenue: data.revenue,
      roi: data.cost > 0 ? ((data.revenue / data.cost) * 100) : 0
    })).sort((a, b) => b.revenue - a.revenue);
  };

  // Pagination
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Campaign handlers
  const handleCampaignClick = (campaign) => {
    setSelectedCampaign(campaign);
    setCurrentView('detail');
  };

  const handleCampaignSave = (updatedCampaign) => {
    const updatedCampaigns = campaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    );
    setCampaigns(updatedCampaigns);
    
    // Update filtered campaigns as well
    const updatedFiltered = filteredCampaigns.map(c => 
      c.id === updatedCampaign.id ? updatedCampaign : c
    );
    setFilteredCampaigns(updatedFiltered);
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
    setSelectedCampaign(null);
  };

  // Render campaign detail view if selected
  if (currentView === 'detail' && selectedCampaign) {
    return (
      <CampaignDetail
        campaign={selectedCampaign}
        onBack={handleBackToDashboard}
        onSave={handleCampaignSave}
        currentUser="Marketing Manager"
      />
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      padding: getResponsiveContainerPadding(),
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: getResponsiveMaxWidth(), margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsiveHeaderPadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveMarginBottom(),
          textAlign: 'center',
          border: '1px solid #e0e0e0'
        }}>
          <h1 style={{
            margin: 0,
            color: '#1a1a1a',
            fontSize: getResponsiveFontSize('1.8rem', '2.5rem'),
            fontWeight: '600',
            marginBottom: getResponsiveMargin('6px', '8px'),
            letterSpacing: '-0.02em'
          }}>
            ERS Interactive Marketing Manager
          </h1>
        </div>

        {/* Filters */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: '24px',
          borderRadius: '8px',
          marginBottom: getResponsiveMarginBottom(),
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: getResponsiveFilterGrid(),
            gap: getResponsiveFilterGap(),
            alignItems: 'end'
          }}>
            {/* Vendor Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Vendors
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowVendorDropdown(!showVendorDropdown);
                    setVendorSearchTerm('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontWeight: '400'
                  }}
                >
                  <span>
                    {selectedVendors.length === 0 ? 'All Vendors' : 
                     selectedVendors.length === 1 ? selectedVendors[0] :
                     `${selectedVendors.length} selected`}
                  </span>
                  {showVendorDropdown ? <ChevronUp size={16} color="#666666" /> : <ChevronDown size={16} color="#666666" />}
                </button>
                
                {showVendorDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    marginTop: '4px',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #f0f0f0'
                    }}>
                      <input
                        type="text"
                        placeholder="Search vendors..."
                        value={vendorSearchTerm}
                        onChange={(e) => setVendorSearchTerm(e.target.value)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #d0d0d0',
                          borderRadius: '4px',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {(() => {
                      const filteredVendors = vendors.filter(vendor => 
                        vendor.toLowerCase().includes(vendorSearchTerm.toLowerCase())
                      );
                      
                      if (filteredVendors.length === 0) {
                        return (
                          <div style={{
                            padding: '16px',
                            color: '#666666',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}>
                            No vendors found matching "{vendorSearchTerm}"
                          </div>
                        );
                      }
                      
                      return filteredVendors.map((vendor) => (
                        <label
                          key={vendor}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '12px 16px',
                            cursor: 'pointer',
                            color: '#1a1a1a',
                            fontSize: '14px',
                            borderBottom: '1px solid #f0f0f0'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#f8f8f8'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        >
                          <input
                            type="checkbox"
                            checked={selectedVendors.includes(vendor)}
                            onChange={() => handleVendorToggle(vendor)}
                            style={{ marginRight: '10px' }}
                          />
                          {vendor}
                        </label>
                      ));
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label style={{
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                {dateRangeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#1a1a1a',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  backgroundColor: '#ffffff',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                <option value="All">All</option>
                <option value="Live">Live</option>
                <option value="Paused">Paused</option>
                <option value="Ended">Ended</option>
              </select>
            </div>

            {/* Custom Date Inputs */}
            {dateRange === 'Custom' && (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    fontWeight: '500',
                    marginBottom: '8px'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      backgroundColor: '#ffffff',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      fontWeight: '400'
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* KPI Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveGridColumns(),
          gap: getResponsiveGap(),
          marginBottom: '24px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #2563eb'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <MousePointer size={20} style={{ marginRight: '8px', color: '#2563eb' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Clicks</span>
            </div>
            <div style={{ color: '#1a1a1a', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              {aggregatedMetrics.totalUniqueClicks.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #059669'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <DollarSign size={20} style={{ marginRight: '8px', color: '#059669' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Cost</span>
            </div>
            <div style={{ color: '#1a1a1a', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              ${aggregatedMetrics.totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #7c3aed'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <Users size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Confirm Reg</span>
            </div>
            <div style={{ color: '#1a1a1a', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              {aggregatedMetrics.totalConfirmReg.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: '4px solid #dc2626'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <ShoppingCart size={20} style={{ marginRight: '8px', color: '#dc2626' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Sales</span>
            </div>
            <div style={{ color: '#1a1a1a', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              {aggregatedMetrics.totalSales.toLocaleString()}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: aggregatedMetrics.totalRevenue >= 0 ? '4px solid #059669' : '4px solid #dc2626'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <DollarSign size={20} style={{ marginRight: '8px', color: aggregatedMetrics.totalRevenue >= 0 ? '#059669' : '#dc2626' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Total Revenue</span>
            </div>
            <div style={{ color: aggregatedMetrics.totalRevenue >= 0 ? '#059669' : '#dc2626', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              ${aggregatedMetrics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            textAlign: 'left',
            border: '1px solid #e0e0e0',
            borderLeft: overallROI >= 0 ? '4px solid #059669' : '4px solid #dc2626'
          }}>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              marginBottom: '12px'
            }}>
              <TrendingUp size={20} style={{ marginRight: '8px', color: overallROI >= 0 ? '#059669' : '#dc2626' }} />
              <span style={{ color: '#666666', fontSize: '14px', fontWeight: '500' }}>Overall ROAS</span>
            </div>
            <div style={{ color: overallROI >= 0 ? '#059669' : '#dc2626', fontSize: getResponsiveFontSize('1.5rem', '2rem'), fontWeight: '600' }}>
              {overallROI}%
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: getResponsiveChartGrid(),
          gap: getResponsiveGap(),
          marginBottom: '24px'
        }}>
          {/* Revenue by Day Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#1a1a1a',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <Activity size={20} style={{ marginRight: '8px', color: '#2563eb' }} />
              Revenue by Day
            </h3>
            <div style={{ height: getResponsiveChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateRevenueByDayData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666666"
                    fontSize={12}
                    fontWeight="400"
                  />
                  <YAxis 
                    stroke="#666666"
                    fontSize={12}
                    fontWeight="400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                    formatter={(value) => [`$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Revenue']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#059669" 
                    strokeWidth={2}
                    dot={{ fill: '#059669', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2, fill: '#ffffff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit by Channel Chart */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: getResponsivePadding(),
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#1a1a1a',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <BarChart3 size={20} style={{ marginRight: '8px', color: '#059669' }} />
              Revenue by Vendor
            </h3>
            <div style={{ height: getResponsiveChartHeight() }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateRevenueByVendorData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="vendor" 
                    stroke="#666666"
                    fontSize={12}
                    fontWeight="400"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="#666666"
                    fontSize={12}
                    fontWeight="400"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      color: '#1a1a1a',
                      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="revenue" 
                    fill="#059669"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaign Details Table */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e0e0e0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: getResponsivePadding(),
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '8px'
            }}>
              <h3 style={{
                margin: '0',
                color: '#1a1a1a',
                fontSize: '1.25rem',
                fontWeight: '600'
              }}>
                Campaign Details
              </h3>
              <button
                onClick={exportToCSV}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <Download size={16} />
                Export CSV
              </button>
            </div>
            <p style={{
              margin: '0',
              color: '#666666',
              fontSize: '14px',
              fontWeight: '400'
            }}>
              Showing {indexOfFirstCampaign + 1}-{Math.min(indexOfLastCampaign, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
            </p>
          </div>

          <div style={{ 
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
            borderRadius: '8px',
            border: getResponsiveTableBorder()
          }}>
            <table style={{
              width: '100%',
              minWidth: getResponsiveTableMinWidth(),
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f8f8' }}>
                  {['Vendor', 'Campaign', 'Status', 'Raw Clicks', 'Unique Clicks', 'Cost', 'CPC (Raw)', 'CPC (Unique)', 'Raw Reg', 'CPR (Raw)', 'Confirm Reg', 'CPR (Confirm)', 'Sales', 'CPS', 'Revenue', 'Rev/Sale', 'LTRev', 'ROAS'].map((header, index) => (
                    <th 
                      key={header}
                      onClick={() => handleSort(
                        header === 'Raw Clicks' ? 'rawClicks' :
                        header === 'Unique Clicks' ? 'uniqueClicks' :
                        header === 'Raw Reg' ? 'rawReg' :
                        header === 'Confirm Reg' ? 'confirmReg' :
                        header === 'LTRev' ? 'ltrev' :
                        header === 'Rev/Sale' ? 'revPerSale' :
                        header === 'CPC (Raw)' ? 'cpcRaw' :
                        header === 'CPC (Unique)' ? 'cpcUnique' :
                        header === 'CPR (Raw)' ? 'cprRaw' :
                        header === 'CPR (Confirm)' ? 'cprConfirm' :
                        header === 'CPS' ? 'cps' :
                        header === 'ROAS' ? 'roas' :
                        header.toLowerCase()
                      )}
                      style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        color: (sortConfig.key === header.toLowerCase() || 
                               (header === 'Raw Clicks' && sortConfig.key === 'rawClicks') ||
                               (header === 'Unique Clicks' && sortConfig.key === 'uniqueClicks') ||
                               (header === 'Raw Reg' && sortConfig.key === 'rawReg') ||
                               (header === 'Confirm Reg' && sortConfig.key === 'confirmReg') ||
                               (header === 'LTRev' && sortConfig.key === 'ltrev') ||
                               (header === 'Rev/Sale' && sortConfig.key === 'revPerSale') ||
                               (header === 'CPC (Raw)' && sortConfig.key === 'cpcRaw') ||
                               (header === 'CPC (Unique)' && sortConfig.key === 'cpcUnique') ||
                               (header === 'CPR (Raw)' && sortConfig.key === 'cprRaw') ||
                               (header === 'CPR (Confirm)' && sortConfig.key === 'cprConfirm') ||
                               (header === 'CPS' && sortConfig.key === 'cps') ||
                               (header === 'ROAS' && sortConfig.key === 'roas')) ? '#2563eb' : '#1a1a1a',
                        fontSize: '13px',
                        fontWeight: '600',
                        borderBottom: '1px solid #e0e0e0',
                        cursor: 'pointer'
                      }}
                    >
                      {header} {((sortConfig.key === header.toLowerCase()) ||
                                (header === 'Raw Clicks' && sortConfig.key === 'rawClicks') ||
                                (header === 'Unique Clicks' && sortConfig.key === 'uniqueClicks') ||
                                (header === 'Raw Reg' && sortConfig.key === 'rawReg') ||
                                (header === 'Confirm Reg' && sortConfig.key === 'confirmReg') ||
                                (header === 'LTRev' && sortConfig.key === 'ltrev') ||
                                (header === 'Rev/Sale' && sortConfig.key === 'revPerSale') ||
                                (header === 'CPC (Raw)' && sortConfig.key === 'cpcRaw') ||
                                (header === 'CPC (Unique)' && sortConfig.key === 'cpcUnique') ||
                                (header === 'CPR (Raw)' && sortConfig.key === 'cprRaw') ||
                                (header === 'CPR (Confirm)' && sortConfig.key === 'cprConfirm') ||
                                (header === 'CPS' && sortConfig.key === 'cps') ||
                                (header === 'ROAS' && sortConfig.key === 'roas')) && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentCampaigns.map((campaign, index) => {
                  const roi = calculateROI(campaign.metrics.revenue, campaign.metrics.cost);
                  return (
                    <tr key={campaign.id} style={{
                      borderBottom: index < currentCampaigns.length - 1 ? '1px solid #f0f0f0' : 'none',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                    onClick={() => handleCampaignClick(campaign)}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#fafafa'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: '16px 20px',
                        color: '#1a1a1a',
                        fontSize: '14px',
                        fontWeight: '400'
                      }}>{campaign.vendor}</td>
                      <td style={{
                        padding: '16px 20px',
                        color: '#1a1a1a',
                        fontSize: '14px',
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <div style={{ fontWeight: '600', marginBottom: '2px', color: '#2563eb' }}>{campaign.name}</div>
                        <div style={{ fontSize: '12px', color: '#666666', fontWeight: '400' }}>{campaign.id}</div>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: campaign.status === 'Live' ? '#dcfce7' : 
                                         campaign.status === 'Paused' ? '#fef3c7' : 
                                         '#fee2e2',
                          color: campaign.status === 'Live' ? '#15803d' : 
                                campaign.status === 'Paused' ? '#a16207' : '#dc2626'
                        }}>
                          {campaign.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        {campaign.metrics.rawClicks.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        {campaign.metrics.uniqueClicks.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        ${campaign.metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666666', fontSize: '14px', fontWeight: '400' }}>
                        ${calculateCPCRaw(campaign.metrics.cost, campaign.metrics.rawClicks)}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666666', fontSize: '14px', fontWeight: '400' }}>
                        ${calculateCPCUnique(campaign.metrics.cost, campaign.metrics.uniqueClicks)}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        {campaign.metrics.rawReg.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666666', fontSize: '14px', fontWeight: '400' }}>
                        ${calculateCPRRaw(campaign.metrics.cost, campaign.metrics.rawReg)}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        {campaign.metrics.confirmReg.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666666', fontSize: '14px', fontWeight: '400' }}>
                        ${calculateCPRConfirm(campaign.metrics.cost, campaign.metrics.confirmReg)}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#1a1a1a', fontSize: '14px', fontWeight: '400' }}>
                        {campaign.metrics.sales.toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', color: '#666666', fontSize: '14px', fontWeight: '400' }}>
                        ${calculateCPS(campaign.metrics.cost, campaign.metrics.sales)}
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: campaign.metrics.revenue >= 0 ? '#059669' : '#dc2626', 
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ${campaign.metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: '#1a1a1a', 
                        fontSize: '14px',
                        fontWeight: '400'
                      }}>
                        ${campaign.metrics.sales > 0 ? (campaign.metrics.revenue / campaign.metrics.sales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: campaign.metrics.ltrev >= 0 ? '#059669' : '#dc2626', 
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ${campaign.metrics.ltrev.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td style={{ 
                        padding: '16px 20px', 
                        color: roi >= 0 ? '#059669' : '#dc2626', 
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        {roi}%
                      </td>
                    </tr>
                  );
                })}
                {/* Summary Row */}
                <tr style={{
                  borderTop: '2px solid #e0e0e0',
                  backgroundColor: '#f8f8f8',
                  fontWeight: '600'
                }}>
                  <td style={{ padding: '16px 20px' }}></td>
                  <td style={{
                    padding: '16px 20px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    Total ({currentCampaigns.length} campaigns)
                  </td>
                  <td style={{ padding: '16px 20px' }}></td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    {currentCampaigns.reduce((sum, c) => sum + c.metrics.rawClicks, 0).toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    {currentCampaigns.reduce((sum, c) => sum + c.metrics.uniqueClicks, 0).toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#666666', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const totalRawClicks = currentCampaigns.reduce((sum, c) => sum + c.metrics.rawClicks, 0);
                      return calculateCPCRaw(totalCost, totalRawClicks);
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#666666', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const totalUniqueClicks = currentCampaigns.reduce((sum, c) => sum + c.metrics.uniqueClicks, 0);
                      return calculateCPCUnique(totalCost, totalUniqueClicks);
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    {currentCampaigns.reduce((sum, c) => sum + c.metrics.rawReg, 0).toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#666666', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const totalRawReg = currentCampaigns.reduce((sum, c) => sum + c.metrics.rawReg, 0);
                      return calculateCPRRaw(totalCost, totalRawReg);
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    {currentCampaigns.reduce((sum, c) => sum + c.metrics.confirmReg, 0).toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#666666', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const totalConfirmReg = currentCampaigns.reduce((sum, c) => sum + c.metrics.confirmReg, 0);
                      return calculateCPRConfirm(totalCost, totalConfirmReg);
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    {currentCampaigns.reduce((sum, c) => sum + c.metrics.sales, 0).toLocaleString()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#666666', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const totalSales = currentCampaigns.reduce((sum, c) => sum + c.metrics.sales, 0);
                      return calculateCPS(totalCost, totalSales);
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: (() => {
                      const totalRevenue = currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
                      return totalRevenue >= 0 ? '#059669' : '#dc2626';
                    })(), 
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    ${currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: '#1a1a1a', 
                    fontSize: '14px', 
                    fontWeight: '700' 
                  }}>
                    ${(() => {
                      const totalRevenue = currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
                      const totalSales = currentCampaigns.reduce((sum, c) => sum + c.metrics.sales, 0);
                      return totalSales > 0 ? (totalRevenue / totalSales).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00';
                    })()}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: (() => {
                      const totalLTRev = currentCampaigns.reduce((sum, c) => sum + c.metrics.ltrev, 0);
                      return totalLTRev >= 0 ? '#059669' : '#dc2626';
                    })(), 
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    ${currentCampaigns.reduce((sum, c) => sum + c.metrics.ltrev, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ 
                    padding: '16px 20px', 
                    color: (() => {
                      const totalRevenue = currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      const roi = calculateROI(totalRevenue, totalCost);
                      return parseFloat(roi) >= 0 ? '#059669' : '#dc2626';
                    })(), 
                    fontSize: '14px',
                    fontWeight: '700'
                  }}>
                    {(() => {
                      const totalRevenue = currentCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
                      const totalCost = currentCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
                      return calculateROI(totalRevenue, totalCost);
                    })()}%
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '20px 24px',
              borderTop: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8f8f8'
            }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === 1 ? '#f8f8f8' : '#ffffff',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  color: currentPage === 1 ? '#999999' : '#1a1a1a',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '8px' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: currentPage === pageNum ? '#2563eb' : '#ffffff',
                        border: '1px solid #d0d0d0',
                        borderRadius: '6px',
                        color: currentPage === pageNum ? '#ffffff' : '#1a1a1a',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '400'
                      }}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  backgroundColor: currentPage === totalPages ? '#f8f8f8' : '#ffffff',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  color: currentPage === totalPages ? '#999999' : '#1a1a1a',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '400'
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketingManagerV4;