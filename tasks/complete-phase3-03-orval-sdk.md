# Phase 3 Task 3: Set Up Orval for SDK Generation

## Objective
Implement Orval to automatically generate a TypeScript SDK from the OpenAPI schema, providing type-safe API client code with proper error handling and request/response types.

## Current State
- OpenAPI schema available
- Manual API calls using axios
- No type safety for API operations
- Inconsistent API client patterns

## Target State
- Auto-generated TypeScript SDK from OpenAPI schema
- Type-safe API client with full IntelliSense support
- Consistent error handling across all API calls
- NPM scripts for SDK generation and updates
- Integration with existing Zustand stores

## Implementation Steps

### 1. Install Orval Dependencies
Add necessary packages for SDK generation:
- orval for OpenAPI code generation
- axios for HTTP client (already installed)
- TypeScript for type definitions

### 2. Configure Orval
Set up Orval configuration:
- Input/output paths
- Code generation templates
- Naming conventions
- Client configuration options

### 3. Generate SDK
Create SDK generation process:
- TypeScript interfaces for all schemas
- API client functions with proper typing
- Error handling utilities
- Custom hooks for React integration

### 4. Integrate with Existing Code
Update existing code to use generated SDK:
- Replace manual API calls
- Update Zustand stores to use typed clients
- Maintain existing functionality with better types

## Detailed Implementation

### Install Dependencies
```bash
npm install --save-dev orval @orval/core @orval/axios
npm install --save-dev typescript @types/node
```

### TypeScript Configuration (`tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": [
      "DOM",
      "DOM.Iterable",
      "ES6"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "declaration": true,
    "outDir": "./dist"
  },
  "include": [
    "src",
    "src/generated"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### Orval Configuration (`orval.config.ts`)
```typescript
import { defineConfig } from 'orval'

export default defineConfig({
  'marketing-api': {
    input: {
      target: './openapi.json',
      validation: true
    },
    output: {
      target: './src/generated/api.ts',
      schemas: './src/generated/types.ts',
      client: 'axios',
      mode: 'split',
      mock: true,
      prettier: true,
      override: {
        mutator: {
          path: './src/api/custom-client.ts',
          name: 'customAxiosInstance'
        },
        operations: {
          'getCampaigns': {
            mutator: {
              path: './src/api/custom-client.ts',
              name: 'customAxiosInstanceWithCache'
            }
          }
        },
        query: {
          useQuery: true,
          useInfiniteQuery: true,
          signal: true
        }
      }
    },
    hooks: {
      afterAllFilesWrite: [
        'prettier --write ./src/generated/**/*.ts',
        'eslint --fix ./src/generated/**/*.ts'
      ]
    }
  },
  'marketing-api-msw': {
    input: {
      target: './openapi.json'
    },
    output: {
      target: './src/generated/msw-handlers.ts',
      client: 'msw',
      mode: 'single'
    }
  }
})
```

### Custom Axios Client (`src/api/custom-client.ts`)
```typescript
import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios'
import { useUIStore } from '../stores/uiStore'
import { apiErrorHandler } from './errorHandler'

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
  (error: AxiosError) => {
    const { setGlobalLoading } = useUIStore.getState()
    setGlobalLoading(false)
    
    // Process error through centralized handler
    const processedError = apiErrorHandler.processError(error, {
      operation: error.config?.metadata?.operation,
      url: error.config?.url,
      method: error.config?.method,
      requestId: error.config?.metadata?.requestId
    })
    
    // Attach processed error info
    ;(error as any).processed = processedError
    
    return Promise.reject(error)
  }
)

// Custom instance with caching for GET requests
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

export const customAxiosInstanceWithCache = <T>(
  config: AxiosRequestConfig,
  options?: { cacheTTL?: number }
): Promise<AxiosResponse<T>> => {
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
      } as AxiosResponse<T>)
    }
    
    return customAxiosInstance.request<T>(config).then(response => {
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
  
  return customAxiosInstance.request<T>(config)
}

// Utility to clear cache
export const clearApiCache = (pattern?: string) => {
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
```

### Package.json Scripts
```json
{
  "scripts": {
    "generate:api": "orval --config orval.config.ts",
    "generate:api-watch": "orval --config orval.config.ts --watch",
    "build:types": "tsc --noEmit",
    "dev:api": "npm-run-all --parallel generate:api-watch dev",
    "postinstall": "npm run generate:api"
  }
}
```

### Generated API Types Enhancement (`src/generated/enhanced-types.ts`)
```typescript
// This file extends the generated types with additional utilities
import { 
  Campaign, 
  CampaignMetrics, 
  Note, 
  Document, 
  VisualMedia,
  HistoryEntry,
  Error as ApiError
} from './types'

// Enhanced campaign type with computed properties
export interface EnhancedCampaign extends Campaign {
  // Computed properties
  readonly duration: number
  readonly isActive: boolean
  readonly performanceRating: 'poor' | 'fair' | 'good' | 'excellent'
  readonly roi: number
  readonly cpc: number
  readonly cpa: number
}

// API response wrapper types
export interface ApiResponse<T> {
  data: T
  meta?: {
    total?: number
    page?: number
    limit?: number
    pages?: number
    lastModified?: string
    created?: boolean
    updated?: boolean
    [key: string]: any
  }
}

export interface ApiListResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number
    page: number
    limit: number
    pages: number
  }
}

// Error handling types
export interface ProcessedApiError extends ApiError {
  id: string
  timestamp: string
  category: string
  severity: string
  isRetryable: boolean
  userMessage: string
  technicalMessage: string
  context?: Record<string, any>
}

// Request configuration types
export interface RequestConfig {
  signal?: AbortSignal
  timeout?: number
  retries?: number
  cache?: boolean
  cacheTTL?: number
}

// Hook options types
export interface UseQueryOptions<T> {
  enabled?: boolean
  refetchOnWindowFocus?: boolean
  refetchInterval?: number
  staleTime?: number
  cacheTime?: number
  retry?: number | boolean
  onSuccess?: (data: T) => void
  onError?: (error: ProcessedApiError) => void
}

export interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void
  onError?: (error: ProcessedApiError, variables: TVariables) => void
  onSettled?: (data: TData | undefined, error: ProcessedApiError | null, variables: TVariables) => void
}

// Utility type for campaign filters
export interface CampaignFilters {
  vendor?: string[]
  status?: Campaign['status'][]
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: keyof Campaign | keyof CampaignMetrics
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Utility functions for working with generated types
export const campaignUtils = {
  // Calculate campaign duration in days
  getDuration: (campaign: Campaign): number => {
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  },
  
  // Check if campaign is currently active
  isActive: (campaign: Campaign): boolean => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    return campaign.status === 'Live' && now >= start && now <= end
  },
  
  // Calculate ROI percentage
  calculateROI: (campaign: Campaign): number => {
    return campaign.metrics.cost > 0 
      ? Math.round((campaign.metrics.revenue / campaign.metrics.cost) * 10000) / 100 
      : 0
  },
  
  // Calculate CPC (Cost Per Click)
  calculateCPC: (campaign: Campaign): number => {
    return campaign.metrics.uniqueClicks > 0 
      ? Math.round((campaign.metrics.cost / campaign.metrics.uniqueClicks) * 100) / 100 
      : 0
  },
  
  // Calculate CPA (Cost Per Acquisition)
  calculateCPA: (campaign: Campaign): number => {
    return campaign.metrics.sales > 0 
      ? Math.round((campaign.metrics.cost / campaign.metrics.sales) * 100) / 100 
      : 0
  },
  
  // Get performance rating based on ROI
  getPerformanceRating: (campaign: Campaign): 'poor' | 'fair' | 'good' | 'excellent' => {
    const roi = campaignUtils.calculateROI(campaign)
    if (roi < 50) return 'poor'
    if (roi < 100) return 'fair'
    if (roi < 200) return 'good'
    return 'excellent'
  },
  
  // Enhanced campaign object with computed properties
  enhance: (campaign: Campaign): EnhancedCampaign => ({
    ...campaign,
    duration: campaignUtils.getDuration(campaign),
    isActive: campaignUtils.isActive(campaign),
    performanceRating: campaignUtils.getPerformanceRating(campaign),
    roi: campaignUtils.calculateROI(campaign),
    cpc: campaignUtils.calculateCPC(campaign),
    cpa: campaignUtils.calculateCPA(campaign)
  })
}

// Type guards
export const isApiError = (error: any): error is ProcessedApiError => {
  return error && typeof error === 'object' && 'error' in error
}

export const isCampaign = (obj: any): obj is Campaign => {
  return obj && typeof obj === 'object' && 'id' in obj && 'name' in obj && 'metrics' in obj
}

// Mock data generators for testing
export const mockGenerators = {
  campaign: (overrides: Partial<Campaign> = {}): Campaign => ({
    id: `CMP-2024-${Math.random().toString(36).substr(2, 3).toUpperCase()}`,
    name: 'Test Campaign',
    vendor: 'Test Vendor',
    status: 'Live',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    manager: 'Test Manager',
    adPlacementDomain: 'example.com',
    device: 'Both',
    targeting: 'Global',
    repContactInfo: 'test@example.com',
    metrics: {
      rawClicks: 1000,
      uniqueClicks: 800,
      cost: 2000,
      rawReg: 100,
      confirmReg: 80,
      sales: 20,
      orderValue: 2000,
      revenue: 1500,
      ltrev: 3000
    },
    notes: [],
    documents: [],
    visualMedia: [],
    history: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    ...overrides
  })
}
```

### React Query Integration (`src/hooks/generated/useCampaigns.ts`)
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getCampaigns, 
  getCampaignById, 
  createCampaign, 
  updateCampaign, 
  deleteCampaign,
  addNoteToCampaign 
} from '../../generated/api'
import { 
  Campaign, 
  CampaignFilters, 
  ApiListResponse, 
  ApiResponse,
  UseQueryOptions,
  UseMutationOptions 
} from '../../generated/enhanced-types'
import { useUIStore } from '../../stores/uiStore'

// Query keys factory
export const campaignKeys = {
  all: ['campaigns'] as const,
  lists: () => [...campaignKeys.all, 'list'] as const,
  list: (filters: CampaignFilters) => [...campaignKeys.lists(), filters] as const,
  details: () => [...campaignKeys.all, 'detail'] as const,
  detail: (id: string) => [...campaignKeys.details(), id] as const
}

// List campaigns hook
export const useCampaigns = (
  filters: CampaignFilters = {},
  options: UseQueryOptions<ApiListResponse<Campaign>> = {}
) => {
  return useQuery({
    queryKey: campaignKeys.list(filters),
    queryFn: async ({ signal }) => {
      const response = await getCampaigns({
        ...filters,
        signal
      })
      return response.data
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...options
  })
}

// Get single campaign hook
export const useCampaign = (
  id: string,
  options: UseQueryOptions<ApiResponse<Campaign>> = {}
) => {
  return useQuery({
    queryKey: campaignKeys.detail(id),
    queryFn: async ({ signal }) => {
      const response = await getCampaignById({ id, signal })
      return response.data
    },
    enabled: !!id,
    staleTime: 1 * 60 * 1000, // 1 minute
    ...options
  })
}

// Create campaign mutation
export const useCreateCampaign = (
  options: UseMutationOptions<ApiResponse<Campaign>, Partial<Campaign>> = {}
) => {
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()
  
  return useMutation({
    mutationFn: async (newCampaign: Partial<Campaign>) => {
      const response = await createCampaign({ data: newCampaign })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch campaigns list
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      
      // Add optimistic update to cache
      queryClient.setQueryData(campaignKeys.detail(data.data.id), data)
      
      addNotification('Campaign created successfully', 'success')
      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      addNotification('Failed to create campaign', 'error')
      options.onError?.(error, variables)
    },
    ...options
  })
}

// Update campaign mutation
export const useUpdateCampaign = (
  options: UseMutationOptions<ApiResponse<Campaign>, { id: string; updates: Partial<Campaign> }> = {}
) => {
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Campaign> }) => {
      const response = await updateCampaign({ id, data: updates })
      return response.data
    },
    onMutate: async ({ id, updates }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: campaignKeys.detail(id) })
      
      // Snapshot the previous value
      const previousCampaign = queryClient.getQueryData(campaignKeys.detail(id))
      
      // Optimistically update to the new value
      queryClient.setQueryData(campaignKeys.detail(id), (old: any) => {
        if (!old) return old
        return {
          ...old,
          data: { ...old.data, ...updates }
        }
      })
      
      return { previousCampaign }
    },
    onError: (error, variables, context) => {
      // Rollback optimistic update
      if (context?.previousCampaign) {
        queryClient.setQueryData(campaignKeys.detail(variables.id), context.previousCampaign)
      }
      addNotification('Failed to update campaign', 'error')
      options.onError?.(error, variables)
    },
    onSuccess: (data, variables) => {
      // Update the cache with the server response
      queryClient.setQueryData(campaignKeys.detail(variables.id), data)
      
      // Invalidate lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      
      addNotification('Campaign updated successfully', 'success')
      options.onSuccess?.(data, variables)
    },
    onSettled: (data, error, variables) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) })
      options.onSettled?.(data, error, variables)
    },
    ...options
  })
}

// Delete campaign mutation
export const useDeleteCampaign = (
  options: UseMutationOptions<void, string> = {}
) => {
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await deleteCampaign({ id })
    },
    onSuccess: (data, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: campaignKeys.detail(id) })
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: campaignKeys.lists() })
      
      addNotification('Campaign deleted successfully', 'success')
      options.onSuccess?.(data, id)
    },
    onError: (error, variables) => {
      addNotification('Failed to delete campaign', 'error')
      options.onError?.(error, variables)
    },
    ...options
  })
}

// Add note mutation
export const useAddNoteToCampaign = (
  options: UseMutationOptions<ApiResponse<{ note: any; historyEntry: any }>, { id: string; text: string; user: string }> = {}
) => {
  const queryClient = useQueryClient()
  const { addNotification } = useUIStore()
  
  return useMutation({
    mutationFn: async ({ id, text, user }: { id: string; text: string; user: string }) => {
      const response = await addNoteToCampaign({ id, data: { text, user } })
      return response.data
    },
    onSuccess: (data, variables) => {
      // Invalidate the specific campaign to refetch with new note
      queryClient.invalidateQueries({ queryKey: campaignKeys.detail(variables.id) })
      
      addNotification('Note added successfully', 'success')
      options.onSuccess?.(data, variables)
    },
    onError: (error, variables) => {
      addNotification('Failed to add note', 'error')
      options.onError?.(error, variables)
    },
    ...options
  })
}
```

### Integration Example (`src/components/MarketingManagerV4.tsx`)
```typescript
import React from 'react'
import { useCampaigns } from '../hooks/generated/useCampaigns'
import { useFiltersStore } from '../stores/filtersStore'
import { campaignUtils } from '../generated/enhanced-types'
import LoadingSpinner from './common/LoadingSpinner'
import ErrorBoundary from './common/ErrorBoundary'

const MarketingManagerV4: React.FC = () => {
  const filters = useFiltersStore()
  
  // Use generated hook with type safety
  const { 
    data: campaignsResponse, 
    isLoading, 
    error, 
    refetch 
  } = useCampaigns({
    vendor: filters.selectedVendors,
    status: filters.statusFilter !== 'All' ? [filters.statusFilter] : undefined,
    search: filters.searchTerm || undefined,
    sortBy: filters.sortConfig.key as any,
    sortOrder: filters.sortConfig.direction,
    page: filters.currentPage,
    limit: filters.itemsPerPage
  })
  
  // Enhanced campaigns with computed properties
  const enhancedCampaigns = campaignsResponse?.data.map(campaignUtils.enhance) || []
  
  if (isLoading) {
    return <LoadingSpinner message="Loading campaigns..." />
  }
  
  if (error) {
    return (
      <ErrorBoundary>
        <div>Error loading campaigns: {error.message}</div>
        <button onClick={() => refetch()}>Retry</button>
      </ErrorBoundary>
    )
  }
  
  return (
    <div>
      <h1>Marketing Dashboard</h1>
      
      {/* Campaign list with full type safety */}
      {enhancedCampaigns.map(campaign => (
        <div key={campaign.id}>
          <h3>{campaign.name}</h3>
          <p>ROI: {campaign.roi}%</p>
          <p>Performance: {campaign.performanceRating}</p>
          <p>Active: {campaign.isActive ? 'Yes' : 'No'}</p>
        </div>
      ))}
      
      {/* Pagination info */}
      {campaignsResponse?.meta && (
        <div>
          Showing {campaignsResponse.meta.page} of {campaignsResponse.meta.pages} pages
          ({campaignsResponse.meta.total} total campaigns)
        </div>
      )}
    </div>
  )
}

export default MarketingManagerV4
```

## Testing Criteria
- [ ] Orval generates TypeScript code without errors
- [ ] Generated types match OpenAPI schema definitions
- [ ] Custom axios client integrates properly
- [ ] React hooks provide proper type safety
- [ ] Error handling works with generated types
- [ ] Existing functionality preserved with new SDK
- [ ] IntelliSense and autocomplete work correctly
- [ ] Generated code passes TypeScript compilation

## Definition of Done
- Complete TypeScript SDK generated from OpenAPI schema
- Type-safe API client with proper error handling
- React Query hooks for efficient data fetching
- Custom axios client with interceptors and caching
- Enhanced types with utility functions
- Integration with existing Zustand stores
- NPM scripts for SDK generation and updates
- Full IntelliSense support in IDE
- All existing API functionality preserved with better types

## Files to Create
- `orval.config.ts`
- `tsconfig.json`
- `src/api/custom-client.ts`
- `src/generated/enhanced-types.ts`
- `src/hooks/generated/useCampaigns.ts`
- Update `package.json` with Orval scripts
- Update existing components to use generated types

## Dependencies
- Completed Phase 3 Task 2 (Redoc Documentation)
- OpenAPI schema with comprehensive endpoint documentation

## Estimated Time
6-8 hours