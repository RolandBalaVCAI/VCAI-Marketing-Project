// Enhanced campaign type with computed properties
export interface EnhancedCampaign {
  // Base Campaign properties will be extended by generated types
  id: string
  name: string
  vendor: string
  status: 'Live' | 'Paused' | 'Ended'
  startDate: string
  endDate: string
  metrics: CampaignMetrics
  
  // Computed properties
  readonly duration: number
  readonly isActive: boolean
  readonly performanceRating: 'poor' | 'fair' | 'good' | 'excellent'
  readonly roi: number
  readonly cpc: number
  readonly cpa: number
}

// Base metric interface
export interface CampaignMetrics {
  rawClicks: number
  uniqueClicks: number
  cost: number
  rawReg: number
  confirmReg: number
  sales: number
  orderValue: number
  revenue: number
  ltrev: number
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
export interface ProcessedApiError {
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
  status?: ('Live' | 'Paused' | 'Ended')[]
  startDate?: string
  endDate?: string
  search?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Utility functions for working with generated types
export const campaignUtils = {
  // Calculate campaign duration in days
  getDuration: (campaign: { startDate: string; endDate: string }): number => {
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  },
  
  // Check if campaign is currently active
  isActive: (campaign: { status: string; startDate: string; endDate: string }): boolean => {
    const now = new Date()
    const start = new Date(campaign.startDate)
    const end = new Date(campaign.endDate)
    return campaign.status === 'Live' && now >= start && now <= end
  },
  
  // Calculate ROI percentage
  calculateROI: (campaign: { metrics: CampaignMetrics }): number => {
    return campaign.metrics.cost > 0 
      ? Math.round((campaign.metrics.revenue / campaign.metrics.cost) * 10000) / 100 
      : 0
  },
  
  // Calculate CPC (Cost Per Click)
  calculateCPC: (campaign: { metrics: CampaignMetrics }): number => {
    return campaign.metrics.uniqueClicks > 0 
      ? Math.round((campaign.metrics.cost / campaign.metrics.uniqueClicks) * 100) / 100 
      : 0
  },
  
  // Calculate CPA (Cost Per Acquisition)
  calculateCPA: (campaign: { metrics: CampaignMetrics }): number => {
    return campaign.metrics.sales > 0 
      ? Math.round((campaign.metrics.cost / campaign.metrics.sales) * 100) / 100 
      : 0
  },
  
  // Get performance rating based on ROI
  getPerformanceRating: (campaign: { metrics: CampaignMetrics }): 'poor' | 'fair' | 'good' | 'excellent' => {
    const roi = campaignUtils.calculateROI(campaign)
    if (roi < 50) return 'poor'
    if (roi < 100) return 'fair'
    if (roi < 200) return 'good'
    return 'excellent'
  }
}

// Type guards
export const isApiError = (error: any): error is ProcessedApiError => {
  return error && typeof error === 'object' && 'error' in error
}

// Mock data generators for testing
export const mockGenerators = {
  campaign: (overrides: Partial<any> = {}): any => ({
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
    changeHistory: [],
    createdAt: new Date().toISOString(),
    modifiedAt: new Date().toISOString(),
    ...overrides
  })
}