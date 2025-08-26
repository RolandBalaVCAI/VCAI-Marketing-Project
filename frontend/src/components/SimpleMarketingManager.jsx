import React, { useEffect, useMemo, useState } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';
import { useUIStore } from '../stores/uiStore';
import { getDateRangeForFilter, isCampaignInDateRange } from '../utils/dateHelpers';
import CampaignDetail from './CampaignDetail';

const SimpleMarketingManager = () => {
  const { campaigns, isLoading, error, fetchCampaigns, selectedCampaign, selectCampaign, addCampaign } = useCampaignsStore();
  const { 
    searchTerm, statusFilter, setSearchTerm, setStatusFilter,
    dateRange, setDateRange, customStartDate, setCustomStartDate, customEndDate, setCustomEndDate
  } = useFiltersStore();
  const { currentView, setCurrentView } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  useEffect(() => {
    if (campaigns.length === 0 && !isLoading) {
      console.log('🔄 Loading campaigns...');
      fetchCampaigns().catch(err => console.error('Dashboard error:', err));
    }
  }, []);
  
  // Advanced filtering with date range
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !searchTerm || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.vendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
      
      // Date range filtering
      const { start: startDate, end: endDate } = getDateRangeForFilter(dateRange, customStartDate, customEndDate);
      const matchesDateRange = isCampaignInDateRange(campaign, startDate, endDate);
      
      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [campaigns, searchTerm, statusFilter, dateRange, customStartDate, customEndDate]);
  
  // Simple totals
  const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0);
  const totalROAS = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 10000) / 100 : 0;

  // Create campaign handler
  const handleCreateCampaign = (formData) => {
    const newCampaign = {
      id: `CMP-${Date.now()}`,
      name: formData.name,
      vendor: formData.vendor || 'Test Vendor',
      status: 'Draft',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: 'Marketing Manager',
      adPlacementDomain: formData.vendor || 'example.com',
      device: 'Both',
      targeting: 'Global',
      repContactInfo: 'contact@example.com',
      metrics: {
        rawClicks: 0,
        uniqueClicks: 0,
        cost: 0,
        rawReg: 0,
        confirmReg: 0,
        sales: 0,
        orderValue: 0,
        revenue: 0,
        ltrev: 0
      },
      notes: [],
      documents: [],
      visualMedia: [],
      changeHistory: [{
        id: `hist_${Date.now()}`,
        action: 'Campaign created',
        user: 'Marketing Manager',
        timestamp: new Date().toISOString()
      }],
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString()
    };
    
    addCampaign(newCampaign);
    setShowCreateForm(false);
  };
  
  // Handle navigation to campaign detail view
  if (currentView === 'detail' && selectedCampaign) {
    return (
      <CampaignDetail 
        campaignId={selectedCampaign.id}
        onBack={() => setCurrentView('dashboard')} 
      />
    );
  }
  
  if (isLoading) {
    return <div style={{ padding: '20px' }}>Loading campaigns...</div>;
  }
  
  if (error) {
    return <div style={{ padding: '20px', color: 'red' }}>Error: {error.message || error}</div>;
  }
  
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Marketing Dashboard</h1>
      <p>Campaign Management System</p>
      
      {/* KPI Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Campaigns</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
            {filteredCampaigns.length}
          </p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#10b981' }}>
            ${totalRevenue.toLocaleString()}
          </p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Cost</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#dc2626' }}>
            ${totalCost.toLocaleString()}
          </p>
        </div>
        <div style={{
          padding: '20px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Overall ROAS</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2563eb' }}>
            {totalROAS}%
          </p>
        </div>
      </div>

      {/* Simple Chart Placeholder */}
      <div style={{
        marginBottom: '30px',
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        padding: '20px'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Revenue & Cost Overview</h3>
        <div style={{ 
          height: '200px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f8fafc',
          borderRadius: '6px',
          color: '#6b7280'
        }}>
          📊 Chart - Revenue: ${totalRevenue.toLocaleString()} | Cost: ${totalCost.toLocaleString()} | ROAS: {totalROAS}%
        </div>
      </div>
      
      {/* Enhanced Search and Filter Controls */}
      <div style={{ 
        display: 'flex', 
        gap: '15px', 
        marginBottom: '20px',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search campaigns or vendors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              minWidth: '220px',
              color: '#1f2937'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#1f2937'
            }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Paused">Paused</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            style={{
              padding: '10px 15px',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              fontSize: '14px',
              backgroundColor: 'white',
              color: '#1f2937'
            }}
          >
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 14 Days">Last 14 Days</option>
            <option value="Last 90 Days">Last 90 Days</option>
            <option value="Current Day">Today</option>
            <option value="Yesterday">Yesterday</option>
            <option value="Custom">Custom Range</option>
          </select>
          {dateRange === 'Custom' && (
            <>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                style={{
                  padding: '10px 15px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1f2937'
                }}
              />
            </>
          )}
          {(searchTerm || statusFilter !== 'All' || dateRange !== 'Last 30 Days') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('All');
                setDateRange('Last 30 Days');
                setCustomStartDate('');
                setCustomEndDate('');
              }}
              style={{
                padding: '10px 15px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer'
              }}
            >
              Reset Filters
            </button>
          )}
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
        >
          + Create Campaign
        </button>
      </div>

      {/* Campaign List */}
      {filteredCampaigns.length > 0 ? (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: 0, padding: '20px', borderBottom: '1px solid #e2e8f0', color: '#1f2937' }}>
            Recent Campaigns ({filteredCampaigns.length})
          </h3>
          
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: '10px',
            padding: '15px 20px',
            backgroundColor: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#374151',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            <div>Campaign Name</div>
            <div>Vendor</div>
            <div>Status</div>
            <div>Cost</div>
            <div>Revenue</div>
            <div>ROAS</div>
            <div>Sales</div>
            <div>Start Date</div>
          </div>
          
          {/* Table Body */}
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredCampaigns.slice(0, 10).map(campaign => {
              const cost = campaign.metrics?.cost || 0;
              const revenue = campaign.metrics?.revenue || 0;
              const roas = cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';
              
              return (
                <div 
                  key={campaign.id} 
                  onClick={() => {
                    selectCampaign(campaign);
                    setCurrentView('detail');
                  }}
                  style={{ 
                    display: 'grid',
                    gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
                    gap: '10px',
                    padding: '15px 20px', 
                    borderBottom: '1px solid #f1f5f9',
                    alignItems: 'center',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    fontSize: '14px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '2px' }}>
                      {campaign.name}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {campaign.id}
                    </div>
                  </div>
                  <div style={{ color: '#1f2937' }}>{campaign.vendor}</div>
                  <div>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      backgroundColor: 
                        campaign.status === 'Active' ? '#dcfce7' :
                        campaign.status === 'Paused' ? '#fef3c7' :
                        campaign.status === 'Completed' ? '#dbeafe' : '#f3f4f6',
                      color:
                        campaign.status === 'Active' ? '#166534' :
                        campaign.status === 'Paused' ? '#92400e' :
                        campaign.status === 'Completed' ? '#1e40af' : '#6b7280'
                    }}>
                      {campaign.status}
                    </span>
                  </div>
                  <div style={{ color: '#dc2626', fontWeight: 'bold' }}>
                    ${cost.toLocaleString()}
                  </div>
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${revenue.toLocaleString()}
                  </div>
                  <div style={{ 
                    color: parseFloat(roas) >= 100 ? '#10b981' : '#6b7280',
                    fontWeight: 'bold' 
                  }}>
                    {roas}%
                  </div>
                  <div style={{ color: '#1f2937' }}>
                    {campaign.metrics?.sales?.toLocaleString() || '0'}
                  </div>
                  <div style={{ color: '#6b7280', fontSize: '13px' }}>
                    {new Date(campaign.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: '2-digit'
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280'
        }}>
          <h3 style={{ marginBottom: '10px', color: '#9ca3af' }}>No campaigns found</h3>
          <p>
            {searchTerm || statusFilter !== 'All' 
              ? 'Try adjusting your search or filter criteria.' 
              : 'No campaigns available in the system.'}
          </p>
        </div>
      )}
      
      {/* Create Campaign Modal */}
      {showCreateForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '30px',
            width: '400px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 20px 0', color: '#1f2937' }}>Create New Campaign</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              handleCreateCampaign({
                name: formData.get('name'),
                vendor: formData.get('vendor')
              });
            }}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                  Campaign Name *
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}
                  placeholder="Enter campaign name..."
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', color: '#374151', fontSize: '14px' }}>
                  Vendor/Domain
                </label>
                <input
                  type="text"
                  name="vendor"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#1f2937'
                  }}
                  placeholder="Enter vendor or domain..."
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    border: '1px solid #e2e8f0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#6b7280',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#2563eb',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Create Campaign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleMarketingManager;