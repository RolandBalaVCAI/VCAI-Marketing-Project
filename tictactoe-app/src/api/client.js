import axios from 'axios';
import { campaignsAPI } from './endpoints/campaigns';
import { apiErrorHandler } from './errorHandler';

// Import stores for loading state management
let uiStore = null;

// Lazy load UI store to avoid circular dependencies
const getUIStore = () => {
  if (!uiStore) {
    // Use dynamic import to avoid require() in ESM
    const stores = require('../stores/uiStore'); // eslint-disable-line
    uiStore = stores.useUIStore;
  }
  return uiStore;
};

// Create axios instance with default configuration
const httpClient = axios.create({
  baseURL: '/api', // This would be your actual API base URL in production
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor for adding auth tokens, logging, etc.
httpClient.interceptors.request.use(
  (config) => {
    // Add timestamp to requests for debugging
    config.metadata = { 
      startTime: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
    
    // Add request ID for tracing
    config.headers['X-Request-ID'] = config.metadata.requestId;
    
    // Add auth token if available (placeholder for future implementation)
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // Set loading state
    try {
      const store = getUIStore();
      const { setGlobalLoading } = store.getState();
      setGlobalLoading(true);
    } catch (error) {
      // Ignore store errors to prevent blocking requests
      console.warn('[API] Could not set loading state:', error.message);
    }
    
    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 [API Request] ${config.method?.toUpperCase()} ${config.url}`, {
        params: config.params,
        data: config.data,
        requestId: config.headers['X-Request-ID']
      });
    }
    
    return config;
  },
  (error) => {
    // Clear loading state on request error
    try {
      const store = getUIStore();
      const { setGlobalLoading } = store.getState();
      setGlobalLoading(false);
    } catch (storeError) {
      console.warn('[API] Could not clear loading state:', storeError.message);
    }
    
    console.error('[API Request Error]', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling, logging, etc.
httpClient.interceptors.response.use(
  (response) => {
    const duration = Date.now() - response.config.metadata.startTime;
    
    // Clear loading state on successful response
    try {
      const store = getUIStore();
      const { setGlobalLoading } = store.getState();
      setGlobalLoading(false);
    } catch (storeError) {
      console.warn('[API] Could not clear loading state:', storeError.message);
    }
    
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(`✅ [API Response] ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        requestId: response.config.headers['X-Request-ID'],
        data: response.data
      });
    }
    
    return response;
  },
  async (error) => {
    const duration = error.config?.metadata?.startTime 
      ? Date.now() - error.config.metadata.startTime 
      : 0;
    
    // Clear loading state on error
    try {
      const store = getUIStore();
      const { setGlobalLoading } = store.getState();
      setGlobalLoading(false);
    } catch (storeError) {
      console.warn('[API] Could not clear loading state:', storeError.message);
    }
    
    // Process error through centralized handler
    const context = {
      operation: error.config?.metadata?.operation,
      url: error.config?.url,
      method: error.config?.method,
      requestId: error.config?.metadata?.requestId,
      duration
    };
    
    const processedError = apiErrorHandler.processError(error, context);
    
    // Log error in development
    if (import.meta.env.DEV) {
      console.error(`❌ [API Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} (${duration}ms)`, {
        status: error.response?.status,
        category: processedError.category,
        severity: processedError.severity,
        message: processedError.userMessage,
        requestId: error.config?.headers?.['X-Request-ID'],
        response: error.response?.data
      });
    }
    
    // Attach processed error info to the original error
    error.processed = processedError;
    
    return Promise.reject(error);
  }
);


// API client wrapper that uses mock endpoints for now
// In production, this would make actual HTTP requests
class APIClientWrapper {
  constructor() {
    this.httpClient = httpClient;
    this.campaigns = campaignsAPI;
  }

  // Campaign endpoints
  async getCampaigns(params = {}) {
    // For now, use mock API directly
    // In production: return this.httpClient.get('/campaigns', { params });
    return this.campaigns.getCampaigns(params);
  }

  async getCampaignById(id) {
    // In production: return this.httpClient.get(`/campaigns/${id}`);
    return this.campaigns.getCampaignById(id);
  }

  async createCampaign(campaignData) {
    // In production: return this.httpClient.post('/campaigns', campaignData);
    return this.campaigns.createCampaign(campaignData);
  }

  async updateCampaign(id, updates) {
    // In production: return this.httpClient.put(`/campaigns/${id}`, updates);
    return this.campaigns.updateCampaign(id, updates);
  }

  async deleteCampaign(id) {
    // In production: return this.httpClient.delete(`/campaigns/${id}`);
    return this.campaigns.deleteCampaign(id);
  }

  async addNoteToCampaign(id, noteData) {
    // In production: return this.httpClient.post(`/campaigns/${id}/notes`, noteData);
    return this.campaigns.addNoteToCampaign(id, noteData);
  }

  async uploadDocumentToCampaign(id, documentData) {
    // In production: return this.httpClient.post(`/campaigns/${id}/documents`, documentData);
    return this.campaigns.uploadDocumentToCampaign(id, documentData);
  }

  async addVisualMediaToCampaign(id, mediaData) {
    // In production: return this.httpClient.post(`/campaigns/${id}/media`, mediaData);
    return this.campaigns.addVisualMediaToCampaign(id, mediaData);
  }

  // Utility methods
  async getServerStats() {
    return this.campaigns.getServerStats();
  }

  async resetData() {
    return this.campaigns.resetData();
  }

  // Generic HTTP methods for future use
  async get(url, config = {}) {
    try {
      const response = await this.httpClient.get(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  }

  async post(url, data = {}, config = {}) {
    try {
      const response = await this.httpClient.post(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  }

  async put(url, data = {}, config = {}) {
    try {
      const response = await this.httpClient.put(url, data, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  }

  async delete(url, config = {}) {
    try {
      const response = await this.httpClient.delete(url, config);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error };
    }
  }

  // Enhanced retry mechanism with exponential backoff
  async retryRequest(requestFn, options = {}) {
    const { 
      maxRetries = 3, 
      baseDelay = 1000,
      retryCondition = (error) => error.processed?.isRetryable 
    } = options;
    
    let lastError;
    let attempt = 0;
    
    while (attempt <= maxRetries) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        attempt++;
        
        // Don't retry if error is not retryable or max attempts reached
        if (!retryCondition(error) || attempt > maxRetries) {
          throw error;
        }
        
        // Use custom retry delay from error handler or calculate exponential backoff
        let delay = error.processed?.retryDelay || baseDelay * Math.pow(2, attempt - 1);
        
        // Add jitter to prevent thundering herd
        delay += Math.random() * 1000;
        
        if (import.meta.env.DEV) {
          console.log(`🔄 [API Retry] Attempt ${attempt + 1}/${maxRetries} in ${Math.round(delay)}ms - ${error.processed?.category}: ${error.processed?.userMessage}`);
        }
        
        // Update retry metadata
        if (error.processed) {
          error.processed.metadata.retryCount = attempt;
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }

  // Batch request helper
  async batchRequests(requests, options = {}) {
    const { concurrent = 5, stopOnError = false } = options;
    const results = [];
    
    for (let i = 0; i < requests.length; i += concurrent) {
      const batch = requests.slice(i, i + concurrent);
      
      try {
        const batchResults = await Promise.allSettled(batch);
        results.push(...batchResults);
        
        if (stopOnError && batchResults.some(result => result.status === 'rejected')) {
          break;
        }
      } catch (error) {
        if (stopOnError) {
          throw error;
        }
        results.push({ status: 'rejected', reason: error });
      }
    }
    
    return results;
  }
}

// Enhanced API request wrapper with retry logic
export const apiRequest = {
  get: (url, config = {}) => {
    const client = new APIClientWrapper();
    return client.retryRequest(() => client.httpClient.get(url, config));
  },
  post: (url, data, config = {}) => {
    const client = new APIClientWrapper();
    return client.retryRequest(() => client.httpClient.post(url, data, config));
  },
  put: (url, data, config = {}) => {
    const client = new APIClientWrapper();
    return client.retryRequest(() => client.httpClient.put(url, data, config));
  },
  delete: (url, config = {}) => {
    const client = new APIClientWrapper();
    return client.retryRequest(() => client.httpClient.delete(url, config));
  },
  patch: (url, data, config = {}) => {
    const client = new APIClientWrapper();
    return client.retryRequest(() => client.httpClient.patch(url, data, config));
  }
};

// Request cancellation support
export const createCancelToken = () => axios.CancelToken.source();

// Create and export singleton instance
export const apiClient = new APIClientWrapper();
export default apiClient;