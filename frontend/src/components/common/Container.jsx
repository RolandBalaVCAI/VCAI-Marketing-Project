import React from 'react';
import { spacing, breakpoints } from './design-system/tokens';

const Container = ({
  children,
  maxWidth = 'xl',
  padding = 'medium',
  center = true,
  className = '',
  ...props
}) => {
  // Max width styles
  const maxWidthStyles = {
    sm: breakpoints.sm,
    md: breakpoints.md,
    lg: breakpoints.lg,
    xl: breakpoints.xl,
    '2xl': breakpoints['2xl'],
    full: '100%',
    none: 'none'
  };
  
  // Padding styles
  const paddingStyles = {
    none: '0',
    small: `0 ${spacing[4]}`,
    medium: `0 ${spacing[6]}`,
    large: `0 ${spacing[8]}`
  };
  
  const containerStyles = {
    width: '100%',
    maxWidth: maxWidthStyles[maxWidth] || maxWidthStyles.xl,
    margin: center ? '0 auto' : '0',
    padding: paddingStyles[padding],
    ...props.style
  };
  
  return (
    <div 
      className={className}
      style={containerStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;