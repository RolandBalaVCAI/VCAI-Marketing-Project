import { useState, useCallback, useMemo } from 'react';

export const useSelection = (items = [], options = {}) => {
  const {
    keyField = 'id',
    multiSelect = true,
    initialSelection = [],
    onSelectionChange
  } = options;
  
  const [selectedItems, setSelectedItems] = useState(new Set(initialSelection));
  
  // Get key for an item
  const getItemKey = useCallback((item) => {
    return typeof item === 'object' ? item[keyField] : item;
  }, [keyField]);
  
  // Select single item
  const selectItem = useCallback((item) => {
    const key = getItemKey(item);
    
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      
      if (multiSelect) {
        newSelection.add(key);
      } else {
        newSelection.clear();
        newSelection.add(key);
      }
      
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [getItemKey, multiSelect, onSelectionChange]);
  
  // Deselect single item
  const deselectItem = useCallback((item) => {
    const key = getItemKey(item);
    
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      newSelection.delete(key);
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [getItemKey, onSelectionChange]);
  
  // Toggle single item selection
  const toggleItem = useCallback((item) => {
    const key = getItemKey(item);
    
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      
      if (newSelection.has(key)) {
        newSelection.delete(key);
      } else {
        if (!multiSelect) {
          newSelection.clear();
        }
        newSelection.add(key);
      }
      
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [getItemKey, multiSelect, onSelectionChange]);
  
  // Select multiple items
  const selectItems = useCallback((itemsToSelect) => {
    setSelectedItems(prev => {
      const newSelection = multiSelect ? new Set(prev) : new Set();
      
      itemsToSelect.forEach(item => {
        const key = getItemKey(item);
        newSelection.add(key);
      });
      
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [getItemKey, multiSelect, onSelectionChange]);
  
  // Deselect multiple items
  const deselectItems = useCallback((itemsToDeselect) => {
    setSelectedItems(prev => {
      const newSelection = new Set(prev);
      
      itemsToDeselect.forEach(item => {
        const key = getItemKey(item);
        newSelection.delete(key);
      });
      
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [getItemKey, onSelectionChange]);
  
  // Select all items
  const selectAll = useCallback(() => {
    if (!multiSelect) return;
    
    setSelectedItems(() => {
      const newSelection = new Set(items.map(item => getItemKey(item)));
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [items, getItemKey, multiSelect, onSelectionChange]);
  
  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedItems(() => {
      const newSelection = new Set();
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [onSelectionChange]);
  
  // Toggle all items selection
  const toggleAll = useCallback(() => {
    if (!multiSelect) return;
    
    setSelectedItems(prev => {
      const allKeys = items.map(item => getItemKey(item));
      const hasAllSelected = allKeys.every(key => prev.has(key));
      
      const newSelection = hasAllSelected ? new Set() : new Set(allKeys);
      onSelectionChange?.(Array.from(newSelection));
      return newSelection;
    });
  }, [items, getItemKey, multiSelect, onSelectionChange]);
  
  // Select items by condition
  const selectWhere = useCallback((predicate) => {
    if (!multiSelect) return;
    
    const itemsToSelect = items.filter(predicate);
    selectItems(itemsToSelect);
  }, [items, selectItems, multiSelect]);
  
  // Deselect items by condition
  const deselectWhere = useCallback((predicate) => {
    const itemsToDeselect = items.filter(predicate);
    deselectItems(itemsToDeselect);
  }, [items, deselectItems]);
  
  // Check if item is selected
  const isSelected = useCallback((item) => {
    const key = getItemKey(item);
    return selectedItems.has(key);
  }, [selectedItems, getItemKey]);
  
  // Get selected items as objects
  const getSelectedItems = useCallback(() => {
    return items.filter(item => selectedItems.has(getItemKey(item)));
  }, [items, selectedItems, getItemKey]);
  
  // Computed values
  const selectedCount = selectedItems.size;
  const totalCount = items.length;
  const hasSelection = selectedCount > 0;
  const hasPartialSelection = selectedCount > 0 && selectedCount < totalCount;
  const hasFullSelection = selectedCount === totalCount && totalCount > 0;
  const selectionPercentage = totalCount > 0 ? (selectedCount / totalCount) * 100 : 0;
  
  // Selected items with their data
  const selectedItemsData = useMemo(() => {
    return getSelectedItems();
  }, [getSelectedItems]);
  
  // Selected item keys as array
  const selectedKeys = useMemo(() => {
    return Array.from(selectedItems);
  }, [selectedItems]);
  
  // Bulk operations
  const bulkOperations = useMemo(() => ({
    // Select by status
    selectByStatus: (status) => {
      selectWhere(item => item.status === status);
    },
    
    // Select by vendor
    selectByVendor: (vendor) => {
      selectWhere(item => item.vendor === vendor);
    },
    
    // Select active campaigns
    selectActive: () => {
      selectWhere(item => item.status === 'Active');
    },
    
    // Select paused campaigns
    selectPaused: () => {
      selectWhere(item => item.status === 'Paused');
    },
    
    // Select high performing (ROAS > threshold)
    selectHighPerforming: (roasThreshold = 150) => {
      selectWhere(item => {
        const roas = item.metrics?.revenue && item.metrics?.cost 
          ? (item.metrics.revenue / item.metrics.cost) * 100 
          : 0;
        return roas > roasThreshold;
      });
    },
    
    // Select low performing (ROAS < threshold)
    selectLowPerforming: (roasThreshold = 100) => {
      selectWhere(item => {
        const roas = item.metrics?.revenue && item.metrics?.cost 
          ? (item.metrics.revenue / item.metrics.cost) * 100 
          : 0;
        return roas < roasThreshold;
      });
    },
    
    // Select by date range
    selectByDateRange: (startDate, endDate) => {
      selectWhere(item => {
        const itemDate = new Date(item.startDate);
        return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
      });
    },
    
    // Select recent campaigns (last N days)
    selectRecent: (days = 30) => {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      selectWhere(item => {
        const itemDate = new Date(item.startDate);
        return itemDate >= cutoffDate;
      });
    }
  }), [selectWhere]);
  
  // Reset selection
  const reset = useCallback(() => {
    setSelectedItems(new Set(initialSelection));
    onSelectionChange?.(initialSelection);
  }, [initialSelection, onSelectionChange]);
  
  return {
    // Selection state
    selectedItems: selectedItemsData,
    selectedKeys,
    selectedCount,
    totalCount,
    hasSelection,
    hasPartialSelection,
    hasFullSelection,
    selectionPercentage,
    
    // Actions
    selectItem,
    deselectItem,
    toggleItem,
    selectItems,
    deselectItems,
    selectAll,
    deselectAll,
    toggleAll,
    selectWhere,
    deselectWhere,
    reset,
    
    // Utilities
    isSelected,
    getSelectedItems,
    
    // Bulk operations
    bulkOperations,
    
    // Configuration
    multiSelect,
    keyField
  };
};