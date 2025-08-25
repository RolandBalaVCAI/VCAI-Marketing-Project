import React, { memo, useEffect, useRef, useState } from 'react';
import { Activity, Clock, Zap } from 'lucide-react';

// Performance Monitor Component
const PerformanceMonitor = memo(({ enabled = false, showMetrics = false }) => {
  const [metrics, setMetrics] = useState({
    renderCount: 0,
    lastRenderTime: 0,
    avgRenderTime: 0,
    memoryUsage: 0
  });
  
  const renderStartTime = useRef(0);
  const renderTimes = useRef([]);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    if (!enabled) return;

    renderStartTime.current = performance.now();
    
    return () => {
      const renderTime = performance.now() - renderStartTime.current;
      renderTimes.current.push(renderTime);
      
      // Keep only last 10 render times
      if (renderTimes.current.length > 10) {
        renderTimes.current = renderTimes.current.slice(-10);
      }
      
      const avgTime = renderTimes.current.reduce((a, b) => a + b, 0) / renderTimes.current.length;
      
      setMetrics(prev => ({
        renderCount: prev.renderCount + 1,
        lastRenderTime: renderTime,
        avgRenderTime: avgTime,
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize / 1024 / 1024 : 0
      }));
    };
  });

  // Log performance warnings
  useEffect(() => {
    if (metrics.lastRenderTime > 100) {
      console.warn(`[Performance Monitor] Slow render detected: ${metrics.lastRenderTime.toFixed(2)}ms`);
    }
    
    if (metrics.renderCount > 0 && metrics.renderCount % 50 === 0) {
      console.info(`[Performance Monitor] ${metrics.renderCount} renders completed, avg: ${metrics.avgRenderTime.toFixed(2)}ms`);
    }
  }, [metrics]);

  if (!showMetrics) return null;

  const isSlowRender = metrics.lastRenderTime > 50;
  const isHighMemory = metrics.memoryUsage > 100;

  return (
    <div style={{
      position: 'fixed',
      top: '10px',
      right: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      color: '#ffffff',
      padding: '12px',
      borderRadius: '8px',
      fontFamily: 'monospace',
      fontSize: '12px',
      zIndex: 9999,
      minWidth: '200px',
      backdropFilter: 'blur(4px)',
      border: '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '8px',
        fontWeight: 'bold'
      }}>
        <Activity size={14} style={{ marginRight: '4px' }} />
        Performance Monitor
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Zap size={12} />
          <span>Renders: {metrics.renderCount}</span>
        </div>
        
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '6px',
          color: isSlowRender ? '#ff6b6b' : '#51cf66'
        }}>
          <Clock size={12} />
          <span>Last: {metrics.lastRenderTime.toFixed(1)}ms</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} />
          <span>Avg: {metrics.avgRenderTime.toFixed(1)}ms</span>
        </div>
        
        {performance.memory && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px',
            color: isHighMemory ? '#ff6b6b' : '#74c0fc'
          }}>
            <Activity size={12} />
            <span>Memory: {metrics.memoryUsage.toFixed(1)}MB</span>
          </div>
        )}
        
        <div style={{ 
          fontSize: '10px', 
          color: '#adb5bd', 
          marginTop: '4px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          paddingTop: '4px'
        }}>
          Uptime: {Math.floor((Date.now() - mountTime.current) / 1000)}s
        </div>
      </div>
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

// Performance profiler hook
export const usePerformanceProfiler = (componentName) => {
  const renderCount = useRef(0);
  const renderStart = useRef(0);

  useEffect(() => {
    renderStart.current = performance.now();
    renderCount.current += 1;
    
    return () => {
      const renderTime = performance.now() - renderStart.current;
      
      if (renderTime > 50) {
        console.warn(`[${componentName}] Slow render: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
      }
      
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'development' && renderCount.current % 25 === 0) {
        console.log(`[${componentName}] Completed ${renderCount.current} renders`);
      }
    };
  });

  return { renderCount: renderCount.current };
};

export default PerformanceMonitor;