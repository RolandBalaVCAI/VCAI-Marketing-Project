import { useState, useCallback, useRef } from 'react';

export const useLoadingState = (initialState = false) => {
  const [isLoading, setIsLoading] = useState(initialState);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [progress, setProgress] = useState(0);
  const loadingCountRef = useRef(0);
  
  const startLoading = useCallback((text = 'Loading...') => {
    loadingCountRef.current += 1;
    setIsLoading(true);
    setLoadingText(text);
    setProgress(0);
  }, []);
  
  const stopLoading = useCallback(() => {
    loadingCountRef.current = Math.max(0, loadingCountRef.current - 1);
    if (loadingCountRef.current === 0) {
      setIsLoading(false);
      setProgress(100);
    }
  }, []);
  
  const updateProgress = useCallback((value) => {
    setProgress(Math.min(100, Math.max(0, value)));
  }, []);
  
  const updateLoadingText = useCallback((text) => {
    setLoadingText(text);
  }, []);
  
  const withLoading = useCallback(async (asyncFn, options = {}) => {
    const {
      text = 'Loading...',
      showProgress = false,
      onProgress,
      onError,
      onSuccess
    } = options;
    
    startLoading(text);
    
    try {
      if (showProgress && onProgress) {
        const result = await asyncFn((progress) => {
          updateProgress(progress);
          onProgress?.(progress);
        });
        
        updateProgress(100);
        onSuccess?.(result);
        return result;
      } else {
        const result = await asyncFn();
        onSuccess?.(result);
        return result;
      }
    } catch (error) {
      onError?.(error);
      throw error;
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading, updateProgress]);
  
  const reset = useCallback(() => {
    loadingCountRef.current = 0;
    setIsLoading(false);
    setLoadingText('Loading...');
    setProgress(0);
  }, []);
  
  return {
    isLoading,
    loadingText,
    progress,
    startLoading,
    stopLoading,
    updateProgress,
    updateLoadingText,
    withLoading,
    reset,
    loadingCount: loadingCountRef.current
  };
};

// Multiple loading states management
export const useMultipleLoadingStates = () => {
  const [loadingStates, setLoadingStates] = useState({});
  
  const setLoading = useCallback((key, value = true, text = 'Loading...') => {
    setLoadingStates(prev => ({
      ...prev,
      [key]: { isLoading: value, text, startTime: value ? Date.now() : prev[key]?.startTime }
    }));
  }, []);
  
  const isLoading = useCallback((key) => {
    return loadingStates[key]?.isLoading || false;
  }, [loadingStates]);
  
  const isAnyLoading = useCallback(() => {
    return Object.values(loadingStates).some(state => state?.isLoading);
  }, [loadingStates]);
  
  const getLoadingText = useCallback((key) => {
    return loadingStates[key]?.text || 'Loading...';
  }, [loadingStates]);
  
  const getLoadingDuration = useCallback((key) => {
    const state = loadingStates[key];
    if (!state?.isLoading || !state?.startTime) return 0;
    return Date.now() - state.startTime;
  }, [loadingStates]);
  
  const clearLoading = useCallback((key) => {
    setLoadingStates(prev => {
      const newStates = { ...prev };
      delete newStates[key];
      return newStates;
    });
  }, []);
  
  const clearAll = useCallback(() => {
    setLoadingStates({});
  }, []);
  
  const withLoading = useCallback(async (key, asyncFn, text = 'Loading...') => {
    setLoading(key, true, text);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);
  
  return {
    loadingStates,
    setLoading,
    isLoading,
    isAnyLoading,
    getLoadingText,
    getLoadingDuration,
    clearLoading,
    clearAll,
    withLoading
  };
};

// Loading queue for sequential operations
export const useLoadingQueue = () => {
  const [queue, setQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  
  const addToQueue = useCallback((item) => {
    const queueItem = {
      id: Date.now(),
      ...item,
      status: 'pending'
    };
    
    setQueue(prev => [...prev, queueItem]);
    return queueItem.id;
  }, []);
  
  const processQueue = useCallback(async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    while (queue.length > 0) {
      const [item, ...rest] = queue;
      setQueue(rest);
      setCurrentItem(item);
      
      try {
        await item.action();
        item.onSuccess?.();
      } catch (error) {
        item.onError?.(error);
      }
    }
    
    setCurrentItem(null);
    setIsProcessing(false);
  }, [queue, isProcessing]);
  
  const clearQueue = useCallback(() => {
    setQueue([]);
    setCurrentItem(null);
    setIsProcessing(false);
  }, []);
  
  const removeFromQueue = useCallback((id) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);
  
  return {
    queue,
    isProcessing,
    currentItem,
    addToQueue,
    processQueue,
    clearQueue,
    removeFromQueue,
    queueLength: queue.length
  };
};