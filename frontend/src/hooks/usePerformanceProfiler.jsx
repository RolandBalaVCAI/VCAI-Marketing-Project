import { useRef, useEffect, useState } from 'react';

export const usePerformanceProfiler = (componentName = 'Component') => {
  const renderStart = useRef(performance.now());
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    memoryUsage: 0,
    renderCount: 0
  });
  
  // Track render times
  useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart.current;
    
    // Update metrics
    setMetrics(prev => ({
      ...prev,
      renderTime,
      renderCount: prev.renderCount + 1
    }));
    
    // Get memory usage if available
    if (performance.memory) {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
      }));
    }
    
    // Log performance warnings for slow renders
    if (renderTime > 100) {
      console.warn(`🐌 Slow render detected in ${componentName}:`, {
        renderTime: `${renderTime.toFixed(2)}ms`,
        renderCount: metrics.renderCount + 1,
        memoryUsage: `${Math.round(performance.memory?.usedJSHeapSize / 1024 / 1024 || 0)}MB`
      });
    }
    
    // Reset render start for next render
    renderStart.current = performance.now();
  });
  
  // Development-only performance logging
  useEffect(() => {
    if (import.meta.env.DEV && metrics.renderCount > 0 && metrics.renderCount % 10 === 0) {
      console.log(`📊 Performance metrics for ${componentName}:`, {
        avgRenderTime: `${metrics.renderTime.toFixed(2)}ms`,
        totalRenders: metrics.renderCount,
        memoryUsage: `${metrics.memoryUsage}MB`
      });
    }
  }, [metrics.renderCount, componentName]);
  
  return {
    ...metrics,
    isSlowRender: metrics.renderTime > 100,
    componentName
  };
};

// Performance monitoring component for displaying metrics
export const PerformanceMonitor = ({ enabled = true, position = 'top-right' }) => {
  const [globalMetrics, setGlobalMetrics] = useState({
    components: {},
    totalRenders: 0,
    averageRenderTime: 0
  });
  
  useEffect(() => {
    if (!enabled || !import.meta.env.DEV) return;
    
    // Listen for performance updates
    const updateMetrics = (event) => {
      const { componentName, renderTime, renderCount } = event.detail;
      setGlobalMetrics(prev => ({
        ...prev,
        components: {
          ...prev.components,
          [componentName]: { renderTime, renderCount }
        },
        totalRenders: prev.totalRenders + 1,
        averageRenderTime: ((prev.averageRenderTime * prev.totalRenders + renderTime) / (prev.totalRenders + 1))
      }));
    };
    
    window.addEventListener('performance-update', updateMetrics);
    return () => window.removeEventListener('performance-update', updateMetrics);
  }, [enabled]);
  
  if (!enabled || !import.meta.env.DEV) return null;
  
  const positionStyles = {
    'top-right': { top: '10px', right: '10px' },
    'top-left': { top: '10px', left: '10px' },
    'bottom-right': { bottom: '10px', right: '10px' },
    'bottom-left': { bottom: '10px', left: '10px' }
  };
  
  return (
    <div style={{
      position: 'fixed',
      ...positionStyles[position],
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      padding: '8px 12px',
      borderRadius: '6px',
      fontSize: '11px',
      fontFamily: 'monospace',
      zIndex: 10000,
      minWidth: '150px',
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
        🔧 Performance Monitor
      </div>
      <div>Total Renders: {globalMetrics.totalRenders}</div>
      <div>Avg Render: {globalMetrics.averageRenderTime.toFixed(1)}ms</div>
      {performance.memory && (
        <div>Memory: {Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)}MB</div>
      )}
      {Object.keys(globalMetrics.components).length > 0 && (
        <details style={{ marginTop: '4px' }}>
          <summary style={{ cursor: 'pointer', fontSize: '10px' }}>Components</summary>
          <div style={{ marginTop: '2px', fontSize: '10px' }}>
            {Object.entries(globalMetrics.components).map(([name, metrics]) => (
              <div key={name} style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                color: metrics.renderTime > 100 ? '#ff6b6b' : '#51cf66'
              }}>
                <span>{name}:</span>
                <span>{metrics.renderTime.toFixed(1)}ms</span>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
};