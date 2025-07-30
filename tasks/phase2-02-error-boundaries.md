# Phase 2 Task 2: Implement Proper Error Boundaries

## Objective
Create comprehensive error boundaries for React components to handle rendering errors gracefully, provide meaningful error messages, and prevent the entire application from crashing.

## Current State
- Basic ErrorBoundary component exists
- Limited error handling and recovery options
- No error reporting or logging system
- No differentiated error handling for different component types

## Target State
- Comprehensive error boundary system
- Granular error handling for different component sections
- Error reporting and logging capabilities
- User-friendly error recovery options
- Development vs production error displays

## Implementation Steps

### 1. Enhanced Error Boundary Components
Create specialized error boundaries for different use cases:
- Global app-level error boundary
- Page-level error boundaries
- Component-specific error boundaries
- Async operation error boundaries

### 2. Error Logging and Reporting
Implement error tracking:
- Console logging for development
- Error reporting service integration (placeholder)
- User session and context capture
- Error categorization and tagging

### 3. Error Recovery Mechanisms
Add recovery options:
- Retry functionality for transient errors
- Fallback UI components
- State reset capabilities
- Navigation recovery

### 4. User Experience Enhancements
Improve error UX:
- Context-aware error messages
- Progressive error disclosure
- Help and support links
- Feedback collection

## Detailed Implementation

### Base Error Boundary (`src/components/common/ErrorBoundary.jsx`)
```javascript
import React from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'
import { colors, spacing, typography, borderRadius, shadows } from './design-system/tokens'
import Button from './Button'
import Card from './Card'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    }
  }
  
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    }
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    })
    
    // Log error with context
    this.logError(error, errorInfo)
  }
  
  logError = (error, errorInfo) => {
    const errorContext = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount,
      boundaryName: this.props.name || 'Unknown',
      userId: this.props.userId || null,
      ...this.props.context
    }
    
    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Triggered')
      console.error('Error:', error)
      console.error('Error Info:', errorInfo)
      console.error('Context:', errorContext)
      console.groupEnd()
    }
    
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.reportError(errorContext)
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorContext)
    }
  }
  
  reportError = (errorContext) => {
    // Placeholder for error reporting service
    // In a real app, you'd integrate with Sentry, Bugsnag, etc.
    console.log('Reporting error to service:', errorContext)
    
    // Example integration:
    // window.errorTracker?.captureException(errorContext.error, {
    //   tags: {
    //     boundary: errorContext.boundaryName,
    //     retryCount: errorContext.retryCount
    //   },
    //   extra: errorContext
    // })
  }
  
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }))
    
    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry()
    }
  }
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    })
    
    // Reset app state if handler provided
    if (this.props.onReset) {
      this.props.onReset()
    }
  }
  
  handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome()
    } else {
      window.location.href = '/'
    }
  }
  
  renderError = () => {
    const {
      level = 'component',
      showDetails = process.env.NODE_ENV === 'development',
      allowRetry = true,
      allowReset = true,
      allowNavigation = true,
      customMessage,
      customActions
    } = this.props
    
    const { error, errorInfo, retryCount } = this.state
    
    // Different layouts based on error level
    const containerStyles = {
      component: {
        padding: spacing[6],
        textAlign: 'center',
        minHeight: '200px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      },
      page: {
        padding: spacing[8],
        textAlign: 'center',
        minHeight: '400px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center'
      },
      app: {
        padding: spacing[10],
        textAlign: 'center',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.neutral[50]
      }
    }
    
    const iconSizes = {
      component: 32,
      page: 48,
      app: 64
    }
    
    const titleSizes = {
      component: typography.fontSize.lg,
      page: typography.fontSize.xl,
      app: typography.fontSize['2xl']
    }
    
    const maxRetries = 3
    const canRetry = allowRetry && retryCount < maxRetries
    
    return (
      <div style={containerStyles[level]}>
        <Card padding={level === 'app' ? 'large' : 'medium'}>
          {/* Error Icon */}
          <AlertTriangle 
            size={iconSizes[level]} 
            style={{ 
              color: colors.error[500], 
              marginBottom: spacing[4] 
            }} 
          />
          
          {/* Error Title */}
          <h2 style={{
            fontSize: titleSizes[level],
            fontWeight: typography.fontWeight.semibold,
            color: colors.neutral[900],
            margin: `0 0 ${spacing[3]} 0`
          }}>
            {customMessage || this.getErrorMessage(level)}
          </h2>
          
          {/* Error Description */}
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.neutral[600],
            margin: `0 0 ${spacing[6]} 0`,
            maxWidth: '500px',
            lineHeight: typography.lineHeight.relaxed
          }}>
            {this.getErrorDescription(level, error)}
          </p>
          
          {/* Retry Information */}
          {retryCount > 0 && (
            <p style={{
              fontSize: typography.fontSize.sm,
              color: colors.warning[600],
              margin: `0 0 ${spacing[4]} 0`
            }}>
              Retry attempts: {retryCount} / {maxRetries}
            </p>
          )}
          
          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: spacing[3],
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            {canRetry && (
              <Button
                variant="primary"
                icon={<RefreshCw size={16} />}
                onClick={this.handleRetry}
              >
                Try Again
              </Button>
            )}
            
            {allowReset && level !== 'app' && (
              <Button
                variant="secondary"
                onClick={this.handleReset}
              >
                Reset
              </Button>
            )}
            
            {allowNavigation && level !== 'component' && (
              <Button
                variant="secondary"
                icon={<Home size={16} />}
                onClick={this.handleGoHome}
              >
                Go Home
              </Button>
            )}
            
            {customActions}
          </div>
          
          {/* Error Details (Development Only) */}
          {showDetails && (
            <details style={{
              marginTop: spacing[6],
              textAlign: 'left',
              width: '100%',
              maxWidth: '600px'
            }}>
              <summary style={{
                cursor: 'pointer',
                fontSize: typography.fontSize.sm,
                color: colors.neutral[600],
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2]
              }}>
                <Bug size={16} />
                Technical Details (Development)
              </summary>
              
              <div style={{
                marginTop: spacing[3],
                padding: spacing[4],
                backgroundColor: colors.neutral[900],
                color: colors.neutral[100],
                borderRadius: borderRadius.md,
                fontSize: typography.fontSize.sm,
                fontFamily: typography.fontFamily.mono.join(', '),
                overflow: 'auto'
              }}>
                <div style={{ marginBottom: spacing[3] }}>
                  <strong>Error:</strong> {error?.message}
                </div>
                
                <div style={{ marginBottom: spacing[3] }}>
                  <strong>Stack Trace:</strong>
                  <pre style={{ whiteSpace: 'pre-wrap' }}>
                    {error?.stack}
                  </pre>
                </div>
                
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component Stack:</strong>
                    <pre style={{ whiteSpace: 'pre-wrap' }}>
                      {errorInfo.componentStack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </Card>
      </div>
    )
  }
  
  getErrorMessage = (level) => {
    const messages = {
      component: 'Component Error',
      page: 'Page Error',
      app: 'Application Error'
    }
    return messages[level] || 'Something went wrong'
  }
  
  getErrorDescription = (level, error) => {
    if (process.env.NODE_ENV === 'development') {
      return error?.message || 'An unexpected error occurred during rendering.'
    }
    
    const descriptions = {
      component: 'This component encountered an error and could not be displayed.',
      page: 'This page encountered an error and could not be loaded properly.',
      app: 'The application encountered an unexpected error. Please try refreshing the page.'
    }
    
    return descriptions[level] || 'An unexpected error occurred.'
  }
  
  render() {
    if (this.state.hasError) {
      return this.renderError()
    }
    
    return this.props.children
  }
}

export default ErrorBoundary
```

### Async Error Boundary (`src/components/common/AsyncErrorBoundary.jsx`)
```javascript
import React, { useState, useEffect } from 'react'
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { colors, spacing } from './design-system/tokens'
import Button from './Button'
import Card from './Card'

const AsyncErrorBoundary = ({ 
  children, 
  fallback: CustomFallback,
  onRetry,
  retryDelay = 1000
}) => {
  const [error, setError] = useState(null)
  const [retrying, setRetrying] = useState(false)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  // Listen for async errors from children
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason)
      setError({
        type: 'async',
        message: event.reason?.message || 'Async operation failed',
        isNetworkError: !isOnline || event.reason?.code === 'NETWORK_ERROR'
      })
      event.preventDefault()
    }
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection)
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [isOnline])
  
  const handleRetry = async () => {
    setRetrying(true)
    setError(null)
    
    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay))
      
      // Call custom retry handler
      if (onRetry) {
        await onRetry()
      }
    } catch (retryError) {
      setError({
        type: 'retry',
        message: retryError.message || 'Retry failed',
        isNetworkError: !isOnline
      })
    } finally {
      setRetrying(false)
    }
  }
  
  const handleClearError = () => {
    setError(null)
  }
  
  // Custom fallback component
  if (CustomFallback && error) {
    return (
      <CustomFallback
        error={error}
        onRetry={handleRetry}
        onClear={handleClearError}
        retrying={retrying}
        isOnline={isOnline}
      />
    )
  }
  
  // Default fallback UI
  if (error) {
    return (
      <Card padding="medium">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[3],
          marginBottom: spacing[4]
        }}>
          {error.isNetworkError ? (
            <WifiOff size={20} style={{ color: colors.error[500] }} />
          ) : (
            <AlertCircle size={20} style={{ color: colors.error[500] }} />
          )}
          
          <div>
            <h4 style={{
              margin: 0,
              color: colors.error[700],
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {error.isNetworkError ? 'Connection Error' : 'Operation Failed'}
            </h4>
            <p style={{
              margin: `${spacing[1]} 0 0 0`,
              color: colors.neutral[600],
              fontSize: '0.875rem'
            }}>
              {error.message}
            </p>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: spacing[2],
          alignItems: 'center'
        }}>
          <Button
            size="small"
            variant="primary"
            icon={<RefreshCw size={14} />}
            onClick={handleRetry}
            loading={retrying}
          >
            Retry
          </Button>
          
          <Button
            size="small"
            variant="ghost"
            onClick={handleClearError}
          >
            Dismiss
          </Button>
          
          {!isOnline && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: spacing[1],
              color: colors.warning[600],
              fontSize: '0.75rem'
            }}>
              <WifiOff size={12} />
              Offline
            </div>
          )}
        </div>
      </Card>
    )
  }
  
  return children
}

export default AsyncErrorBoundary
```

### Error Context Provider (`src/contexts/ErrorContext.js`)
```javascript
import React, { createContext, useContext, useReducer } from 'react'

const ErrorContext = createContext()

const errorReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ERROR':
      return {
        ...state,
        errors: [...state.errors, {
          id: Date.now(),
          ...action.payload,
          timestamp: new Date().toISOString()
        }]
      }
      
    case 'REMOVE_ERROR':
      return {
        ...state,
        errors: state.errors.filter(error => error.id !== action.payload.id)
      }
      
    case 'CLEAR_ERRORS':
      return {
        ...state,
        errors: []
      }
      
    case 'SET_GLOBAL_ERROR':
      return {
        ...state,
        globalError: action.payload
      }
      
    case 'CLEAR_GLOBAL_ERROR':
      return {
        ...state,
        globalError: null
      }
      
    default:
      return state
  }
}

export const ErrorProvider = ({ children }) => {
  const [state, dispatch] = useReducer(errorReducer, {
    errors: [],
    globalError: null
  })
  
  const addError = (error) => {
    dispatch({ type: 'ADD_ERROR', payload: error })
  }
  
  const removeError = (id) => {
    dispatch({ type: 'REMOVE_ERROR', payload: { id } })
  }
  
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' })
  }
  
  const setGlobalError = (error) => {
    dispatch({ type: 'SET_GLOBAL_ERROR', payload: error })
  }
  
  const clearGlobalError = () => {
    dispatch({ type: 'CLEAR_GLOBAL_ERROR' })
  }
  
  return (
    <ErrorContext.Provider value={{
      ...state,
      addError,
      removeError,
      clearErrors,
      setGlobalError,
      clearGlobalError
    }}>
      {children}
    </ErrorContext.Provider>
  )
}

export const useError = () => {
  const context = useContext(ErrorContext)
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider')
  }
  return context
}
```

### Error Hook (`src/hooks/useErrorHandler.js`)
```javascript
import { useCallback } from 'react'
import { useError } from '../contexts/ErrorContext'
import { useUIStore } from '../stores/uiStore'

export const useErrorHandler = () => {
  const { addError } = useError()
  const { addNotification } = useUIStore()
  
  const handleError = useCallback((error, options = {}) => {
    const {
      showNotification = true,
      notificationType = 'error',
      context = {},
      level = 'component'
    } = options
    
    // Create error object
    const errorObj = {
      message: error.message || 'An unexpected error occurred',
      stack: error.stack,
      level,
      context: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        ...context
      }
    }
    
    // Add to error context
    addError(errorObj)
    
    // Show notification if requested
    if (showNotification) {
      addNotification(errorObj.message, notificationType)
    }
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error handled:', error, options)
    }
    
    return errorObj
  }, [addError, addNotification])
  
  const handleAsyncError = useCallback(async (asyncFn, options = {}) => {
    try {
      return await asyncFn()
    } catch (error) {
      handleError(error, { ...options, level: 'async' })
      throw error
    }
  }, [handleError])
  
  return {
    handleError,
    handleAsyncError
  }
}
```

## Usage Examples

### App-Level Error Boundary
```javascript
// App.jsx
import ErrorBoundary from './components/common/ErrorBoundary'
import { ErrorProvider } from './contexts/ErrorContext'

function App() {
  return (
    <ErrorProvider>
      <ErrorBoundary 
        level="app" 
        name="App"
        onError={(error, errorInfo, context) => {
          // Custom app-level error handling
          console.log('App error:', { error, errorInfo, context })
        }}
      >
        <MarketingManagerV4 />
      </ErrorBoundary>
    </ErrorProvider>
  )
}
```

### Page-Level Error Boundary
```javascript
// MarketingManagerV4.jsx
<ErrorBoundary 
  level="page" 
  name="Dashboard"
  allowRetry={true}
  onRetry={() => window.location.reload()}
>
  <DashboardContent />
</ErrorBoundary>
```

### Component-Level Error Boundary
```javascript
// CampaignTable.jsx
<ErrorBoundary 
  level="component" 
  name="CampaignTable"
  customMessage="Unable to load campaigns"
  onRetry={refetchCampaigns}
>
  <TableContent />
</ErrorBoundary>
```

## Testing Criteria
- [ ] Error boundaries catch and display errors appropriately
- [ ] Different error levels show appropriate UI and actions
- [ ] Retry functionality works for recoverable errors
- [ ] Error logging captures relevant context information
- [ ] Navigation recovery works correctly
- [ ] Async errors are handled properly
- [ ] Development and production modes show appropriate details
- [ ] Error boundaries don't interfere with normal operation

## Definition of Done
- Comprehensive error boundary system implemented
- Multiple error boundary types for different scenarios
- Error logging and reporting infrastructure in place
- User-friendly error recovery mechanisms
- Proper error context and state management
- Development vs production error handling
- Integration with existing store and notification systems
- All existing functionality preserved with error protection

## Files to Create/Modify
- Update `src/components/common/ErrorBoundary.jsx`
- `src/components/common/AsyncErrorBoundary.jsx`
- `src/contexts/ErrorContext.js`
- `src/hooks/useErrorHandler.js`
- Update `src/App.jsx` to include error boundaries

## Dependencies
- Completed Phase 2 Task 1 (Shared Components)
- React error boundary lifecycle methods

## Estimated Time
4-6 hours