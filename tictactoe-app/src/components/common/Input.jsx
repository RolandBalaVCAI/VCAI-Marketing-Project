import React, { useState } from 'react';
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  size = 'medium',
  leftIcon,
  rightIcon,
  onLeftIconClick,
  onRightIconClick,
  className = '',
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm
    },
    medium: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base
    },
    large: {
      padding: `${spacing[4]} ${spacing[5]}`,
      fontSize: typography.fontSize.lg
    }
  };
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto'
  };
  
  const labelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.error[600] : colors.neutral[700],
    fontFamily: typography.fontFamily.sans.join(', ')
  };
  
  const inputContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };
  
  const inputStyles = {
    width: '100%',
    border: `1px solid ${
      error 
        ? colors.error[400]
        : focused 
          ? colors.primary[500]
          : colors.neutral[300]
    }`,
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.sans.join(', '),
    backgroundColor: disabled ? colors.neutral[50] : colors.neutral[0],
    color: disabled ? colors.neutral[500] : colors.neutral[900],
    outline: 'none',
    transition: transitions.fast,
    ...sizeStyles[size],
    paddingLeft: leftIcon ? `${spacing[10]}` : sizeStyles[size].padding.split(' ')[1],
    paddingRight: rightIcon ? `${spacing[10]}` : sizeStyles[size].padding.split(' ')[1]
  };
  
  const iconStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    color: colors.neutral[500],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: spacing[5],
    height: spacing[5]
  };
  
  const leftIconStyles = {
    ...iconStyles,
    left: spacing[3]
  };
  
  const rightIconStyles = {
    ...iconStyles,
    right: spacing[3]
  };
  
  const helperTextStyles = {
    fontSize: typography.fontSize.sm,
    color: error ? colors.error[600] : colors.neutral[600],
    fontFamily: typography.fontFamily.sans.join(', ')
  };
  
  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);
  
  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: colors.error[500] }}>*</span>}
        </label>
      )}
      
      <div style={inputContainerStyles}>
        {leftIcon && (
          <div 
            style={leftIconStyles} 
            onClick={onLeftIconClick}
          >
            {leftIcon}
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          style={inputStyles}
          {...props}
        />
        
        {rightIcon && (
          <div 
            style={rightIconStyles} 
            onClick={onRightIconClick}
          >
            {rightIcon}
          </div>
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

export default Input;