import React, { useEffect, useState } from 'react';
import { colors, shadows } from './design-system/tokens';

const Toast = ({
  id,
  type = 'info',
  title,
  message,
  duration = 5000,
  position = 'top-right',
  onClose,
  action,
  actionText = 'Action',
  showProgress = true
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);
  
  useEffect(() => {
    if (duration === 0) return;
    
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
      
      if (remaining === 0) {
        clearInterval(interval);
        handleClose();
      }
    }, 50);
    
    return () => clearInterval(interval);
  }, [duration]);
  
  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.(id);
    }, 300);
  };
  
  const types = {
    success: {
      backgroundColor: colors.success[50],
      borderColor: colors.success[200],
      iconColor: colors.success[500],
      progressColor: colors.success[500],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={colors.success[500]} strokeWidth="2"/>
          <path d="M9 12l2 2 4-4" stroke={colors.success[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    error: {
      backgroundColor: colors.error[50],
      borderColor: colors.error[200],
      iconColor: colors.error[500],
      progressColor: colors.error[500],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={colors.error[500]} strokeWidth="2"/>
          <path d="M15 9l-6 6M9 9l6 6" stroke={colors.error[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    warning: {
      backgroundColor: colors.warning[50],
      borderColor: colors.warning[200],
      iconColor: colors.warning[500],
      progressColor: colors.warning[500],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            stroke={colors.warning[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    info: {
      backgroundColor: colors.primary[50],
      borderColor: colors.primary[200],
      iconColor: colors.primary[500],
      progressColor: colors.primary[500],
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke={colors.primary[500]} strokeWidth="2"/>
          <path d="M12 16v-4m0-4h.01" stroke={colors.primary[500]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    }
  };
  
  const currentType = types[type] || types.info;
  
  const containerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: currentType.backgroundColor,
    border: `1px solid ${currentType.borderColor}`,
    borderRadius: '8px',
    boxShadow: shadows.md,
    minWidth: '320px',
    maxWidth: '500px',
    position: 'relative',
    overflow: 'hidden',
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
    transition: 'all 0.3s ease'
  };
  
  const closeButtonStyles = {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    color: colors.neutral[500],
    transition: 'color 0.2s ease'
  };
  
  const progressBarStyles = {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    backgroundColor: currentType.progressColor,
    width: `${progress}%`,
    transition: 'width 0.05s linear'
  };
  
  return (
    <div style={containerStyles}>
      <div style={{ flexShrink: 0 }}>
        {currentType.icon}
      </div>
      <div style={{ flex: 1 }}>
        {title && (
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: colors.neutral[900],
            marginBottom: message ? '4px' : 0
          }}>
            {title}
          </div>
        )}
        {message && (
          <div style={{
            fontSize: '14px',
            color: colors.neutral[700],
            lineHeight: '1.5'
          }}>
            {message}
          </div>
        )}
        {action && (
          <button
            onClick={action}
            style={{
              marginTop: '8px',
              padding: '4px 12px',
              backgroundColor: 'transparent',
              border: `1px solid ${currentType.borderColor}`,
              borderRadius: '4px',
              fontSize: '13px',
              fontWeight: 500,
              color: currentType.iconColor,
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = currentType.backgroundColor;
              e.target.style.borderColor = currentType.iconColor;
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = currentType.borderColor;
            }}
          >
            {actionText}
          </button>
        )}
      </div>
      <button
        onClick={handleClose}
        style={closeButtonStyles}
        onMouseOver={(e) => e.target.style.color = colors.neutral[700]}
        onMouseOut={(e) => e.target.style.color = colors.neutral[500]}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>
      {showProgress && duration > 0 && (
        <div style={progressBarStyles} />
      )}
    </div>
  );
};

// Toast Container Component
export const ToastContainer = ({ toasts = [], position = 'top-right', onClose }) => {
  const positions = {
    'top-left': { top: '20px', left: '20px' },
    'top-right': { top: '20px', right: '20px' },
    'top-center': { top: '20px', left: '50%', transform: 'translateX(-50%)' },
    'bottom-left': { bottom: '20px', left: '20px' },
    'bottom-right': { bottom: '20px', right: '20px' },
    'bottom-center': { bottom: '20px', left: '50%', transform: 'translateX(-50%)' }
  };
  
  const containerStyles = {
    position: 'fixed',
    ...positions[position],
    zIndex: 9999,
    display: 'flex',
    flexDirection: position.includes('bottom') ? 'column-reverse' : 'column',
    gap: '12px',
    pointerEvents: 'none'
  };
  
  const toastWrapperStyles = {
    pointerEvents: 'auto'
  };
  
  return (
    <div style={containerStyles}>
      {toasts.map((toast) => (
        <div key={toast.id} style={toastWrapperStyles}>
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
};

// Toast hook for easy usage
export const useToast = () => {
  const [toasts, setToasts] = useState([]);
  
  const addToast = (options) => {
    const id = Date.now() + Math.random();
    const toast = { id, ...options };
    setToasts(prev => [...prev, toast]);
    return id;
  };
  
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };
  
  const success = (title, message, options = {}) => {
    return addToast({ type: 'success', title, message, ...options });
  };
  
  const error = (title, message, options = {}) => {
    return addToast({ type: 'error', title, message, ...options });
  };
  
  const warning = (title, message, options = {}) => {
    return addToast({ type: 'warning', title, message, ...options });
  };
  
  const info = (title, message, options = {}) => {
    return addToast({ type: 'info', title, message, ...options });
  };
  
  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

export default Toast;