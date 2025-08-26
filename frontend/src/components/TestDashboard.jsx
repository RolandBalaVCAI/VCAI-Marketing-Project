import React, { useEffect, useMemo } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useFiltersStore } from '../stores/filtersStore';

const TestDashboard = () => {
  const { campaigns, isLoading, error, fetchCampaigns } = useCampaignsStore();
  const { searchTerm, statusFilter } = useFiltersStore();
  
  useEffect(() => {
    if (campaigns.length === 0 && !isLoading) {
      console.log('🔄 Test dashboard loading campaigns...');
      fetchCampaigns().catch(err => console.error('Test dashboard error:', err));
    }
  }, []);
  
  // Simple filtering
  const filteredCampaigns = useMemo(() => {
    return campaigns.filter(campaign => {
      const matchesSearch = !searchTerm || 
        campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [campaigns, searchTerm, statusFilter]);
  
  // Simple totals
  const totalRevenue = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.revenue || 0), 0);
  const totalCost = filteredCampaigns.reduce((sum, c) => sum + (c.metrics?.cost || 0), 0);
  
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
          📊 Chart placeholder - Revenue: ${totalRevenue.toLocaleString()} | Cost: ${totalCost.toLocaleString()}
        </div>
      </div>
      
      {/* Campaign List */}
      {filteredCampaigns.length > 0 && (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          overflow: 'hidden'
        }}>
          <h3 style={{ margin: 0, padding: '20px', borderBottom: '1px solid #e2e8f0', color: '#1f2937' }}>
            Recent Campaigns ({filteredCampaigns.length})
          </h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {filteredCampaigns.slice(0, 10).map(campaign => (
              <div key={campaign.id} style={{ 
                padding: '15px 20px', 
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <strong style={{ color: '#1f2937' }}>{campaign.name}</strong>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                    {campaign.vendor} • {campaign.status}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#10b981', fontWeight: 'bold' }}>
                    ${campaign.metrics?.revenue?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    Cost: ${campaign.metrics?.cost?.toLocaleString() || '0'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestDashboard;