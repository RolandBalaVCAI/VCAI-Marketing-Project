import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { colors, spacing } from './design-system/tokens';
import Button from './Button';
import Card from './Card';

const AsyncErrorBoundary = ({ 
  children, 
  fallback: CustomFallback,
  onRetry,
  retryDelay = 1000
}) => {
  const [error, setError] = useState(null);
  const [retrying, setRetrying] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  
  // Listen for async errors from children
  useEffect(() => {
    const handleUnhandledRejection = (event) => {
      console.error('Unhandled promise rejection:', event.reason);
      setError({
        type: 'async',
        message: event.reason?.message || 'Async operation failed',
        isNetworkError: !isOnline || event.reason?.code === 'NETWORK_ERROR'
      });
      event.preventDefault();
    };
    
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isOnline]);
  
  const handleRetry = async () => {
    setRetrying(true);
    setError(null);
    
    try {
      // Wait for retry delay
      await new Promise(resolve => setTimeout(resolve, retryDelay));
      
      // Call custom retry handler
      if (onRetry) {
        await onRetry();
      }
    } catch (retryError) {
      setError({
        type: 'retry',
        message: retryError.message || 'Retry failed',
        isNetworkError: !isOnline
      });
    } finally {
      setRetrying(false);
    }
  };
  
  const handleClearError = () => {
    setError(null);
  };
  
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
    );
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
    );
  }
  
  return children;
};

export default AsyncErrorBoundary;