import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

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
      level: this.props.level || 'component',
      ...this.props.context
    };
    
    // Console log in development
    if (import.meta.env.DEV) {
      console.group(`🚨 Error Boundary: ${this.props.name || 'Unknown'}`);
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Context:', errorContext);
      console.groupEnd();
    }
    
    // Send to error tracking service in production
    if (import.meta.env.PROD && this.props.onError) {
      this.props.onError(error, errorContext);
    }
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
  
  handleNavigateHome = () => {
    if (this.props.onNavigateHome) {
      this.props.onNavigateHome();
    } else {
      window.location.reload();
    }
  };
  
  render() {
    if (this.state.hasError) {
      const { level = 'component', allowRetry = true, allowNavigation = true } = this.props;
      
      return (
        <div style={{
          backgroundColor: '#ffffff',
          border: level === 'page' ? 'none' : '1px solid #fca5a5',
          borderRadius: '8px',
          padding: level === 'page' ? '40px 20px' : '20px',
          margin: level === 'page' ? '0' : '10px 0',
          textAlign: 'center',
          minHeight: level === 'page' ? '50vh' : 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <AlertTriangle 
            size={level === 'page' ? 48 : 32} 
            style={{ 
              color: '#dc2626', 
              marginBottom: '16px' 
            }} 
          />
          
          <h3 style={{
            margin: '0 0 12px 0',
            color: '#dc2626',
            fontSize: level === 'page' ? '24px' : '18px',
            fontWeight: '600'
          }}>
            {level === 'page' ? 'Oops! Something went wrong' : 'Component Error'}
          </h3>
          
          <p style={{
            margin: '0 0 20px 0',
            color: '#6b7280',
            fontSize: '14px',
            maxWidth: '400px',
            lineHeight: '1.5'
          }}>
            {this.props.customMessage || 
             (level === 'page' 
               ? 'We encountered an unexpected error. Please try refreshing the page or contact support if the problem persists.'
               : 'This component failed to load properly. You can try again or continue using other parts of the application.'
             )
            }
          </p>
          
          {/* Error Details (Development Only) */}
          {import.meta.env.DEV && this.state.error && (
            <details style={{
              marginBottom: '20px',
              padding: '12px',
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '4px',
              fontSize: '12px',
              textAlign: 'left',
              maxWidth: '100%',
              color: '#374151'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: '500', marginBottom: '8px' }}>
                <Bug size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Error Details
              </summary>
              <pre style={{ 
                margin: '0', 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                fontSize: '11px'
              }}>
                {this.state.error.message}
                {'\n\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          
          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            {allowRetry && (
              <button
                onClick={this.handleRetry}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <RefreshCw size={16} />
                Try Again
                {this.state.retryCount > 0 && ` (${this.state.retryCount})`}
              </button>
            )}
            
            {allowNavigation && level === 'page' && (
              <button
                onClick={this.handleNavigateHome}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '10px 16px',
                  backgroundColor: '#6b7280',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#4b5563'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6b7280'}
              >
                <Home size={16} />
                Go Home
              </button>
            )}
          </div>
          
          {/* Retry Count Warning */}
          {this.state.retryCount >= 3 && (
            <p style={{
              marginTop: '16px',
              color: '#f59e0b',
              fontSize: '12px',
              fontStyle: 'italic'
            }}>
              Multiple retry attempts detected. Consider refreshing the page or contacting support.
            </p>
          )}
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;