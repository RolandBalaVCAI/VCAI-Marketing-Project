# Phase 2 Task 5: Implement Loading States and Skeletons

## Objective
Implement comprehensive loading states and skeleton screens throughout the application to provide better user experience during data fetching and async operations.

## Current State
- Basic loading spinners in some components
- Inconsistent loading state management
- No skeleton screens for content loading
- Poor user experience during data transitions

## Target State
- Comprehensive loading state system
- Skeleton screens for all major content areas
- Smooth transitions between loading and content states
- Contextual loading indicators for different operations

## Implementation Steps

### 1. Enhanced Loading Components
Create various loading components:
- Skeleton screens for different content types
- Loading spinners with contextual messages
- Progress indicators for file uploads
- Shimmer effects for smooth transitions

### 2. Loading State Management
Implement loading state coordination:
- Global loading state management
- Component-level loading states
- Operation-specific loading indicators
- Loading state composition and priority

### 3. Skeleton Screen Templates
Create skeleton templates for:
- Campaign table and cards
- Dashboard KPI cards
- Chart loading states
- Form loading states

### 4. Progressive Loading
Implement progressive loading patterns:
- Lazy loading for large datasets
- Incremental data loading
- Background refresh indicators
- Error state transitions

## Detailed Implementation

### Enhanced Skeleton Components (`src/components/common/Skeleton.jsx`)
```javascript
import React from 'react'
import { colors, borderRadius, spacing } from './design-system/tokens'

// Add keyframes to document head if not already present
const addSkeletonKeyframes = () => {
  const keyframesId = 'skeleton-keyframes'
  if (document.getElementById(keyframesId)) return
  
  const style = document.createElement('style')
  style.id = keyframesId
  style.textContent = `
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    
    @keyframes skeleton-pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
  `
  document.head.appendChild(style)
}

// Initialize keyframes
if (typeof window !== 'undefined') {
  addSkeletonKeyframes()
}

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius: borderRadius.base,
  className = '',
  variant = 'shimmer', // 'shimmer', 'pulse', 'wave'
  ...props 
}) => {
  const baseStyles = {
    width,
    height,
    borderRadius,
    backgroundColor: colors.neutral[200],
    display: 'inline-block',
    ...props.style
  }
  
  const variantStyles = {
    shimmer: {
      backgroundImage: `linear-gradient(90deg, ${colors.neutral[200]} 0%, ${colors.neutral[100]} 50%, ${colors.neutral[200]} 100%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s ease-in-out infinite'
    },
    pulse: {
      animation: 'skeleton-pulse 2s ease-in-out infinite'
    },
    wave: {
      backgroundImage: `linear-gradient(90deg, transparent 0%, ${colors.neutral[100]} 50%, transparent 100%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 2s ease-in-out infinite'
    }
  }
  
  return (
    <div
      className={className}
      style={{
        ...baseStyles,
        ...variantStyles[variant]
      }}
      {...props}
    />
  )
}

// Skeleton component variations
export const SkeletonText = ({ lines = 1, lastLineWidth = '75%', ...props }) => (
  <div>
    {Array.from({ length: lines }, (_, index) => (
      <Skeleton
        key={index}
        width={index === lines - 1 ? lastLineWidth : '100%'}
        height="16px"
        style={{ 
          marginBottom: index < lines - 1 ? spacing[2] : 0,
          display: 'block'
        }}
        {...props}
      />
    ))}
  </div>
)

export const SkeletonAvatar = ({ size = 40, ...props }) => (
  <Skeleton
    width={`${size}px`}
    height={`${size}px`}
    borderRadius="50%"
    {...props}
  />
)

export const SkeletonButton = ({ width = '100px', ...props }) => (
  <Skeleton
    width={width}
    height="36px"
    borderRadius={borderRadius.md}
    {...props}
  />
)

export default Skeleton
```

### Campaign Table Skeleton (`src/components/common/skeletons/CampaignTableSkeleton.jsx`)
```javascript
import React from 'react'
import { Skeleton, SkeletonText } from '../Skeleton'
import Card from '../Card'
import { spacing } from '../design-system/tokens'

const CampaignTableSkeleton = ({ rows = 5 }) => {
  return (
    <Card>
      {/* Header */}
      <div style={{
        padding: spacing[6],
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Skeleton width="200px" height="24px" />
        <Skeleton width="120px" height="36px" />
      </div>
      
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gap: spacing[4],
        padding: `${spacing[4]} ${spacing[6]}`,
        backgroundColor: '#f8f8f8',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} width="80%" height="16px" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: spacing[4],
            padding: `${spacing[4]} ${spacing[6]}`,
            borderBottom: rowIndex < rows - 1 ? '1px solid #f0f0f0' : 'none'
          }}
        >
          {/* Campaign Name */}
          <div>
            <SkeletonText lines={2} lastLineWidth="60%" />
          </div>
          
          {/* Status */}
          <Skeleton width="60px" height="24px" borderRadius="12px" />
          
          {/* Numeric columns */}
          {Array.from({ length: 6 }, (_, colIndex) => (
            <Skeleton key={colIndex} width="70%" height="16px" />
          ))}
        </div>
      ))}
      
      {/* Pagination */}
      <div style={{
        padding: spacing[4],
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Skeleton width="150px" height="16px" />
        <div style={{ display: 'flex', gap: spacing[2] }}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} width="32px" height="32px" />
          ))}
        </div>
      </div>
    </Card>
  )
}

export default CampaignTableSkeleton
```

### KPI Cards Skeleton (`src/components/common/skeletons/KPICardsSkeleton.jsx`)
```javascript
import React from 'react'
import { Skeleton } from '../Skeleton'
import Card from '../Card'
import { spacing } from '../design-system/tokens'

const KPICardSkeleton = () => (
  <Card padding="medium">
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: spacing[3]
    }}>
      <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
      <Skeleton width="100px" height="14px" />
    </div>
    <Skeleton width="120px" height="32px" style={{ marginBottom: spacing[2] }} />
    <Skeleton width="80px" height="12px" />
  </Card>
)

const KPICardsSkeleton = ({ cards = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: spacing[4],
      marginBottom: spacing[6]
    }}>
      {Array.from({ length: cards }, (_, index) => (
        <KPICardSkeleton key={index} />
      ))}
    </div>
  )
}

export default KPICardsSkeleton
```

### Chart Skeleton (`src/components/common/skeletons/ChartSkeleton.jsx`)
```javascript
import React from 'react'
import { Skeleton } from '../Skeleton'
import Card from '../Card'
import { spacing } from '../design-system/tokens'

const ChartSkeleton = ({ title = true, height = '300px' }) => {
  return (
    <Card padding="medium">
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing[5]
        }}>
          <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
          <Skeleton width="150px" height="20px" />
        </div>
      )}
      
      <div style={{
        height,
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-between',
        gap: spacing[2],
        marginBottom: spacing[4]
      }}>
        {/* Chart bars/lines simulation */}
        {Array.from({ length: 12 }, (_, index) => {
          const randomHeight = Math.random() * 0.7 + 0.3 // 30-100% height
          return (
            <Skeleton
              key={index}
              width="20px"
              height={`${randomHeight * 80}%`}
              style={{ alignSelf: 'flex-end' }}
            />
          )
        })}
      </div>
      
      {/* X-axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: spacing[2]
      }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} width="40px" height="12px" />
        ))}
      </div>
    </Card>
  )
}

export default ChartSkeleton
```

### Campaign Detail Skeleton (`src/components/common/skeletons/CampaignDetailSkeleton.jsx`)
```javascript
import React from 'react'
import { Skeleton, SkeletonText } from '../Skeleton'
import Card from '../Card'
import { spacing } from '../design-system/tokens'

const CampaignDetailSkeleton = () => {
  return (
    <div style={{ padding: spacing[4] }}>
      {/* Header */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <Skeleton width="120px" height="36px" />
          </div>
          <Skeleton width="100px" height="36px" />
        </div>
      </Card>
      
      {/* Campaign Info */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <Skeleton width="180px" height="24px" style={{ marginBottom: spacing[5] }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing[6]
        }}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <Skeleton width="100px" height="14px" style={{ marginBottom: spacing[2] }} />
              <Skeleton width="100%" height="40px" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Performance Metrics */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing[5]
        }}>
          <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
          <Skeleton width="180px" height="20px" />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4]
        }}>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              style={{
                padding: spacing[4],
                backgroundColor: '#f8f8f8',
                borderRadius: '6px',
                borderLeft: '4px solid #e0e0e0'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: spacing[2]
              }}>
                <Skeleton width="16px" height="16px" style={{ marginRight: spacing[2] }} />
                <Skeleton width="80px" height="13px" />
              </div>
              <Skeleton width="100px" height="24px" style={{ marginBottom: spacing[1] }} />
              <Skeleton width="60px" height="12px" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Sections */}
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <Card key={sectionIndex} padding="medium" style={{ marginBottom: spacing[6] }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[5]
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
              <Skeleton width="150px" height="20px" />
            </div>
            <Skeleton width="100px" height="32px" />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[4]
          }}>
            {Array.from({ length: 4 }, (_, itemIndex) => (
              <div key={itemIndex}>
                <Skeleton width="100%" height="120px" style={{ marginBottom: spacing[3] }} />
                <SkeletonText lines={2} />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  )
}

export default CampaignDetailSkeleton
```

### Loading State Manager (`src/hooks/useLoadingState.js`)
```javascript
import { useState, useCallback, useRef, useEffect } from 'react'

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState)
  const [loadingOperations, setLoadingOperations] = useState(new Map())
  const timeoutRef = useRef(null)
  
  // Set global loading state
  const setLoading = useCallback((loading, delay = 0) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setIsLoading(loading)
      }, delay)
    } else {
      setIsLoading(loading)
    }
  }, [])
  
  // Set loading state for specific operation
  const setOperationLoading = useCallback((operationId, loading) => {
    setLoadingOperations(prev => {
      const next = new Map(prev)
      if (loading) {
        next.set(operationId, true)
      } else {
        next.delete(operationId)
      }
      return next
    })
  }, [])
  
  // Check if specific operation is loading
  const isOperationLoading = useCallback((operationId) => {
    return loadingOperations.has(operationId)
  }, [loadingOperations])
  
  // Check if any operation is loading
  const hasLoadingOperations = loadingOperations.size > 0
  
  // Wrapper for async operations with loading state
  const withLoading = useCallback(async (asyncFn, operationId) => {
    if (operationId) {
      setOperationLoading(operationId, true)
    } else {
      setLoading(true)
    }
    
    try {
      const result = await asyncFn()
      return result
    } finally {
      if (operationId) {
        setOperationLoading(operationId, false)
      } else {
        setLoading(false)
      }
    }
  }, [setLoading, setOperationLoading])
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])
  
  return {
    isLoading,
    hasLoadingOperations,
    loadingOperations: Array.from(loadingOperations.keys()),
    setLoading,
    setOperationLoading,
    isOperationLoading,
    withLoading
  }
}

// Hook for progressive loading
export const useProgressiveLoading = (items = [], chunkSize = 10, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState([])
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(items.length > chunkSize)
  
  // Initialize with first chunk
  useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, chunkSize))
      setHasMore(items.length > chunkSize)
    } else {
      setVisibleItems([])
      setHasMore(false)
    }
  }, [items, chunkSize])
  
  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return
    
    setIsLoadingMore(true)
    
    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, delay))
    
    setVisibleItems(prev => {
      const nextChunk = items.slice(prev.length, prev.length + chunkSize)
      const newItems = [...prev, ...nextChunk]
      setHasMore(newItems.length < items.length)
      return newItems
    })
    
    setIsLoadingMore(false)
  }, [items, chunkSize, delay, isLoadingMore, hasMore])
  
  // Load all remaining items
  const loadAll = useCallback(async () => {
    if (isLoadingMore) return
    
    setIsLoadingMore(true)
    await new Promise(resolve => setTimeout(resolve, delay))
    
    setVisibleItems(items)
    setHasMore(false)
    setIsLoadingMore(false)
  }, [items, delay, isLoadingMore])
  
  return {
    visibleItems,
    isLoadingMore,
    hasMore,
    loadMore,
    loadAll,
    progress: items.length > 0 ? (visibleItems.length / items.length) * 100 : 0
  }
}

// Hook for transition states
export const useTransitionState = (delay = 300) => {
  const [isVisible, setIsVisible] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const transition = useCallback(async (callback) => {
    setIsTransitioning(true)
    setIsVisible(false)
    
    await new Promise(resolve => setTimeout(resolve, delay))
    
    if (callback) {
      await callback()
    }
    
    setIsVisible(true)
    setIsTransitioning(false)
  }, [delay])
  
  return {
    isVisible,
    isTransitioning,
    transition
  }
}
```

### Enhanced Loading Components (`src/components/common/LoadingSpinner.jsx`)
```javascript
import React from 'react'
import { Loader2, RefreshCw, Upload, Download } from 'lucide-react'
import { colors, spacing, typography } from './design-system/tokens'

const LoadingSpinner = ({ 
  size = 24, 
  message = 'Loading...', 
  show = true,
  inline = false,
  variant = 'default', // 'default', 'refresh', 'upload', 'download'
  progress,
  color = colors.primary[600]
}) => {
  if (!show) return null
  
  const icons = {
    default: Loader2,
    refresh: RefreshCw,
    upload: Upload,
    download: Download
  }
  
  const Icon = icons[variant] || Loader2
  
  const containerStyle = inline 
    ? { display: 'inline-flex', alignItems: 'center', gap: spacing[2] }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[10],
        backgroundColor: colors.neutral[0],
        borderRadius: '8px',
        border: `1px solid ${colors.neutral[200]}`
      }
  
  return (
    <div style={containerStyle}>
      <div style={{ position: 'relative', display: 'inline-flex' }}>
        <Icon 
          size={size} 
          style={{ 
            color, 
            animation: 'spin 1s linear infinite' 
          }} 
        />
        
        {progress !== undefined && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: `${size * 0.3}px`,
            fontWeight: typography.fontWeight.bold,
            color
          }}>
            {Math.round(progress)}
          </div>
        )}
      </div>
      
      {message && (
        <span style={{
          color: colors.neutral[600],
          fontSize: typography.fontSize.sm,
          fontWeight: typography.fontWeight.medium,
          marginTop: inline ? 0 : spacing[3],
          textAlign: 'center'
        }}>
          {message}
        </span>
      )}
      
      {progress !== undefined && (
        <div style={{
          width: '200px',
          height: '4px',
          backgroundColor: colors.neutral[200],
          borderRadius: '2px',
          marginTop: spacing[3],
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progress}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: '2px',
            transition: 'width 0.3s ease'
          }} />
        </div>
      )}
    </div>
  )
}

export default LoadingSpinner
```

## Testing Criteria
- [ ] Skeleton screens display correctly for all major content areas
- [ ] Loading states transition smoothly to content
- [ ] Progressive loading works properly with large datasets
- [ ] Loading indicators show appropriate messages and progress
- [ ] Loading states don't interfere with user interactions
- [ ] Skeleton layouts match actual content structure
- [ ] Loading state priorities work correctly
- [ ] Performance remains good with loading animations

## Definition of Done
- Comprehensive skeleton screens for all major UI sections
- Smooth loading state transitions throughout the application
- Progressive loading for improved performance with large datasets
- Contextual loading indicators with appropriate messaging
- Loading state management integrated with existing stores
- Consistent loading experience across all components
- All existing functionality preserved with enhanced loading UX

## Files to Create/Modify
- Update `src/components/common/Skeleton.jsx`
- `src/components/common/skeletons/CampaignTableSkeleton.jsx`
- `src/components/common/skeletons/KPICardsSkeleton.jsx`
- `src/components/common/skeletons/ChartSkeleton.jsx`
- `src/components/common/skeletons/CampaignDetailSkeleton.jsx`
- `src/hooks/useLoadingState.js`
- Update `src/components/common/LoadingSpinner.jsx`
- Update components to use skeleton screens

## Dependencies
- Completed Phase 2 Task 4 (Extract Business Logic)
- Enhanced design system tokens

## Estimated Time
4-6 hours