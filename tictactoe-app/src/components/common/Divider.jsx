import React from 'react';
import { colors, spacing } from './design-system/tokens';

const Divider = ({
  orientation = 'horizontal',
  thickness = 'thin',
  color = 'neutral',
  margin = 'medium',
  className = '',
  ...props
}) => {
  // Thickness styles
  const thicknessStyles = {
    thin: '1px',
    medium: '2px',
    thick: '4px'
  };
  
  // Color styles
  const colorStyles = {
    neutral: colors.neutral[200],
    light: colors.neutral[100],
    dark: colors.neutral[300],
    primary: colors.primary[200],
    success: colors.success[200],
    warning: colors.warning[200],
    error: colors.error[200]
  };
  
  // Margin styles
  const marginStyles = {
    none: '0',
    small: spacing[2],
    medium: spacing[4],
    large: spacing[6],
    xl: spacing[8]
  };
  
  const dividerStyles = orientation === 'horizontal' 
    ? {
        width: '100%',
        height: thicknessStyles[thickness],
        backgroundColor: colorStyles[color],
        margin: `${marginStyles[margin]} 0`,
        border: 'none'
      }
    : {
        width: thicknessStyles[thickness],
        height: '100%',
        backgroundColor: colorStyles[color],
        margin: `0 ${marginStyles[margin]}`,
        border: 'none'
      };
  
  return (
    <div 
      className={className}
      style={dividerStyles}
      role="separator"
      {...props}
    />
  );
};

export default Divider;