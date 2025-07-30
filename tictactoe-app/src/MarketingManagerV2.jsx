import React, { useState, useEffect } from 'react';
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketingManagerV2 = () => {
  // Mock data generation (same as original)
  const generateMockData = () => {
    const channels = ['Google Ads', 'Facebook Ads', 'Email Marketing', 'Organic Search', 'Affiliate', 'Display Network', 'Instagram Ads'];
    const statuses = ['Live', 'Paused', 'Ended'];
    const campaigns = [];

    const channelPerformance = {
      'Google Ads': { costMultiplier: 1.2, conversionMultiplier: 1.5, profitMultiplier: 1.3 },
      'Facebook Ads': { costMultiplier: 0.9, conversionMultiplier: 1.2, profitMultiplier: 1.1 },
      'Email Marketing': { costMultiplier: 0.3, conversionMultiplier: 2.0, profitMultiplier: 2.5 },
      'Organic Search': { costMultiplier: 0.1, conversionMultiplier: 1.0, profitMultiplier: 3.0 },
      'Affiliate': { costMultiplier: 0.7, conversionMultiplier: 1.3, profitMultiplier: 1.4 },
      'Display Network': { costMultiplier: 0.6, conversionMultiplier: 0.8, profitMultiplier: 0.9 },
      'Instagram Ads': { costMultiplier: 1.0, conversionMultiplier: 1.1, profitMultiplier: 1.2 }
    };

    let campaignId = 1;
    channels.forEach(channel => {
      const minCampaigns = 3;
      const maxCampaigns = 6;
      const numCampaigns = Math.floor(Math.random() * (maxCampaigns - minCampaigns + 1)) + minCampaigns;
      
      for (let j = 0; j < numCampaigns; j++) {
        const perf = channelPerformance[channel];
        const startDate = subDays(new Date(), Math.floor(Math.random() * 90));
        const endDate = subDays(startDate, -Math.floor(Math.random() * 30) - 7);
        
        const baseCost = Math.floor(Math.random() * 4000) + 1000;
        const cost = Math.floor(baseCost * perf.costMultiplier);
        const clicks = Math.floor((Math.random() * 4000 + 500) * perf.conversionMultiplier);
        const signups = Math.floor(clicks * (Math.random() * 0.15 + 0.05) * perf.conversionMultiplier);
        const orders = Math.floor(signups * (Math.random() * 0.4 + 0.1) * perf.conversionMultiplier);
        const orderValue = orders * (Math.random() * 150 + 50) * perf.profitMultiplier;
        const profit = orderValue - cost;

        campaigns.push({
          id: `CMP-2024-${String(campaignId).padStart(3, '0')}`,
          name: `${channel.split(' ')[0]} - ${['Summer Sale', 'Holiday Promo', 'Flash Deal', 'New Product Launch', 'Brand Awareness', 'Retargeting', 'Lead Generation', 'Customer Retention'][Math.floor(Math.random() * 8)]}`,
          channel: channel,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          startDate: format(startDate, 'yyyy-MM-dd'),
          endDate: format(endDate, 'yyyy-MM-dd'),
          metrics: { clicks, cost, signups, orders, orderValue, profit }
        });
        
        campaignId++;
      }
    });

    return campaigns;
  };

  // State management (same as original)
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

  // All calculation and data processing functions (same as original)
  const calculateCPC = (cost, clicks) => clicks > 0 ? (cost / clicks).toFixed(2) : '0.00';
  const calculateCPS = (cost, signups) => signups > 0 ? (cost / signups).toFixed(2) : '0.00';
  const calculateCPO = (cost, orders) => orders > 0 ? (cost / orders).toFixed(2) : '0.00';
  const calculateROI = (profit, cost) => cost > 0 ? ((profit / cost) * 100).toFixed(1) : '0.0';

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

    if (selectedChannels.length > 0) {
      filtered = filtered.filter(campaign => selectedChannels.includes(campaign.channel));
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
        
        if (sortConfig.key === 'profit') {
          aValue = a.metrics.profit;
          bValue = b.metrics.profit;
        } else if (sortConfig.key in a.metrics) {
          aValue = a.metrics[sortConfig.key];
          bValue = b.metrics[sortConfig.key];
        } else {
          aValue = a[sortConfig.key];
          bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCampaigns(filtered);
    setCurrentPage(1);
  }, [campaigns, selectedChannels, dateRange, customStartDate, customEndDate, statusFilter, sortConfig]);

  const aggregatedMetrics = filteredCampaigns.reduce((acc, campaign) => {
    acc.totalClicks += campaign.metrics.clicks;
    acc.totalCost += campaign.metrics.cost;
    acc.totalSignups += campaign.metrics.signups;
    acc.totalOrders += campaign.metrics.orders;
    acc.totalProfit += campaign.metrics.profit;
    return acc;
  }, { totalClicks: 0, totalCost: 0, totalSignups: 0, totalOrders: 0, totalProfit: 0 });

  const overallROI = aggregatedMetrics.totalCost > 0 ? ((aggregatedMetrics.totalProfit / aggregatedMetrics.totalCost) * 100).toFixed(1) : '0.0';

  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const handleChannelToggle = (channel) => {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const generateROIOverTimeData = () => {
    const { start, end } = getDateRangeBounds();
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    const intervals = daysDiff <= 7 ? daysDiff : daysDiff <= 30 ? 7 : daysDiff <= 90 ? 15 : 30;
    const data = [];

    for (let i = intervals; i >= 0; i--) {
      const date = subDays(end, Math.floor((daysDiff * i) / intervals));
      const campaignsAtDate = filteredCampaigns.filter(campaign => {
        const campaignDate = parseISO(campaign.startDate);
        return campaignDate <= date;
      });

      const metrics = campaignsAtDate.reduce((acc, campaign) => {
        acc.profit += campaign.metrics.profit;
        acc.cost += campaign.metrics.cost;
        return acc;
      }, { profit: 0, cost: 0 });

      const roi = metrics.cost > 0 ? ((metrics.profit / metrics.cost) * 100) : 0;

      data.push({
        date: format(date, daysDiff <= 7 ? 'MMM dd' : daysDiff <= 30 ? 'MMM dd' : 'MMM yyyy'),
        roi: parseFloat(roi.toFixed(1))
      });
    }

    return data;
  };

  const generateProfitByChannelData = () => {
    const channelData = {};
    
    filteredCampaigns.forEach(campaign => {
      if (!channelData[campaign.channel]) {
        channelData[campaign.channel] = { profit: 0, cost: 0 };
      }
      channelData[campaign.channel].profit += campaign.metrics.profit;
      channelData[campaign.channel].cost += campaign.metrics.cost;
    });

    return Object.entries(channelData).map(([channel, data]) => ({
      channel: channel.replace(' Ads', '').replace(' Marketing', '').replace(' Network', ''),
      profit: data.profit,
      roi: data.cost > 0 ? ((data.profit / data.cost) * 100) : 0
    })).sort((a, b) => b.profit - a.profit);
  };

  // Pagination
  const indexOfLastCampaign = currentPage * campaignsPerPage;
  const indexOfFirstCampaign = indexOfLastCampaign - campaignsPerPage;
  const currentCampaigns = filteredCampaigns.slice(indexOfFirstCampaign, indexOfLastCampaign);
  const totalPages = Math.ceil(filteredCampaigns.length / campaignsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(145deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
          padding: '40px',
          borderRadius: '24px',
          marginBottom: '30px',
          textAlign: 'center',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
        }}>
          <h1 style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '3.2rem',
            fontWeight: '800',
            marginBottom: '12px',
            background: 'linear-gradient(45deg, #ffffff, #e0e7ff)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            ERS Interactive Marketing Manager
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.3rem',
            fontWeight: '300'
          }}>
            Gradient Cards Design - Performance Analytics
          </p>
        </div>

        {/* Filters */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '30px',
          borderRadius: '20px',
          marginBottom: '30px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(148, 163, 184, 0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '24px',
            alignItems: 'end'
          }}>
            {/* Traffic Channel Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                Traffic Channels
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    color: '#374151',
                    fontSize: '15px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s ease',
                    fontWeight: '500'
                  }}
                >
                  <span>
                    {selectedChannels.length === 0 ? 'All Channels' : 
                     selectedChannels.length === 1 ? selectedChannels[0] :
                     `${selectedChannels.length} selected`}
                  </span>
                  {showChannelDropdown ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
                
                {showChannelDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                    border: '2px solid #e2e8f0',
                    borderRadius: '16px',
                    marginTop: '8px',
                    zIndex: 1000,
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
                  }}>
                    {channels.map((channel) => (
                      <label
                        key={channel}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '14px 18px',
                          cursor: 'pointer',
                          color: '#374151',
                          fontSize: '15px',
                          borderBottom: '1px solid rgba(148, 163, 184, 0.1)',
                          transition: 'background-color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                          style={{ marginRight: '12px' }}
                        />
                        {channel}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label style={{
                display: 'block',
                color: '#374151',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                Date Range
              </label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  color: '#374151',
                  fontSize: '15px',
                  fontWeight: '500'
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
                color: '#374151',
                fontSize: '15px',
                fontWeight: '600',
                marginBottom: '10px'
              }}>
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 18px',
                  background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                  border: '2px solid #e2e8f0',
                  borderRadius: '16px',
                  color: '#374151',
                  fontSize: '15px',
                  fontWeight: '500'
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
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={customStartDate}
                    onChange={(e) => setCustomStartDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      color: '#374151',
                      fontSize: '15px',
                      fontWeight: '500'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#374151',
                    fontSize: '15px',
                    fontWeight: '600',
                    marginBottom: '10px'
                  }}>
                    End Date
                  </label>
                  <input
                    type="date"
                    value={customEndDate}
                    onChange={(e) => setCustomEndDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
                      border: '2px solid #e2e8f0',
                      borderRadius: '16px',
                      color: '#374151',
                      fontSize: '15px',
                      fontWeight: '500'
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '30px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
            padding: '28px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.05)',
            transform: 'translateY(0)',
            transition: 'transform 0.2s ease'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <MousePointer size={22} style={{ marginRight: '10px' }} />
              Total Clicks
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800' }}>
              {aggregatedMetrics.totalClicks.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)',
            padding: '28px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.05)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={22} style={{ marginRight: '10px' }} />
              Total Cost
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800' }}>
              ${aggregatedMetrics.totalCost.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)',
            padding: '28px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3), 0 4px 6px -2px rgba(139, 92, 246, 0.05)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Users size={22} style={{ marginRight: '10px' }} />
              Total Sign-ups
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800' }}>
              {aggregatedMetrics.totalSignups.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #fb7185 0%, #e11d48 100%)',
            padding: '28px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: '0 10px 15px -3px rgba(225, 29, 72, 0.3), 0 4px 6px -2px rgba(225, 29, 72, 0.05)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingCart size={22} style={{ marginRight: '10px' }} />
              Total Orders
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800' }}>
              {aggregatedMetrics.totalOrders.toLocaleString()}
            </div>
          </div>

          <div style={{
            background: overallROI >= 0 ? 
              'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' : 
              'linear-gradient(135deg, #f87171 0%, #ef4444 100%)',
            padding: '28px',
            borderRadius: '20px',
            textAlign: 'center',
            boxShadow: overallROI >= 0 ? 
              '0 10px 15px -3px rgba(34, 197, 94, 0.3), 0 4px 6px -2px rgba(34, 197, 94, 0.05)' :
              '0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.05)'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.9)', fontSize: '15px', marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TrendingUp size={22} style={{ marginRight: '10px' }} />
              Overall ROI
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.5rem', fontWeight: '800' }}>
              {overallROI}%
            </div>
          </div>
        </div>

        {/* Charts */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '30px',
          marginBottom: '30px'
        }}>
          {/* ROI Over Time Chart */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 25px 0',
              color: '#1f2937',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                borderRadius: '10px',
                padding: '8px',
                marginRight: '12px'
              }}>
                <Activity size={20} color="#ffffff" />
              </div>
              ROI Over Time
            </h3>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateROIOverTimeData()}>
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#6b7280"
                    fontSize={13}
                    fontWeight="500"
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={13}
                    fontWeight="500"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      color: '#374151',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="#3b82f6" 
                    strokeWidth={4}
                    fill="url(#roiGradient)"
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3, fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit by Channel Chart */}
          <div style={{
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid rgba(148, 163, 184, 0.1)'
          }}>
            <h3 style={{
              margin: '0 0 25px 0',
              color: '#1f2937',
              fontSize: '1.5rem',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                borderRadius: '10px',
                padding: '8px',
                marginRight: '12px'
              }}>
                <BarChart3 size={20} color="#ffffff" />
              </div>
              Profit by Channel
            </h3>
            <div style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateProfitByChannelData()}>
                  <defs>
                    <linearGradient id="profitGradientV2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="channel" 
                    stroke="#6b7280"
                    fontSize={13}
                    fontWeight="500"
                    angle={-35}
                    textAnchor="end"
                    height={90}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={13}
                    fontWeight="500"
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      color: '#374151',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="url(#profitGradientV2)"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaign Details Table */}
        <div style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '20px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          border: '1px solid rgba(148, 163, 184, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '30px',
            borderBottom: '2px solid #f1f5f9',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
          }}>
            <h3 style={{
              margin: '0',
              color: '#1f2937',
              fontSize: '1.6rem',
              fontWeight: '700'
            }}>
              Campaign Details
            </h3>
            <p style={{
              margin: '8px 0 0 0',
              color: '#6b7280',
              fontSize: '15px',
              fontWeight: '500'
            }}>
              Showing {indexOfFirstCampaign + 1}-{Math.min(indexOfLastCampaign, filteredCampaigns.length)} of {filteredCampaigns.length} campaigns
            </p>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse'
            }}>
              <thead>
                <tr style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Campaign</th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Channel</th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>Status</th>
                  <th 
                    onClick={() => handleSort('clicks')}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      color: sortConfig.key === 'clicks' ? '#3b82f6' : '#374151',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Clicks {sortConfig.key === 'clicks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('cost')}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      color: sortConfig.key === 'cost' ? '#3b82f6' : '#374151',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Cost {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>CPC</th>
                  <th 
                    onClick={() => handleSort('signups')}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      color: sortConfig.key === 'signups' ? '#3b82f6' : '#374151',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Sign-ups {sortConfig.key === 'signups' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>CPS</th>
                  <th 
                    onClick={() => handleSort('orders')}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      color: sortConfig.key === 'orders' ? '#3b82f6' : '#374151',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Orders {sortConfig.key === 'orders' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>CPO</th>
                  <th 
                    onClick={() => handleSort('profit')}
                    style={{
                      padding: '18px 24px',
                      textAlign: 'left',
                      color: sortConfig.key === 'profit' ? '#3b82f6' : '#374151',
                      fontSize: '14px',
                      fontWeight: '700',
                      borderBottom: '2px solid #e2e8f0',
                      cursor: 'pointer',
                      transition: 'color 0.2s ease'
                    }}
                  >
                    Profit {sortConfig.key === 'profit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '18px 24px',
                    textAlign: 'left',
                    color: '#374151',
                    fontSize: '14px',
                    fontWeight: '700',
                    borderBottom: '2px solid #e2e8f0'
                  }}>ROI</th>
                </tr>
              </thead>
              <tbody>
                {currentCampaigns.map((campaign, index) => {
                  const roi = calculateROI(campaign.metrics.profit, campaign.metrics.cost);
                  return (
                    <tr key={campaign.id} style={{
                      borderBottom: index < currentCampaigns.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#fafbfc'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}
                    >
                      <td style={{
                        padding: '18px 24px',
                        color: '#1f2937',
                        fontSize: '15px',
                        maxWidth: '220px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <div style={{ fontWeight: '700', marginBottom: '4px' }}>{campaign.name}</div>
                        <div style={{ fontSize: '13px', color: '#6b7280', fontWeight: '500' }}>{campaign.id}</div>
                      </td>
                      <td style={{
                        padding: '18px 24px',
                        color: '#374151',
                        fontSize: '15px',
                        fontWeight: '600'
                      }}>{campaign.channel}</td>
                      <td style={{ padding: '18px 24px' }}>
                        <span style={{
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: '13px',
                          fontWeight: '700',
                          background: campaign.status === 'Live' ? 'linear-gradient(135deg, #d1fae5, #a7f3d0)' : 
                                     campaign.status === 'Paused' ? 'linear-gradient(135deg, #fef3c7, #fde68a)' : 
                                     'linear-gradient(135deg, #fecaca, #fca5a5)',
                          color: campaign.status === 'Live' ? '#065f46' : 
                                campaign.status === 'Paused' ? '#92400e' : '#991b1b',
                        }}>
                          {campaign.status}
                        </span>
                      </td>
                      <td style={{ padding: '18px 24px', color: '#374151', fontSize: '15px', fontWeight: '600' }}>
                        {campaign.metrics.clicks.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#374151', fontSize: '15px', fontWeight: '600' }}>
                        ${campaign.metrics.cost.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                        ${calculateCPC(campaign.metrics.cost, campaign.metrics.clicks)}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#374151', fontSize: '15px', fontWeight: '600' }}>
                        {campaign.metrics.signups.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                        ${calculateCPS(campaign.metrics.cost, campaign.metrics.signups)}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#374151', fontSize: '15px', fontWeight: '600' }}>
                        {campaign.metrics.orders.toLocaleString()}
                      </td>
                      <td style={{ padding: '18px 24px', color: '#6b7280', fontSize: '15px', fontWeight: '500' }}>
                        ${calculateCPO(campaign.metrics.cost, campaign.metrics.orders)}
                      </td>
                      <td style={{ 
                        padding: '18px 24px', 
                        color: campaign.metrics.profit >= 0 ? '#059669' : '#dc2626', 
                        fontSize: '15px',
                        fontWeight: '700'
                      }}>
                        ${campaign.metrics.profit.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '18px 24px', 
                        color: roi >= 0 ? '#059669' : '#dc2626', 
                        fontSize: '15px',
                        fontWeight: '700'
                      }}>
                        {roi}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{
              padding: '24px 30px',
              borderTop: '2px solid #f1f5f9',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '10px 20px',
                  background: currentPage === 1 ? 
                    'linear-gradient(135deg, #f1f5f9, #e2e8f0)' : 
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  color: currentPage === 1 ? '#9ca3af' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
                }}
              >
                Previous
              </button>

              <div style={{ display: 'flex', gap: '12px' }}>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => paginate(pageNum)}
                      style={{
                        padding: '10px 16px',
                        background: currentPage === pageNum ? 
                          'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 
                          'linear-gradient(135deg, #f1f5f9, #e2e8f0)',
                        border: '2px solid #e2e8f0',
                        borderRadius: '12px',
                        color: currentPage === pageNum ? '#ffffff' : '#374151',
                        cursor: 'pointer',
                        fontSize: '15px',
                        fontWeight: '600',
                        transition: 'all 0.2s ease'
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
                  padding: '10px 20px',
                  background: currentPage === totalPages ? 
                    'linear-gradient(135deg, #f1f5f9, #e2e8f0)' : 
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: '2px solid #e2e8f0',
                  borderRadius: '12px',
                  color: currentPage === totalPages ? '#9ca3af' : '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '15px',
                  fontWeight: '600',
                  transition: 'all 0.2s ease'
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

export default MarketingManagerV2;