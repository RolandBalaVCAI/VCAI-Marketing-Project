import { ERROR_CATEGORIES } from '../api/errorHandler';
import { useUIStore } from '../stores/uiStore';

class ErrorRecoveryService {
  constructor() {
    this.pendingRecoveries = new Map();
    this.recoveryStrategies = new Map();
    this.isOnline = navigator.onLine;
    
    // Monitor online status
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
  }
  
  // Register recovery strategy for specific error types
  registerRecoveryStrategy(errorCategory, strategy) {
    this.recoveryStrategies.set(errorCategory, strategy);
  }
  
  // Attempt to recover from error
  async attemptRecovery(error, originalOperation) {
    const recoveryId = this.generateRecoveryId();
    
    const recovery = {
      id: recoveryId,
      error,
      originalOperation,
      attempts: 0,
      maxAttempts: error.processed?.maxRetries || 3,
      startTime: Date.now(),
      status: 'pending'
    };
    
    this.pendingRecoveries.set(recoveryId, recovery);
    
    try {
      const strategy = this.recoveryStrategies.get(error.processed?.category);
      
      if (strategy) {
        await strategy(error, originalOperation, recovery);
      } else {
        await this.defaultRecoveryStrategy(error, originalOperation, recovery);
      }
      
      recovery.status = 'successful';
      this.notifyRecoverySuccess(recovery);
    } catch (recoveryError) {
      recovery.status = 'failed';
      recovery.error = recoveryError;
      this.notifyRecoveryFailure(recovery);
    } finally {
      // Clean up after delay
      setTimeout(() => {
        this.pendingRecoveries.delete(recoveryId);
      }, 60000); // Keep for 1 minute for debugging
    }
    
    return recovery;
  }
  
  // Default recovery strategy
  async defaultRecoveryStrategy(error, originalOperation, recovery) {
    if (error.processed?.isRetryable && recovery.attempts < recovery.maxAttempts) {
      recovery.attempts++;
      
      // Wait before retry
      const delay = Math.min(1000 * Math.pow(2, recovery.attempts - 1), 10000);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Retry original operation
      return await originalOperation();
    } else {
      throw new Error('Recovery not possible');
    }
  }
  
  // Handle coming back online
  handleOnline() {
    this.isOnline = true;
    console.log('🌐 Back online - attempting to recover failed operations');
    
    // Get UI store for notifications
    try {
      const { addNotification } = useUIStore.getState();
      addNotification(
        'Connection restored. Retrying failed operations.',
        'success',
        3000
      );
    } catch (error) {
      console.warn('Could not show online notification:', error);
    }
    
    // Attempt to recover network-related failures
    for (const [, recovery] of this.pendingRecoveries) {
      if (recovery.error.processed?.category === ERROR_CATEGORIES.NETWORK && 
          recovery.status === 'pending') {
        this.attemptRecovery(recovery.error, recovery.originalOperation);
      }
    }
  }
  
  // Handle going offline
  handleOffline() {
    this.isOnline = false;
    console.log('🌐 Gone offline - queueing operations for later');
    
    try {
      const { addNotification } = useUIStore.getState();
      addNotification(
        'You are now offline. Changes will be saved when connection is restored.',
        'warning',
        0 // Don't auto-dismiss
      );
    } catch (error) {
      console.warn('Could not show offline notification:', error);
    }
  }
  
  // Generate recovery ID
  generateRecoveryId() {
    return `recovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // Notify recovery success
  notifyRecoverySuccess(recovery) {
    try {
      const { addNotification } = useUIStore.getState();
      addNotification(
        'Operation completed successfully after retry.',
        'success',
        3000
      );
    } catch (error) {
      console.warn('Could not show recovery success notification:', error);
    }
    
    console.log('✅ Recovery successful:', recovery);
  }
  
  // Notify recovery failure
  notifyRecoveryFailure(recovery) {
    try {
      const { addNotification } = useUIStore.getState();
      addNotification(
        'Unable to complete the operation. Please try again later.',
        'error',
        5000
      );
    } catch (error) {
      console.warn('Could not show recovery failure notification:', error);
    }
    
    console.error('❌ Recovery failed:', recovery);
  }
  
  // Get recovery statistics
  getRecoveryStats() {
    const recoveries = Array.from(this.pendingRecoveries.values());
    
    return {
      total: recoveries.length,
      successful: recoveries.filter(r => r.status === 'successful').length,
      failed: recoveries.filter(r => r.status === 'failed').length,
      pending: recoveries.filter(r => r.status === 'pending').length,
      averageAttempts: recoveries.reduce((sum, r) => sum + r.attempts, 0) / recoveries.length || 0
    };
  }
  
  // Queue operation for later execution (useful for offline mode)
  queueOperation(operation, options = {}) {
    const queueId = this.generateRecoveryId();
    const queuedOperation = {
      id: queueId,
      operation,
      options,
      queuedAt: new Date().toISOString(),
      status: 'queued'
    };
    
    // Store in localStorage for persistence across page reloads
    const queuedOps = JSON.parse(localStorage.getItem('queuedOperations') || '[]');
    queuedOps.push(queuedOperation);
    localStorage.setItem('queuedOperations', JSON.stringify(queuedOps));
    
    return queueId;
  }
  
  // Process queued operations (when coming back online)
  async processQueuedOperations() {
    const queuedOps = JSON.parse(localStorage.getItem('queuedOperations') || '[]');
    const results = [];
    
    for (const queuedOp of queuedOps) {
      try {
        const result = await queuedOp.operation();
        results.push({ id: queuedOp.id, status: 'success', result });
      } catch (error) {
        results.push({ id: queuedOp.id, status: 'error', error });
      }
    }
    
    // Clear processed operations
    localStorage.removeItem('queuedOperations');
    
    return results;
  }
}

// Create singleton instance
export const errorRecoveryService = new ErrorRecoveryService();

// Register default recovery strategies
errorRecoveryService.registerRecoveryStrategy(ERROR_CATEGORIES.NETWORK, async (error, originalOperation) => {
  // Wait for network to come back online if offline
  if (!navigator.onLine) {
    await new Promise(resolve => {
      const handleOnline = () => {
        window.removeEventListener('online', handleOnline);
        resolve();
      };
      window.addEventListener('online', handleOnline);
    });
  }
  
  // Retry the operation
  return await originalOperation();
});

errorRecoveryService.registerRecoveryStrategy(ERROR_CATEGORIES.RATE_LIMIT, async (error, originalOperation) => {
  // Wait for the specified retry delay
  const delay = error.processed?.retryDelay || 5000;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Retry the operation
  return await originalOperation();
});

errorRecoveryService.registerRecoveryStrategy(ERROR_CATEGORIES.SERVER, async (error, originalOperation, recovery) => {
  // Exponential backoff for server errors
  const delay = Math.min(1000 * Math.pow(2, recovery.attempts), 30000);
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // Retry the operation
  return await originalOperation();
});

export default errorRecoveryService;