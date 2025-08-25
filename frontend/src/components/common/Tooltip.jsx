import React, { useState, useRef, useEffect } from 'react';
import { colors, spacing, borderRadius, typography, shadows, transitions } from './design-system/tokens';

const Tooltip = ({
  children,
  content,
  position = 'top',
  trigger = 'hover',
  delay = 500,
  className = '',
  ...props
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timeoutRef = useRef(null);
  
  // Position styles
  const getTooltipStyles = () => {
    const baseStyles = {
      position: 'absolute',
      zIndex: 1000,
      backgroundColor: colors.neutral[900],
      color: colors.neutral[0],
      padding: `${spacing[2]} ${spacing[3]}`,
      borderRadius: borderRadius.md,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.sans.join(', '),
      boxShadow: shadows.lg,
      opacity: isVisible ? 1 : 0,
      visibility: isVisible ? 'visible' : 'hidden',
      transition: transitions.fast,
      pointerEvents: 'none',
      maxWidth: '250px',
      whiteSpace: 'normal',
      wordWrap: 'break-word'
    };
    
    const arrowSize = 6;
    
    // Arrow styles
    const arrowStyles = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid'
    };
    
    switch (position) {
      case 'top':
        return {
          tooltip: {
            ...baseStyles,
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: `${arrowSize}px`
          },
          arrow: {
            ...arrowStyles,
            top: '100%',
            left: '50%',
            marginLeft: `-${arrowSize}px`,
            borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
            borderColor: `${colors.neutral[900]} transparent transparent transparent`
          }
        };
      case 'bottom':
        return {
          tooltip: {
            ...baseStyles,
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginTop: `${arrowSize}px`
          },
          arrow: {
            ...arrowStyles,
            bottom: '100%',
            left: '50%',
            marginLeft: `-${arrowSize}px`,
            borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent ${colors.neutral[900]} transparent`
          }
        };
      case 'left':
        return {
          tooltip: {
            ...baseStyles,
            right: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginRight: `${arrowSize}px`
          },
          arrow: {
            ...arrowStyles,
            left: '100%',
            top: '50%',
            marginTop: `-${arrowSize}px`,
            borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
            borderColor: `transparent transparent transparent ${colors.neutral[900]}`
          }
        };
      case 'right':
        return {
          tooltip: {
            ...baseStyles,
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: `${arrowSize}px`
          },
          arrow: {
            ...arrowStyles,
            right: '100%',
            top: '50%',
            marginTop: `-${arrowSize}px`,
            borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
            borderColor: `transparent ${colors.neutral[900]} transparent transparent`
          }
        };
      default:
        return { tooltip: baseStyles, arrow: arrowStyles };
    }
  };
  
  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };
  
  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };
  
  const handleMouseEnter = () => {
    if (trigger === 'hover') {
      showTooltip();
    }
  };
  
  const handleMouseLeave = () => {
    if (trigger === 'hover') {
      hideTooltip();
    }
  };
  
  const handleClick = () => {
    if (trigger === 'click') {
      if (isVisible) {
        hideTooltip();
      } else {
        showTooltip();
      }
    }
  };
  
  const handleFocus = () => {
    if (trigger === 'focus') {
      showTooltip();
    }
  };
  
  const handleBlur = () => {
    if (trigger === 'focus') {
      hideTooltip();
    }
  };
  
  // Handle click outside for click trigger
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      const handleClickOutside = (event) => {
        if (triggerRef.current && !triggerRef.current.contains(event.target)) {
          hideTooltip();
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [trigger, isVisible]);
  
  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  const styles = getTooltipStyles();
  
  if (!content) {
    return children;
  }
  
  return (
    <div
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-block' }}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {children}
      
      <div ref={tooltipRef} style={styles.tooltip}>
        {content}
        <div style={styles.arrow} />
      </div>
    </div>
  );
};

export default Tooltip;