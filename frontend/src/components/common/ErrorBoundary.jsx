import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { colors, spacing, typography, borderRadius } from './design-system/tokens';
import Button from './Button';
import Card from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }
  
  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error
    };
  }
  
  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });
    
    // Log error with context
    this.logError(error, errorInfo);
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
    };
    
    // Console log in development
    if (import.meta.env.DEV) {
      console.group('🚨 Error Boundary Triggered');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorContext);
      console.groupEnd();
    }
    
    // Report to error tracking service in production
    if (import.meta.env.PROD) {
      this.reportError(errorContext);
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo, errorContext);
    }
  };
  
  reportError = (errorContext) => {
    // Placeholder for error reporting service
    // In a real app, you'd integrate with Sentry, Bugsnag, etc.
    console.log('Reporting error to service:', errorContext);
    
    // Example integration:
    // window.errorTracker?.captureException(errorContext.error, {
    //   tags: {
    //     boundary: errorContext.boundaryName,
    //     retryCount: errorContext.retryCount
    //   },
    //   extra: errorContext
    // })
  };
  
  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
    
    // Call custom retry handler if provided
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };
  
  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
    
    // Reset app state if handler provided
    if (this.props.onReset) {
      this.props.onReset();
    }
  };
  
  handleGoHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.href = '/';
    }
  };
  
  renderError = () => {
    const {
      level = 'component',
      showDetails = import.meta.env.DEV,
      allowRetry = true,
      allowReset = true,
      allowNavigation = true,
      customMessage,
      customActions
    } = this.props;
    
    const { error, errorInfo, retryCount } = this.state;
    
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
    };
    
    const iconSizes = {
      component: 32,
      page: 48,
      app: 64
    };
    
    const titleSizes = {
      component: typography.fontSize.lg,
      page: typography.fontSize.xl,
      app: typography.fontSize['2xl']
    };
    
    const maxRetries = 3;
    const canRetry = allowRetry && retryCount < maxRetries;
    
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
    );
  };
  
  getErrorMessage = (level) => {
    const messages = {
      component: 'Component Error',
      page: 'Page Error',
      app: 'Application Error'
    };
    return messages[level] || 'Something went wrong';
  };
  
  getErrorDescription = (level, error) => {
    if (import.meta.env.DEV) {
      return error?.message || 'An unexpected error occurred during rendering.';
    }
    
    const descriptions = {
      component: 'This component encountered an error and could not be displayed.',
      page: 'This page encountered an error and could not be loaded properly.',
      app: 'The application encountered an unexpected error. Please try refreshing the page.'
    };
    
    return descriptions[level] || 'An unexpected error occurred.';
  };
  
  render() {
    if (this.state.hasError) {
      return this.renderError();
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;