import React, { useState, useEffect } from 'react';
import { 
  Filter, Calendar, DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, ChevronDown, ChevronUp, Activity, BarChart3
} from 'lucide-react';
import { format, subDays, isWithinInterval, parseISO } from 'date-fns';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MarketingManagerV1 = () => {
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

  // All calculation functions (same as original)
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

  // All filtering and data processing functions (same as original)
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

  // Chart data generation (same as original)
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

  // Glass Morphism Styles
  const glassStyle = {
    background: 'rgba(255, 255, 255, 0.25)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
    borderRadius: '20px',
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };

  const cardStyle = {
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '16px',
    boxShadow: '0 4px 20px 0 rgba(31, 38, 135, 0.2)'
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          ...glassStyle,
          padding: '30px',
          marginBottom: '30px',
          textAlign: 'center'
        }}>
          <h1 style={{
            margin: 0,
            color: '#ffffff',
            fontSize: '3rem',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
            marginBottom: '10px'
          }}>
            ERS Interactive Marketing Manager
          </h1>
          <p style={{
            margin: 0,
            color: 'rgba(255,255,255,0.9)',
            fontSize: '1.2rem',
            fontWeight: '300'
          }}>
            Glass Morphism Design - Campaign Performance Dashboard
          </p>
        </div>

        {/* Filters */}
        <div style={{
          ...glassStyle,
          padding: '25px',
          marginBottom: '30px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '20px',
            alignItems: 'end'
          }}>
            {/* Traffic Channel Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
                marginBottom: '8px'
              }}>
                Traffic Channels
              </label>
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowChannelDropdown(!showChannelDropdown)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <span>
                    {selectedChannels.length === 0 ? 'All Channels' : 
                     selectedChannels.length === 1 ? selectedChannels[0] :
                     `${selectedChannels.length} selected`}
                  </span>
                  {showChannelDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                
                {showChannelDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    borderRadius: '12px',
                    marginTop: '8px',
                    zIndex: 1000,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
                  }}>
                    {channels.map((channel) => (
                      <label
                        key={channel}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          color: '#333',
                          fontSize: '14px',
                          borderBottom: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedChannels.includes(channel)}
                          onChange={() => handleChannelToggle(channel)}
                          style={{ marginRight: '10px' }}
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
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
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
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  backdropFilter: 'blur(5px)'
                }}
              >
                {dateRangeOptions.map(option => (
                  <option key={option} value={option} style={{ color: '#333' }}>{option}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label style={{
                display: 'block',
                color: '#ffffff',
                fontSize: '14px',
                fontWeight: '600',
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
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  backdropFilter: 'blur(5px)'
                }}
              >
                <option value="All" style={{ color: '#333' }}>All</option>
                <option value="Live" style={{ color: '#333' }}>Live</option>
                <option value="Paused" style={{ color: '#333' }}>Paused</option>
                <option value="Ended" style={{ color: '#333' }}>Ended</option>
              </select>
            </div>

            {/* Custom Date Inputs */}
            {dateRange === 'Custom' && (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
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
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      backdropFilter: 'blur(5px)'
                    }}
                  />
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
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
                      background: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '14px',
                      backdropFilter: 'blur(5px)'
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
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <div style={{
            ...cardStyle,
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
              <MousePointer size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Total Clicks
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
              {aggregatedMetrics.totalClicks.toLocaleString()}
            </div>
          </div>

          <div style={{
            ...cardStyle,
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
              <DollarSign size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Total Cost
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
              ${aggregatedMetrics.totalCost.toLocaleString()}
            </div>
          </div>

          <div style={{
            ...cardStyle,
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
              <Users size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Total Sign-ups
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
              {aggregatedMetrics.totalSignups.toLocaleString()}
            </div>
          </div>

          <div style={{
            ...cardStyle,
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
              <ShoppingCart size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Total Orders
            </div>
            <div style={{ color: '#ffffff', fontSize: '2.2rem', fontWeight: '700' }}>
              {aggregatedMetrics.totalOrders.toLocaleString()}
            </div>
          </div>

          <div style={{
            ...cardStyle,
            padding: '25px',
            textAlign: 'center'
          }}>
            <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '14px', marginBottom: '8px' }}>
              <TrendingUp size={20} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
              Overall ROI
            </div>
            <div style={{ color: overallROI >= 0 ? '#4ade80' : '#f87171', fontSize: '2.2rem', fontWeight: '700' }}>
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
            ...glassStyle,
            padding: '25px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              <Activity size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              ROI Over Time
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={generateROIOverTimeData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis 
                    dataKey="date" 
                    stroke="rgba(255,255,255,0.8)"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.8)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#333'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="roi" 
                    stroke="#4ade80" 
                    strokeWidth={3}
                    dot={{ fill: '#4ade80', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#ffffff', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Profit by Channel Chart */}
          <div style={{
            ...glassStyle,
            padding: '25px'
          }}>
            <h3 style={{
              margin: '0 0 20px 0',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              <BarChart3 size={20} style={{ marginRight: '10px', verticalAlign: 'middle' }} />
              Profit by Channel
            </h3>
            <div style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={generateProfitByChannelData()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis 
                    dataKey="channel" 
                    stroke="rgba(255,255,255,0.8)"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.8)"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(255,255,255,0.95)',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#333'
                    }}
                  />
                  <Bar 
                    dataKey="profit" 
                    fill="url(#profitGradient)"
                    radius={[4, 4, 0, 0]}
                  />
                  <defs>
                    <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4ade80" />
                      <stop offset="100%" stopColor="#16a34a" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Campaign Details Table */}
        <div style={{
          ...glassStyle,
          padding: '0',
          overflow: 'hidden'
        }}>
          <div style={{
            padding: '25px',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <h3 style={{
              margin: '0',
              color: '#ffffff',
              fontSize: '1.4rem',
              fontWeight: '600'
            }}>
              Campaign Details
            </h3>
            <p style={{
              margin: '5px 0 0 0',
              color: 'rgba(255,255,255,0.8)',
              fontSize: '14px'
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
                <tr style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>Campaign</th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>Channel</th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>Status</th>
                  <th 
                    onClick={() => handleSort('clicks')}
                    style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Clicks {sortConfig.key === 'clicks' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th 
                    onClick={() => handleSort('cost')}
                    style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Cost {sortConfig.key === 'cost' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>CPC</th>
                  <th 
                    onClick={() => handleSort('signups')}
                    style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Sign-ups {sortConfig.key === 'signups' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>CPS</th>
                  <th 
                    onClick={() => handleSort('orders')}
                    style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Orders {sortConfig.key === 'orders' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>CPO</th>
                  <th 
                    onClick={() => handleSort('profit')}
                    style={{
                      padding: '15px 20px',
                      textAlign: 'left',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '600',
                      borderBottom: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer'
                    }}
                  >
                    Profit {sortConfig.key === 'profit' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                  </th>
                  <th style={{
                    padding: '15px 20px',
                    textAlign: 'left',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '600',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                  }}>ROI</th>
                </tr>
              </thead>
              <tbody>
                {currentCampaigns.map((campaign, index) => {
                  const roi = calculateROI(campaign.metrics.profit, campaign.metrics.cost);
                  return (
                    <tr key={campaign.id} style={{
                      borderBottom: index < currentCampaigns.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'
                    }}>
                      <td style={{
                        padding: '15px 20px',
                        color: '#ffffff',
                        fontSize: '14px',
                        maxWidth: '200px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        <div style={{ fontWeight: '600' }}>{campaign.name}</div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>{campaign.id}</div>
                      </td>
                      <td style={{
                        padding: '15px 20px',
                        color: '#ffffff',
                        fontSize: '14px'
                      }}>{campaign.channel}</td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600',
                          backgroundColor: campaign.status === 'Live' ? 'rgba(34, 197, 94, 0.2)' : 
                                         campaign.status === 'Paused' ? 'rgba(251, 191, 36, 0.2)' : 
                                         'rgba(239, 68, 68, 0.2)',
                          color: campaign.status === 'Live' ? '#4ade80' : 
                                campaign.status === 'Paused' ? '#fbbf24' : '#f87171',
                          border: `1px solid ${campaign.status === 'Live' ? 'rgba(34, 197, 94, 0.3)' : 
                                              campaign.status === 'Paused' ? 'rgba(251, 191, 36, 0.3)' : 
                                              'rgba(239, 68, 68, 0.3)'}`
                        }}>
                          {campaign.status}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        {campaign.metrics.clicks.toLocaleString()}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        ${campaign.metrics.cost.toLocaleString()}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        ${calculateCPC(campaign.metrics.cost, campaign.metrics.clicks)}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        {campaign.metrics.signups.toLocaleString()}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        ${calculateCPS(campaign.metrics.cost, campaign.metrics.signups)}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        {campaign.metrics.orders.toLocaleString()}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#ffffff', fontSize: '14px' }}>
                        ${calculateCPO(campaign.metrics.cost, campaign.metrics.orders)}
                      </td>
                      <td style={{ 
                        padding: '15px 20px', 
                        color: campaign.metrics.profit >= 0 ? '#4ade80' : '#f87171', 
                        fontSize: '14px',
                        fontWeight: '600'
                      }}>
                        ${campaign.metrics.profit.toLocaleString()}
                      </td>
                      <td style={{ 
                        padding: '15px 20px', 
                        color: roi >= 0 ? '#4ade80' : '#f87171', 
                        fontSize: '14px',
                        fontWeight: '600'
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
              padding: '20px 25px',
              borderTop: '1px solid rgba(255,255,255,0.2)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  background: currentPage === 1 ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: currentPage === 1 ? 'rgba(255,255,255,0.5)' : '#ffffff',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
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
                        background: currentPage === pageNum ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.1)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '8px',
                        color: '#ffffff',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: currentPage === pageNum ? '600' : '400'
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
                  background: currentPage === totalPages ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.2)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  borderRadius: '8px',
                  color: currentPage === totalPages ? 'rgba(255,255,255,0.5)' : '#ffffff',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px'
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

export default MarketingManagerV1;