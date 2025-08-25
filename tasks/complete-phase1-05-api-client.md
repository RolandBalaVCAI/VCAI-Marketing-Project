# Phase 1 Task 5: Implement API Client with Error Handling

## Objective
Create a robust API client that handles HTTP requests, provides proper error handling, implements retry logic, and manages loading states consistently across the application.

## Current State
- Mock API service created with endpoints
- Zustand stores ready to consume API data
- No centralized HTTP client or error handling

## Target State
- Axios-based HTTP client with interceptors
- Centralized error handling and user-friendly messages
- Retry logic for failed requests
- Request/response logging for debugging
- Loading state management integration

## Implementation Steps

### 1. Create Base HTTP Client
Create `src/api/client.js` with Axios configuration:
- Base URL configuration
- Default headers and timeout settings
- Request/response interceptors
- Error transformation and handling

### 2. Implement Error Handling
Create comprehensive error handling:
- Network error handling
- HTTP status code handling
- User-friendly error messages
- Error logging and debugging information

### 3. Add Retry Logic
Implement automatic retry for failed requests:
- Exponential backoff strategy
- Configurable retry attempts
- Retry only for appropriate error types

### 4. Create Loading State Integration
Integrate with Zustand stores for loading states:
- Automatic loading state management
- Request cancellation support
- Concurrent request handling

## Detailed Implementation

### Base HTTP Client (`src/api/client.js`)
```javascript
import axios from 'axios'
import { useUIStore } from '../stores/uiStore'

// Create axios instance
const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add timestamp for cache busting
    config.metadata = { startTime: Date.now() }
    
    // Add loading state
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(true)
    
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params
      })
    }
    
    return config
  },
  (error) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    return Promise.reject(error)
  }
)

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    
    // Log response time in development
    if (process.env.NODE_ENV === 'development') {
      const duration = Date.now() - response.config.metadata.startTime
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`, {
        status: response.status,
        data: response.data
      })
    }
    
    return response
  },
  async (error) => {
    const { setGlobalLoading, addNotification } = useUIStore.getState()
    setGlobalLoading(false)
    
    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      })
    }
    
    // Handle different error types
    const enhancedError = await handleApiError(error)
    
    // Show user notification for certain errors
    if (enhancedError.showNotification) {
      addNotification(enhancedError.userMessage, 'error')
    }
    
    return Promise.reject(enhancedError)
  }
)

// Error handling function
async function handleApiError(error) {
  const originalRequest = error.config
  
  // Network error
  if (!error.response) {
    return {
      ...error,
      code: 'NETWORK_ERROR',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      showNotification: true,
      retryable: true
    }
  }
  
  const { status, data } = error.response
  
  switch (status) {
    case 400:
      return {
        ...error,
        code: 'VALIDATION_ERROR',
        userMessage: data?.error?.message || 'Please check your input and try again.',
        showNotification: true,
        retryable: false
      }
      
    case 401:
      return {
        ...error,
        code: 'UNAUTHORIZED',
        userMessage: 'Your session has expired. Please log in again.',
        showNotification: true,
        retryable: false
      }
      
    case 403:
      return {
        ...error,
        code: 'FORBIDDEN',
        userMessage: 'You do not have permission to perform this action.',
        showNotification: true,
        retryable: false
      }
      
    case 404:
      return {
        ...error,
        code: 'NOT_FOUND',
        userMessage: 'The requested resource was not found.',
        showNotification: false,
        retryable: false
      }
      
    case 422:
      return {
        ...error,
        code: 'VALIDATION_ERROR',
        userMessage: data?.error?.message || 'Please check your input and try again.',
        validationErrors: data?.error?.details || {},
        showNotification: true,
        retryable: false
      }
      
    case 429:
      return {
        ...error,
        code: 'RATE_LIMITED',
        userMessage: 'Too many requests. Please wait a moment and try again.',
        showNotification: true,
        retryable: true
      }
      
    case 500:
    case 502:
    case 503:
    case 504:
      return {
        ...error,
        code: 'SERVER_ERROR',
        userMessage: 'Server error. Please try again in a few moments.',
        showNotification: true,
        retryable: true
      }
      
    default:
      return {
        ...error,
        code: 'UNKNOWN_ERROR',
        userMessage: 'An unexpected error occurred. Please try again.',
        showNotification: true,
        retryable: true
      }
  }
}

// Retry logic with exponential backoff
const retryRequest = async (fn, maxRetries = 3, baseDelay = 1000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      // Don't retry if error is not retryable
      if (!error.retryable || attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff: 1s, 2s, 4s
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
      
      console.log(`🔄 Retrying request (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms`)
    }
  }
}

// API client wrapper with retry logic
export const apiRequest = {
  get: (url, config = {}) => retryRequest(() => apiClient.get(url, config)),
  post: (url, data, config = {}) => retryRequest(() => apiClient.post(url, data, config)),
  put: (url, data, config = {}) => retryRequest(() => apiClient.put(url, data, config)),
  delete: (url, config = {}) => retryRequest(() => apiClient.delete(url, config)),
  patch: (url, data, config = {}) => retryRequest(() => apiClient.patch(url, data, config))
}

// Request cancellation support
export const createCancelToken = () => axios.CancelToken.source()

export default apiClient
```

### Enhanced Campaign API (`src/api/endpoints/campaigns.js`)
```javascript
import { apiRequest } from '../client'
import { mockCampaignServer } from '../mock/server'

export const campaignApi = {
  // Get all campaigns with filtering
  getAll: async (filters = {}) => {
    // For now, use mock server
    return await mockCampaignServer.getCampaigns(filters)
    
    // When ready for real API:
    // return await apiRequest.get('/campaigns', { params: filters })
  },
  
  // Get single campaign
  getById: async (id) => {
    return await mockCampaignServer.getCampaign(id)
    // return await apiRequest.get(`/campaigns/${id}`)
  },
  
  // Create new campaign
  create: async (campaignData) => {
    return await mockCampaignServer.createCampaign(campaignData)
    // return await apiRequest.post('/campaigns', campaignData)
  },
  
  // Update campaign
  update: async (id, updates) => {
    return await mockCampaignServer.updateCampaign(id, updates)
    // return await apiRequest.put(`/campaigns/${id}`, updates)
  },
  
  // Delete campaign
  delete: async (id) => {
    return await mockCampaignServer.deleteCampaign(id)
    // return await apiRequest.delete(`/campaigns/${id}`)
  },
  
  // Add note to campaign
  addNote: async (campaignId, noteText, user) => {
    return await mockCampaignServer.addNote(campaignId, noteText, user)
    // return await apiRequest.post(`/campaigns/${campaignId}/notes`, { text: noteText, user })
  },
  
  // Upload document
  uploadDocument: async (campaignId, file, user) => {
    return await mockCampaignServer.uploadDocument(campaignId, file, user)
    // const formData = new FormData()
    // formData.append('document', file)
    // formData.append('uploadedBy', user)
    // return await apiRequest.post(`/campaigns/${campaignId}/documents`, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // })
  },
  
  // Add visual media
  addMedia: async (campaignId, mediaData, user) => {
    return await mockCampaignServer.addMedia(campaignId, mediaData, user)
    // return await apiRequest.post(`/campaigns/${campaignId}/media`, { ...mediaData, addedBy: user })
  }
}
```

### Error Boundary Integration
Create `src/components/common/ErrorBoundary.jsx`:
```javascript
import React from 'react'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo)
    
    // Log to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(error, errorInfo)
    }
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          padding: '40px',
          textAlign: 'center'
        }}>
          <AlertTriangle size={48} style={{ color: '#dc2626', marginBottom: '16px' }} />
          <h2 style={{ margin: '0 0 8px 0', color: '#1a1a1a' }}>Something went wrong</h2>
          <p style={{ margin: '0 0 16px 0', color: '#666666' }}>
            We're sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '8px 16px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Refresh Page
          </button>
        </div>
      )
    }
    
    return this.props.children
  }
}

export default ErrorBoundary
```

## Testing Criteria
- [ ] HTTP client properly configured with interceptors
- [ ] Error handling works for all status codes
- [ ] Retry logic functions correctly with exponential backoff
- [ ] Loading states integrate with UI store
- [ ] Request cancellation works properly
- [ ] Error notifications appear for user-facing errors
- [ ] Development logging provides useful debugging info

## Definition of Done
- Robust HTTP client with proper configuration
- Comprehensive error handling for all scenarios
- Retry logic with exponential backoff
- Integration with Zustand stores for loading states
- User-friendly error messages and notifications
- Request cancellation support
- Development-friendly logging and debugging
- Error boundary component for React errors

## Files to Create
- `src/api/client.js`
- `src/components/common/ErrorBoundary.jsx`
- Update `src/api/endpoints/campaigns.js`

## Dependencies
- Completed Phase 1 Task 4 (Zustand Stores)
- Axios package installed

## Estimated Time
3-4 hours