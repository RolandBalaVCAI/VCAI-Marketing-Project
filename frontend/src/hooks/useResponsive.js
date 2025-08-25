import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return {
    windowWidth,
    isMobile: windowWidth < 768,
    isTablet: windowWidth >= 768 && windowWidth < 1024,
    isDesktop: windowWidth >= 1024,
    
    // Responsive helpers
    getGridColumns: () => windowWidth >= 768 ? 'repeat(3, 1fr)' : windowWidth >= 480 ? 'repeat(2, 1fr)' : '1fr',
    getGap: () => windowWidth >= 768 ? '16px' : '12px',
    getPadding: () => windowWidth >= 768 ? '24px' : '16px',
    getChartHeight: () => windowWidth >= 768 ? '300px' : '250px',
    getFontSize: (mobile, desktop = null) => windowWidth >= 768 ? (desktop || mobile) : mobile,
    getMargin: (mobile, desktop = null) => windowWidth >= 768 ? (desktop || mobile) : mobile,
    getFilterGrid: () => windowWidth >= 768 ? 'repeat(auto-fit, minmax(240px, 1fr))' : '1fr',
    getChartGrid: () => windowWidth >= 768 ? 'repeat(auto-fit, minmax(480px, 1fr))' : '1fr',
    getHeaderPadding: () => windowWidth >= 768 ? '32px' : '20px',
    getTableMinWidth: () => windowWidth >= 768 ? 'auto' : '1200px',
    getTableBorder: () => windowWidth >= 768 ? 'none' : '1px solid #e0e0e0',
    getFilterGap: () => windowWidth >= 768 ? '20px' : '16px',
    getMaxWidth: () => {
      if (windowWidth >= 1400) return '1400px';
      if (windowWidth >= 768) return '100%';
      return '100%';
    },
    getContainerPadding: () => {
      if (windowWidth >= 1024) return '16px';
      if (windowWidth >= 768) return '12px';
      return '8px';
    },
    getMarginBottom: () => windowWidth >= 768 ? '24px' : '16px'
  };
};