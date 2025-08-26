import React, { useState, useEffect } from 'react';
import { getMockDataStatus, resetMockData } from '../utils/resetMockData';
import apiClient from '../api/client';

const DebugPanel = () => {
  const [status, setStatus] = useState(null);
  const [apiTest, setApiTest] = useState(null);
  const [mockMode, setMockMode] = useState(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    // Check mock data status
    const mockStatus = getMockDataStatus();
    setStatus(mockStatus);

    // Test API
    try {
      const campaigns = await apiClient.getCampaigns({ limit: 5 });
      console.log('API Test Response:', campaigns);
      setApiTest({
        success: true,
        count: campaigns?.data?.length || 0,
        hasData: !!(campaigns?.data && campaigns.data.length > 0),
        response: campaigns
      });
    } catch (error) {
      console.error('API Test Failed:', error);
      setApiTest({
        success: false,
        error: error.message
      });
    }

    // Check if mock mode
    const useMock = await apiClient.shouldUseMock();
    setMockMode(useMock);
  };

  const handleReset = () => {
    resetMockData();
    checkStatus();
    window.location.reload();
  };

  const handleClearStorage = () => {
    localStorage.removeItem('marketing_dashboard_campaigns');
    sessionStorage.clear();
    checkStatus();
    window.location.reload();
  };

  const handleForceGenerate = async () => {
    // Clear storage first
    localStorage.removeItem('marketing_dashboard_campaigns');
    
    // Force generate new data
    const campaigns = resetMockData();
    console.log('🔄 Force generated campaigns:', campaigns.length);
    
    // Recheck status
    await checkStatus();
    
    // Reload page to refresh components
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: 10, 
      right: 10, 
      background: '#ffffff', 
      border: '2px solid #0066cc', 
      padding: '15px', 
      borderRadius: '5px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      maxWidth: '300px',
      zIndex: 9999,
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.4',
      color: '#000000' // Force black text
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#0066cc', fontSize: '16px' }}>🐛 Debug Panel</h3>
      
      <div style={{ marginBottom: '10px', color: '#000000' }}>
        <strong style={{ color: '#000000' }}>Mock Data Status:</strong>
        <div style={{ color: '#000000' }}>Exists: {status?.exists ? '✅' : '❌'}</div>
        <div style={{ color: '#000000' }}>Count: {status?.count || 0}</div>
        {status?.error && <div style={{ color: '#ff0000' }}>Error: {status.error}</div>}
      </div>

      <div style={{ marginBottom: '10px', color: '#000000' }}>
        <strong style={{ color: '#000000' }}>API Test:</strong>
        {apiTest ? (
          <div>
            <div style={{ color: '#000000' }}>Success: {apiTest.success ? '✅' : '❌'}</div>
            <div style={{ color: '#000000' }}>Campaign Count: {apiTest.count || 0}</div>
            <div style={{ color: '#000000' }}>Has Data: {apiTest.hasData ? '✅' : '❌'}</div>
            {apiTest.error && <div style={{ color: '#ff0000' }}>Error: {apiTest.error}</div>}
          </div>
        ) : (
          <div style={{ color: '#000000' }}>Testing...</div>
        )}
      </div>

      <div style={{ marginBottom: '10px', color: '#000000' }}>
        <strong style={{ color: '#000000' }}>Mode:</strong>
        <div style={{ color: '#000000' }}>{mockMode === null ? 'Checking...' : mockMode ? '🎭 Mock Mode' : '🏭 Backend Mode'}</div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <button 
          onClick={handleForceGenerate}
          style={{ 
            padding: '8px 12px', 
            background: '#ff6b35', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 'bold'
          }}
        >
          🚀 FORCE GENERATE CAMPAIGNS
        </button>
        <button 
          onClick={handleReset}
          style={{ 
            padding: '6px 10px', 
            background: '#0066cc', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🔄 Reset Mock Data
        </button>
        <button 
          onClick={handleClearStorage}
          style={{ 
            padding: '6px 10px', 
            background: '#dc3545', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          🗑️ Clear All Storage
        </button>
        <button 
          onClick={checkStatus}
          style={{ 
            padding: '6px 10px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '13px'
          }}
        >
          ✅ Recheck Status
        </button>
      </div>

      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        Open browser console (F12) for detailed logs
      </div>
    </div>
  );
};

export default DebugPanel;