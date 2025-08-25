import React from 'react';
import { spacing } from './design-system/tokens';

const Flex = ({
  children,
  direction = 'row',
  align = 'stretch',
  justify = 'flex-start',
  gap = 'medium',
  wrap = 'nowrap',
  className = '',
  ...props
}) => {
  // Gap styles
  const gapStyles = {
    none: '0',
    small: spacing[2],
    medium: spacing[4],
    large: spacing[6],
    xl: spacing[8]
  };
  
  const flexStyles = {
    display: 'flex',
    flexDirection: direction,
    alignItems: align,
    justifyContent: justify,
    gap: gapStyles[gap],
    flexWrap: wrap,
    ...props.style
  };
  
  return (
    <div 
      className={className}
      style={flexStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export default Flex;