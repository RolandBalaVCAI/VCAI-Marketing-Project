# Phase 2 Task 1: Create Shared Components Library

## Objective
Build a comprehensive shared components library to eliminate code duplication, ensure consistent UI patterns, and improve maintainability across the application.

## Current State
- Inline styles scattered throughout components
- Repeated UI patterns (buttons, inputs, cards)
- Inconsistent styling and behavior
- No reusable component system

## Target State
- Comprehensive shared components library
- Consistent design system with theme support
- Reusable components with proper prop interfaces
- Reduced code duplication following DRY principles

## Implementation Steps

### 1. Create Base Design System
Establish consistent design tokens:
- Color palette and semantic colors
- Typography scale and font weights
- Spacing system and grid
- Border radius and shadows
- Animation and transition values

### 2. Build Core Components
Create fundamental UI components:
- Button variations and states
- Input components with validation
- Card layouts and containers
- Modal and dialog components
- Navigation components

### 3. Create Layout Components
Build layout and structural components:
- Grid and flex containers
- Responsive layout helpers
- Page layouts and sections
- Header and footer components

### 4. Implement Form Components
Create form-specific components:
- Form containers with validation
- Input groups and field sets
- Select and dropdown components
- Date and file inputs

## Detailed Implementation

### Design System (`src/components/common/design-system/tokens.js`)
```javascript
// Color palette
export const colors = {
  // Primary colors
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    900: '#1e3a8a'
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    900: '#0f172a'
  },
  
  // Success colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d'
  },
  
  // Error colors
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c'
  },
  
  // Warning colors
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309'
  },
  
  // Neutral colors
  neutral: {
    0: '#ffffff',
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  }
}

// Typography
export const typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
    mono: ['ui-monospace', 'SFMono-Regular', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace']
  },
  
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem', // 30px
    '4xl': '2.25rem'  // 36px
  },
  
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  
  lineHeight: {
    tight: '1.25',
    normal: '1.5',
    relaxed: '1.75'
  }
}

// Spacing system (based on 4px grid)
export const spacing = {
  0: '0',
  1: '0.25rem',  // 4px
  2: '0.5rem',   // 8px
  3: '0.75rem',  // 12px
  4: '1rem',     // 16px
  5: '1.25rem',  // 20px
  6: '1.5rem',   // 24px
  8: '2rem',     // 32px
  10: '2.5rem',  // 40px
  12: '3rem',    // 48px
  16: '4rem',    // 64px
  20: '5rem',    // 80px
  24: '6rem'     // 96px
}

// Border radius
export const borderRadius = {
  none: '0',
  sm: '0.125rem',   // 2px
  base: '0.25rem',  // 4px
  md: '0.375rem',   // 6px
  lg: '0.5rem',     // 8px
  xl: '0.75rem',    // 12px
  full: '9999px'
}

// Shadows
export const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
}

// Breakpoints
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
}

// Transitions
export const transitions = {
  fast: '150ms ease-in-out',
  normal: '250ms ease-in-out',
  slow: '350ms ease-in-out'
}
```

### Button Component (`src/components/common/Button.jsx`)
```javascript
import React from 'react'
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens'

const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  // Variant styles
  const variantStyles = {
    primary: {
      backgroundColor: disabled ? colors.neutral[300] : colors.primary[600],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.primary[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.primary[800]
      }
    },
    secondary: {
      backgroundColor: colors.neutral[0],
      color: colors.primary[600],
      border: `1px solid ${colors.primary[600]}`,
      ':hover': !disabled && {
        backgroundColor: colors.primary[50]
      },
      ':active': !disabled && {
        backgroundColor: colors.primary[100]
      }
    },
    danger: {
      backgroundColor: disabled ? colors.neutral[300] : colors.error[600],
      color: colors.neutral[0],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.error[700]
      },
      ':active': !disabled && {
        backgroundColor: colors.error[800]
      }
    },
    ghost: {
      backgroundColor: 'transparent',
      color: colors.neutral[700],
      border: 'none',
      ':hover': !disabled && {
        backgroundColor: colors.neutral[100]
      },
      ':active': !disabled && {
        backgroundColor: colors.neutral[200]
      }
    }
  }
  
  // Size styles
  const sizeStyles = {
    small: {
      padding: `${spacing[2]} ${spacing[3]}`,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium
    },
    medium: {
      padding: `${spacing[3]} ${spacing[4]}`,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium
    },
    large: {
      padding: `${spacing[4]} ${spacing[6]}`,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold
    }
  }
  
  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    borderRadius: borderRadius.md,
    fontFamily: typography.fontFamily.sans.join(', '),
    lineHeight: typography.lineHeight.tight,
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: transitions.fast,
    outline: 'none',
    width: fullWidth ? '100%' : 'auto',
    ...sizeStyles[size],
    ...variantStyles[variant]
  }
  
  const handleClick = (e) => {
    if (disabled || loading) return
    onClick?.(e)
  }
  
  const handleMouseEnter = (e) => {
    if (disabled || loading) return
    const hoverStyles = variantStyles[variant][':hover']
    if (hoverStyles) {
      Object.assign(e.target.style, hoverStyles)
    }
  }
  
  const handleMouseLeave = (e) => {
    if (disabled || loading) return
    // Reset to base styles
    Object.assign(e.target.style, {
      backgroundColor: variantStyles[variant].backgroundColor,
      color: variantStyles[variant].color
    })
  }
  
  return (
    <button
      type={type}
      className={className}
      style={baseStyles}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          style={{ animation: 'spin 1s linear infinite' }}
        >
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      )}
      
      {!loading && icon && iconPosition === 'left' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
      
      {children}
      
      {!loading && icon && iconPosition === 'right' && (
        <span style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
        </span>
      )}
    </button>
  )
}

export default Button
```

### Input Component (`src/components/common/Input.jsx`)
```javascript
import React, { useState } from 'react'
import { colors, spacing, borderRadius, typography, transitions } from './design-system/tokens'

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
  const [focused, setFocused] = useState(false)
  
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
  }
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing[2],
    width: fullWidth ? '100%' : 'auto'
  }
  
  const labelStyles = {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: error ? colors.error[600] : colors.neutral[700],
    fontFamily: typography.fontFamily.sans.join(', ')
  }
  
  const inputContainerStyles = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  }
  
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
  }
  
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
  }
  
  const leftIconStyles = {
    ...iconStyles,
    left: spacing[3]
  }
  
  const rightIconStyles = {
    ...iconStyles,
    right: spacing[3]
  }
  
  const helperTextStyles = {
    fontSize: typography.fontSize.sm,
    color: error ? colors.error[600] : colors.neutral[600],
    fontFamily: typography.fontFamily.sans.join(', ')
  }
  
  const handleFocus = () => setFocused(true)
  const handleBlur = () => setFocused(false)
  
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
  )
}

export default Input
```

### Card Component (`src/components/common/Card.jsx`)
```javascript
import React from 'react'
import { colors, spacing, borderRadius, shadows } from './design-system/tokens'

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
  }
  
  const baseStyles = {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    border: border ? `1px solid ${colors.neutral[200]}` : 'none',
    boxShadow: shadows[shadow],
    padding: paddingStyles[padding],
    cursor: onClick ? 'pointer' : 'default',
    transition: hover ? transitions.normal : 'none'
  }
  
  const hoverStyles = hover ? {
    ':hover': {
      boxShadow: shadows.lg,
      transform: 'translateY(-2px)'
    }
  } : {}
  
  const handleMouseEnter = (e) => {
    if (hover) {
      e.target.style.boxShadow = shadows.lg
      e.target.style.transform = 'translateY(-2px)'
    }
  }
  
  const handleMouseLeave = (e) => {
    if (hover) {
      e.target.style.boxShadow = shadows[shadow]
      e.target.style.transform = 'translateY(0)'
    }
  }
  
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
  )
}

export default Card
```

### Modal Component (`src/components/common/Modal.jsx`)
```javascript
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { colors, spacing, borderRadius, shadows, transitions } from './design-system/tokens'
import Button from './Button'

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  showCloseButton = true,
  closeOnOverlayClick = true,
  className = ''
}) => {
  // Size styles
  const sizeStyles = {
    small: {
      width: '400px',
      maxWidth: '90vw'
    },
    medium: {
      width: '600px',
      maxWidth: '90vw'
    },
    large: {
      width: '800px',
      maxWidth: '95vw'
    },
    full: {
      width: '95vw',
      height: '95vh'
    }
  }
  
  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[4],
    opacity: isOpen ? 1 : 0,
    visibility: isOpen ? 'visible' : 'hidden',
    transition: transitions.normal
  }
  
  const modalStyles = {
    backgroundColor: colors.neutral[0],
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    maxHeight: '90vh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transform: isOpen ? 'scale(1)' : 'scale(0.95)',
    transition: transitions.normal,
    ...sizeStyles[size]
  }
  
  const headerStyles = {
    padding: spacing[6],
    borderBottom: `1px solid ${colors.neutral[200]}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  }
  
  const titleStyles = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: colors.neutral[900],
    margin: 0
  }
  
  const contentStyles = {
    padding: spacing[6],
    overflowY: 'auto',
    flex: 1
  }
  
  const closeButtonStyles = {
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: spacing[1],
    borderRadius: borderRadius.base,
    color: colors.neutral[500],
    transition: transitions.fast
  }
  
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose()
    }
  }
  
  if (!isOpen) return null
  
  return (
    <div style={overlayStyles} onClick={handleOverlayClick}>
      <div style={modalStyles} className={className}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = colors.neutral[100]
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent'
                }}
              >
                <X size={20} />
              </button>
            )}
          </div>
        )}
        
        <div style={contentStyles}>
          {children}
        </div>
      </div>
    </div>
  )
}

export default Modal
```

## Testing Criteria
- [ ] All components render correctly with default props
- [ ] Component variants and sizes work as expected
- [ ] Hover and focus states function properly
- [ ] Components are keyboard accessible
- [ ] Responsive behavior works on different screen sizes
- [ ] Design tokens provide consistent styling
- [ ] Components can be composed together effectively
- [ ] No style conflicts or CSS bleeding

## Definition of Done
- Comprehensive shared components library created
- Consistent design system with theme tokens
- All components properly documented with prop interfaces
- Components are reusable and composable
- Accessibility considerations implemented
- Responsive design patterns established
- Code duplication eliminated across the app
- Components follow established naming conventions

## Files to Create
- `src/components/common/design-system/tokens.js`
- `src/components/common/Button.jsx`
- `src/components/common/Input.jsx`
- `src/components/common/Card.jsx`
- `src/components/common/Modal.jsx`
- `src/components/common/Select.jsx`
- `src/components/common/Checkbox.jsx`
- `src/components/common/RadioButton.jsx`
- `src/components/common/index.js` (exports)

## Dependencies
- Completed Phase 1 (Mock API and Zustand setup)
- Lucide React icons

## Estimated Time
8-10 hours