import React, { useEffect, useState, useRef } from 'react';

const Transition = ({
  children,
  show = true,
  appear = false,
  enter = 'transition-all duration-300 ease-in-out',
  enterFrom = 'opacity-0 transform scale-95',
  enterTo = 'opacity-100 transform scale-100',
  leave = 'transition-all duration-200 ease-in-out',
  leaveFrom = 'opacity-100 transform scale-100',
  leaveTo = 'opacity-0 transform scale-95',
  unmount = true,
  as = 'div',
  style = {},
  onEntered,
  onExited
}) => {
  const [mounted, setMounted] = useState(show);
  const [transitionState, setTransitionState] = useState('idle');
  const timeoutRef = useRef(null);
  
  useEffect(() => {
    if (show) {
      setMounted(true);
      setTransitionState('entering');
      
      // Force browser reflow
      requestAnimationFrame(() => {
        setTransitionState('entered');
      });
      
      // Call onEntered after transition completes
      const enterDuration = parseInt(enter.match(/duration-(\d+)/)?.[1] || '300');
      timeoutRef.current = setTimeout(() => {
        onEntered?.();
      }, enterDuration);
    } else {
      setTransitionState('leaving');
      
      const leaveDuration = parseInt(leave.match(/duration-(\d+)/)?.[1] || '200');
      timeoutRef.current = setTimeout(() => {
        setTransitionState('left');
        if (unmount) {
          setMounted(false);
        }
        onExited?.();
      }, leaveDuration);
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [show]);
  
  if (!mounted && unmount) {
    return null;
  }
  
  // Convert tailwind-like classes to CSS
  const parseClasses = (classes) => {
    const styles = {};
    const classArray = classes.split(' ');
    
    classArray.forEach(cls => {
      if (cls.startsWith('opacity-')) {
        const value = cls.replace('opacity-', '');
        styles.opacity = value === '0' ? 0 : value === '100' ? 1 : parseInt(value) / 100;
      }
      if (cls.includes('scale-')) {
        const value = cls.replace('scale-', '');
        const scale = value === '0' ? 0 : value === '100' ? 1 : parseInt(value) / 100;
        styles.transform = (styles.transform || '') + ` scale(${scale})`;
      }
      if (cls.startsWith('translate-x-')) {
        const value = cls.replace('translate-x-', '');
        styles.transform = (styles.transform || '') + ` translateX(${value}px)`;
      }
      if (cls.startsWith('translate-y-')) {
        const value = cls.replace('translate-y-', '');
        styles.transform = (styles.transform || '') + ` translateY(${value}px)`;
      }
      if (cls.startsWith('duration-')) {
        const value = cls.replace('duration-', '');
        styles.transitionDuration = `${value}ms`;
      }
      if (cls.includes('ease-')) {
        const easing = cls.replace('ease-', '');
        const easingMap = {
          'in': 'ease-in',
          'out': 'ease-out',
          'in-out': 'ease-in-out',
          'linear': 'linear'
        };
        styles.transitionTimingFunction = easingMap[easing] || 'ease';
      }
      if (cls === 'transition-all') {
        styles.transitionProperty = 'all';
      }
      if (cls === 'transition-opacity') {
        styles.transitionProperty = 'opacity';
      }
      if (cls === 'transition-transform') {
        styles.transitionProperty = 'transform';
      }
    });
    
    return styles;
  };
  
  // Get current styles based on transition state
  const getStyles = () => {
    let transitionClasses = '';
    let stateClasses = '';
    
    switch (transitionState) {
      case 'entering':
        transitionClasses = enter;
        stateClasses = enterFrom;
        break;
      case 'entered':
        transitionClasses = enter;
        stateClasses = enterTo;
        break;
      case 'leaving':
        transitionClasses = leave;
        stateClasses = leaveFrom;
        break;
      case 'left':
        transitionClasses = leave;
        stateClasses = leaveTo;
        break;
      default:
        transitionClasses = '';
        stateClasses = appear ? enterFrom : enterTo;
    }
    
    return {
      ...parseClasses(transitionClasses),
      ...parseClasses(stateClasses),
      ...style
    };
  };
  
  const Component = as;
  
  return (
    <Component style={getStyles()}>
      {children}
    </Component>
  );
};

// Fade transition preset
export const FadeTransition = ({ children, ...props }) => (
  <Transition
    enter="transition-opacity duration-300"
    enterFrom="opacity-0"
    enterTo="opacity-100"
    leave="transition-opacity duration-200"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
    {...props}
  >
    {children}
  </Transition>
);

// Scale transition preset
export const ScaleTransition = ({ children, ...props }) => (
  <Transition
    enter="transition-all duration-300"
    enterFrom="opacity-0 scale-95"
    enterTo="opacity-100 scale-100"
    leave="transition-all duration-200"
    leaveFrom="opacity-100 scale-100"
    leaveTo="opacity-0 scale-95"
    {...props}
  >
    {children}
  </Transition>
);

// Slide transition preset
export const SlideTransition = ({ children, direction = 'right', ...props }) => {
  const directionMap = {
    right: { from: 'translate-x-100', to: 'translate-x-0' },
    left: { from: 'translate-x--100', to: 'translate-x-0' },
    up: { from: 'translate-y--100', to: 'translate-y-0' },
    down: { from: 'translate-y-100', to: 'translate-y-0' }
  };
  
  const { from, to } = directionMap[direction] || directionMap.right;
  
  return (
    <Transition
      enter="transition-all duration-300"
      enterFrom={`opacity-0 ${from}`}
      enterTo={`opacity-100 ${to}`}
      leave="transition-all duration-200"
      leaveFrom={`opacity-100 ${to}`}
      leaveTo={`opacity-0 ${from}`}
      {...props}
    >
      {children}
    </Transition>
  );
};

// Collapse transition preset
export const CollapseTransition = ({ children, ...props }) => {
  const [height, setHeight] = useState('auto');
  const contentRef = useRef(null);
  
  useEffect(() => {
    if (contentRef.current) {
      setHeight(props.show ? contentRef.current.scrollHeight : 0);
    }
  }, [props.show]);
  
  return (
    <div
      style={{
        height,
        overflow: 'hidden',
        transition: 'height 300ms ease-in-out',
        ...props.style
      }}
    >
      <div ref={contentRef}>
        {children}
      </div>
    </div>
  );
};

export default Transition;