import React from 'react';
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens';

const RadioButton = ({
  name,
  value,
  checked = false,
  onChange,
  label,
  disabled = false,
  error,
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
    alignItems: 'flex-start',
    gap: spacing[3],
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1
  };
  
  const radioStyles = {
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
    borderRadius: borderRadius.full,
    backgroundColor: colors.neutral[0],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: transitions.fast,
    position: 'relative'
  };
  
  const dotStyles = {
    width: '8px',
    height: '8px',
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary[600],
    opacity: checked ? 1 : 0,
    transform: checked ? 'scale(1)' : 'scale(0)',
    transition: transitions.fast
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
  
  const handleClick = () => {
    if (disabled) return;
    onChange(value);
  };
  
  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(value);
    }
  };
  
  const handleMouseEnter = (e) => {
    if (disabled) return;
    const radio = e.currentTarget.querySelector('[data-radio]');
    if (radio) {
      radio.style.borderColor = checked ? colors.primary[700] : colors.neutral[400];
    }
  };
  
  const handleMouseLeave = (e) => {
    if (disabled) return;
    const radio = e.currentTarget.querySelector('[data-radio]');
    if (radio) {
      radio.style.borderColor = error 
        ? colors.error[500]
        : checked 
          ? colors.primary[600]
          : colors.neutral[300];
    }
  };
  
  return (
    <div
      style={containerStyles}
      className={className}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      tabIndex={disabled ? -1 : 0}
      role="radio"
      aria-checked={checked}
      aria-disabled={disabled}
      {...props}
    >
      <div style={radioStyles} data-radio>
        <div style={dotStyles} />
      </div>
      
      {label && (
        <label style={labelStyles}>
          {label}
        </label>
      )}
      
      {/* Hidden input for form submission */}
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={() => {}} // Controlled by parent
        style={{ display: 'none' }}
        disabled={disabled}
      />
    </div>
  );
};

// RadioGroup component for managing multiple radio buttons
export const RadioGroup = ({
  name,
  value,
  onChange,
  options = [],
  error,
  helperText,
  disabled = false,
  size = 'medium',
  direction = 'vertical',
  className = ''
}) => {
  const groupStyles = {
    display: 'flex',
    flexDirection: direction === 'vertical' ? 'column' : 'row',
    gap: direction === 'vertical' ? spacing[3] : spacing[6],
    flexWrap: direction === 'horizontal' ? 'wrap' : 'nowrap'
  };
  
  const helperTextStyles = {
    fontSize: typography.fontSize.sm,
    color: error ? colors.error[600] : colors.neutral[600],
    fontFamily: typography.fontFamily.sans.join(', '),
    marginTop: spacing[2]
  };
  
  return (
    <div className={className}>
      <div style={groupStyles}>
        {options.map((option, index) => (
          <RadioButton
            key={option.value || index}
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={onChange}
            label={option.label}
            disabled={disabled || option.disabled}
            error={error}
            size={size}
          />
        ))}
      </div>
      
      {(error || helperText) && (
        <div style={helperTextStyles}>
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default RadioButton;