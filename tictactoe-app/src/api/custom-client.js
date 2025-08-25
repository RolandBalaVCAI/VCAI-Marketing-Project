import axios from 'axios'
import { useUIStore } from '../stores/uiStore.js'

// Create custom axios instance with interceptors
export const customAxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor
customAxiosInstance.interceptors.request.use(
  (config) => {
    // Add loading state
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(true)
    
    // Add request metadata
    config.metadata = {
      startTime: Date.now(),
      requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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
customAxiosInstance.interceptors.response.use(
  (response) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    return response
  },
  (error) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    
    return Promise.reject(error)
  }
)

// Custom instance with caching for GET requests
const cache = new Map()

export const customAxiosInstanceWithCache = (
  config,
  options = {}
) => {
  const { cacheTTL = 5 * 60 * 1000 } = options || {} // 5 minutes default
  
  // Only cache GET requests
  if (config.method?.toLowerCase() === 'get' || !config.method) {
    const cacheKey = `${config.url}?${JSON.stringify(config.params || {})}`
    const cached = cache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK',
        headers: {},
        config
      })
    }
    
    return customAxiosInstance.request(config).then(response => {
      // Cache successful responses
      if (response.status >= 200 && response.status < 300) {
        cache.set(cacheKey, {
          data: response.data,
          timestamp: Date.now(),
          ttl: cacheTTL
        })
      }
      return response
    })
  }
  
  return customAxiosInstance.request(config)
}

// Utility to clear cache
export const clearApiCache = (pattern) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key)
      }
    }
  } else {
    cache.clear()
  }
}

export default customAxiosInstance