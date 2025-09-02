import { useState, useEffect, useCallback } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useUIStore } from '../stores/uiStore';

export const useCampaignDetail = (campaign, onBack) => {
  const {
    selectedCampaign,
    isUpdating,
    error,
    selectCampaign,
    updateCampaign,
    updateCampaignOptimistic,
    clearError
  } = useCampaignsStore();
  
  const { setCurrentView, addNotification } = useUIStore();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [originalData, setOriginalData] = useState({});
  
  // Initialize campaign data
  useEffect(() => {
    if (campaign) {
      selectCampaign(campaign);
      setOriginalData(campaign);
      setEditedData(campaign);
    }
  }, [campaign, selectCampaign]);
  
  // Update local editing state when campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      setOriginalData(selectedCampaign);
      setEditedData(selectedCampaign);
    }
  }, [selectedCampaign]);
  
  // Handle editing state
  const startEditing = useCallback(() => {
    setIsEditing(true);
    setEditedData({ ...selectedCampaign });
    setOriginalData({ ...selectedCampaign });
  }, [selectedCampaign]);
  
  const cancelEditing = useCallback(() => {
    setIsEditing(false);
    setEditedData({ ...originalData });
    clearError();
  }, [originalData, clearError]);
  
  // Field update handler
  const updateField = useCallback((field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);
  
  // Nested field update handler (for metrics, etc.)
  const updateNestedField = useCallback((parentField, childField, value) => {
    setEditedData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }));
  }, []);
  
  // Save changes with optimistic updates
  const saveChanges = useCallback(async () => {
    if (!selectedCampaign) return { success: false, error: 'No campaign selected' };
    
    try {
      // Calculate what changed
      const changes = calculateChanges(originalData, editedData);
      
      if (changes.length === 0) {
        setIsEditing(false);
        return { success: true, message: 'No changes to save' };
      }
      
      // Use optimistic update method from store
      const updatesWithHistory = {
        ...editedData,
        changeHistory: [
          ...(editedData.changeHistory || []),
          ...changes.map(change => ({
            id: Date.now() + Math.random(),
            action: change,
            user: 'Current User', // TODO: Get from auth context
            timestamp: new Date().toISOString()
          }))
        ],
        modifiedAt: new Date().toISOString()
      };
      
      // Use the enhanced optimistic update method
      await (updateCampaignOptimistic || updateCampaign)(selectedCampaign.id, updatesWithHistory);
      
      setIsEditing(false);
      setOriginalData({ ...editedData });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [selectedCampaign, originalData, editedData, updateCampaign, updateCampaignOptimistic]);
  
  // Navigate back to dashboard
  const goBack = useCallback(() => {
    if (isEditing && hasUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        if (onBack) {
          onBack();
        } else {
          setCurrentView('dashboard');
        }
      }
    } else {
      if (onBack) {
        onBack();
      } else {
        setCurrentView('dashboard');
      }
    }
  }, [isEditing, onBack, setCurrentView, editedData, originalData]);
  
  // Helper functions
  const hasUnsavedChanges = () => {
    return JSON.stringify(editedData) !== JSON.stringify(originalData);
  };
  
  const calculateChanges = (original, edited) => {
    const changes = [];
    
    if (original.name !== edited.name) {
      changes.push(`Changed campaign name from "${original.name}" to "${edited.name}"`);
    }
    if (original.status !== edited.status) {
      changes.push(`Changed status from "${original.status}" to "${edited.status}"`);
    }
    if (original.metrics?.cost !== edited.metrics?.cost) {
      changes.push(`Updated cost from $${(original.metrics?.cost || 0).toFixed(2)} to $${(edited.metrics?.cost || 0).toFixed(2)}`);
    }
    if (original.metrics?.revenue !== edited.metrics?.revenue) {
      changes.push(`Updated revenue from $${(original.metrics?.revenue || 0).toFixed(2)} to $${(edited.metrics?.revenue || 0).toFixed(2)}`);
    }
    if (original.startDate !== edited.startDate) {
      changes.push(`Changed start date from ${original.startDate} to ${edited.startDate}`);
    }
    if (original.endDate !== edited.endDate) {
      changes.push(`Changed end date from ${original.endDate} to ${edited.endDate}`);
    }
    if (original.manager !== edited.manager) {
      changes.push(`Changed manager from "${original.manager}" to "${edited.manager}"`);
    }
    if (original.adPlacementDomain !== edited.adPlacementDomain) {
      changes.push(`Changed ad placement domain from "${original.adPlacementDomain}" to "${edited.adPlacementDomain}"`);
    }
    if (original.device !== edited.device) {
      changes.push(`Changed device targeting from "${original.device}" to "${edited.device}"`);
    }
    if (original.targeting !== edited.targeting) {
      changes.push(`Changed geographic targeting from "${original.targeting}" to "${edited.targeting}"`);
    }
    if (JSON.stringify(original.repContactInfo) !== JSON.stringify(edited.repContactInfo)) {
      changes.push(`Updated rep contact information`);
    }
    
    return changes;
  };
  
  return {
    // Data
    campaign: selectedCampaign,
    editedData,
    
    // State
    isEditing,
    isUpdating: isUpdating || false,
    error,
    hasUnsavedChanges: hasUnsavedChanges(),
    
    // Actions
    startEditing,
    cancelEditing,
    updateField,
    updateNestedField,
    saveChanges,
    goBack,
    clearError
  };
};