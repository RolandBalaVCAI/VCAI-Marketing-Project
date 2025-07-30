import React, { useState, useEffect } from 'react';
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketingManager = () => {
  // Mock data generation
  const generateMockData = () => {
    const channels = ['Google Ads', 'Facebook Ads', 'Email Marketing', 'Organic Search', 'Affiliate', 'Display Network', 'Instagram Ads'];
    const statuses = ['Live', 'Paused', 'Ended'];
    const campaignTypes = ['Summer Sale', 'Holiday Promo', 'Flash Deal', 'New Product Launch', 'Brand Awareness', 'Retargeting', 'Lead Generation', 'Customer Retention'];
    const campaigns = [];

    // Channel-specific performance multipliers for more realistic data
    const channelPerformance = {
      'Google Ads': { costMultiplier: 1.2, conversionMultiplier: 1.5, profitMultiplier: 1.3 },
      'Facebook Ads': { costMultiplier: 0.9, conversionMultiplier: 1.2, profitMultiplier: 1.1 },
      'Email Marketing': { costMultiplier: 0.3, conversionMultiplier: 2.0, profitMultiplier: 2.5 },
      'Organic Search': { costMultiplier: 0.1, conversionMultiplier: 1.0, profitMultiplier: 3.0 },
      'Affiliate': { costMultiplier: 0.7, conversionMultiplier: 1.3, profitMultiplier: 1.4 },
      'Display Network': { costMultiplier: 0.6, conversionMultiplier: 0.8, profitMultiplier: 0.9 },
      'Instagram Ads': { costMultiplier: 1.0, conversionMultiplier: 1.1, profitMultiplier: 1.2 }
    };

    // Ensure at least 3 campaigns per channel
    let campaignId = 1;
    channels.forEach(channel => {
      const minCampaigns = 3;
      const maxCampaigns = 6;
      const numCampaigns = Math.floor(Math.random() * (maxCampaigns - minCampaigns + 1)) + minCampaigns;
      
      for (let j = 0; j < numCampaigns; j++) {
        const perf = channelPerformance[channel];
        const startDate = subDays(new Date(), Math.floor(Math.random() * 90));
        const endDate = subDays(startDate, -Math.floor(Math.random() * 30) - 7);
        
        // Base values with channel-specific adjustments
        const baseCost = Math.floor(Math.random() * 4000) + 1000;
        const cost = Math.floor(baseCost * perf.costMultiplier);
        const clicks = Math.floor((Math.random() * 4000 + 500) * perf.conversionMultiplier);
        const signups = Math.floor(clicks * (Math.random() * 0.15 + 0.05) * perf.conversionMultiplier);
        const orders = Math.floor(signups * (Math.random() * 0.4 + 0.1) * perf.conversionMultiplier);
        const orderValue = orders * (Math.random() * 150 + 50) * perf.profitMultiplier;
        const profit = orderValue - cost;

        campaigns.push({
          id: `CMP-2024-${String(campaignId).padStart(3, '0')}`,
          name: `${channel.split(' ')[0]} - ${campaignTypes[Math.floor(Math.random() * campaignTypes.length)]}`,
          channel: channel,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          metrics: {
            clicks,
            cost,
            signups,
            orders,
            orderValue,
            profit
          }
        });
        
        campaignId++;
      }
    });

    return campaigns;
  };

  // State management
  const [campaigns, setCampaigns] = useState(generateMockData());
  const [filteredCampaigns, setFilteredCampaigns] = useState(campaigns);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'profit', direction: 'desc' });
  const [showChannelDropdown, setShowChannelDropdown] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const campaignsPerPage = 10;

  const channels = ['Google Ads', 'Facebook Ads', 'Email Marketing', 'Organic Search', 'Affiliate', 'Display Network', 'Instagram Ads'];
  const dateRangeOptions = ['Current Day', 'Yesterday', 'Last 7 Days', 'Last 14 Days', 'Last 30 Days', 'Last 90 Days', 'Custom'];

  // Calculate metrics
  const calculateCPC = (cost, clicks) => clicks > 0 ? (cost / clicks).toFixed(2) : '0.00';
  const calculateCPS = (cost, signups) => signups > 0 ? (cost / signups).toFixed(2) : '0.00';
  const calculateCPO = (cost, orders) => orders > 0 ? (cost / orders).toFixed(2) : '0.00';
  const calculateROI = (profit, cost) => cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0.0';

  // Get date range boundaries
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
        start = subDays(today, 6);
        end = today;
        break;
      case 'Last 14 Days':
        start = subDays(today, 13);
        end = today;
        break;
      case 'Last 30 Days':
        start = subDays(today, 29);
        end = today;
        break;
      case 'Last 90 Days':
        start = subDays(today, 89);
        end = today;
        break;
      case 'Custom':
        start = customStartDate ? parseISO(customStartDate) : subDays(today, 29);
        end = customEndDate ? parseISO(customEndDate) : today;
        break;
      default:
        start = subDays(today, 29);
        end = today;
    }

    return { start, end };
  };

  // Filter campaigns
  useEffect(() => {
    let filtered = [...campaigns];
    
    // Channel filter
    if (selectedChannels.length > 0) {
      filtered = filtered.filter(campaign => selectedChannels.includes(campaign.channel));
    }

    // Status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    // Date range filter
    const { start, end } = getDateRangeBounds();
    filtered = filtered.filter(campaign => {
      const campaignStart = parseISO(campaign.startDate);
      const campaignEnd = parseISO(campaign.endDate);
      return isWithinInterval(campaignStart, { start, end }) || 
             isWithinInterval(campaignEnd, { start, end }) ||
             (campaignStart <= start && campaignEnd >= end);
    });

    // Sort
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      if (sortConfig.key === 'name' || sortConfig.key === 'channel' || sortConfig.key === 'status') {
        aValue = a[sortConfig.key];
        bValue = b[sortConfig.key];
      } else {
        aValue = a.metrics[sortConfig.key] || 0;
        bValue = b.metrics[sortConfig.key] || 0;
      }

      if (sortConfig.direction === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredCampaigns(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [campaigns, selectedChannels, dateRange, customStartDate, customEndDate, statusFilter, sortConfig]);

  // Calculate aggregated metrics
  const aggregatedMetrics = filteredCampaigns.reduce((acc, campaign) => {
    acc.totalClicks += campaign.metrics.clicks;
    acc.totalCost += campaign.metrics.cost;
    acc.totalSignups += campaign.metrics.signups;
    acc.totalOrders += campaign.metrics.orders;
    acc.totalOrderValue += campaign.metrics.orderValue;
    acc.totalProfit += campaign.metrics.profit;
    return acc;
  }, {
    totalClicks: 0,
    totalCost: 0,
    totalSignups: 0,
    totalOrders: 0,
    totalOrderValue: 0,
    totalProfit: 0
  });

  // Prepare chart data - aggregate by channel
  const channelData = {};
  filteredCampaigns.forEach(campaign => {
    if (!channelData[campaign.channel]) {
      channelData[campaign.channel] = {
        profit: 0,
        cost: 0,
        campaigns: 0
      };
    }
    channelData[campaign.channel].profit += campaign.metrics.profit;
    channelData[campaign.channel].cost += campaign.metrics.cost;
    channelData[campaign.channel].campaigns += 1;
  });

  const chartData = Object.entries(channelData).map(([channel, data]) => ({
    name: channel,
    profit: data.profit,
    roi: parseFloat(calculateROI(data.profit, data.cost)),
    campaigns: data.campaigns
  })).sort((a, b) => b.profit - a.profit);

  // Prepare ROI over time data
  const { start, end } = getDateRangeBounds();
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  
  // Generate date points based on the range
  let datePoints = [];
  if (daysDiff <= 1) {
    // Single day - show hourly data (mock)
    for (let i = 0; i < 24; i += 4) {
      datePoints.push({
        date: format(new Date(start.getFullYear(), start.getMonth(), start.getDate(), i), 'HH:mm'),
        label: format(new Date(start.getFullYear(), start.getMonth(), start.getDate(), i), 'ha')
      });
    }
  } else if (daysDiff <= 7) {
    // Week or less - show daily
    for (let i = 0; i < daysDiff; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      datePoints.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM d')
      });
    }
  } else if (daysDiff <= 30) {
    // Month or less - show every few days
    const interval = Math.ceil(daysDiff / 10);
    for (let i = 0; i < daysDiff; i += interval) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      datePoints.push({
        date: format(date, 'yyyy-MM-dd'),
        label: format(date, 'MMM d')
      });
    }
  } else {
    // More than a month - show weekly
    const weeks = Math.ceil(daysDiff / 7);
    for (let i = 0; i < weeks; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + (i * 7));
      if (date <= end) {
        datePoints.push({
          date: format(date, 'yyyy-MM-dd'),
          label: format(date, 'MMM d')
        });
      }
    }
  }

  // Generate ROI data for each date point (mock data with realistic trends)
  const roiOverTimeData = datePoints.map((point, index) => {
    // Simulate ROI trends - generally improving over time with some variation
    const baseROI = 50 + (index * 5) + Math.random() * 20 - 10;
    const campaigns = Math.floor(Math.random() * 5) + 2;
    const cost = (Math.random() * 3000) + 1000;
    const profit = cost * (baseROI / 100);
    
    return {
      date: point.label,
      roi: Math.max(0, parseFloat(baseROI.toFixed(1))),
      profit: profit,
      cost: cost,
      campaigns: campaigns
    };
  });

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'desc' ? 'asc' : 'desc'
    });
  };

  // Handle channel selection
  const toggleChannel = (channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  // Handle status change
  const updateCampaignStatus = (campaignId, newStatus) => {
    setCampaigns(prev => 
      prev.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus }
          : campaign
      )
    );
  };

  // Pagination calculations
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);

  // Handle page change
  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Styles
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#f3f4f6',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  };

  const headerStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const cardStyle = {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    marginBottom: '20px'
  };

  const metricCardStyle = {
    padding: '20px',
    backgroundColor: '#f3f4f6',
    borderRadius: '8px',
    textAlign: 'center',
    border: '1px solid #e5e7eb'
  };

  const buttonStyle = (active = false) => ({
    padding: '8px 16px',
    backgroundColor: active ? '#3b82f6' : 'white',
    color: active ? 'white' : '#374151',
    border: `1px solid ${active ? '#3b82f6' : '#e5e7eb'}`,
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s'
  });

  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse'
  };

  const thStyle = {
    textAlign: 'left',
    padding: '12px',
    borderBottom: '2px solid #e5e7eb',
    color: '#374151',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    userSelect: 'none'
  };

  const tdStyle = {
    padding: '12px',
    borderBottom: '1px solid #e5e7eb',
    fontSize: '14px',
    color: '#000000'
  };

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <h1 style={{ margin: '0 0 10px 0', color: '#1f2937', fontSize: '32px' }}>ERS Interactive Marketing Manager</h1>
        <p style={{ margin: 0, color: '#000000' }}>Track and optimize your marketing campaign performance</p>
      </div>

      {/* Filters */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={20} /> Filters
        </h2>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          {/* Channel Filter */}
          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
              Traffic Channel
            </label>
            <button
              onClick={() => setShowChannelDropdown(!showChannelDropdown)}
              style={{
                ...buttonStyle(),
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: '200px',
                justifyContent: 'space-between'
              }}
            >
              {selectedChannels.length > 0 ? `${selectedChannels.length} selected` : 'All Channels'}
              <ChevronDown size={16} />
            </button>
            
            {showChannelDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                marginTop: '4px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                zIndex: 10
              }}>
                {channels.map(channel => (
                  <label
                    key={channel}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '10px',
                      cursor: 'pointer',
                      color: '#000000',
                      fontSize: '14px'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'white'}
                  >
                    <input
                      type="checkbox"
                      checked={selectedChannels.includes(channel)}
                      onChange={() => toggleChannel(channel)}
                      style={{ marginRight: '8px' }}
                    />
                    {channel}
                  </label>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              style={{
                padding: '8px 16px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: 'white',
                color: '#000000',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {dateRangeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Custom Date Range */}
          {dateRange === 'Custom' && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{
                    padding: '8px 16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
            </>
          )}

          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: '#000000', fontSize: '14px', fontWeight: '500' }}>
              Campaign Status
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['All', 'Live', 'Paused', 'Ended'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  style={buttonStyle(statusFilter === status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Overview */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} /> Dashboard Overview
        </h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '20px'
        }}>
          <div style={metricCardStyle}>
            <MousePointer size={24} color="#3b82f6" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '14px', fontWeight: '600' }}>Total Clicks</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {aggregatedMetrics.totalClicks.toLocaleString()}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#000000' }}>
              Avg CPC: ${calculateCPC(aggregatedMetrics.totalCost, aggregatedMetrics.totalClicks)}
            </p>
          </div>

          <div style={metricCardStyle}>
            <DollarSign size={24} color="#ef4444" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '14px', fontWeight: '600' }}>Total Cost</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              ${aggregatedMetrics.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#000000' }}>
              {filteredCampaigns.length} Active Campaigns
            </p>
          </div>

          <div style={metricCardStyle}>
            <Users size={24} color="#8b5cf6" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '14px', fontWeight: '600' }}>Total Sign-ups</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {aggregatedMetrics.totalSignups.toLocaleString()}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#000000' }}>
              Avg CPS: ${calculateCPS(aggregatedMetrics.totalCost, aggregatedMetrics.totalSignups)}
            </p>
          </div>

          <div style={metricCardStyle}>
            <ShoppingCart size={24} color="#f59e0b" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '14px', fontWeight: '600' }}>Total Orders</h3>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>
              {aggregatedMetrics.totalOrders.toLocaleString()}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#000000' }}>
              Avg CPO: ${calculateCPO(aggregatedMetrics.totalCost, aggregatedMetrics.totalOrders)}
            </p>
          </div>

          <div style={metricCardStyle}>
            <TrendingUp size={24} color="#10b981" style={{ marginBottom: '8px' }} />
            <h3 style={{ margin: '0 0 5px 0', color: '#000000', fontSize: '14px', fontWeight: '600' }}>Overall ROI</h3>
            <p style={{ 
              margin: 0, 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: aggregatedMetrics.totalProfit >= 0 ? '#10b981' : '#ef4444' 
            }}>
              {calculateROI(aggregatedMetrics.totalProfit, aggregatedMetrics.totalCost)}%
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#000000' }}>
              Profit: ${aggregatedMetrics.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      {/* ROI Over Time - Full Width */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} /> ROI Over Time
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={roiOverTimeData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#000000' }}>{payload[0].payload.date}</p>
                      <p style={{ margin: '0', color: '#000000' }}>ROI: {payload[0].value}%</p>
                      <p style={{ margin: '0', color: '#000000', fontSize: '12px' }}>Profit: ${payload[0].payload.profit.toLocaleString()}</p>
                      <p style={{ margin: '0', color: '#000000', fontSize: '12px' }}>Cost: ${payload[0].payload.cost.toLocaleString()}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line type="monotone" dataKey="roi" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Profit by Channel - Full Width */}
      <div style={cardStyle}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} /> Profit by Channel
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value, name) => [`$${value.toLocaleString()}`, name === 'profit' ? 'Profit' : name]}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div style={{ backgroundColor: 'white', padding: '10px', border: '1px solid #e5e7eb', borderRadius: '4px' }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '600', color: '#000000' }}>{payload[0].payload.name}</p>
                      <p style={{ margin: '0', color: '#000000' }}>Profit: ${payload[0].value.toLocaleString()}</p>
                      <p style={{ margin: '0', color: '#000000', fontSize: '12px' }}>Campaigns: {payload[0].payload.campaigns}</p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="profit" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign Table */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 20px 0', color: '#1f2937', fontSize: '20px' }}>Campaign Details</h2>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle} onClick={() => handleSort('name')}>
                  Campaign {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle} onClick={() => handleSort('channel')}>
                  Channel {sortConfig.key === 'channel' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle}>Status</th>
                <th style={thStyle} onClick={() => handleSort('clicks')}>
                  Clicks {sortConfig.key === 'clicks' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle} onClick={() => handleSort('cost')}>
                  Cost {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle}>CPC</th>
                <th style={thStyle} onClick={() => handleSort('signups')}>
                  Sign-ups {sortConfig.key === 'signups' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle}>CPS</th>
                <th style={thStyle} onClick={() => handleSort('orders')}>
                  Orders {sortConfig.key === 'orders' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle}>CPO</th>
                <th style={thStyle} onClick={() => handleSort('orderValue')}>
                  Order Value {sortConfig.key === 'orderValue' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle} onClick={() => handleSort('profit')}>
                  Profit {sortConfig.key === 'profit' && (sortConfig.direction === 'asc' ? <ChevronUp size={14} style={{ display: 'inline' }} /> : <ChevronDown size={14} style={{ display: 'inline' }} />)}
                </th>
                <th style={thStyle}>ROI</th>
              </tr>
            </thead>
            <tbody>
              {currentCampaigns.map(campaign => (
                <tr key={campaign.id}>
                  <td style={tdStyle}>
                    <div>
                      <div style={{ fontWeight: '500', color: '#000000' }}>{campaign.name}</div>
                      <div style={{ fontSize: '12px', color: '#000000' }}>{campaign.id}</div>
                    </div>
                  </td>
                  <td style={tdStyle}>{campaign.channel}</td>
                  <td style={tdStyle}>
                    <select
                      value={campaign.status}
                      onChange={(e) => updateCampaignStatus(campaign.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: campaign.status === 'Live' ? '#dcfce7' : campaign.status === 'Paused' ? '#fef3c7' : '#fee2e2',
                        color: '#000000',
                        fontWeight: '500'
                      }}
                    >
                      <option value="Live">Live</option>
                      <option value="Paused">Paused</option>
                      <option value="Ended">Ended</option>
                    </select>
                  </td>
                  <td style={tdStyle}>{campaign.metrics.clicks.toLocaleString()}</td>
                  <td style={tdStyle}>${campaign.metrics.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={tdStyle}>${calculateCPC(campaign.metrics.cost, campaign.metrics.clicks)}</td>
                  <td style={tdStyle}>{campaign.metrics.signups.toLocaleString()}</td>
                  <td style={tdStyle}>${calculateCPS(campaign.metrics.cost, campaign.metrics.signups)}</td>
                  <td style={tdStyle}>{campaign.metrics.orders.toLocaleString()}</td>
                  <td style={tdStyle}>${calculateCPO(campaign.metrics.cost, campaign.metrics.orders)}</td>
                  <td style={tdStyle}>${campaign.metrics.orderValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                  <td style={{ ...tdStyle, color: campaign.metrics.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                    ${campaign.metrics.profit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...tdStyle, color: campaign.metrics.profit >= 0 ? '#10b981' : '#ef4444', fontWeight: '500' }}>
                    {calculateROI(campaign.metrics.profit, campaign.metrics.cost)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid #e5e7eb'
          }}>
            <div style={{ color: '#000000', fontSize: '14px' }}>
              Showing {indexOfFirstCampaign + 1}-{Math.min(indexOfLastCampaign, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === 1 ? '#f3f4f6' : 'white',
                  color: currentPage === 1 ? '#9ca3af' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: currentPage === number ? '#3b82f6' : 'white',
                    color: currentPage === number ? 'white' : '#374151',
                    border: `1px solid ${currentPage === number ? '#3b82f6' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: currentPage === number ? '600' : '400'
                  }}
                >
                  {number}
                </button>
              ))}
              
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 12px',
                  backgroundColor: currentPage === totalPages ? '#f3f4f6' : 'white',
                  color: currentPage === totalPages ? '#9ca3af' : '#374151',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingManager;