import React from 'react';
import { colors } from './design-system/tokens';

const LoadingSpinner = ({ 
  size = 24, 
  message = 'Loading...', 
  show = true,
  inline = false,
  color = colors.primary[500],
  thickness = 3
}) => {
  if (!show) return null;
  
  const containerStyle = inline 
    ? { display: 'inline-flex', alignItems: 'center', gap: '8px' }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      };
  
  const spinnerSize = size;
  const strokeWidth = thickness;
  const radius = (spinnerSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  return (
    <div style={containerStyle}>
      <svg 
        width={spinnerSize} 
        height={spinnerSize}
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <circle
          cx={spinnerSize / 2}
          cy={spinnerSize / 2}
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={spinnerSize / 2}
          cy={spinnerSize / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
          strokeLinecap="round"
          style={{
            transformOrigin: 'center',
            animation: 'spin 1s linear infinite'
          }}
        />
      </svg>
      {message && (
        <span style={{
          color: '#666666',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: inline ? 0 : '8px'
        }}>
          {message}
        </span>
      )}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Inline loading indicator for buttons
export const ButtonSpinner = ({ size = 16, color = '#ffffff' }) => {
  const spinnerSize = size;
  const strokeWidth = 2;
  const radius = (spinnerSize - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  return (
    <svg 
      width={spinnerSize} 
      height={spinnerSize}
      style={{ 
        animation: 'spin 1s linear infinite',
        marginRight: '6px',
        display: 'inline-block'
      }}
    >
      <circle
        cx={spinnerSize / 2}
        cy={spinnerSize / 2}
        r={radius}
        stroke={color}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
        strokeLinecap="round"
        style={{
          transformOrigin: 'center'
        }}
      />
    </svg>
  );
};

// Overlay loading spinner
export const OverlaySpinner = ({ message = 'Loading...', show = true }) => {
  if (!show) return null;
  
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
      zIndex: 9999
    }}>
      <div style={{
        backgroundColor: '#ffffff',
        padding: '24px',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px',
        minWidth: '200px'
      }}>
        <LoadingSpinner 
          size={32} 
          inline={true}
          message=""
          color={colors.primary[500]}
        />
        <span style={{
          color: '#1a1a1a',
          fontSize: '16px',
          fontWeight: '500'
        }}>
          {message}
        </span>
      </div>
    </div>
  );
};

export default LoadingSpinner;