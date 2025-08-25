import { lazy } from 'react';

// Lazy load components with error boundaries and loading states
export const createLazyComponent = (importFn, fallback = null) => {
  const LazyComponent = lazy(importFn);
  
  // Return a wrapper that includes error handling
  return {
    Component: LazyComponent,
    fallback: fallback || <div>Loading...</div>
  };
};

// Pre-defined lazy components for the marketing app
export const LazyComponents = {
  CampaignDetail: createLazyComponent(
    () => import('../components/CampaignDetail'),
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e0e0e0'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f4f6',
        borderTop: '4px solid #0066cc',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  ),

  Charts: createLazyComponent(
    () => import('../components/charts/ChartComponents'),
    <div style={{ padding: '20px', textAlign: 'center' }}>Loading charts...</div>
  ),

  DataExport: createLazyComponent(
    () => import('../components/export/DataExportModal'),
    <div style={{ padding: '20px', textAlign: 'center' }}>Loading export...</div>
  )
};

// Bundle size optimization - Code splitting utility
export const splitBundle = {
  // Split vendor libraries
  vendor: () => import('react'),
  charts: () => import('recharts'),
  icons: () => import('lucide-react'),
  
  // Split utility functions
  calculations: () => import('../utils/calculations'),
  csvExport: () => import('../utils/csvExport'),
  chartHelpers: () => import('../utils/chartHelpers'),
  
  // Split store modules
  stores: () => import('../stores'),
  hooks: () => import('../hooks')
};

// Dynamic import with retry logic
export const importWithRetry = async (importFn, maxRetries = 3) => {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error;
      console.warn(`Import attempt ${i + 1} failed:`, error);
      
      // Wait before retrying (exponential backoff)
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }
  }
  
  throw lastError;
};

// Preload critical components
export const preloadCriticalComponents = () => {
  // Preload components that are likely to be needed soon
  const preloadPromises = [
    importWithRetry(() => import('../components/CampaignDetail')),
    importWithRetry(() => import('../utils/csvExport'))
  ];

  return Promise.allSettled(preloadPromises);
};

// Route-based code splitting helper
export const createRouteComponent = (importFn, routeName) => {
  return lazy(async () => {
    console.log(`Loading route: ${routeName}`);
    const startTime = performance.now();
    
    try {
      const module = await importWithRetry(importFn);
      const loadTime = performance.now() - startTime;
      
      console.log(`Route ${routeName} loaded in ${loadTime.toFixed(2)}ms`);
      return module;
    } catch (error) {
      console.error(`Failed to load route ${routeName}:`, error);
      throw error;
    }
  });
};