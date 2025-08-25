# API Integration Guide

This guide provides practical examples and best practices for integrating with the Marketing Campaign Manager API.

## Table of Contents
1. [Quick Start](#quick-start)
2. [Authentication Setup](#authentication-setup)
3. [Common Integration Patterns](#common-integration-patterns)
4. [Error Handling Examples](#error-handling-examples)
5. [Pagination Handling](#pagination-handling)
6. [File Upload Examples](#file-upload-examples)
7. [Webhook Integration](#webhook-integration)
8. [Testing Your Integration](#testing-your-integration)

## Quick Start

### 1. Basic API Client Setup

```javascript
// api-client.js
import axios from 'axios';

class CampaignAPIClient {
  constructor(apiKey, baseURL = 'https://api.marketing-campaign-manager.com/v1') {
    this.client = axios.create({
      baseURL,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });
    
    // Add request interceptor for logging
    this.client.interceptors.request.use(request => {
      console.log('API Request:', request.method.toUpperCase(), request.url);
      return request;
    });
    
    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      response => response,
      error => this.handleError(error)
    );
  }
  
  handleError(error) {
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;
      console.error(`API Error ${status}:`, data.error?.message || data);
      
      // Handle specific error cases
      switch (status) {
        case 401:
          // Token expired or invalid
          this.onAuthError?.();
          break;
        case 429:
          // Rate limit exceeded
          const retryAfter = data.error?.retryAfter || 60;
          console.log(`Rate limited. Retry after ${retryAfter} seconds`);
          break;
      }
    } else if (error.request) {
      // Network error
      console.error('Network error:', error.message);
    }
    
    return Promise.reject(error);
  }
  
  // Campaign methods
  async getCampaigns(params = {}) {
    const response = await this.client.get('/campaigns', { params });
    return response.data;
  }
  
  async getCampaign(id) {
    const response = await this.client.get(`/campaigns/${id}`);
    return response.data;
  }
  
  async createCampaign(data) {
    const response = await this.client.post('/campaigns', data);
    return response.data;
  }
  
  async updateCampaign(id, data) {
    const response = await this.client.put(`/campaigns/${id}`, data);
    return response.data;
  }
  
  async deleteCampaign(id) {
    const response = await this.client.delete(`/campaigns/${id}`);
    return response.data;
  }
}

// Usage
const api = new CampaignAPIClient('your-api-key');
const campaigns = await api.getCampaigns({ status: 'Active' });
```

### 2. React Hook for API Integration

```javascript
// hooks/useCampaignAPI.js
import { useState, useCallback } from 'react';
import { CampaignAPIClient } from '../api/client';

export const useCampaignAPI = (apiKey) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const client = new CampaignAPIClient(apiKey);
  
  const execute = useCallback(async (apiCall) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiCall();
      return result;
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);
  
  const getCampaigns = useCallback((params) => {
    return execute(() => client.getCampaigns(params));
  }, [execute]);
  
  const createCampaign = useCallback((data) => {
    return execute(() => client.createCampaign(data));
  }, [execute]);
  
  const updateCampaign = useCallback((id, data) => {
    return execute(() => client.updateCampaign(id, data));
  }, [execute]);
  
  return {
    loading,
    error,
    getCampaigns,
    createCampaign,
    updateCampaign
  };
};

// Usage in React component
function CampaignList() {
  const { loading, error, getCampaigns } = useCampaignAPI('your-api-key');
  const [campaigns, setCampaigns] = useState([]);
  
  useEffect(() => {
    loadCampaigns();
  }, []);
  
  const loadCampaigns = async () => {
    try {
      const result = await getCampaigns({ status: 'Active' });
      setCampaigns(result.data.campaigns);
    } catch (err) {
      console.error('Failed to load campaigns:', err);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div>
      {campaigns.map(campaign => (
        <div key={campaign.id}>{campaign.name}</div>
      ))}
    </div>
  );
}
```

## Authentication Setup

### Environment Variables

```bash
# .env
VITE_API_KEY=your-api-key-here
VITE_API_URL=https://api.marketing-campaign-manager.com/v1
```

### Secure Token Storage

```javascript
// auth-manager.js
class AuthManager {
  constructor() {
    this.tokenKey = 'mcm_api_token';
    this.expiryKey = 'mcm_token_expiry';
  }
  
  setToken(token, expiresIn = 86400) { // 24 hours default
    const expiry = Date.now() + (expiresIn * 1000);
    
    // Store in memory for current session
    this.token = token;
    
    // Store in localStorage for persistence
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.expiryKey, expiry.toString());
  }
  
  getToken() {
    // Check if token exists and is not expired
    const token = this.token || localStorage.getItem(this.tokenKey);
    const expiry = localStorage.getItem(this.expiryKey);
    
    if (!token || !expiry) return null;
    
    if (Date.now() > parseInt(expiry)) {
      this.clearToken();
      return null;
    }
    
    return token;
  }
  
  clearToken() {
    this.token = null;
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.expiryKey);
  }
  
  isAuthenticated() {
    return !!this.getToken();
  }
}

export const authManager = new AuthManager();
```

## Common Integration Patterns

### 1. Batch Operations

```javascript
// Batch update multiple campaigns
async function batchUpdateCampaigns(campaignUpdates) {
  const results = await Promise.allSettled(
    campaignUpdates.map(({ id, updates }) => 
      api.updateCampaign(id, updates)
    )
  );
  
  const successful = results.filter(r => r.status === 'fulfilled');
  const failed = results.filter(r => r.status === 'rejected');
  
  console.log(`Updated ${successful.length} campaigns`);
  if (failed.length > 0) {
    console.error(`Failed to update ${failed.length} campaigns`);
  }
  
  return { successful, failed };
}

// Usage
const updates = [
  { id: 'camp_123', updates: { status: 'Paused' } },
  { id: 'camp_456', updates: { status: 'Active' } },
  { id: 'camp_789', updates: { budget: 5000 } }
];

const results = await batchUpdateCampaigns(updates);
```

### 2. Retry Logic with Exponential Backoff

```javascript
async function retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
  let lastError;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry on client errors (4xx)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        throw error;
      }
      
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`Retry attempt ${attempt + 1} after ${Math.round(delay)}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

// Usage
const campaign = await retryWithBackoff(() => 
  api.getCampaign('camp_123')
);
```

### 3. Caching Strategy

```javascript
class CachedAPIClient extends CampaignAPIClient {
  constructor(apiKey, cacheTime = 300000) { // 5 minutes default
    super(apiKey);
    this.cache = new Map();
    this.cacheTime = cacheTime;
  }
  
  getCacheKey(method, ...args) {
    return `${method}:${JSON.stringify(args)}`;
  }
  
  async getCachedOrFetch(key, fetchFn) {
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTime) {
      console.log('Cache hit:', key);
      return cached.data;
    }
    
    console.log('Cache miss:', key);
    const data = await fetchFn();
    
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    
    return data;
  }
  
  async getCampaign(id) {
    const key = this.getCacheKey('getCampaign', id);
    return this.getCachedOrFetch(key, () => super.getCampaign(id));
  }
  
  clearCache() {
    this.cache.clear();
  }
}
```

## Error Handling Examples

### Comprehensive Error Handler

```javascript
class APIErrorHandler {
  constructor() {
    this.errorHandlers = new Map();
    this.setupDefaultHandlers();
  }
  
  setupDefaultHandlers() {
    // Network errors
    this.register('NETWORK_ERROR', (error) => ({
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      action: 'retry'
    }));
    
    // Validation errors
    this.register('VALIDATION_ERROR', (error) => ({
      title: 'Invalid Input',
      message: this.formatValidationErrors(error.response?.data?.error?.validationErrors),
      action: 'fix'
    }));
    
    // Auth errors
    this.register('AUTH_ERROR', (error) => ({
      title: 'Authentication Required',
      message: 'Your session has expired. Please log in again.',
      action: 'login'
    }));
    
    // Rate limit errors
    this.register('RATE_LIMIT', (error) => ({
      title: 'Too Many Requests',
      message: `Please wait ${error.response?.data?.error?.retryAfter || 60} seconds before trying again.`,
      action: 'wait'
    }));
  }
  
  register(type, handler) {
    this.errorHandlers.set(type, handler);
  }
  
  handle(error) {
    const errorType = this.getErrorType(error);
    const handler = this.errorHandlers.get(errorType);
    
    if (handler) {
      return handler(error);
    }
    
    // Default handler
    return {
      title: 'Error',
      message: error.response?.data?.error?.message || error.message,
      action: 'none'
    };
  }
  
  getErrorType(error) {
    if (!error.response) return 'NETWORK_ERROR';
    
    const status = error.response.status;
    const category = error.response.data?.error?.category;
    
    if (status === 401) return 'AUTH_ERROR';
    if (status === 422 || category === 'validation') return 'VALIDATION_ERROR';
    if (status === 429 || category === 'rate_limit') return 'RATE_LIMIT';
    
    return 'UNKNOWN';
  }
  
  formatValidationErrors(errors) {
    if (!errors) return 'Please check your input and try again.';
    
    return Object.entries(errors)
      .map(([field, message]) => `${field}: ${message}`)
      .join('\n');
  }
}

// Usage
const errorHandler = new APIErrorHandler();

try {
  await api.createCampaign(campaignData);
} catch (error) {
  const { title, message, action } = errorHandler.handle(error);
  
  // Show error to user
  showNotification({
    type: 'error',
    title,
    message
  });
  
  // Take action based on error type
  switch (action) {
    case 'retry':
      // Show retry button
      break;
    case 'login':
      // Redirect to login
      break;
    case 'wait':
      // Disable actions temporarily
      break;
  }
}
```

## Pagination Handling

### Automatic Pagination Iterator

```javascript
class PaginationIterator {
  constructor(apiClient, endpoint, params = {}) {
    this.apiClient = apiClient;
    this.endpoint = endpoint;
    this.params = params;
    this.currentPage = 1;
    this.hasMore = true;
  }
  
  async *[Symbol.asyncIterator]() {
    while (this.hasMore) {
      const response = await this.apiClient.get(this.endpoint, {
        params: {
          ...this.params,
          page: this.currentPage
        }
      });
      
      const { data, pagination } = response.data;
      
      yield* data.campaigns;
      
      this.hasMore = pagination.hasNextPage;
      this.currentPage++;
    }
  }
}

// Usage - iterate through all campaigns
const iterator = new PaginationIterator(api.client, '/campaigns', {
  status: 'Active',
  limit: 50
});

for await (const campaign of iterator) {
  console.log(campaign.name);
}

// Or collect all results
async function getAllCampaigns(params = {}) {
  const allCampaigns = [];
  const iterator = new PaginationIterator(api.client, '/campaigns', params);
  
  for await (const campaign of iterator) {
    allCampaigns.push(campaign);
  }
  
  return allCampaigns;
}
```

### React Hook for Paginated Data

```javascript
function usePaginatedCampaigns(initialParams = {}) {
  const [campaigns, setCampaigns] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState({ page: 1, limit: 20, ...initialParams });
  
  const loadPage = useCallback(async (pageNumber) => {
    setLoading(true);
    
    try {
      const response = await api.getCampaigns({ ...params, page: pageNumber });
      setCampaigns(response.data.campaigns);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Failed to load campaigns:', error);
    } finally {
      setLoading(false);
    }
  }, [params]);
  
  useEffect(() => {
    loadPage(params.page);
  }, [params]);
  
  const goToPage = (page) => setParams(prev => ({ ...prev, page }));
  const nextPage = () => goToPage(pagination.currentPage + 1);
  const prevPage = () => goToPage(pagination.currentPage - 1);
  
  return {
    campaigns,
    pagination,
    loading,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: pagination?.hasNextPage,
    canGoPrev: pagination?.hasPreviousPage
  };
}
```

## File Upload Examples

### Upload Campaign Document

```javascript
async function uploadDocument(campaignId, file) {
  // Validate file
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
  
  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }
  
  if (!allowedTypes.includes(file.type)) {
    throw new Error('File type not supported');
  }
  
  // Convert to base64
  const base64 = await fileToBase64(file);
  
  // Upload
  const response = await api.client.post(`/campaigns/${campaignId}/documents`, {
    name: file.name,
    type: file.type,
    size: file.size,
    data: base64,
    uploadedBy: 'Current User'
  });
  
  return response.data;
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = reject;
  });
}

// React component for file upload
function DocumentUpload({ campaignId }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setProgress(0);
    
    try {
      // Simulate progress (in real app, use XMLHttpRequest for progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 200);
      
      const result = await uploadDocument(campaignId, file);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('Upload successful:', result);
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        onChange={handleUpload}
        disabled={uploading}
        accept=".pdf,.jpg,.jpeg,.png"
      />
      {uploading && (
        <div>
          <progress value={progress} max="100" />
          <span>{progress}%</span>
        </div>
      )}
    </div>
  );
}
```

## Webhook Integration

### Setting Up Webhook Endpoint

```javascript
// Express.js webhook handler
import express from 'express';
import crypto from 'crypto';

const app = express();

// Middleware to verify webhook signature
function verifyWebhookSignature(secret) {
  return (req, res, next) => {
    const signature = req.headers['x-webhook-signature'];
    const body = JSON.stringify(req.body);
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body)
      .digest('hex');
    
    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }
    
    next();
  };
}

// Webhook endpoint
app.post('/webhooks/campaigns', 
  express.json(),
  verifyWebhookSignature(process.env.WEBHOOK_SECRET),
  async (req, res) => {
    const { event, data, timestamp } = req.body;
    
    console.log(`Received webhook: ${event} at ${timestamp}`);
    
    try {
      switch (event) {
        case 'campaign.created':
          await handleCampaignCreated(data);
          break;
          
        case 'campaign.updated':
          await handleCampaignUpdated(data);
          break;
          
        case 'campaign.status_changed':
          await handleStatusChanged(data);
          break;
          
        default:
          console.log(`Unhandled event type: ${event}`);
      }
      
      // Acknowledge receipt
      res.status(200).json({ received: true });
    } catch (error) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: 'Processing failed' });
    }
  }
);

// Event handlers
async function handleCampaignCreated(data) {
  console.log('New campaign created:', data.campaignId);
  // Update local cache, send notifications, etc.
}

async function handleCampaignUpdated(data) {
  console.log('Campaign updated:', data.campaignId);
  console.log('Changes:', data.changes);
  // Sync local data, update UI, etc.
}

async function handleStatusChanged(data) {
  console.log(`Campaign ${data.campaignId} status changed:`, data.changes.status);
  // Trigger workflows based on status changes
}
```

### Webhook Event Manager

```javascript
class WebhookEventManager {
  constructor() {
    this.handlers = new Map();
    this.queue = [];
    this.processing = false;
  }
  
  register(eventType, handler) {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType).push(handler);
  }
  
  async process(event) {
    // Add to queue
    this.queue.push(event);
    
    // Process queue if not already processing
    if (!this.processing) {
      await this.processQueue();
    }
  }
  
  async processQueue() {
    this.processing = true;
    
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      
      try {
        await this.handleEvent(event);
      } catch (error) {
        console.error(`Failed to process event ${event.event}:`, error);
        // Could implement retry logic here
      }
    }
    
    this.processing = false;
  }
  
  async handleEvent(event) {
    const handlers = this.handlers.get(event.event) || [];
    
    // Run all handlers for this event type
    await Promise.all(
      handlers.map(handler => handler(event.data, event))
    );
  }
}

// Usage
const webhookManager = new WebhookEventManager();

// Register handlers
webhookManager.register('campaign.created', async (data) => {
  // Update local state
  campaignStore.add(data.campaign);
});

webhookManager.register('campaign.updated', async (data) => {
  // Update UI
  updateCampaignDisplay(data.campaignId, data.changes);
});

// Process incoming webhook
app.post('/webhooks', async (req, res) => {
  await webhookManager.process(req.body);
  res.status(200).json({ received: true });
});
```

## Testing Your Integration

### Unit Tests for API Client

```javascript
// __tests__/api-client.test.js
import { CampaignAPIClient } from '../api/client';
import MockAdapter from 'axios-mock-adapter';

describe('CampaignAPIClient', () => {
  let client;
  let mock;
  
  beforeEach(() => {
    client = new CampaignAPIClient('test-api-key');
    mock = new MockAdapter(client.client);
  });
  
  afterEach(() => {
    mock.restore();
  });
  
  test('getCampaigns returns campaign list', async () => {
    const mockResponse = {
      success: true,
      data: {
        campaigns: [
          { id: 'camp_123', name: 'Test Campaign' }
        ],
        pagination: {
          currentPage: 1,
          totalPages: 1
        }
      }
    };
    
    mock.onGet('/campaigns').reply(200, mockResponse);
    
    const result = await client.getCampaigns();
    expect(result).toEqual(mockResponse);
  });
  
  test('handles authentication errors', async () => {
    mock.onGet('/campaigns').reply(401, {
      error: {
        category: 'authentication',
        message: 'Invalid token'
      }
    });
    
    await expect(client.getCampaigns()).rejects.toThrow();
  });
  
  test('retries on network errors', async () => {
    mock.onGet('/campaigns')
      .replyOnce(500)
      .onGet('/campaigns')
      .reply(200, { success: true });
    
    // With retry logic
    const result = await retryWithBackoff(() => client.getCampaigns());
    expect(result.success).toBe(true);
  });
});
```

### Integration Tests

```javascript
// __tests__/integration/campaigns.test.js
describe('Campaign API Integration', () => {
  const testCampaign = {
    name: 'Integration Test Campaign',
    vendor: 'Test Vendor',
    status: 'Draft',
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 86400000).toISOString(),
    manager: 'Test User'
  };
  
  let createdCampaignId;
  
  test('complete campaign lifecycle', async () => {
    // Create
    const createResponse = await api.createCampaign(testCampaign);
    expect(createResponse.success).toBe(true);
    createdCampaignId = createResponse.data.campaign.id;
    
    // Read
    const getResponse = await api.getCampaign(createdCampaignId);
    expect(getResponse.data.campaign.name).toBe(testCampaign.name);
    
    // Update
    const updateResponse = await api.updateCampaign(createdCampaignId, {
      status: 'Active'
    });
    expect(updateResponse.data.campaign.status).toBe('Active');
    
    // Delete
    const deleteResponse = await api.deleteCampaign(createdCampaignId);
    expect(deleteResponse.success).toBe(true);
    
    // Verify deletion
    await expect(api.getCampaign(createdCampaignId))
      .rejects.toMatchObject({
        response: { status: 404 }
      });
  });
});
```

### Mock Server for Development

```javascript
// mock-server.js
import express from 'express';
import { faker } from '@faker-js/faker';

const app = express();
app.use(express.json());

// Generate mock campaigns
function generateMockCampaign() {
  return {
    id: `camp_${faker.datatype.uuid()}`,
    name: faker.company.catchPhrase(),
    status: faker.helpers.arrayElement(['Active', 'Paused', 'Completed', 'Draft']),
    vendor: faker.helpers.arrayElement(['Google Ads', 'Facebook Ads', 'Instagram']),
    startDate: faker.date.recent().toISOString(),
    endDate: faker.date.future().toISOString(),
    manager: faker.name.fullName(),
    metrics: {
      cost: faker.datatype.number({ min: 1000, max: 10000 }),
      revenue: faker.datatype.number({ min: 5000, max: 50000 }),
      rawClicks: faker.datatype.number({ min: 1000, max: 100000 }),
      uniqueClicks: faker.datatype.number({ min: 800, max: 80000 }),
      impressions: faker.datatype.number({ min: 10000, max: 1000000 }),
      confirmReg: faker.datatype.number({ min: 10, max: 1000 }),
      sales: faker.datatype.number({ min: 5, max: 500 })
    }
  };
}

// Mock endpoints
app.get('/api/campaigns', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const total = 100;
  
  const campaigns = Array.from({ length: limit }, generateMockCampaign);
  
  res.json({
    success: true,
    data: {
      campaigns,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1
      }
    }
  });
});

app.get('/api/campaigns/:id', (req, res) => {
  const campaign = generateMockCampaign();
  campaign.id = req.params.id;
  
  res.json({
    success: true,
    data: { campaign }
  });
});

app.post('/api/campaigns', (req, res) => {
  const campaign = {
    ...generateMockCampaign(),
    ...req.body,
    id: `camp_${faker.datatype.uuid()}`
  };
  
  res.status(201).json({
    success: true,
    data: { campaign }
  });
});

app.listen(3001, () => {
  console.log('Mock API server running on http://localhost:3001');
});
```

## Best Practices Checklist

- [ ] Always validate input before sending to API
- [ ] Implement proper error handling with user-friendly messages
- [ ] Use environment variables for API keys and URLs
- [ ] Cache responses when appropriate
- [ ] Implement retry logic for transient failures
- [ ] Handle pagination for large datasets
- [ ] Verify webhook signatures for security
- [ ] Log API interactions for debugging
- [ ] Write tests for your integration
- [ ] Monitor rate limits and implement backoff
- [ ] Use TypeScript for better type safety
- [ ] Implement request cancellation for user-initiated actions
- [ ] Handle offline scenarios gracefully
- [ ] Compress large payloads when possible
- [ ] Use connection pooling for better performance