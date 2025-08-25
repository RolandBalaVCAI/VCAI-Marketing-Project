import React, { useState, useRef, useEffect } from 'react';
import { colors, spacing, borderRadius, typography, transitions, shadows } from './design-system/tokens';

const Select = ({
  label,
  value,
  onChange,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  disabled = false,
  fullWidth = false,
  size = 'medium',
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const selectRef = useRef(null);
  const dropdownRef = useRef(null);
  
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
    width: fullWidth ? '100%' : 'auto',
    position: 'relative'
  };
  
  const labelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.error[600] : colors.neutral[700],
    fontFamily: typography.fontFamily.sans.join(', ')
  };
  
  const selectStyles = {
    width: '100%',
    border: `1px solid ${
      error 
        ? colors.error[400]
        : focused || isOpen
          ? colors.primary[500]
          : colors.neutral[300]
    }`,
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.sans.join(', '),
    backgroundColor: disabled ? colors.neutral[50] : colors.neutral[0],
    color: disabled ? colors.neutral[500] : colors.neutral[900],
    outline: 'none',
    transition: transitions.fast,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...sizeStyles[size]
  };
  
  const dropdownStyles = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.neutral[0],
    border: `1px solid ${colors.neutral[300]}`,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    maxHeight: '200px',
    overflowY: 'auto',
    marginTop: spacing[1],
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transform: isOpen ? 'translateY(0)' : 'translateY(-10px)',
    transition: transitions.fast
  };
  
  const optionStyles = {
    padding: `${spacing[3]} ${spacing[4]}`,
    cursor: 'pointer',
    fontSize: sizeStyles[size].fontSize,
    fontFamily: typography.fontFamily.sans.join(', '),
    color: colors.neutral[900],
    borderBottom: `1px solid ${colors.neutral[100]}`,
    transition: transitions.fast
  };
  
  const helperTextStyles = {
    fontSize: typography.fontSize.sm,
    color: error ? colors.error[600] : colors.neutral[600],
    fontFamily: typography.fontFamily.sans.join(', ')
  };
  
  const chevronStyles = {
    width: '20px',
    height: '20px',
    color: colors.neutral[500],
    transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    transition: transitions.fast
  };
  
  // Find selected option
  const selectedOption = options.find(option => option.value === value);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setFocused(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!isOpen) return;
      
      if (event.key === 'Escape') {
        setIsOpen(false);
        setFocused(false);
      } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
        // Add keyboard navigation logic here if needed
      } else if (event.key === 'Enter') {
        event.preventDefault();
        // Add enter selection logic here if needed
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
  
  const handleSelectClick = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    setFocused(!isOpen);
  };
  
  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
    setFocused(false);
  };
  
  const handleOptionMouseEnter = (e) => {
    e.target.style.backgroundColor = colors.primary[50];
  };
  
  const handleOptionMouseLeave = (e) => {
    e.target.style.backgroundColor = 'transparent';
  };
  
  return (
    <div style={containerStyles} className={className} ref={selectRef}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: colors.error[500] }}>*</span>}
        </label>
      )}
      
      <div style={selectStyles} onClick={handleSelectClick} {...props}>
        <span style={{
          color: selectedOption ? colors.neutral[900] : colors.neutral[500],
          flex: 1,
          textAlign: 'left'
        }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <svg
          style={chevronStyles}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
      
      <div style={dropdownStyles} ref={dropdownRef}>
        {options.map((option, index) => (
          <div
            key={option.value || index}
            style={{
              ...optionStyles,
              backgroundColor: option.value === value ? colors.primary[50] : 'transparent',
              borderBottom: index === options.length - 1 ? 'none' : `1px solid ${colors.neutral[100]}`
            }}
            onClick={() => handleOptionClick(option)}
            onMouseEnter={handleOptionMouseEnter}
            onMouseLeave={handleOptionMouseLeave}
          >
            {option.label}
          </div>
        ))}
        
        {options.length === 0 && (
          <div style={{
            ...optionStyles,
            color: colors.neutral[500],
            cursor: 'default'
          }}>
            No options available
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

export default Select;