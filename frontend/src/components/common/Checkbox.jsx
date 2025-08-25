import React from 'react';
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens';

const Checkbox = ({
  label,
  checked = false,
  onChange,
  disabled = false,
  error,
  helperText,
  size = 'medium',
  className = '',
  ...props
}) => {
  // Size styles
  const sizeStyles = {
    small: {
      width: '16px',
      height: '16px',
      fontSize: typography.fontSize.sm
    },
    medium: {
      width: '20px',
      height: '20px',
      fontSize: typography.fontSize.base
    },
    large: {
      width: '24px',
      height: '24px',
      fontSize: typography.fontSize.lg
    }
  };
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[1]
  };
  
  const checkboxContainerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: spacing[3],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  };
  
  const checkboxStyles = {
    width: sizeStyles[size].width,
    height: sizeStyles[size].height,
    minWidth: sizeStyles[size].width,
    minHeight: sizeStyles[size].height,
    border: `2px solid ${
      error 
        ? colors.error[500]
        : checked 
          ? colors.primary[600]
          : colors.neutral[300]
    }`,
    borderRadius: borderRadius.sm,
    backgroundColor: checked ? colors.primary[600] : colors.neutral[0],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: transitions.fast,
    position: 'relative'
  };
  
  const checkmarkStyles = {
    color: colors.neutral[0],
    fontSize: '12px',
    fontWeight: 'bold',
    opacity: checked ? 1 : 0,
    transition: transitions.fast,
    transform: checked ? 'scale(1)' : 'scale(0.5)'
  };
  
  const labelStyles = {
    fontSize: sizeStyles[size].fontSize,
    fontWeight: typography.fontWeight.normal,
    color: error ? colors.error[600] : colors.neutral[700],
    fontFamily: typography.fontFamily.sans.join(', '),
    lineHeight: typography.lineHeight.normal,
    userSelect: 'none',
    flex: 1
  };
  
  const helperTextStyles = {
    fontSize: typography.fontSize.sm,
    color: error ? colors.error[600] : colors.neutral[600],
    fontFamily: typography.fontFamily.sans.join(', '),
    marginLeft: `calc(${sizeStyles[size].width} + ${spacing[3]})`
  };
  
  const handleClick = () => {
    if (disabled) return;
    onChange(!checked);
  };
  
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };
  
  const handleMouseEnter = (e) => {
    if (disabled) return;
    const checkbox = e.currentTarget.querySelector('[data-checkbox]');
    if (checkbox) {
      checkbox.style.borderColor = checked ? colors.primary[700] : colors.neutral[400];
    }
  };
  
  const handleMouseLeave = (e) => {
    if (disabled) return;
    const checkbox = e.currentTarget.querySelector('[data-checkbox]');
    if (checkbox) {
      checkbox.style.borderColor = error 
        ? colors.error[500]
        : checked 
          ? colors.primary[600]
          : colors.neutral[300];
    }
  };
  
  return (
    <div style={containerStyles} className={className}>
      <div
        style={checkboxContainerStyles}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        tabIndex={disabled ? -1 : 0}
        role="checkbox"
        aria-checked={checked}
        aria-disabled={disabled}
        {...props}
      >
        <div style={checkboxStyles} data-checkbox>
          <span style={checkmarkStyles}>✓</span>
        </div>
        
        {label && (
          <label style={labelStyles}>
            {label}
          </label>
        )}
      </div>
      
      {(error || helperText) && (
        <span style={helperTextStyles}>
          {error || helperText}
        </span>
      )}
    </div>
  );
};

export default Checkbox;