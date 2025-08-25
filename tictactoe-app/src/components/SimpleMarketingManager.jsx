import React, { useState } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';
import { useUIStore } from '../stores/uiStore';

const SimpleMarketingManager = () => {
  const { campaigns, isLoading, error } = useCampaignsStore();
  const { searchTerm, setSearchTerm, statusFilter, setStatusFilter } = useFiltersStore();
  const { currentView, setCurrentView, selectedCampaign, setSelectedCampaign } = useUIStore();
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Simple campaign creation
  const { addCampaign } = useCampaignsStore();
  
  const handleCreateCampaign = (formData) => {
    const newCampaign = {
      id: `CMP-${Date.now()}`,
      name: formData.name,
      vendor: formData.vendor || 'Test Vendor',
      status: 'Paused',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      manager: 'Marketing Manager',
      adPlacementDomain: 'example.com',
      device: 'Both',
      targeting: 'Global',
      repContactInfo: 'contact@example.com',
      metrics: {
        rawClicks: Math.floor(Math.random() * 1000) + 100,
        uniqueClicks: Math.floor(Math.random() * 800) + 80,
        cost: Math.floor(Math.random() * 2000) + 500,
        rawReg: Math.floor(Math.random() * 100) + 10,
        confirmReg: Math.floor(Math.random() * 80) + 8,
        sales: Math.floor(Math.random() * 20) + 2,
        orderValue: Math.floor(Math.random() * 2000) + 200,
        revenue: Math.floor(Math.random() * 1500) + 300,
        ltrev: Math.floor(Math.random() * 3000) + 500
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

  if (currentView === 'detail' && selectedCampaign) {
    return <CampaignDetailView campaign={selectedCampaign} onBack={() => setCurrentView('dashboard')} />;
  }

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading campaigns...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
        <h2>Error loading campaigns</h2>
        <p>{error}</p>
      </div>
    );
  }

  // Filter campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = !searchTerm || 
      campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      campaign.vendor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + c.metrics.cost, 0);
  const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + c.metrics.revenue, 0);
  const totalROAS = totalCost > 0 ? Math.round((totalRevenue / totalCost) * 10000) / 100 : 0;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ color: '#2563eb', marginBottom: '10px' }}>Marketing Dashboard</h1>
        <p>Campaign Management System</p>
      </div>

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
          <h3 style={{ margin: '0 0 10px 0', color: '#475569' }}>Total Revenue</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#059669' }}>
            ${totalRevenue.toLocaleString()}
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

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search campaigns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              minWidth: '200px'
            }}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '8px 12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px'
            }}
          >
            <option value="All">All Status</option>
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
          </select>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500'
          }}
        >
          Add New Campaign
        </button>
      </div>

      {/* Create Campaign Form */}
      {showCreateForm && (
        <CreateCampaignForm 
          onSubmit={handleCreateCampaign}
          onCancel={() => setShowCreateForm(false)}
        />
      )}

      {/* Campaigns Table */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        overflow: 'hidden'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
          gap: '10px',
          padding: '15px',
          backgroundColor: '#f8fafc',
          fontWeight: 'bold',
          borderBottom: '1px solid #e2e8f0'
        }}>
          <div>Campaign</div>
          <div>Status</div>
          <div>Cost</div>
          <div>Revenue</div>
          <div>ROAS</div>
          <div>Clicks</div>
          <div>Sales</div>
        </div>
        
        {filteredCampaigns.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            <p>No campaigns found</p>
          </div>
        ) : (
          filteredCampaigns.map(campaign => {
            const roas = campaign.metrics.cost > 0 
              ? Math.round((campaign.metrics.revenue / campaign.metrics.cost) * 10000) / 100 
              : 0;
            
            return (
              <div
                key={campaign.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr',
                  gap: '10px',
                  padding: '15px',
                  borderBottom: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                onClick={() => {
                  setSelectedCampaign(campaign);
                  setCurrentView('detail');
                }}
              >
                <div>
                  <div style={{ fontWeight: '500', marginBottom: '4px' }}>{campaign.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{campaign.vendor}</div>
                </div>
                <div>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: campaign.status === 'Live' ? '#dcfce7' : 
                                   campaign.status === 'Paused' ? '#fef3c7' : '#fee2e2',
                    color: campaign.status === 'Live' ? '#166534' : 
                           campaign.status === 'Paused' ? '#92400e' : '#991b1b'
                  }}>
                    {campaign.status}
                  </span>
                </div>
                <div>${campaign.metrics.cost.toLocaleString()}</div>
                <div>${campaign.metrics.revenue.toLocaleString()}</div>
                <div style={{ color: roas >= 100 ? '#059669' : '#dc2626' }}>{roas}%</div>
                <div>{campaign.metrics.uniqueClicks.toLocaleString()}</div>
                <div>{campaign.metrics.sales.toLocaleString()}</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Simple Campaign Detail View
const CampaignDetailView = ({ campaign, onBack }) => {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={onBack}
          style={{
            padding: '8px 16px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            marginBottom: '20px'
          }}
        >
          ← Back to Dashboard
        </button>
        <h1 style={{ color: '#2563eb' }}>{campaign.name}</h1>
        <p style={{ color: '#6b7280' }}>Campaign Details</p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px'
      }}>
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0 }}>Campaign Info</h3>
          <p><strong>Vendor:</strong> {campaign.vendor}</p>
          <p><strong>Status:</strong> {campaign.status}</p>
          <p><strong>Start Date:</strong> {campaign.startDate}</p>
          <p><strong>End Date:</strong> {campaign.endDate}</p>
          <p><strong>Manager:</strong> {campaign.manager}</p>
          <p><strong>Device:</strong> {campaign.device}</p>
          <p><strong>Targeting:</strong> {campaign.targeting}</p>
        </div>

        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{ marginTop: 0 }}>Performance Metrics</h3>
          <p><strong>Cost:</strong> ${campaign.metrics.cost.toLocaleString()}</p>
          <p><strong>Revenue:</strong> ${campaign.metrics.revenue.toLocaleString()}</p>
          <p><strong>Raw Clicks:</strong> {campaign.metrics.rawClicks.toLocaleString()}</p>
          <p><strong>Unique Clicks:</strong> {campaign.metrics.uniqueClicks.toLocaleString()}</p>
          <p><strong>Registrations:</strong> {campaign.metrics.confirmReg.toLocaleString()}</p>
          <p><strong>Sales:</strong> {campaign.metrics.sales.toLocaleString()}</p>
          <p><strong>ROAS:</strong> {Math.round((campaign.metrics.revenue / campaign.metrics.cost) * 10000) / 100}%</p>
        </div>
      </div>
    </div>
  );
};

// Simple Create Campaign Form
const CreateCampaignForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    vendor: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.name.trim()) {
      onSubmit(formData);
      setFormData({ name: '', vendor: '' });
    }
  };

  return (
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
        padding: '30px',
        borderRadius: '8px',
        width: '400px',
        maxWidth: '90vw'
      }}>
        <h2 style={{ marginTop: 0 }}>Create New Campaign</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Campaign Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
              required
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Vendor
            </label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '10px 20px',
                backgroundColor: '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
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
                cursor: 'pointer'
              }}
            >
              Create Campaign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SimpleMarketingManager;