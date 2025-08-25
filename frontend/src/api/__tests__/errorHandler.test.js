import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  apiErrorHandler, 
  ERROR_CATEGORIES, 
  ERROR_SEVERITY, 
  RETRY_STRATEGIES,
  useAPIErrorHandler 
} from '../errorHandler';
import { renderHook } from '@testing-library/react';
import { createMockError } from '../../test/utils';

// Mock dependencies
vi.mock('../../stores/uiStore', () => ({
  useUIStore: vi.fn(() => ({
    addNotification: vi.fn()
  }))
}));

vi.mock('../../contexts/ErrorContext.jsx', () => ({
  useError: vi.fn(() => ({
    addError: vi.fn()
  }))
}));

describe('APIErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiErrorHandler.errorHistory = [];
    apiErrorHandler.errorPatterns.clear();
  });

  describe('classifyError', () => {
    it('should classify network errors', () => {
      const networkError = {
        request: {},
        message: 'Network Error'
      };

      const classification = apiErrorHandler.classifyError(networkError);

      expect(classification.category).toBe(ERROR_CATEGORIES.NETWORK);
      expect(classification.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(classification.retryStrategy).toBe(RETRY_STRATEGIES.EXPONENTIAL);
      expect(classification.isRetryable).toBe(true);
      expect(classification.maxRetries).toBe(3);
    });

    it('should classify timeout errors', () => {
      const timeoutError = {
        code: 'ECONNABORTED',
        message: 'timeout of 5000ms exceeded'
      };

      const classification = apiErrorHandler.classifyError(timeoutError);

      expect(classification.category).toBe(ERROR_CATEGORIES.TIMEOUT);
      expect(classification.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(classification.retryStrategy).toBe(RETRY_STRATEGIES.LINEAR);
      expect(classification.isRetryable).toBe(true);
      expect(classification.maxRetries).toBe(2);
    });

    it('should classify 400 validation errors', () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            error: {
              message: 'Validation failed',
              details: { name: 'Name is required' }
            }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(validationError);

      expect(classification.category).toBe(ERROR_CATEGORIES.VALIDATION);
      expect(classification.severity).toBe(ERROR_SEVERITY.LOW);
      expect(classification.retryStrategy).toBe(RETRY_STRATEGIES.NONE);
      expect(classification.isRetryable).toBe(false);
      expect(classification.validationErrors).toEqual({ name: 'Name is required' });
    });

    it('should classify 401 authentication errors', () => {
      const authError = {
        response: {
          status: 401,
          data: {
            error: { message: 'Unauthorized' }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(authError);

      expect(classification.category).toBe(ERROR_CATEGORIES.AUTHENTICATION);
      expect(classification.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(classification.requiresAuth).toBe(true);
      expect(classification.isRetryable).toBe(false);
    });

    it('should classify 403 authorization errors', () => {
      const authzError = {
        response: {
          status: 403,
          data: {
            error: { message: 'Forbidden' }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(authzError);

      expect(classification.category).toBe(ERROR_CATEGORIES.AUTHORIZATION);
      expect(classification.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(classification.isRetryable).toBe(false);
    });

    it('should classify 404 client errors', () => {
      const notFoundError = {
        response: {
          status: 404,
          data: {
            error: { message: 'Not found' }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(notFoundError);

      expect(classification.category).toBe(ERROR_CATEGORIES.CLIENT);
      expect(classification.severity).toBe(ERROR_SEVERITY.LOW);
      expect(classification.isRetryable).toBe(false);
    });

    it('should classify 429 rate limit errors', () => {
      const rateLimitError = {
        response: {
          status: 429,
          headers: {
            'retry-after': '60'
          },
          data: {
            error: { message: 'Too many requests' }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(rateLimitError);

      expect(classification.category).toBe(ERROR_CATEGORIES.RATE_LIMIT);
      expect(classification.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(classification.retryStrategy).toBe(RETRY_STRATEGIES.EXPONENTIAL);
      expect(classification.isRetryable).toBe(true);
      expect(classification.retryDelay).toBe(60000); // 60 seconds in ms
    });

    it('should classify 500 server errors', () => {
      const serverError = {
        response: {
          status: 500,
          data: {
            error: { message: 'Internal server error' }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(serverError);

      expect(classification.category).toBe(ERROR_CATEGORIES.SERVER);
      expect(classification.severity).toBe(ERROR_SEVERITY.HIGH);
      expect(classification.retryStrategy).toBe(RETRY_STRATEGIES.EXPONENTIAL);
      expect(classification.isRetryable).toBe(true);
      expect(classification.maxRetries).toBe(2);
    });

    it('should handle unknown status codes', () => {
      const unknownError = {
        response: {
          status: 418, // I'm a teapot
          data: {
            error: { message: "I'm a teapot" }
          }
        }
      };

      const classification = apiErrorHandler.classifyError(unknownError);

      expect(classification.category).toBe(ERROR_CATEGORIES.CLIENT);
      expect(classification.severity).toBe(ERROR_SEVERITY.MEDIUM);
      expect(classification.isRetryable).toBe(false);
    });
  });

  describe('processError', () => {
    it('should process error with full context', () => {
      const error = createMockError('Test error', 500);
      const context = {
        operation: 'getCampaigns',
        url: '/api/campaigns',
        method: 'GET',
        userId: 'user123'
      };

      const processedError = apiErrorHandler.processError(error, context);

      expect(processedError.id).toMatch(/^error_\d+_[a-z0-9]+$/);
      expect(processedError.timestamp).toBeDefined();
      expect(processedError.originalError).toBe(error);
      expect(processedError.category).toBe(ERROR_CATEGORIES.SERVER);
      expect(processedError.context.operation).toBe('getCampaigns');
      expect(processedError.context.userId).toBe('user123');
      expect(processedError.metadata.retryCount).toBe(0);
    });

    it('should add error to history', () => {
      const error = createMockError('Test error');
      
      expect(apiErrorHandler.errorHistory).toHaveLength(0);
      
      apiErrorHandler.processError(error);
      
      expect(apiErrorHandler.errorHistory).toHaveLength(1);
      expect(apiErrorHandler.errorHistory[0].originalError).toBe(error);
    });

    it('should detect error patterns', () => {
      const error1 = createMockError('Test error', 500);
      error1.config = { url: '/api/campaigns', method: 'GET' };
      
      const error2 = createMockError('Test error', 500);
      error2.config = { url: '/api/campaigns', method: 'GET' };

      apiErrorHandler.processError(error1);
      const processedError2 = apiErrorHandler.processError(error2);

      expect(processedError2.metadata.pattern.count).toBe(2);
      expect(processedError2.metadata.pattern.isRecurring).toBe(false); // Needs >2 for recurring
    });

    it('should detect recurring patterns', () => {
      const createError = () => {
        const err = createMockError('Test error', 500);
        err.config = { url: '/api/campaigns', method: 'GET' };
        return err;
      };

      // Generate 3 identical errors
      for (let i = 0; i < 3; i++) {
        apiErrorHandler.processError(createError());
      }

      const processedError = apiErrorHandler.processError(createError());
      
      expect(processedError.metadata.pattern.count).toBe(4);
      expect(processedError.metadata.pattern.isRecurring).toBe(true);
    });

    it('should limit error history size', () => {
      const originalMaxSize = apiErrorHandler.maxHistorySize;
      apiErrorHandler.maxHistorySize = 3;

      // Add 5 errors
      for (let i = 0; i < 5; i++) {
        apiErrorHandler.processError(createMockError(`Error ${i}`));
      }

      expect(apiErrorHandler.errorHistory).toHaveLength(3);
      
      // Restore original size
      apiErrorHandler.maxHistorySize = originalMaxSize;
    });
  });

  describe('parseRetryAfter', () => {
    it('should parse numeric retry-after header', () => {
      const delay = apiErrorHandler.parseRetryAfter('60');
      expect(delay).toBe(60000); // 60 seconds in ms
    });

    it('should parse date retry-after header', () => {
      const future = new Date(Date.now() + 60000);
      const delay = apiErrorHandler.parseRetryAfter(future.toISOString());
      expect(delay).toBeGreaterThan(59000);
      expect(delay).toBeLessThan(61000);
    });

    it('should handle invalid retry-after header', () => {
      const delay = apiErrorHandler.parseRetryAfter('invalid');
      expect(delay).toBe(1000);
    });

    it('should handle missing retry-after header', () => {
      const delay = apiErrorHandler.parseRetryAfter(null);
      expect(delay).toBe(1000);
    });
  });

  describe('getErrorStats', () => {
    beforeEach(() => {
      apiErrorHandler.errorHistory = [];
    });

    it('should return empty stats for no errors', () => {
      const stats = apiErrorHandler.getErrorStats();
      
      expect(stats.total).toBe(0);
      expect(stats.lastHour).toBe(0);
      expect(stats.today).toBe(0);
      expect(stats.byCategory).toEqual({});
      expect(stats.bySeverity).toEqual({});
    });

    it('should calculate error statistics', () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 30 * 60 * 1000); // 30 min ago
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000); // 2 hours ago

      // Add errors with different timestamps
      apiErrorHandler.errorHistory = [
        { 
          timestamp: now.toISOString(), 
          category: ERROR_CATEGORIES.NETWORK,
          severity: ERROR_SEVERITY.HIGH
        },
        { 
          timestamp: oneHourAgo.toISOString(), 
          category: ERROR_CATEGORIES.SERVER,
          severity: ERROR_SEVERITY.HIGH
        },
        { 
          timestamp: twoHoursAgo.toISOString(), 
          category: ERROR_CATEGORIES.VALIDATION,
          severity: ERROR_SEVERITY.LOW
        }
      ];

      const stats = apiErrorHandler.getErrorStats();
      
      expect(stats.total).toBe(3);
      expect(stats.lastHour).toBe(2); // Within last hour
      expect(stats.today).toBe(3); // All within today
      expect(stats.byCategory[ERROR_CATEGORIES.NETWORK]).toBe(1);
      expect(stats.byCategory[ERROR_CATEGORIES.SERVER]).toBe(1);
      expect(stats.bySeverity[ERROR_SEVERITY.HIGH]).toBe(2);
      expect(stats.bySeverity[ERROR_SEVERITY.LOW]).toBe(1);
    });
  });
});

describe('useAPIErrorHandler', () => {
  const mockAddError = vi.fn();
  const mockAddNotification = vi.fn();

  beforeEach(() => {
    const { useError } = require('../../contexts/ErrorContext.jsx');
    const { useUIStore } = require('../../stores/uiStore');
    
    useError.mockReturnValue({ addError: mockAddError });
    useUIStore.mockReturnValue({ addNotification: mockAddNotification });
    
    vi.clearAllMocks();
  });

  it('should handle API errors', () => {
    const { result } = renderHook(() => useAPIErrorHandler());
    const error = createMockError('Test error', 500);

    const processedError = result.current.handleAPIError(error, {
      operation: 'testOperation'
    });

    expect(processedError).toBeDefined();
    expect(processedError.category).toBe(ERROR_CATEGORIES.SERVER);
    expect(mockAddError).toHaveBeenCalledWith(processedError);
  });

  it('should show notifications for high severity errors', () => {
    const { result } = renderHook(() => useAPIErrorHandler());
    const error = createMockError('Server error', 500);

    result.current.handleAPIError(error);

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.stringContaining('Server error'),
      'error',
      5000
    );
  });

  it('should show warning for recurring server errors', () => {
    const { result } = renderHook(() => useAPIErrorHandler());
    
    // Create recurring error pattern
    const createError = () => {
      const err = createMockError('Server error', 500);
      err.config = { url: '/api/test', method: 'GET' };
      return err;
    };

    // Generate pattern (6 errors to trigger warning)
    for (let i = 0; i < 6; i++) {
      result.current.handleAPIError(createError());
    }

    expect(mockAddNotification).toHaveBeenCalledWith(
      expect.stringContaining('technical difficulties'),
      'warning',
      10000
    );
  });

  it('should not show notifications for low severity errors', () => {
    const { result } = renderHook(() => useAPIErrorHandler());
    const error = createMockError('Validation error', 400);

    result.current.handleAPIError(error);

    // Should add to error context but not show notification
    expect(mockAddError).toHaveBeenCalled();
    expect(mockAddNotification).not.toHaveBeenCalled();
  });

  it('should show critical error notifications that do not auto-dismiss', () => {
    const { result } = renderHook(() => useAPIErrorHandler());
    
    // Mock a critical error
    const criticalError = createMockError('Critical error', 500);
    apiErrorHandler.classifyError = vi.fn().mockReturnValue({
      category: ERROR_CATEGORIES.SERVER,
      severity: ERROR_SEVERITY.CRITICAL,
      userMessage: 'Critical system error'
    });

    result.current.handleAPIError(criticalError);

    expect(mockAddNotification).toHaveBeenCalledWith(
      'Critical system error',
      'error',
      0 // No auto-dismiss
    );
  });

  it('should log errors in development mode', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleGroupSpy = vi.spyOn(console, 'group').mockImplementation(() => {});
    const consoleGroupEndSpy = vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    
    // Mock development environment
    const originalEnv = import.meta.env.DEV;
    import.meta.env.DEV = true;

    const { result } = renderHook(() => useAPIErrorHandler());
    const error = createMockError('Test error');

    result.current.handleAPIError(error);

    expect(consoleGroupSpy).toHaveBeenCalledWith('🚨 API Error');
    expect(consoleSpy).toHaveBeenCalledWith('Processed Error:', expect.any(Object));
    expect(consoleSpy).toHaveBeenCalledWith('Original Error:', error);
    expect(consoleGroupEndSpy).toHaveBeenCalled();

    // Restore environment
    import.meta.env.DEV = originalEnv;
    
    consoleSpy.mockRestore();
    consoleGroupSpy.mockRestore();
    consoleGroupEndSpy.mockRestore();
  });
});