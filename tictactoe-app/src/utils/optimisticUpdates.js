import { useUIStore } from '../stores/uiStore';

// Generic optimistic update helper
export const createOptimisticUpdate = ({
  updateFunction,
  rollbackFunction,
  successMessage,
  errorMessage,
  loadingStateKey
}) => {
  return async (...args) => {
    const { addNotification } = useUIStore.getState();
    
    // Store original state for rollback
    const originalState = rollbackFunction ? rollbackFunction() : null;
    
    try {
      // Show loading indicator if specified
      if (loadingStateKey) {
        useUIStore.getState().setGlobalLoading(true);
      }
      
      // Apply optimistic update and perform actual operation
      const result = await updateFunction(...args);
      
      // Show success notification
      if (successMessage) {
        addNotification(successMessage, 'success');
      }
      
      return result;
    } catch (error) {
      // Rollback optimistic changes
      if (rollbackFunction && originalState) {
        rollbackFunction(originalState);
      }
      
      // Show error notification
      const message = errorMessage || `Operation failed: ${error.message}`;
      addNotification(message, 'error');
      
      throw error;
    } finally {
      // Clear loading state
      if (loadingStateKey) {
        useUIStore.getState().setGlobalLoading(false);
      }
    }
  };
};

// Optimistic list operations
export const optimisticListOperations = {
  // Add item to list optimistically
  add: (list, item, getId = (item) => item.id) => {
    const optimisticItem = {
      ...item,
      id: getId(item) || `temp-${Date.now()}`,
      _optimistic: true,
      _timestamp: Date.now()
    };
    
    return [...list, optimisticItem];
  },
  
  // Update item in list optimistically
  update: (list, itemId, updates) => {
    return list.map(item => 
      item.id === itemId 
        ? { ...item, ...updates, _optimistic: true, _timestamp: Date.now() }
        : item
    );
  },
  
  // Remove item from list optimistically
  remove: (list, itemId) => {
    return list.filter(item => item.id !== itemId);
  },
  
  // Confirm optimistic operation (remove optimistic flags)
  confirm: (list, itemId, confirmedData = {}) => {
    return list.map(item => 
      item.id === itemId || (item._optimistic && item._tempId === itemId)
        ? { ...item, ...confirmedData, _optimistic: false, _timestamp: undefined }
        : item
    );
  },
  
  // Rollback optimistic operation
  rollback: (list, itemId) => {
    return list.filter(item => !(item.id === itemId && item._optimistic));
  },
  
  // Clean all optimistic flags
  cleanOptimistic: (list) => {
    return list.map(item => ({
      ...item,
      _optimistic: false,
      _timestamp: undefined
    }));
  }
};

// Optimistic UI helpers
export const optimisticUI = {
  // Show optimistic success for a brief moment
  showOptimisticSuccess: (element, duration = 2000) => {
    if (!element) return;
    
    const originalStyle = element.style.cssText;
    element.style.cssText += '; border: 2px solid #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);';
    
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, duration);
  },
  
  // Show optimistic loading state
  showOptimisticLoading: (element, isLoading) => {
    if (!element) return;
    
    if (isLoading) {
      element.style.opacity = '0.6';
      element.style.pointerEvents = 'none';
      element.style.cursor = 'wait';
    } else {
      element.style.opacity = '';
      element.style.pointerEvents = '';
      element.style.cursor = '';
    }
  },
  
  // Add pulsing animation to optimistic items
  addOptimisticAnimation: (element) => {
    if (!element) return;
    
    element.style.animation = 'optimistic-pulse 2s ease-in-out infinite';
    
    // Add keyframes if not already present
    if (!document.querySelector('#optimistic-keyframes')) {
      const style = document.createElement('style');
      style.id = 'optimistic-keyframes';
      style.textContent = `
        @keyframes optimistic-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `;
      document.head.appendChild(style);
    }
  },
  
  // Remove optimistic animation
  removeOptimisticAnimation: (element) => {
    if (!element) return;
    element.style.animation = '';
  }
};

// Optimistic state management helpers
export const optimisticStateHelpers = {
  // Create optimistic item with metadata
  createOptimisticItem: (item, type = 'generic') => ({
    ...item,
    _optimistic: true,
    _optimisticType: type,
    _timestamp: Date.now(),
    _tempId: `temp-${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }),
  
  // Check if item is optimistic
  isOptimistic: (item) => Boolean(item?._optimistic),
  
  // Get optimistic items from list
  getOptimisticItems: (list) => list.filter(item => item._optimistic),
  
  // Get confirmed items from list
  getConfirmedItems: (list) => list.filter(item => !item._optimistic),
  
  // Merge optimistic and confirmed data
  mergeOptimisticData: (optimisticItem, confirmedData) => ({
    ...optimisticItem,
    ...confirmedData,
    _optimistic: false,
    _timestamp: undefined,
    _tempId: undefined,
    _optimisticType: undefined
  }),
  
  // Create optimistic change history entry
  createOptimisticHistoryEntry: (action, user = 'Current User') => ({
    id: `temp-history-${Date.now()}`,
    action,
    user,
    timestamp: new Date().toISOString(),
    _optimistic: true
  })
};

// Enhanced optimistic update wrapper with better error handling
export const withOptimisticUpdate = (asyncOperation, options = {}) => {
  const {
    optimisticUpdate,
    rollback,
    onSuccess,
    onError,
    successMessage,
    errorMessage,
    showLoading = true
  } = options;
  
  return async (...args) => {
    const { addNotification, setGlobalLoading } = useUIStore.getState();
    
    // Store original state for potential rollback
    let originalState = null;
    if (rollback) {
      originalState = rollback();
    }
    
    try {
      // Show loading state
      if (showLoading) {
        setGlobalLoading(true);
      }
      
      // Apply optimistic update immediately
      if (optimisticUpdate) {
        optimisticUpdate(...args);
      }
      
      // Perform actual async operation
      const result = await asyncOperation(...args);
      
      // Handle success
      if (onSuccess) {
        onSuccess(result, ...args);
      }
      
      if (successMessage) {
        addNotification(successMessage, 'success');
      }
      
      return result;
    } catch (error) {
      console.error('Optimistic update failed:', error);
      
      // Rollback optimistic changes
      if (rollback && originalState) {
        rollback(originalState);
      }
      
      // Handle error
      if (onError) {
        onError(error, ...args);
      }
      
      const message = errorMessage || `Operation failed: ${error.message}`;
      addNotification(message, 'error');
      
      throw error;
    } finally {
      // Clear loading state
      if (showLoading) {
        setGlobalLoading(false);
      }
    }
  };
};

// Batch optimistic updates
export const batchOptimisticUpdates = (updates) => {
  const { addNotification, setGlobalLoading } = useUIStore.getState();
  
  return Promise.allSettled(
    updates.map(update => 
      withOptimisticUpdate(update.operation, update.options)(...update.args)
    )
  ).then(results => {
    const successes = results.filter(r => r.status === 'fulfilled').length;
    const failures = results.filter(r => r.status === 'rejected').length;
    
    if (failures === 0) {
      addNotification(`All ${successes} operations completed successfully`, 'success');
    } else if (successes === 0) {
      addNotification(`All ${failures} operations failed`, 'error');
    } else {
      addNotification(`${successes} operations succeeded, ${failures} failed`, 'warning');
    }
    
    return results;
  });
};