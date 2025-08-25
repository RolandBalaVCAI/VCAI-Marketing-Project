import { useCallback } from 'react';
import { useError } from '../contexts/ErrorContext.jsx';
import { useUIStore } from '../stores/uiStore';

export const useErrorHandler = () => {
  const { addError } = useError();
  const { addNotification } = useUIStore();
  
  const handleError = useCallback((error, options = {}) => {
    const {
      showNotification = true,
      notificationType = 'error',
      context = {},
      level = 'component'
    } = options;
    
    // Create error object
    const errorObj = {
      message: error.message || 'An unexpected error occurred',
      stack: error.stack,
      level,
      context: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        ...context
      }
    };
    
    // Add to error context
    addError(errorObj);
    
    // Show notification if requested
    if (showNotification) {
      addNotification(errorObj.message, notificationType);
    }
    
    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('Error handled:', error, options);
    }
    
    return errorObj;
  }, [addError, addNotification]);
  
  const handleAsyncError = useCallback(async (asyncFn, options = {}) => {
    try {
      return await asyncFn();
    } catch (error) {
      handleError(error, { ...options, level: 'async' });
      throw error;
    }
  }, [handleError]);
  
  return {
    handleError,
    handleAsyncError
  };
};