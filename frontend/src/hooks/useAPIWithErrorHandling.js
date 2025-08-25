import { useState, useCallback } from 'react';
import { useAPIErrorHandler } from '../api/errorHandler';
import { errorRecoveryService } from '../services/errorRecovery';

export const useAPIWithErrorHandling = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { handleAPIError } = useAPIErrorHandler();
  
  const executeWithErrorHandling = useCallback(async (apiCall, options = {}) => {
    const {
      showErrorNotification = true,
      attemptRecovery = true,
      context = {}
    } = options;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (apiError) {
      // Process error through centralized handler
      const processedError = handleAPIError(apiError, {
        ...context,
        showErrorNotification
      });
      
      setError(processedError);
      
      // Attempt automatic recovery if enabled and error is recoverable
      if (attemptRecovery && processedError.isRetryable) {
        try {
          console.log('🔄 Attempting automatic recovery...');
          const recovery = await errorRecoveryService.attemptRecovery(
            apiError, 
            apiCall
          );
          
          if (recovery.status === 'successful') {
            setError(null);
            return recovery.result;
          }
        } catch (recoveryError) {
          console.error('❌ Recovery failed:', recoveryError);
        }
      }
      
      throw processedError;
    } finally {
      setIsLoading(false);
    }
  }, [handleAPIError]);
  
  const retry = useCallback(async (originalApiCall, options = {}) => {
    return executeWithErrorHandling(originalApiCall, options);
  }, [executeWithErrorHandling]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  return {
    executeWithErrorHandling,
    retry,
    clearError,
    isLoading,
    error,
    hasError: error !== null
  };
};

// Convenience hook for campaign operations
export const useCampaignAPI = () => {
  const apiHandler = useAPIWithErrorHandling();
  
  const fetchCampaigns = useCallback((params = {}) => {
    return apiHandler.executeWithErrorHandling(
      () => import('../api/client').then(({ apiClient }) => apiClient.getCampaigns(params)),
      {
        context: { operation: 'fetchCampaigns', params }
      }
    );
  }, [apiHandler]);
  
  const updateCampaign = useCallback((id, updates) => {
    return apiHandler.executeWithErrorHandling(
      () => import('../api/client').then(({ apiClient }) => apiClient.updateCampaign(id, updates)),
      {
        context: { operation: 'updateCampaign', campaignId: id }
      }
    );
  }, [apiHandler]);
  
  const createCampaign = useCallback((campaignData) => {
    return apiHandler.executeWithErrorHandling(
      () => import('../api/client').then(({ apiClient }) => apiClient.createCampaign(campaignData)),
      {
        context: { operation: 'createCampaign' }
      }
    );
  }, [apiHandler]);
  
  const deleteCampaign = useCallback((id) => {
    return apiHandler.executeWithErrorHandling(
      () => import('../api/client').then(({ apiClient }) => apiClient.deleteCampaign(id)),
      {
        context: { operation: 'deleteCampaign', campaignId: id }
      }
    );
  }, [apiHandler]);
  
  return {
    ...apiHandler,
    fetchCampaigns,
    updateCampaign,
    createCampaign,
    deleteCampaign
  };
};