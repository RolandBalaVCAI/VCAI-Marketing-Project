import React, { useEffect } from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from './design-system/tokens';
import Button from './Button';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  // Size styles
  const sizeStyles = {
    small: {
      width: '400px',
      maxWidth: '90vw'
    },
    medium: {
      width: '600px',
      maxWidth: '90vw'
    },
    large: {
      width: '800px',
      maxWidth: '95vw'
    },
    full: {
      width: '95vw',
      height: '95vh'
    }
  };
  
  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[4],
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: transitions.normal
  };
  
  const modalStyles = {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    transition: transitions.normal,
    ...sizeStyles[size]
  };
  
  const headerStyles = {
    padding: spacing[6],
    borderBottom: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };
  
  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.neutral[900],
    margin: 0
  };
  
  const contentStyles = {
    padding: spacing[6],
    overflowY: 'auto',
    flex: 1
  };
  
  const closeButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing[1],
    borderRadius: borderRadius.base,
    color: colors.neutral[500],
    transition: transitions.fast,
    fontSize: '20px',
    width: '28px',
    height: '28px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  };
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={modalStyles} className={className}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.neutral[100];
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;