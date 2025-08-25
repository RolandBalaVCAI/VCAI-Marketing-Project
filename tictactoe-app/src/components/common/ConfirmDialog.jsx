import React from 'react';
import { colors, shadows } from './design-system/tokens';
import { FadeTransition } from './Transition';
import Button from './Button';

const ConfirmDialog = ({
  isOpen = false,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'default',
  loading = false,
  icon,
  confirmButtonVariant,
  cancelButtonVariant = 'secondary'
}) => {
  if (!isOpen) return null;
  
  const variants = {
    default: {
      iconColor: colors.primary[500],
      confirmVariant: 'primary'
    },
    danger: {
      iconColor: colors.error[500],
      confirmVariant: 'danger'
    },
    warning: {
      iconColor: colors.warning[500],
      confirmVariant: 'warning'
    },
    success: {
      iconColor: colors.success[500],
      confirmVariant: 'success'
    }
  };
  
  const currentVariant = variants[variant] || variants.default;
  const finalConfirmVariant = confirmButtonVariant || currentVariant.confirmVariant;
  
  // Default icons for variants
  const defaultIcons = {
    default: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={currentVariant.iconColor} strokeWidth="2"/>
        <path d="M12 8v4m0 4h.01" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    danger: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
          stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    warning: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={currentVariant.iconColor} strokeWidth="2"/>
        <path d="M12 8v4m0 4h.01" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    success: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={currentVariant.iconColor} strokeWidth="2"/>
        <path d="M9 12l2 2 4-4" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
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
    zIndex: 10000,
    padding: '16px'
  };
  
  const dialogStyles = {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: shadows.xl,
    maxWidth: '400px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto'
  };
  
  const headerStyles = {
    padding: '24px 24px 0',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px'
  };
  
  const iconContainerStyles = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: colors.neutral[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  };
  
  const contentStyles = {
    flex: 1
  };
  
  const titleStyles = {
    fontSize: '18px',
    fontWeight: 600,
    color: colors.neutral[900],
    marginBottom: '8px'
  };
  
  const messageStyles = {
    fontSize: '14px',
    color: colors.neutral[600],
    lineHeight: '1.5'
  };
  
  const footerStyles = {
    padding: '24px',
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end'
  };
  
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel?.();
    }
  };
  
  return (
    <FadeTransition show={isOpen}>
      <div style={overlayStyles} onClick={handleOverlayClick}>
        <div style={dialogStyles} onClick={(e) => e.stopPropagation()}>
          <div style={headerStyles}>
            <div style={iconContainerStyles}>
              {icon || defaultIcons[variant] || defaultIcons.default}
            </div>
            <div style={contentStyles}>
              <h3 style={titleStyles}>{title}</h3>
              <p style={messageStyles}>{message}</p>
            </div>
          </div>
          
          <div style={footerStyles}>
            <Button
              variant={cancelButtonVariant}
              onClick={onCancel}
              disabled={loading}
            >
              {cancelText}
            </Button>
            <Button
              variant={finalConfirmVariant}
              onClick={onConfirm}
              loading={loading}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </FadeTransition>
  );
};

// Pre-configured confirm dialogs
export const DeleteConfirmDialog = ({ itemName = 'this item', ...props }) => (
  <ConfirmDialog
    title="Delete Confirmation"
    message={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    confirmText="Delete"
    variant="danger"
    {...props}
  />
);

export const SaveConfirmDialog = (props) => (
  <ConfirmDialog
    title="Save Changes"
    message="Do you want to save the changes you made?"
    confirmText="Save"
    cancelText="Discard"
    variant="default"
    {...props}
  />
);

export const LogoutConfirmDialog = (props) => (
  <ConfirmDialog
    title="Logout"
    message="Are you sure you want to logout? Any unsaved changes will be lost."
    confirmText="Logout"
    variant="warning"
    {...props}
  />
);

// Hook for managing confirm dialogs
export const useConfirmDialog = () => {
  const [dialogs, setDialogs] = React.useState([]);
  
  const confirm = (options) => {
    return new Promise((resolve) => {
      const id = Date.now();
      
      const dialog = {
        id,
        ...options,
        onConfirm: () => {
          setDialogs(prev => prev.filter(d => d.id !== id));
          options.onConfirm?.();
          resolve(true);
        },
        onCancel: () => {
          setDialogs(prev => prev.filter(d => d.id !== id));
          options.onCancel?.();
          resolve(false);
        }
      };
      
      setDialogs(prev => [...prev, dialog]);
    });
  };
  
  const confirmDelete = (itemName, onConfirm) => {
    return confirm({
      title: 'Delete Confirmation',
      message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
      confirmText: 'Delete',
      variant: 'danger',
      onConfirm
    });
  };
  
  const confirmAction = (message, onConfirm) => {
    return confirm({
      message,
      onConfirm
    });
  };
  
  return {
    dialogs,
    confirm,
    confirmDelete,
    confirmAction
  };
};

export default ConfirmDialog;