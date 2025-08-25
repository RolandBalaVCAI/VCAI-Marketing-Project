import React from 'react';
import { colors, spacing, borderRadius, shadows, transitions } from './design-system/tokens';

const Card = ({
  children,
  padding = 'medium',
  shadow = 'base',
  border = true,
  hover = false,
  className = '',
  onClick,
  ...props
}) => {
  // Padding styles
  const paddingStyles = {
    none: spacing[0],
    small: spacing[4],
    medium: spacing[6],
    large: spacing[8]
  };
  
  const baseStyles = {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    border: border ? `1px solid ${colors.neutral[200]}` : 'none',
    boxShadow: shadows[shadow],
    padding: paddingStyles[padding],
    cursor: onClick ? 'pointer' : 'default',
    transition: hover ? transitions.normal : 'none'
  };
  
  const handleMouseEnter = (e) => {
    if (hover) {
      e.target.style.boxShadow = shadows.lg;
      e.target.style.transform = 'translateY(-2px)';
    }
  };
  
  const handleMouseLeave = (e) => {
    if (hover) {
      e.target.style.boxShadow = shadows[shadow];
      e.target.style.transform = 'translateY(0)';
    }
  };
  
  return (
    <div
      className={className}
      style={baseStyles}
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;