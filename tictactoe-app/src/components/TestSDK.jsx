import React from 'react'
import { useCampaigns, useCreateCampaign } from '../hooks/generated/useCampaigns'
import { campaignUtils } from '../generated/enhanced-types'

const TestSDK = () => {
  const { data: campaignsResponse, isLoading, error, refetch } = useCampaigns({
    page: 1,
    limit: 5
  })
  
  const createCampaignMutation = useCreateCampaign({
    onSuccess: () => {
      refetch() // Refresh the list after creating
    }
  })

  const handleCreateTest = async () => {
    try {
      await createCampaignMutation.mutate({
        name: 'Test SDK Campaign',
        vendor: 'SDK Test Vendor',
        status: 'Paused',
        startDate: '2024-01-01',
        endDate: '2024-02-01',
        device: 'Both',
        targeting: 'Global'
      })
    } catch (err) {
      console.error('Failed to create campaign:', err)
    }
  }

  if (isLoading) {
    return <div>Loading campaigns...</div>
  }

  if (error) {
    return (
      <div>
        <div>Error loading campaigns: {error.message}</div>
        <button onClick={refetch}>Retry</button>
      </div>
    )
  }

  const campaigns = campaignsResponse?.campaigns || []

  return (
    <div style={{ padding: '20px' }}>
      <h2>SDK Integration Test</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={handleCreateTest}
          disabled={createCampaignMutation.isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: createCampaignMutation.isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {createCampaignMutation.isLoading ? 'Creating...' : 'Create Test Campaign'}
        </button>
      </div>

      <h3>Campaigns ({campaigns.length})</h3>
      
      {campaigns.length === 0 ? (
        <p>No campaigns found</p>
      ) : (
        <div>
          {campaigns.map(campaign => {
            // Use utility functions from enhanced types
            const duration = campaignUtils.getDuration(campaign)
            const isActive = campaignUtils.isActive(campaign)
            const roi = campaignUtils.calculateROI(campaign)
            const performanceRating = campaignUtils.getPerformanceRating(campaign)
            
            return (
              <div 
                key={campaign.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  padding: '15px',
                  marginBottom: '10px',
                  backgroundColor: isActive ? '#f0f9ff' : '#f9f9f9'
                }}
              >
                <h4>{campaign.name}</h4>
                <p><strong>Vendor:</strong> {campaign.vendor}</p>
                <p><strong>Status:</strong> {campaign.status} {isActive && '(Active)'}</p>
                <p><strong>Duration:</strong> {duration} days</p>
                <p><strong>ROI:</strong> {roi}%</p>
                <p><strong>Performance:</strong> {performanceRating}</p>
                {campaign.metrics && (
                  <div>
                    <strong>Metrics:</strong>
                    <ul>
                      <li>Cost: ${campaign.metrics.cost}</li>
                      <li>Revenue: ${campaign.metrics.revenue}</li>
                      <li>Clicks: {campaign.metrics.uniqueClicks}</li>
                      <li>Sales: {campaign.metrics.sales}</li>
                    </ul>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
      
      <div style={{ marginTop: '20px' }}>
        <button onClick={refetch} style={{
          padding: '8px 16px',
          backgroundColor: '#059669',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Refresh Campaigns
        </button>
      </div>
    </div>
  )
}

export default TestSDK