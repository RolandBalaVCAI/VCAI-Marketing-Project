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

// Configuration for different environments
const API_CONFIG = {
  // Use FastAPI backend if available, fallback to mock API
  BACKEND_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  MOCK_MODE: import.meta.env.VITE_USE_MOCK === 'true' || false,
  TIMEOUT: 30000,
  MAX_RETRIES: 3
};

// Create axios instance with default configuration
const httpClient = axios.create({
  baseURL: API_CONFIG.BACKEND_URL,
  timeout: API_CONFIG.TIMEOUT,
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


// API client wrapper that supports both mock and real backend
class APIClientWrapper {
  constructor() {
    this.httpClient = httpClient;
    this.campaigns = campaignsAPI; // Mock API fallback
    this.useMock = API_CONFIG.MOCK_MODE;
  }

  // Helper method to check if backend is available
  async checkBackendHealth() {
    try {
      const response = await this.httpClient.get('/health', { timeout: 5000 });
      return response.status === 200;
    } catch (error) {
      console.warn('[API] Backend health check failed, falling back to mock API');
      return false;
    }
  }

  // Auto-detect whether to use mock or real backend
  async shouldUseMock() {
    if (this.useMock) return true;
    
    // Cache health check result for 5 minutes
    const healthCacheKey = 'backend_health_check';
    const healthCache = sessionStorage.getItem(healthCacheKey);
    const cacheTime = parseInt(sessionStorage.getItem(`${healthCacheKey}_time`)) || 0;
    
    if (healthCache && Date.now() - cacheTime < 5 * 60 * 1000) {
      return healthCache === 'false'; // Invert logic: healthy backend means don't use mock
    }
    
    const isHealthy = await this.checkBackendHealth();
    sessionStorage.setItem(healthCacheKey, isHealthy.toString());
    sessionStorage.setItem(`${healthCacheKey}_time`, Date.now().toString());
    
    return !isHealthy;
  }

  // Campaign endpoints with smart fallback
  async getCampaigns(params = {}) {
    console.log('🚀 getCampaigns called with params:', params);
    const useMock = await this.shouldUseMock();
    console.log('🎭 Using mock API:', useMock);
    
    if (useMock) {
      console.log('📁 Calling mock API getCampaigns...');
      const result = await this.campaigns.getCampaigns(params);
      console.log('📋 Mock API result:', result);
      return result;
    }
    
    try {
      const response = await this.httpClient.get('/campaigns', { params });
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.getCampaigns(params);
    }
  }

  async getCampaignById(id) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.getCampaignById(id);
    }
    
    try {
      const response = await this.httpClient.get(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.getCampaignById(id);
    }
  }

  async createCampaign(campaignData) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.createCampaign(campaignData);
    }
    
    try {
      const response = await this.httpClient.post('/campaigns', campaignData);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.createCampaign(campaignData);
    }
  }

  async updateCampaign(id, updates) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.updateCampaign(id, updates);
    }
    
    try {
      const response = await this.httpClient.put(`/campaigns/${id}`, updates);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.updateCampaign(id, updates);
    }
  }

  async deleteCampaign(id) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.deleteCampaign(id);
    }
    
    try {
      const response = await this.httpClient.delete(`/campaigns/${id}`);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.deleteCampaign(id);
    }
  }

  async addNoteToCampaign(id, noteData) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.addNoteToCampaign(id, noteData);
    }
    
    try {
      const response = await this.httpClient.post(`/campaigns/${id}/notes`, noteData);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.addNoteToCampaign(id, noteData);
    }
  }

  async uploadDocumentToCampaign(id, documentData) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.uploadDocumentToCampaign(id, documentData);
    }
    
    try {
      const response = await this.httpClient.post(`/campaigns/${id}/documents`, documentData);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.uploadDocumentToCampaign(id, documentData);
    }
  }

  async addVisualMediaToCampaign(id, mediaData) {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.addVisualMediaToCampaign(id, mediaData);
    }
    
    try {
      const response = await this.httpClient.post(`/campaigns/${id}/media`, mediaData);
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, falling back to mock API');
      return this.campaigns.addVisualMediaToCampaign(id, mediaData);
    }
  }

  // New methods for backend-specific functionality
  async getKPISummary() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      // Calculate KPIs from mock data
      const campaigns = await this.campaigns.getCampaigns();
      return this.calculateMockKPIs(campaigns.data || []);
    }
    
    try {
      const response = await this.httpClient.get('/kpis');
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed, calculating KPIs from mock data');
      const campaigns = await this.campaigns.getCampaigns();
      return this.calculateMockKPIs(campaigns.data || []);
    }
  }

  async triggerSync() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return {
        success: true,
        message: "Mock sync completed (no real sync in mock mode)",
        status: "completed"
      };
    }
    
    try {
      const response = await this.httpClient.post('/sync');
      return response.data;
    } catch (error) {
      throw new Error(`Sync failed: ${error.message}`);
    }
  }

  async getSyncStatus() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return {
        status: "idle",
        last_sync: new Date().toISOString(),
        campaigns_synced: 0,
        errors: []
      };
    }
    
    try {
      const response = await this.httpClient.get('/sync/status');
      return response.data;
    } catch (error) {
      return {
        status: "error",
        last_sync: "",
        campaigns_synced: 0,
        errors: [error.message]
      };
    }
  }

  async getHierarchyData() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return {
        data: [],
        summary: {
          total_mapped: 0,
          networks: 0,
          domains: 0
        }
      };
    }
    
    try {
      const response = await this.httpClient.get('/hierarchy');
      return response.data;
    } catch (error) {
      console.warn('[API] Backend request failed for hierarchy data');
      return {
        data: [],
        summary: {
          total_mapped: 0,
          networks: 0,
          domains: 0
        }
      };
    }
  }

  // Helper method to calculate KPIs from mock data
  calculateMockKPIs(campaigns) {
    const totals = campaigns.reduce((acc, campaign) => {
      const metrics = campaign.metrics || {};
      return {
        totalSpend: acc.totalSpend + (metrics.cost || 0),
        totalRevenue: acc.totalRevenue + (metrics.revenue || 0),
        totalRegistrations: acc.totalRegistrations + (metrics.confirmReg || 0),
        totalSessions: acc.totalSessions + (metrics.uniqueClicks || 0)
      };
    }, { totalSpend: 0, totalRevenue: 0, totalRegistrations: 0, totalSessions: 0 });

    const activeCampaigns = campaigns.filter(c => c.status === 'Live').length;
    const pausedCampaigns = campaigns.filter(c => c.status === 'Paused').length;

    return {
      totalCampaigns: campaigns.length,
      activeCampaigns,
      pausedCampaigns,
      totalSpend: totals.totalSpend,
      totalRevenue: totals.totalRevenue,
      totalROAS: totals.totalSpend > 0 ? (totals.totalRevenue / totals.totalSpend) : 0,
      totalRegistrations: totals.totalRegistrations,
      averageRegRate: totals.totalSessions > 0 ? (totals.totalRegistrations / totals.totalSessions * 100) : 0
    };
  }

  // Utility methods
  async getServerStats() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.getServerStats();
    }
    
    try {
      const response = await this.httpClient.get('/health');
      return {
        success: true,
        mode: 'backend',
        uptime: 'unknown',
        version: '1.0.0'
      };
    } catch (error) {
      return this.campaigns.getServerStats();
    }
  }

  async resetData() {
    const useMock = await this.shouldUseMock();
    
    if (useMock) {
      return this.campaigns.resetData();
    }
    
    // Backend doesn't support reset in production
    throw new Error('Data reset not available in backend mode');
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