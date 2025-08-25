import React from 'react';
import { colors, spacing, borderRadius, typography } from './design-system/tokens';

const Badge = ({
  children,
  variant = 'neutral',
  size = 'medium',
  pill = false,
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    neutral: {
      backgroundColor: colors.neutral[100],
      color: colors.neutral[700],
      border: `1px solid ${colors.neutral[200]}`
    },
    primary: {
      backgroundColor: colors.primary[100],
      color: colors.primary[700],
      border: `1px solid ${colors.primary[200]}`
    },
    success: {
      backgroundColor: colors.success[100],
      color: colors.success[700],
      border: `1px solid ${colors.success[200]}`
    },
    warning: {
      backgroundColor: colors.warning[100],
      color: colors.warning[700],
      border: `1px solid ${colors.warning[200]}`
    },
    error: {
      backgroundColor: colors.error[100],
      color: colors.error[700],
      border: `1px solid ${colors.error[200]}`
    },
    'solid-primary': {
      backgroundColor: colors.primary[600],
      color: colors.neutral[0],
      border: 'none'
    },
    'solid-success': {
      backgroundColor: colors.success[600],
      color: colors.neutral[0],
      border: 'none'
    },
    'solid-warning': {
      backgroundColor: colors.warning[600],
      color: colors.neutral[0],
      border: 'none'
    },
    'solid-error': {
      backgroundColor: colors.error[600],
      color: colors.neutral[0],
      border: 'none'
    }
  };
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: `${spacing[1]} ${spacing[2]}`,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium
    },
    medium: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium
    },
    large: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold
    }
  };
  
  const badgeStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: pill ? borderRadius.full : borderRadius.md,
    fontFamily: typography.fontFamily.sans.join(', '),
    lineHeight: typography.lineHeight.tight,
    whiteSpace: 'nowrap',
    ...sizeStyles[size],
    ...variantStyles[variant],
    ...props.style
  };
  
  return (
    <span 
      className={className}
      style={badgeStyles}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;