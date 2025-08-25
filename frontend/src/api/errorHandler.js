import { useUIStore } from '../stores/uiStore';
import { useError } from '../contexts/ErrorContext.jsx';

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
};

// Error severity levels
export const ERROR_SEVERITY = {
  LOW: 'low',        // Minor issues, user can continue
  MEDIUM: 'medium',  // Affects functionality but not critical
  HIGH: 'high',      // Critical issues, blocks major functionality
  CRITICAL: 'critical' // App-breaking issues
};

// Retry strategies
export const RETRY_STRATEGIES = {
  NONE: 'none',
  IMMEDIATE: 'immediate',
  EXPONENTIAL: 'exponential',
  LINEAR: 'linear',
  CUSTOM: 'custom'
};

class APIErrorHandler {
  constructor() {
    this.errorPatterns = new Map();
    this.retryConfigs = new Map();
    this.errorHistory = [];
    this.maxHistorySize = 100;
  }
  
  // Classify error based on status code, message, and context
  classifyError(error, context = {}) { // eslint-disable-line no-unused-vars
    const { response, request, code } = error;
    const status = response?.status;
    const data = response?.data;
    
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
      };
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
      };
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
        };
        
      case 401:
        return {
          category: ERROR_CATEGORIES.AUTHENTICATION,
          severity: ERROR_SEVERITY.HIGH,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'Your session has expired. Please log in again.',
          technicalMessage: error.message,
          isRetryable: false,
          requiresAuth: true
        };
        
      case 403:
        return {
          category: ERROR_CATEGORIES.AUTHORIZATION,
          severity: ERROR_SEVERITY.MEDIUM,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'You do not have permission to perform this action.',
          technicalMessage: error.message,
          isRetryable: false
        };
        
      case 404:
        return {
          category: ERROR_CATEGORIES.CLIENT,
          severity: ERROR_SEVERITY.LOW,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'The requested resource was not found.',
          technicalMessage: error.message,
          isRetryable: false
        };
        
      case 422:
        return {
          category: ERROR_CATEGORIES.VALIDATION,
          severity: ERROR_SEVERITY.LOW,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: data?.error?.message || 'Please check your input and try again.',
          technicalMessage: error.message,
          validationErrors: data?.error?.details || {},
          isRetryable: false
        };
        
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
        };
        
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
        };
        
      default:
        return {
          category: ERROR_CATEGORIES.CLIENT,
          severity: ERROR_SEVERITY.MEDIUM,
          retryStrategy: RETRY_STRATEGIES.NONE,
          userMessage: 'An unexpected error occurred. Please try again.',
          technicalMessage: error.message,
          isRetryable: false
        };
    }
  }
  
  // Enhanced error processing with context
  processError(error, context = {}) {
    const classification = this.classifyError(error, context);
    
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
    };
    
    // Add to error history
    this.addToHistory(processedError);
    
    // Check for error patterns
    this.analyzeErrorPatterns(processedError);
    
    return processedError;
  }
  
  // Generate unique error ID
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Detect recurring error patterns
  detectErrorPattern(error) {
    const pattern = {
      status: error.response?.status,
      url: error.config?.url,
      method: error.config?.method
    };
    
    const patternKey = JSON.stringify(pattern);
    const existing = this.errorPatterns.get(patternKey) || { count: 0, lastSeen: null };
    
    existing.count += 1;
    existing.lastSeen = new Date().toISOString();
    
    this.errorPatterns.set(patternKey, existing);
    
    return {
      key: patternKey,
      count: existing.count,
      isRecurring: existing.count > 2
    };
  }
  
  // Analyze error patterns for insights
  analyzeErrorPatterns(error) {
    if (error.metadata.pattern.isRecurring) {
      console.warn(`Recurring error pattern detected:`, {
        pattern: error.metadata.pattern,
        error: error.userMessage
      });
      
      // Could trigger alerts or adjustments to retry strategies
      this.handleRecurringError(error);
    }
  }
  
  // Handle recurring errors
  handleRecurringError(error) {
    // Show system health notification for recurring server errors
    if (error.category === ERROR_CATEGORIES.SERVER && error.metadata.pattern.count > 5) {
      // We'll handle this in the hook since we can't use hooks in classes
    }
    
    // Adjust retry strategy for recurring network errors
    if (error.category === ERROR_CATEGORIES.NETWORK && error.metadata.pattern.count > 3) {
      // Increase retry delays
      error.retryDelay = (error.retryDelay || 1000) * 2;
    }
  }
  
  // Parse Retry-After header
  parseRetryAfter(retryAfter) {
    if (!retryAfter) return 1000;
    
    // If it's a number, it's seconds
    if (/^\d+$/.test(retryAfter)) {
      return parseInt(retryAfter) * 1000;
    }
    
    // If it's a date, calculate the difference
    const retryDate = new Date(retryAfter);
    if (!isNaN(retryDate.getTime())) {
      return Math.max(0, retryDate.getTime() - Date.now());
    }
    
    return 1000;
  }
  
  // Add error to history
  addToHistory(error) {
    this.errorHistory.unshift(error);
    
    // Keep history size manageable
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }
  
  // Get error statistics
  getErrorStats() {
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;
    const oneDay = 24 * oneHour;
    
    const recentErrors = this.errorHistory.filter(
      error => now - new Date(error.timestamp).getTime() < oneHour
    );
    
    const todayErrors = this.errorHistory.filter(
      error => now - new Date(error.timestamp).getTime() < oneDay
    );
    
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
    };
  }
  
  // Utility function to group by property
  groupBy(array, property) {
    return array.reduce((groups, item) => {
      const key = item[property];
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }
}

// Create singleton instance
export const apiErrorHandler = new APIErrorHandler();

// Hook for using error handler in components
export const useAPIErrorHandler = () => {
  const { addError } = useError();
  const { addNotification } = useUIStore();
  
  const handleAPIError = (error, context = {}) => {
    const processedError = apiErrorHandler.processError(error, context);
    
    // Add to error context
    addError(processedError);
    
    // Handle recurring server errors
    if (processedError.category === ERROR_CATEGORIES.SERVER && 
        processedError.metadata.pattern.isRecurring && 
        processedError.metadata.pattern.count > 5) {
      addNotification(
        'We\'re experiencing some technical difficulties. Our team has been notified.',
        'warning',
        10000
      );
    }
    
    // Show user notification based on severity and category
    if (processedError.severity !== ERROR_SEVERITY.LOW) {
      const notificationType = processedError.severity === ERROR_SEVERITY.CRITICAL 
        ? 'error' 
        : processedError.severity === ERROR_SEVERITY.HIGH 
          ? 'error' 
          : 'warning';
      
      addNotification(
        processedError.userMessage,
        notificationType,
        processedError.severity === ERROR_SEVERITY.CRITICAL ? 0 : 5000 // Critical errors don't auto-dismiss
      );
    }
    
    // Log detailed error in development
    if (import.meta.env.DEV) {
      console.group('🚨 API Error');
      console.error('Processed Error:', processedError);
      console.error('Original Error:', error);
      console.groupEnd();
    }
    
    return processedError;
  };
  
  return { handleAPIError };
};