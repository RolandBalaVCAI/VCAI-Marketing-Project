import React from 'react';
import { spacing } from './design-system/tokens';

const Grid = ({
  children,
  columns = 12,
  gap = 'medium',
  responsive = false,
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
  
  const gridStyles = {
    display: 'grid',
    gridTemplateColumns: responsive 
      ? `repeat(auto-fit, minmax(250px, 1fr))`
      : `repeat(${columns}, 1fr)`,
    gap: gapStyles[gap],
    width: '100%',
    ...props.style
  };
  
  return (
    <div 
      className={className}
      style={gridStyles}
      {...props}
    >
      {children}
    </div>
  );
};

// Grid Item component
export const GridItem = ({
  children,
  span = 1,
  start,
  end,
  className = '',
  ...props
}) => {
  const itemStyles = {
    gridColumn: start && end 
      ? `${start} / ${end}`
      : span > 1 
        ? `span ${span}`
        : 'auto',
    ...props.style
  };
  
  return (
    <div 
      className={className}
      style={itemStyles}
      {...props}
    >
      {children}
    </div>
  );
};

export default Grid;