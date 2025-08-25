import React from 'react';

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  variant = 'rectangular',
  animation = 'pulse',
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'circular':
        return {
          borderRadius: '50%',
          width: height, // Make it square for circular
        };
      case 'rounded':
        return {
          borderRadius: '8px',
        };
      case 'text':
        return {
          height: '1em',
          borderRadius: '4px',
        };
      default:
        return {};
    }
  };

  const getAnimationStyles = () => {
    if (animation === 'wave') {
      return {
        backgroundImage: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-wave 1.5s ease-in-out infinite',
      };
    }
    
    return {
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
    };
  };
  
  return (
    <>
      <div
        className={className}
        style={{
          width,
          height,
          borderRadius,
          backgroundColor: '#f3f4f6',
          ...getVariantStyles(),
          ...getAnimationStyles(),
          ...props.style
        }}
        {...props}
      />
      <SkeletonKeyframes />
    </>
  );
};

// Skeleton keyframes component
const SkeletonKeyframes = () => (
  <style>{`
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }
    
    @keyframes skeleton-wave {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
);

// Pre-built skeleton components for common use cases
export const SkeletonText = ({ lines = 1, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        width={index === lines - 1 ? '70%' : '100%'}
        {...props} 
      />
    ))}
  </div>
);

export const SkeletonCard = ({ ...props }) => (
  <div style={{
    padding: '16px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#ffffff'
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
      <Skeleton variant="circular" width="40px" height="40px" {...props} />
      <div style={{ flex: 1 }}>
        <Skeleton variant="text" width="60%" height="16px" {...props} />
        <Skeleton variant="text" width="40%" height="14px" style={{ marginTop: '4px' }} {...props} />
      </div>
    </div>
    <SkeletonText lines={3} {...props} />
  </div>
);

export const SkeletonTable = ({ rows = 5, columns = 4, ...props }) => (
  <div style={{ border: '1px solid #e5e7eb', borderRadius: '8px', overflow: 'hidden' }}>
    {/* Header */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap: '16px',
      padding: '12px',
      backgroundColor: '#f9fafb',
      borderBottom: '1px solid #e5e7eb'
    }}>
      {Array.from({ length: columns }, (_, index) => (
        <Skeleton key={index} variant="text" height="16px" {...props} />
      ))}
    </div>
    
    {/* Rows */}
    {Array.from({ length: rows }, (_, rowIndex) => (
      <div 
        key={rowIndex}
        style={{ 
          display: 'grid', 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: '16px',
          padding: '12px',
          borderBottom: rowIndex < rows - 1 ? '1px solid #e5e7eb' : 'none'
        }}
      >
        {Array.from({ length: columns }, (_, colIndex) => (
          <Skeleton key={colIndex} variant="text" height="14px" {...props} />
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonDashboard = ({ ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
    {/* Header */}
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center',
      padding: '20px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb'
    }}>
      <Skeleton width="200px" height="32px" {...props} />
      <Skeleton width="120px" height="36px" {...props} />
    </div>
    
    {/* KPI Cards */}
    <div style={{ 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px'
    }}>
      {Array.from({ length: 4 }, (_, index) => (
        <div key={index} style={{
          padding: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <Skeleton variant="circular" width="32px" height="32px" style={{ margin: '0 auto 12px' }} {...props} />
          <Skeleton width="80px" height="14px" style={{ margin: '0 auto 8px' }} {...props} />
          <Skeleton width="100px" height="24px" style={{ margin: '0 auto' }} {...props} />
        </div>
      ))}
    </div>
    
    {/* Chart placeholder */}
    <div style={{
      height: '300px',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      padding: '20px'
    }}>
      <Skeleton width="150px" height="20px" style={{ marginBottom: '20px' }} {...props} />
      <Skeleton width="100%" height="260px" {...props} />
    </div>
  </div>
);

export default Skeleton;
export { SkeletonKeyframes };