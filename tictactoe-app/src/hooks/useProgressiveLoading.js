import { useState, useEffect, useCallback } from 'react';

// Hook for progressive loading
export const useProgressiveLoading = (items = [], chunkSize = 10, delay = 100) => {
  const [visibleItems, setVisibleItems] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(items.length > chunkSize);

  // Initialize with first chunk
  useEffect(() => {
    if (items.length > 0) {
      setVisibleItems(items.slice(0, chunkSize));
      setHasMore(items.length > chunkSize);
    } else {
      setVisibleItems([]);
      setHasMore(false);
    }
  }, [items, chunkSize]);

  // Load more items
  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    // Simulate async delay
    await new Promise(resolve => setTimeout(resolve, delay));

    setVisibleItems(prev => {
      const nextChunk = items.slice(prev.length, prev.length + chunkSize);
      const newItems = [...prev, ...nextChunk];
      setHasMore(newItems.length < items.length);
      return newItems;
    });

    setIsLoadingMore(false);
  }, [items, chunkSize, delay, isLoadingMore, hasMore]);

  // Load all remaining items
  const loadAll = useCallback(async () => {
    if (isLoadingMore) return;

    setIsLoadingMore(true);
    await new Promise(resolve => setTimeout(resolve, delay));

    setVisibleItems(items);
    setHasMore(false);
    setIsLoadingMore(false);
  }, [items, delay, isLoadingMore]);

  return {
    visibleItems,
    isLoadingMore,
    hasMore,
    loadMore,
    loadAll,
    progress: items.length > 0 ? (visibleItems.length / items.length) * 100 : 0
  };
};

// Hook for transition states
export const useTransitionState = (delay = 300) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const transition = useCallback(async (callback) => {
    setIsTransitioning(true);
    setIsVisible(false);

    await new Promise(resolve => setTimeout(resolve, delay));

    if (callback) {
      await callback();
    }

    setIsVisible(true);
    setIsTransitioning(false);
  }, [delay]);

  return {
    isVisible,
    isTransitioning,
    transition
  };
};

// Hook for lazy loading with intersection observer
export const useLazyLoading = (options = {}) => {
  const {
    threshold = 0.1,
    rootMargin = '50px',
    triggerOnce = true
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(false);
  const [ref, setRef] = useState(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          if (triggerOnce) {
            observer.unobserve(ref);
          }
        } else if (!triggerOnce) {
          setIsIntersecting(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(ref);

    return () => {
      observer.unobserve(ref);
    };
  }, [ref, threshold, rootMargin, triggerOnce]);

  return [setRef, isIntersecting];
};

// Hook for infinite scroll
export const useInfiniteScroll = (loadMore, hasMore = true) => {
  const [isFetching, setIsFetching] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + document.documentElement.scrollTop !== document.documentElement.offsetHeight || isFetching) {
        return;
      }
      setIsFetching(true);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isFetching]);

  useEffect(() => {
    if (!isFetching || !hasMore) return;

    const fetchMoreData = async () => {
      await loadMore();
      setIsFetching(false);
    };

    fetchMoreData();
  }, [isFetching, hasMore, loadMore]);

  return [isFetching, setIsFetching];
};

// Hook for smooth state transitions
export const useSmoothTransition = (value, delay = 150) => {
  const [displayValue, setDisplayValue] = useState(value);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (value !== displayValue) {
      setIsTransitioning(true);
      
      const timeout = setTimeout(() => {
        setDisplayValue(value);
        setIsTransitioning(false);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [value, displayValue, delay]);

  return [displayValue, isTransitioning];
};