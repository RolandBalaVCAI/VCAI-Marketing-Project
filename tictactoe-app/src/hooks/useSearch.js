import { useState, useCallback, useMemo } from 'react';
import { useDebounce } from './useDebounce';

export const useSearch = (data = [], options = {}) => {
  const {
    searchFields = ['name'],
    caseSensitive = false,
    exactMatch = false,
    debounceMs = 300,
    minSearchLength = 0,
    highlightMatches = false,
    onSearchChange
  } = options;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState([]);
  const [isSearchActive, setIsSearchActive] = useState(false);
  
  // Debounced search term for performance
  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);
  
  // Normalize search term
  const normalizeText = useCallback((text) => {
    if (typeof text !== 'string') return '';
    return caseSensitive ? text : text.toLowerCase();
  }, [caseSensitive]);
  
  // Extract searchable text from an item
  const extractSearchableText = useCallback((item, fields) => {
    return fields.map(field => {
      // Handle nested fields like 'metrics.revenue'
      const value = field.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : '';
      }, item);
      
      return String(value);
    }).join(' ');
  }, []);
  
  // Search matching logic
  const matchesSearch = useCallback((item, term) => {
    if (!term || term.length < minSearchLength) return true;
    
    const searchableText = normalizeText(
      extractSearchableText(item, searchFields)
    );
    const normalizedTerm = normalizeText(term);
    
    if (exactMatch) {
      return searchableText === normalizedTerm;
    }
    
    // Support multiple search terms (AND logic)
    const searchTerms = normalizedTerm.split(/\s+/).filter(t => t.length > 0);
    
    return searchTerms.every(searchTermPart => 
      searchableText.includes(searchTermPart)
    );
  }, [
    searchFields, 
    exactMatch, 
    minSearchLength, 
    normalizeText, 
    extractSearchableText
  ]);
  
  // Filter data based on search
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm || debouncedSearchTerm.length < minSearchLength) {
      return data;
    }
    
    return data.filter(item => matchesSearch(item, debouncedSearchTerm));
  }, [data, debouncedSearchTerm, matchesSearch, minSearchLength]);
  
  // Highlight matches in text
  const highlightText = useCallback((text, term) => {
    if (!highlightMatches || !term || !text) return text;
    
    const normalizedText = normalizeText(text);
    const normalizedTerm = normalizeText(term);
    
    if (!normalizedText.includes(normalizedTerm)) return text;
    
    // Create regex for case-insensitive replacement
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, caseSensitive ? 'g' : 'gi');
    
    return text.replace(regex, '<mark>$1</mark>');
  }, [highlightMatches, normalizeText, caseSensitive]);
  
  // Update search term
  const updateSearchTerm = useCallback((term) => {
    setSearchTerm(term);
    setIsSearchActive(term.length > 0);
    
    // Add to search history if it's a meaningful search
    if (term && term.length >= minSearchLength && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 9)]); // Keep last 10 searches
    }
    
    onSearchChange?.(term);
  }, [minSearchLength, searchHistory, onSearchChange]);
  
  // Clear search
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setIsSearchActive(false);
    onSearchChange?.('');
  }, [onSearchChange]);
  
  // Advanced search functions
  const searchByField = useCallback((field, term) => {
    return data.filter(item => {
      const fieldValue = field.split('.').reduce((obj, key) => {
        return obj && obj[key] !== undefined ? obj[key] : '';
      }, item);
      
      const searchableText = normalizeText(String(fieldValue));
      const normalizedTerm = normalizeText(term);
      
      return exactMatch 
        ? searchableText === normalizedTerm
        : searchableText.includes(normalizedTerm);
    });
  }, [data, normalizeText, exactMatch]);
  
  // Multi-field search
  const multiFieldSearch = useCallback((searchQueries) => {
    return data.filter(item => {
      return Object.entries(searchQueries).every(([field, term]) => {
        if (!term) return true;
        
        const fieldValue = field.split('.').reduce((obj, key) => {
          return obj && obj[key] !== undefined ? obj[key] : '';
        }, item);
        
        const searchableText = normalizeText(String(fieldValue));
        const normalizedTerm = normalizeText(term);
        
        return exactMatch 
          ? searchableText === normalizedTerm
          : searchableText.includes(normalizedTerm);
      });
    });
  }, [data, normalizeText, exactMatch]);
  
  // Search suggestions based on available data
  const searchSuggestions = useMemo(() => {
    if (!searchTerm || searchTerm.length < 2) return [];
    
    const suggestions = new Set();
    const term = normalizeText(searchTerm);
    
    data.forEach(item => {
      searchFields.forEach(field => {
        const value = field.split('.').reduce((obj, key) => {
          return obj && obj[key] !== undefined ? obj[key] : '';
        }, item);
        
        const text = normalizeText(String(value));
        if (text.includes(term) && text !== term) {
          suggestions.add(value);
        }
      });
    });
    
    return Array.from(suggestions).slice(0, 10);
  }, [data, searchTerm, searchFields, normalizeText]);
  
  // Search statistics
  const searchStats = useMemo(() => {
    const totalItems = data.length;
    const filteredItems = filteredData.length;
    const isFiltered = debouncedSearchTerm.length >= minSearchLength;
    
    return {
      totalItems,
      filteredItems,
      hiddenItems: totalItems - filteredItems,
      isFiltered,
      matchPercentage: totalItems > 0 ? (filteredItems / totalItems) * 100 : 0,
      hasResults: filteredItems > 0,
      isEmpty: filteredItems === 0 && isFiltered
    };
  }, [data.length, filteredData.length, debouncedSearchTerm, minSearchLength]);
  
  // Get search result summary
  const getSearchSummary = useCallback(() => {
    if (!isSearchActive) return '';
    
    const { filteredItems, totalItems, isEmpty } = searchStats;
    
    if (isEmpty) {
      return `No results found for "${debouncedSearchTerm}"`;
    }
    
    if (filteredItems === totalItems) {
      return `Showing all ${totalItems} items`;
    }
    
    return `Found ${filteredItems} of ${totalItems} items matching "${debouncedSearchTerm}"`;
  }, [isSearchActive, searchStats, debouncedSearchTerm]);
  
  return {
    // Search state
    searchTerm,
    debouncedSearchTerm,
    isSearchActive,
    
    // Filtered data
    data: filteredData,
    originalData: data,
    
    // Actions
    updateSearchTerm,
    clearSearch,
    setSearchTerm: updateSearchTerm,
    
    // Advanced search
    searchByField,
    multiFieldSearch,
    
    // Utilities
    highlightText,
    matchesSearch,
    
    // Search history and suggestions
    searchHistory,
    searchSuggestions,
    
    // Statistics
    ...searchStats,
    searchSummary: getSearchSummary(),
    
    // Configuration
    searchFields,
    caseSensitive,
    exactMatch,
    minSearchLength,
    highlightMatches
  };
};