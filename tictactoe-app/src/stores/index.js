import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Utility to combine stores
export const combineStores = (...stores) => create(
  devtools(
    (set, get) => {
      const combined = stores.reduce((acc, createStore) => {
        const store = createStore(set, get);
        return { ...acc, ...store };
      }, {});
      return combined;
    },
    { name: 'marketing-dashboard' }
  )
);

// Utility to create a store with devtools and persistence
export const createStoreWithMiddleware = (
  storeCreator,
  options = {}
) => {
  const {
    name = 'store',
    persist: shouldPersist = false,
    persistOptions = {}
  } = options;

  let store = create(devtools(storeCreator, { name }));

  if (shouldPersist) {
    store = create(
      persist(
        devtools(storeCreator, { name }),
        {
          name: `marketing-dashboard-${name}`,
          ...persistOptions
        }
      )
    );
  }

  return store;
};

// Action helper to ensure proper action naming in devtools
export const createAction = (actionName, actionFn) => {
  return (...args) => {
    const result = actionFn(...args);
    
    // If the action returns a function (for async actions), wrap it
    if (typeof result === 'function') {
      return (set, get, api) => {
        return result(
          (partial, replace, name) => set(partial, replace, name || actionName),
          get,
          api
        );
      };
    }
    
    return result;
  };
};

// Async action wrapper for consistent error handling
export const createAsyncAction = (actionName, asyncFn) => {
  return (...args) => async (set, get) => {
    set({ isLoading: true }, false, `${actionName}_START`);
    
    try {
      const result = await asyncFn(...args, { set, get });
      set({ isLoading: false }, false, `${actionName}_SUCCESS`);
      return result;
    } catch (error) {
      console.error(`${actionName} failed:`, error);
      set(
        { 
          isLoading: false, 
          error: {
            message: error.message || 'An unexpected error occurred',
            code: error.code || 'UNKNOWN_ERROR',
            timestamp: new Date().toISOString(),
            action: actionName
          }
        }, 
        false, 
        `${actionName}_ERROR`
      );
      throw error;
    }
  };
};

// Optimistic update helper
export const createOptimisticAction = (actionName, updateFn, revertFn) => {
  return (payload) => (set, get) => {
    const previousState = get();
    
    // Apply optimistic update
    updateFn(payload, set, get);
    set({}, false, `${actionName}_OPTIMISTIC`);
    
    // Return revert function
    return () => {
      revertFn(previousState, set, get);
      set({}, false, `${actionName}_REVERT`);
    };
  };
};

// Store subscription helper
export const subscribeToStore = (store, selector, callback) => {
  return store.subscribe(
    (state) => selector(state),
    (selectedState, previousSelectedState) => {
      if (selectedState !== previousSelectedState) {
        callback(selectedState, previousSelectedState);
      }
    }
  );
};

// Computed value helper (memoized selectors)
export const createSelector = (selectorFn) => {
  let lastResult;
  let lastArgs;
  
  return (...args) => {
    // Simple shallow comparison for args
    const argsChanged = !lastArgs || 
      args.length !== lastArgs.length || 
      args.some((arg, index) => arg !== lastArgs[index]);
    
    if (argsChanged) {
      lastArgs = args;
      lastResult = selectorFn(...args);
    }
    
    return lastResult;
  };
};

// Debug helper for development
export const logStoreState = (storeName, state) => {
  if (process.env.NODE_ENV === 'development') {
    console.group(`🏪 ${storeName} State`);
    console.log('Current State:', state);
    console.groupEnd();
  }
};

// Store health check utility
export const validateStoreState = (state, schema) => {
  const errors = [];
  
  Object.entries(schema).forEach(([key, validator]) => {
    if (typeof validator === 'function') {
      const isValid = validator(state[key]);
      if (!isValid) {
        errors.push(`Invalid value for ${key}: ${state[key]}`);
      }
    } else if (typeof validator === 'object' && validator.required) {
      if (state[key] === undefined || state[key] === null) {
        errors.push(`Required field ${key} is missing`);
      }
    }
  });
  
  if (errors.length > 0) {
    console.warn('Store validation errors:', errors);
  }
  
  return errors.length === 0;
};

export default {
  combineStores,
  createStoreWithMiddleware,
  createAction,
  createAsyncAction,
  createOptimisticAction,
  subscribeToStore,
  createSelector,
  logStoreState,
  validateStoreState
};