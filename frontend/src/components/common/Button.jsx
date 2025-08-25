import React from 'react';
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens';

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  fullWidth = false,
  icon = null,
  leftIcon = null,
  rightIcon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  as = 'button',
  style = {},
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? colors.neutral[300] : colors.primary[600],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.primary[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.primary[800]
      }
    },
    secondary: {
      backgroundColor: colors.secondary[600],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.secondary[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.secondary[800]
      }
    },
    success: {
      backgroundColor: disabled ? colors.neutral[300] : colors.success[600],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.success[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.success[800]
      }
    },
    outline: {
      backgroundColor: 'transparent',
      color: colors.primary[600],
      border: `2px solid ${colors.primary[600]}`,
      ':hover': !disabled && {
        backgroundColor: colors.primary[50]
      },
      ':active': !disabled && {
        backgroundColor: colors.primary[100]
      }
    },
    danger: {
      backgroundColor: disabled ? colors.neutral[300] : colors.error[500],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.error[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.error[800]
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.neutral[100]
      },
      ':active': !disabled && {
        backgroundColor: colors.neutral[200]
      }
    }
  };
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: '6px 12px',
      fontSize: '12px',
      fontWeight: typography.fontWeight.medium
    },
    medium: {
      padding: '8px 16px',
      fontSize: '14px',
      fontWeight: typography.fontWeight.medium
    },
    large: {
      padding: '12px 24px',
      fontSize: '16px',
      fontWeight: typography.fontWeight.semibold
    }
  };
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.sans.join(', '),
    lineHeight: typography.lineHeight.tight,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : loading ? 0.7 : 1,
    transition: transitions.fast,
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles[size],
    ...variantStyles[variant],
    // Apply custom styles last so they override defaults
    ...style
  };
  
  const handleClick = (e) => {
    if (disabled || loading) return;
    onClick?.(e);
  };
  
  const handleMouseEnter = (e) => {
    if (disabled || loading) return;
    const hoverStyles = variantStyles[variant][':hover'];
    if (hoverStyles) {
      Object.assign(e.target.style, hoverStyles);
    }
  };
  
  const handleMouseLeave = (e) => {
    if (disabled || loading) return;
    // Reset to base styles
    Object.assign(e.target.style, {
      backgroundColor: variantStyles[variant].backgroundColor,
      color: variantStyles[variant].color
    });
  };
  
  const Component = as;
  
  return (
    <Component
      type={as === 'button' ? type : undefined}
      className={className}
      style={baseStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      
      {!loading && leftIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {leftIcon}
        </span>
      )}
      
      {!loading && icon && iconPosition === 'left' && !leftIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      {loading 
        ? loadingText 
        : (icon && !leftIcon && !rightIcon && iconPosition !== 'left' && iconPosition !== 'right') 
          ? icon 
          : children
      }
      
      {!loading && icon && iconPosition === 'right' && !rightIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      {!loading && rightIcon && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {rightIcon}
        </span>
      )}
    </Component>
  );
};

export default Button;