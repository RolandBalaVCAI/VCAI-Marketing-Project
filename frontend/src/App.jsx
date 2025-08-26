import React, { useEffect } from 'react';
import SimpleMarketingManager from './components/SimpleMarketingManager';
import TestDashboard from './components/TestDashboard';
import DebugPanel from './components/DebugPanel';
import './App.css';

// Import mock data utility to ensure data is loaded
import { getMockDataStatus, resetMockData } from './utils/resetMockData';

function App() {
  useEffect(() => {
    // Ensure mock data is available
    const status = getMockDataStatus();
    console.log('🎯 Mock data check on App load:', status);
    
    if (!status.exists || status.count === 0) {
      console.log('🔄 Generating mock data...');
      resetMockData();
    }
  }, []);
  
  return (
    <div className="App">
      <DebugPanel />
      <SimpleMarketingManager />
    </div>
  );
}

export default App