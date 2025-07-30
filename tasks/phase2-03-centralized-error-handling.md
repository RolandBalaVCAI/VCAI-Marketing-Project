# Phase 2 Task 3: Create Centralized Error Handling for API Calls

## Objective
Implement a centralized error handling system for all API calls that provides consistent error messaging, automatic retry logic, user notifications, and proper error categorization.

## Current State
- Basic error handling in API client
- Inconsistent error messages across the application
- Limited error categorization and recovery options
- No centralized error state management

## Target State
- Unified error handling system for all API operations
- Consistent error messaging and user experience
- Intelligent retry logic and error recovery
- Comprehensive error logging and monitoring
- User-friendly error notifications and actions

## Implementation Steps

### 1. Enhanced API Error Handler
Improve the existing API client error handling:
- Better error categorization and classification
- Context-aware error messages
- Automatic retry strategies
- Error transformation and normalization

### 2. Error State Management
Create centralized error state:
- Global error store
- Per-operation error tracking
- Error history and patterns
- Recovery state management

### 3. User Notification System
Implement smart notifications:
- Context-aware error messages
- Action-based notifications
- Progressive error disclosure
- Notification queuing and deduplication

### 4. Error Recovery Mechanisms
Build automatic recovery:
- Background retry for failed operations
- Offline/online synchronization
- State reconciliation after errors
- Graceful degradation strategies

## Detailed Implementation

### Enhanced API Error Handler (`src/api/errorHandler.js`)
```javascript
import { useUIStore } from '../stores/uiStore'
import { useError } from '../contexts/ErrorContext'

// Error categories for different handling strategies
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization', 
  VALIDATION: 'validation',
  SERVER: 'server',
  CLIENT: 'client',
  TIMEOUT: 'timeout',
  RATE_LIMIT: 'rate_limit',
  MAINTENANCE: 'maintenance'
}

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',        // Minor issues, user can continue
  MEDIUM: 'medium',  // Affects functionality but not critical
  HIGH: 'high',      // Critical issues, blocks major functionality
  CRITICAL: 'critical' // App-breaking issues
}

// Retry strategies
export const RETRY_STRATEGIES = {
  NONE: 'none',
  IMMEDIATE: 'immediate',
  EXPONENTIAL: 'exponential',
  LINEAR: 'linear',
  CUSTOM: 'custom'
}

class APIErrorHandler {
  constructor() {
    this.errorPatterns = new Map()
    this.retryConfigs = new Map()
    this.errorHistory = []
    this.maxHistorySize = 100
  }
  
  // Classify error based on status code, message, and context
  classifyError(error, context = {}) {
    const { response, request, code } = error
    const status = response?.status
    const data = response?.data
    
    // Network errors
    if (!response && request) {
      return {
        category: ERROR_CATEGORIES.NETWORK,
        severity: ERROR_SEVERITY.HIGH,
        retryStrategy: RETRY_STRATEGIES.EXPONENTIAL,
        userMessage: 'Unable to connect to the server. Please check your internet connection.',
        technicalMessage: error.message,
        isRetryable: true,
        maxRetries: 3
      }
    }
    
    // Timeout errors
    if (code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return {
        category: ERROR_CATEGORIES.TIMEOUT,
        severity: ERROR_SEVERITY.MEDIUM,
        retryStrategy: RETRY_STRATEGIES.LINEAR,
        userMessage: 'The request took too long to complete. Please try again.',
        technicalMessage: error.message,
        isRetryable: true,
        maxRetries: 2
      }
    }
    
    // HTTP status-based classification
    switch (status) {
      case 400:
        return {
          category: ERROR_CATEGORIES.VALIDATION,
          severity: ERROR_SEVERITY.LOW,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: data?.error?.message || 'Please check your input and try again.',
          technicalMessage: error.message,
          validationErrors: data?.error?.details || {},
          isRetryable: false
        }
        
      case 401:
        return {
          category: ERROR_CATEGORIES.AUTHENTICATION,
          severity: ERROR_SEVERITY.HIGH,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'Your session has expired. Please log in again.',
          technicalMessage: error.message,
          isRetryable: false,
          requiresAuth: true
        }
        
      case 403:
        return {
          category: ERROR_CATEGORIES.AUTHORIZATION,
          severity: ERROR_SEVERITY.MEDIUM,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'You do not have permission to perform this action.',
          technicalMessage: error.message,
          isRetryable: false
        }
        
      case 404:
        return {
          category: ERROR_CATEGORIES.CLIENT,
          severity: ERROR_SEVERITY.LOW,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'The requested resource was not found.',
          technicalMessage: error.message,
          isRetryable: false
        }
        
      case 422:
        return {
          category: ERROR_CATEGORIES.VALIDATION,
          severity: ERROR_SEVERITY.LOW,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: data?.error?.message || 'Please check your input and try again.',
          technicalMessage: error.message,
          validationErrors: data?.error?.details || {},
          isRetryable: false
        }
        
      case 429:
        return {
          category: ERROR_CATEGORIES.RATE_LIMIT,
          severity: ERROR_SEVERITY.MEDIUM,
          retryStrategy: RETRY_STRATEGIES.EXPONENTIAL,
          userMessage: 'Too many requests. Please wait a moment and try again.',
          technicalMessage: error.message,
          isRetryable: true,
          maxRetries: 3,
          retryDelay: this.parseRetryAfter(response?.headers?.['retry-after'])
        }
        
      case 500:
      case 502:
      case 503:
      case 504:
        return {
          category: ERROR_CATEGORIES.SERVER,
          severity: ERROR_SEVERITY.HIGH,
          retryStrategy: RETRY_STRATEGIES.EXPONENTIAL,
          userMessage: 'Server error. Please try again in a few moments.',
          technicalMessage: error.message,
          isRetryable: true,
          maxRetries: 2
        }
        
      default:
        return {
          category: ERROR_CATEGORIES.CLIENT,
          severity: ERROR_SEVERITY.MEDIUM,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'An unexpected error occurred. Please try again.',
          technicalMessage: error.message,
          isRetryable: false
        }
    }
  }
  
  // Enhanced error processing with context
  processError(error, context = {}) {
    const classification = this.classifyError(error, context)
    
    const processedError = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      originalError: error,
      ...classification,
      context: {
        operation: context.operation,
        url: context.url || error.config?.url,
        method: context.method || error.config?.method?.toUpperCase(),
        userId: context.userId,
        sessionId: context.sessionId,
        userAgent: navigator.userAgent,
        ...context
      },
      metadata: {
        retryCount: 0,
        firstOccurrence: new Date().toISOString(),
        pattern: this.detectErrorPattern(error)
      }
    }
    
    // Add to error history
    this.addToHistory(processedError)
    
    // Check for error patterns
    this.analyzeErrorPatterns(processedError)
    
    return processedError
  }
  
  // Generate unique error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Detect recurring error patterns
  detectErrorPattern(error) {
    const pattern = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    }
    
    const patternKey = JSON.stringify(pattern)
    const existing = this.errorPatterns.get(patternKey) || { count: 0, lastSeen: null }
    
    existing.count += 1
    existing.lastSeen = new Date().toISOString()
    
    this.errorPatterns.set(patternKey, existing)
    
    return {
      key: patternKey,
      count: existing.count,
      isRecurring: existing.count > 2
    }
  }
  
  // Analyze error patterns for insights
  analyzeErrorPatterns(error) {
    if (error.metadata.pattern.isRecurring) {
      console.warn(`Recurring error pattern detected:`, {
        pattern: error.metadata.pattern,
        error: error.userMessage
      })
      
      // Could trigger alerts or adjustments to retry strategies
      this.handleRecurringError(error)
    }
  }
  
  // Handle recurring errors
  handleRecurringError(error) {
    const { addNotification } = useUIStore.getState()
    
    // Show system health notification for recurring server errors
    if (error.category === ERROR_CATEGORIES.SERVER && error.metadata.pattern.count > 5) {
      addNotification(
        'We\'re experiencing some technical difficulties. Our team has been notified.',
        'warning',
        10000
      )
    }
    
    // Adjust retry strategy for recurring network errors
    if (error.category === ERROR_CATEGORIES.NETWORK && error.metadata.pattern.count > 3) {
      // Increase retry delays
      error.retryDelay = (error.retryDelay || 1000) * 2
    }
  }
  
  // Parse Retry-After header
  parseRetryAfter(retryAfter) {
    if (!retryAfter) return 1000
    
    // If it's a number, it's seconds
    if (/^\d+$/.test(retryAfter)) {
      return parseInt(retryAfter) * 1000
    }
    
    // If it's a date, calculate the difference
    const retryDate = new Date(retryAfter)
    if (!isNaN(retryDate.getTime())) {
      return Math.max(0, retryDate.getTime() - Date.now())
    }
    
    return 1000
  }
  
  // Add error to history
  addToHistory(error) {
    this.errorHistory.unshift(error)
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }
  }
  
  // Get error statistics
  getErrorStats() {
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    const oneDay = 24 * oneHour
    
    const recentErrors = this.errorHistory.filter(
      error => now - new Date(error.timestamp).getTime() < oneHour
    )
    
    const todayErrors = this.errorHistory.filter(
      error => now - new Date(error.timestamp).getTime() < oneDay
    )
    
    return {
      total: this.errorHistory.length,
      lastHour: recentErrors.length,
      today: todayErrors.length,
      byCategory: this.groupBy(this.errorHistory, 'category'),
      bySeverity: this.groupBy(this.errorHistory, 'severity'),
      patterns: Array.from(this.errorPatterns.entries()).map(([key, data]) => ({
        pattern: JSON.parse(key),
        ...data
      }))
    }
  }
  
  // Utility function to group by property
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property]
      groups[key] = (groups[key] || 0) + 1
      return groups
    }, {})
  }
}

// Create singleton instance
export const apiErrorHandler = new APIErrorHandler()

// Hook for using error handler in components
export const useAPIErrorHandler = () => {
  const { addError } = useError()
  const { addNotification } = useUIStore()
  
  const handleAPIError = (error, context = {}) => {
    const processedError = apiErrorHandler.processError(error, context)
    
    // Add to error context
    addError(processedError)
    
    // Show user notification based on severity and category
    if (processedError.severity !== ERROR_SEVERITY.LOW) {
      const notificationType = processedError.severity === ERROR_SEVERITY.CRITICAL 
        ? 'error' 
        : processedError.severity === ERROR_SEVERITY.HIGH 
          ? 'error' 
          : 'warning'
      
      addNotification(
        processedError.userMessage,
        notificationType,
        processedError.severity === ERROR_SEVERITY.CRITICAL ? 0 : 5000 // Critical errors don't auto-dismiss
      )
    }
    
    // Log detailed error in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 API Error')
      console.error('Processed Error:', processedError)
      console.error('Original Error:', error)
      console.groupEnd()
    }
    
    return processedError
  }
  
  return { handleAPIError }
}
```

### Enhanced API Client (`src/api/client.js`)
```javascript
import axios from 'axios'
import { apiErrorHandler } from './errorHandler'
import { useUIStore } from '../stores/uiStore'

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add request metadata
    config.metadata = { 
      startTime: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    // Add loading state
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(true)
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request [${config.metadata.requestId}]:`, {
        method: config.method?.toUpperCase(),
        url: config.url,
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    return Promise.reject(error)
  }
)

// Response interceptor with enhanced error handling
apiClient.interceptors.response.use(
  (response) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    
    // Log successful response in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - response.config.metadata.startTime
      console.log(`✅ API Response [${response.config.metadata.requestId}]:`, {
        status: response.status,
        duration: `${duration}ms`,
        data: response.data
      })
    }
    
    return response
  },
  async (error) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    
    // Process error through centralized handler
    const context = {
      operation: error.config?.metadata?.operation,
      url: error.config?.url,
      method: error.config?.method,
      requestId: error.config?.metadata?.requestId
    }
    
    const processedError = apiErrorHandler.processError(error, context)
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error [${context.requestId}]:`, {
        status: error.response?.status,
        message: processedError.userMessage,
        category: processedError.category,
        severity: processedError.severity
      })
    }
    
    // Attach processed error info to the original error
    error.processed = processedError
    
    return Promise.reject(error)
  }
)

// Enhanced request wrapper with automatic retry
export const apiRequest = {
  async request(config, retryOptions = {}) {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      retryStrategy = 'exponential',
      retryCondition = (error) => error.processed?.isRetryable
    } = retryOptions
    
    let attempt = 0
    
    while (attempt <= maxRetries) {
      try {
        const response = await apiClient.request(config)
        return response
      } catch (error) {
        attempt++
        
        // Don't retry if it's the last attempt or not retryable
        if (attempt > maxRetries || !retryCondition(error)) {
          throw error
        }
        
        // Calculate retry delay
        let delay = retryDelay
        
        if (retryStrategy === 'exponential') {
          delay = retryDelay * Math.pow(2, attempt - 1)
        } else if (retryStrategy === 'linear') {
          delay = retryDelay * attempt
        } else if (error.processed?.retryDelay) {
          delay = error.processed.retryDelay
        }
        
        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000
        
        console.log(`🔄 Retrying request (attempt ${attempt}/${maxRetries}) in ${delay}ms`)
        
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  },
  
  get: (url, config = {}) => apiRequest.request({ ...config, method: 'GET', url }),
  post: (url, data, config = {}) => apiRequest.request({ ...config, method: 'POST', url, data }),
  put: (url, data, config = {}) => apiRequest.request({ ...config, method: 'PUT', url, data }),
  delete: (url, config = {}) => apiRequest.request({ ...config, method: 'DELETE', url }),
  patch: (url, data, config = {}) => apiRequest.request({ ...config, method: 'PATCH', url, data })
}

export default apiClient
```

### Error Recovery Service (`src/services/errorRecovery.js`)
```javascript
import { apiErrorHandler } from '../api/errorHandler'
import { useUIStore } from '../stores/uiStore'

class ErrorRecoveryService {
  constructor() {
    this.pendingRecoveries = new Map()
    this.recoveryStrategies = new Map()
    this.isOnline = navigator.onLine
    
    // Monitor online status
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
  }
  
  // Register recovery strategy for specific error types
  registerRecoveryStrategy(errorCategory, strategy) {
    this.recoveryStrategies.set(errorCategory, strategy)
  }
  
  // Attempt to recover from error
  async attemptRecovery(error, originalOperation) {
    const recoveryId = this.generateRecoveryId()
    
    const recovery = {
      id: recoveryId,
      error,
      originalOperation,
      attempts: 0,
      maxAttempts: 3,
      startTime: Date.now(),
      status: 'pending'
    }
    
    this.pendingRecoveries.set(recoveryId, recovery)
    
    try {
      const strategy = this.recoveryStrategies.get(error.category)
      
      if (strategy) {
        await strategy(error, originalOperation, recovery)
      } else {
        await this.defaultRecoveryStrategy(error, originalOperation, recovery)
      }
      
      recovery.status = 'successful'
      this.notifyRecoverySuccess(recovery)
    } catch (recoveryError) {
      recovery.status = 'failed'
      recovery.error = recoveryError
      this.notifyRecoveryFailure(recovery)
    } finally {
      // Clean up after delay
      setTimeout(() => {
        this.pendingRecoveries.delete(recoveryId)
      }, 60000) // Keep for 1 minute for debugging
    }
    
    return recovery
  }
  
  // Default recovery strategy
  async defaultRecoveryStrategy(error, originalOperation, recovery) {
    if (error.isRetryable && recovery.attempts < recovery.maxAttempts) {
      recovery.attempts++
      
      // Wait before retry
      const delay = Math.min(1000 * Math.pow(2, recovery.attempts - 1), 10000)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      // Retry original operation
      return await originalOperation()
    } else {
      throw new Error('Recovery not possible')
    }
  }
  
  // Handle coming back online
  handleOnline() {
    this.isOnline = true
    console.log('🌐 Back online - attempting to recover failed operations')
    
    // Attempt to recover network-related failures
    for (const [id, recovery] of this.pendingRecoveries) {
      if (recovery.error.category === 'network' && recovery.status === 'pending') {
        this.attemptRecovery(recovery.error, recovery.originalOperation)
      }
    }
  }
  
  // Handle going offline
  handleOffline() {
    this.isOnline = false
    console.log('🌐 Gone offline - queueing operations for later')
    
    const { addNotification } = useUIStore.getState()
    addNotification(
      'You are now offline. Changes will be saved when connection is restored.',
      'warning',
      0 // Don't auto-dismiss
    )
  }
  
  // Generate recovery ID
  generateRecoveryId() {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }
  
  // Notify recovery success
  notifyRecoverySuccess(recovery) {
    const { addNotification } = useUIStore.getState()
    addNotification(
      'Operation completed successfully after retry.',
      'success',
      3000
    )
    
    console.log('✅ Recovery successful:', recovery)
  }
  
  // Notify recovery failure
  notifyRecoveryFailure(recovery) {
    const { addNotification } = useUIStore.getState()
    addNotification(
      'Unable to complete the operation. Please try again later.',
      'error',
      5000
    )
    
    console.error('❌ Recovery failed:', recovery)
  }
  
  // Get recovery statistics
  getRecoveryStats() {
    const recoveries = Array.from(this.pendingRecoveries.values())
    
    return {
      total: recoveries.length,
      successful: recoveries.filter(r => r.status === 'successful').length,
      failed: recoveries.filter(r => r.status === 'failed').length,
      pending: recoveries.filter(r => r.status === 'pending').length,
      averageAttempts: recoveries.reduce((sum, r) => sum + r.attempts, 0) / recoveries.length || 0
    }
  }
}

// Create singleton instance
export const errorRecoveryService = new ErrorRecoveryService()

// Register default recovery strategies
errorRecoveryService.registerRecoveryStrategy('network', async (error, originalOperation, recovery) => {
  // Wait for network to come back online
  if (!navigator.onLine) {
    await new Promise(resolve => {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline)
        resolve()
      }
      window.addEventListener('online', handleOnline)
    })
  }
  
  // Retry the operation
  return await originalOperation()
})

export default errorRecoveryService
```

## Testing Criteria
- [ ] All API errors are properly classified and handled
- [ ] User notifications show appropriate messages for different error types
- [ ] Retry logic works correctly for retryable errors
- [ ] Error patterns are detected and handled appropriately
- [ ] Recovery mechanisms work for network and temporary errors
- [ ] Error statistics and monitoring provide useful insights
- [ ] Development and production error handling differs appropriately
- [ ] No unhandled promise rejections or uncaught errors

## Definition of Done
- Centralized error handling system for all API calls
- Intelligent error classification and retry strategies
- User-friendly error notifications and recovery options
- Comprehensive error logging and pattern detection
- Automatic recovery mechanisms for appropriate error types
- Error statistics and monitoring capabilities
- Integration with existing store and notification systems
- All existing API functionality preserved with enhanced error handling

## Files to Create/Modify
- `src/api/errorHandler.js`
- Update `src/api/client.js`
- `src/services/errorRecovery.js`
- Update API endpoint files to use enhanced error handling

## Dependencies
- Completed Phase 2 Task 2 (Error Boundaries)
- Enhanced UI store with notification system

## Estimated Time
6-8 hours