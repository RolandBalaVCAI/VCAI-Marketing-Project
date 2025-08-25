# Phase 2 Task 4: Extract Business Logic into Custom Hooks

## Objective
Extract all business logic from components into reusable custom hooks to improve code organization, testability, and reusability while maintaining clean separation of concerns.

## Current State
- Business logic mixed with UI code in components
- Complex calculations and transformations in render methods
- Repeated logic across multiple components
- Difficult to test business logic independently

## Target State
- Clean separation between business logic and UI presentation
- Reusable custom hooks for common operations
- Easily testable business logic
- Improved code organization and maintainability

## Implementation Steps

### 1. Extract Data Processing Logic
Create hooks for data transformations:
- Campaign filtering and sorting
- Metric calculations and aggregations
- Chart data generation
- Pagination and search logic

### 2. Extract Form and Validation Logic
Create hooks for form handling:
- Form state management
- Validation rules and error handling
- Field-level and form-level validation
- Submission and reset logic

### 3. Extract API Operation Logic
Create hooks for API interactions:
- CRUD operations with loading states
- Batch operations and bulk actions
- File upload and download handling
- Real-time data synchronization

### 4. Extract UI State Logic
Create hooks for UI state management:
- Modal and dialog state
- Selection and multi-selection
- Drag and drop operations
- Keyboard navigation

## Detailed Implementation

### Campaign Data Processing Hook (`src/hooks/useCampaignData.js`)
```javascript
import { useMemo } from 'react'
import { useCampaignStore } from '../stores/campaignStore'
import { useFiltersStore } from '../stores/filtersStore'
import { 
  calculateCPCRaw, 
  calculateCPCUnique, 
  calculateCPRConfirm, 
  calculateCPS, 
  calculateROAS,
  aggregateMetrics 
} from '../utils/calculations'

export const useCampaignData = () => {
  const { campaigns, isLoading, error } = useCampaignStore()
  const filters = useFiltersStore()
  
  // Apply filters to campaigns
  const filteredCampaigns = useMemo(() => {
    let result = campaigns
    
    // Vendor filter
    if (filters.selectedVendors.length > 0) {
      result = result.filter(campaign => 
        filters.selectedVendors.includes(campaign.vendor)
      )
    }
    
    // Status filter
    if (filters.statusFilter !== 'All') {
      result = result.filter(campaign => 
        campaign.status === filters.statusFilter
      )
    }
    
    // Date range filter
    const { start, end } = getDateRangeBounds(filters.dateRange, filters.customStartDate, filters.customEndDate)
    result = result.filter(campaign => {
      const campaignStart = new Date(campaign.startDate)
      return campaignStart >= start && campaignStart <= end
    })
    
    // Search filter
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      result = result.filter(campaign =>
        campaign.name.toLowerCase().includes(searchLower) ||
        campaign.vendor.toLowerCase().includes(searchLower) ||
        campaign.id.toLowerCase().includes(searchLower)
      )
    }
    
    return result
  }, [campaigns, filters])
  
  // Apply sorting
  const sortedCampaigns = useMemo(() => {
    if (!filters.sortConfig.key) return filteredCampaigns
    
    return [...filteredCampaigns].sort((a, b) => {
      let aValue, bValue
      
      // Handle calculated fields
      switch (filters.sortConfig.key) {
        case 'cpcRaw':
          aValue = parseFloat(calculateCPCRaw(a.metrics.cost, a.metrics.rawClicks))
          bValue = parseFloat(calculateCPCRaw(b.metrics.cost, b.metrics.rawClicks))
          break
        case 'cpcUnique':
          aValue = parseFloat(calculateCPCUnique(a.metrics.cost, a.metrics.uniqueClicks))
          bValue = parseFloat(calculateCPCUnique(b.metrics.cost, b.metrics.uniqueClicks))
          break
        case 'cprConfirm':
          aValue = parseFloat(calculateCPRConfirm(a.metrics.cost, a.metrics.confirmReg))
          bValue = parseFloat(calculateCPRConfirm(b.metrics.cost, b.metrics.confirmReg))
          break
        case 'cps':
          aValue = parseFloat(calculateCPS(a.metrics.cost, a.metrics.sales))
          bValue = parseFloat(calculateCPS(b.metrics.cost, b.metrics.sales))
          break
        case 'roas':
          aValue = parseFloat(calculateROAS(a.metrics.revenue, a.metrics.cost))
          bValue = parseFloat(calculateROAS(b.metrics.revenue, b.metrics.cost))
          break
        case 'revPerSale':
          aValue = a.metrics.sales > 0 ? a.metrics.revenue / a.metrics.sales : 0
          bValue = b.metrics.sales > 0 ? b.metrics.revenue / b.metrics.sales : 0
          break
        default:
          // Handle direct field access
          if (filters.sortConfig.key in a.metrics) {
            aValue = a.metrics[filters.sortConfig.key]
            bValue = b.metrics[filters.sortConfig.key]
          } else {
            aValue = a[filters.sortConfig.key]
            bValue = b[filters.sortConfig.key]
          }
      }
      
      // String comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return filters.sortConfig.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }
      
      // Numeric comparison
      if (aValue < bValue) return filters.sortConfig.direction === 'asc' ? -1 : 1
      if (aValue > bValue) return filters.sortConfig.direction === 'asc' ? 1 : -1
      return 0
    })
  }, [filteredCampaigns, filters.sortConfig])
  
  // Calculate pagination
  const paginatedData = useMemo(() => {
    const startIndex = (filters.currentPage - 1) * filters.itemsPerPage
    const endIndex = startIndex + filters.itemsPerPage
    const paginatedCampaigns = sortedCampaigns.slice(startIndex, endIndex)
    
    return {
      campaigns: paginatedCampaigns,
      totalCampaigns: sortedCampaigns.length,
      totalPages: Math.ceil(sortedCampaigns.length / filters.itemsPerPage),
      currentPage: filters.currentPage,
      itemsPerPage: filters.itemsPerPage,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, sortedCampaigns.length),
      hasNextPage: filters.currentPage < Math.ceil(sortedCampaigns.length / filters.itemsPerPage),
      hasPreviousPage: filters.currentPage > 1
    }
  }, [sortedCampaigns, filters.currentPage, filters.itemsPerPage])
  
  // Calculate aggregated metrics
  const aggregatedMetrics = useMemo(() => {
    return aggregateMetrics(sortedCampaigns)
  }, [sortedCampaigns])
  
  // Performance insights
  const performanceInsights = useMemo(() => {
    if (sortedCampaigns.length === 0) return null
    
    const insights = []
    
    // Best performing campaign by ROAS
    const bestCampaign = sortedCampaigns.reduce((best, current) => {
      const currentROAS = parseFloat(calculateROAS(current.metrics.revenue, current.metrics.cost))
      const bestROAS = parseFloat(calculateROAS(best.metrics.revenue, best.metrics.cost))
      return currentROAS > bestROAS ? current : best
    })
    
    insights.push({
      type: 'best_performer',
      campaign: bestCampaign,
      metric: 'ROAS',
      value: calculateROAS(bestCampaign.metrics.revenue, bestCampaign.metrics.cost)
    })
    
    // Worst performing campaign by ROAS
    const worstCampaign = sortedCampaigns.reduce((worst, current) => {
      const currentROAS = parseFloat(calculateROAS(current.metrics.revenue, current.metrics.cost))
      const worstROAS = parseFloat(calculateROAS(worst.metrics.revenue, worst.metrics.cost))
      return currentROAS < worstROAS ? current : worst
    })
    
    insights.push({
      type: 'worst_performer',
      campaign: worstCampaign,
      metric: 'ROAS',
      value: calculateROAS(worstCampaign.metrics.revenue, worstCampaign.metrics.cost)
    })
    
    // High spend, low return campaigns
    const underperformers = sortedCampaigns.filter(campaign => {
      const roas = parseFloat(calculateROAS(campaign.metrics.revenue, campaign.metrics.cost))
      return campaign.metrics.cost > 1000 && roas < 100 // Spent >$1000 but ROAS <100%
    })
    
    if (underperformers.length > 0) {
      insights.push({
        type: 'underperformers',
        count: underperformers.length,
        campaigns: underperformers
      })
    }
    
    return insights
  }, [sortedCampaigns])
  
  return {
    // Data
    ...paginatedData,
    filteredCampaigns: sortedCampaigns,
    allCampaigns: campaigns,
    aggregatedMetrics,
    performanceInsights,
    
    // State
    isLoading,
    error,
    isEmpty: sortedCampaigns.length === 0,
    
    // Computed values
    hasData: campaigns.length > 0,
    hasFilters: filters.selectedVendors.length > 0 || 
                filters.statusFilter !== 'All' || 
                filters.searchTerm.length > 0 ||
                filters.dateRange !== 'Last 30 Days'
  }
}

// Helper function for date range bounds
function getDateRangeBounds(dateRange, customStartDate, customEndDate) {
  const today = new Date()
  let start, end
  
  switch (dateRange) {
    case 'Current Day':
      start = end = today
      break
    case 'Yesterday':
      start = end = new Date(today.getTime() - 24 * 60 * 60 * 1000)
      break
    case 'Last 7 Days':
      start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      end = today
      break
    case 'Last 14 Days':
      start = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000)
      end = today
      break
    case 'Last 30 Days':
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      end = today
      break
    case 'Last 90 Days':
      start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
      end = today
      break
    case 'Custom':
      if (customStartDate && customEndDate) {
        start = new Date(customStartDate)
        end = new Date(customEndDate)
      } else {
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
        end = today
      }
      break
    default:
      start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
      end = today
  }
  
  return { start, end }
}
```

### Form Validation Hook (`src/hooks/useFormValidation.js`)
```javascript
import { useState, useCallback, useMemo } from 'react'

export const useFormValidation = (initialValues = {}, validationRules = {}, options = {}) => {
  const {
    validateOnChange = true,
    validateOnBlur = true,
    touchOnChange = true
  } = options
  
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Validate single field
  const validateField = useCallback((name, value) => {
    const rule = validationRules[name]
    if (!rule) return null
    
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      return rule.requiredMessage || `${name} is required`
    }
    
    // Min length validation
    if (rule.minLength && value && value.length < rule.minLength) {
      return rule.minLengthMessage || `${name} must be at least ${rule.minLength} characters`
    }
    
    // Max length validation
    if (rule.maxLength && value && value.length > rule.maxLength) {
      return rule.maxLengthMessage || `${name} must be no more than ${rule.maxLength} characters`
    }
    
    // Min value validation
    if (rule.minValue !== undefined && value !== undefined && Number(value) < rule.minValue) {
      return rule.minValueMessage || `${name} must be at least ${rule.minValue}`
    }
    
    // Max value validation
    if (rule.maxValue !== undefined && value !== undefined && Number(value) > rule.maxValue) {
      return rule.maxValueMessage || `${name} must be no more than ${rule.maxValue}`
    }
    
    // Pattern validation
    if (rule.pattern && value && !rule.pattern.test(value)) {
      return rule.patternMessage || `${name} has invalid format`
    }
    
    // Email validation
    if (rule.email && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailPattern.test(value)) {
        return rule.emailMessage || `${name} must be a valid email address`
      }
    }
    
    // Custom validation function
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value, values)
      if (customError) return customError
    }
    
    return null
  }, [validationRules, values])
  
  // Validate all fields
  const validateForm = useCallback(() => {
    const newErrors = {}
    let isValid = true
    
    Object.keys(validationRules).forEach(fieldName => {
      const error = validateField(fieldName, values[fieldName])
      if (error) {
        newErrors[fieldName] = error
        isValid = false
      }
    })
    
    setErrors(newErrors)
    return isValid
  }, [validationRules, values, validateField])
  
  // Handle field change
  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
    
    if (touchOnChange) {
      setTouched(prev => ({ ...prev, [name]: true }))
    }
    
    if (validateOnChange) {
      const error = validateField(name, value)
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateField, validateOnChange, touchOnChange])
  
  // Handle field blur
  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }))
    
    if (validateOnBlur) {
      const error = validateField(name, values[name])
      setErrors(prev => ({ ...prev, [name]: error }))
    }
  }, [validateField, validateOnBlur, values])
  
  // Handle form submission
  const handleSubmit = useCallback(async (onSubmit) => {
    setIsSubmitting(true)
    
    // Mark all fields as touched
    const allTouched = Object.keys(validationRules).reduce((acc, key) => {
      acc[key] = true
      return acc
    }, {})
    setTouched(allTouched)
    
    // Validate form
    const isValid = validateForm()
    
    if (isValid && onSubmit) {
      try {
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      }
    }
    
    setIsSubmitting(false)
    return isValid
  }, [values, validationRules, validateForm])
  
  // Reset form
  const reset = useCallback((newInitialValues = initialValues) => {
    setValues(newInitialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])
  
  // Set field value programmatically
  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }))
  }, [])
  
  // Set field error programmatically
  const setError = useCallback((name, error) => {
    setErrors(prev => ({ ...prev, [name]: error }))
  }, [])
  
  // Set multiple errors (useful for server-side validation)
  const setErrors = useCallback((newErrors) => {
    setErrors(prev => ({ ...prev, ...newErrors }))
  }, [])
  
  // Computed values
  const isValid = useMemo(() => {
    return Object.keys(errors).every(key => !errors[key])
  }, [errors])
  
  const isDirty = useMemo(() => {
    return Object.keys(values).some(key => values[key] !== initialValues[key])
  }, [values, initialValues])
  
  const hasErrors = useMemo(() => {
    return Object.keys(errors).some(key => errors[key])
  }, [errors])
  
  const touchedWithErrors = useMemo(() => {
    return Object.keys(errors).reduce((acc, key) => {
      if (touched[key] && errors[key]) {
        acc[key] = errors[key]
      }
      return acc
    }, {})
  }, [errors, touched])
  
  // Helper to get field props for input components
  const getFieldProps = useCallback((name) => ({
    value: values[name] || '',
    error: touched[name] ? errors[name] : null,
    onChange: (e) => {
      const value = e.target ? e.target.value : e
      handleChange(name, value)
    },
    onBlur: () => handleBlur(name)
  }), [values, errors, touched, handleChange, handleBlur])
  
  return {
    // Values and state
    values,
    errors,
    touched,
    isSubmitting,
    
    // Computed values
    isValid,
    isDirty,
    hasErrors,
    touchedWithErrors,
    
    // Actions
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValue,
    setError,
    setErrors,
    validateField,
    validateForm,
    getFieldProps
  }
}

// Predefined validation rules
export const validationRules = {
  required: (message) => ({
    required: true,
    requiredMessage: message
  }),
  
  email: (message) => ({
    email: true,
    emailMessage: message
  }),
  
  minLength: (length, message) => ({
    minLength: length,
    minLengthMessage: message
  }),
  
  maxLength: (length, message) => ({
    maxLength: length,
    maxLengthMessage: message
  }),
  
  minValue: (value, message) => ({
    minValue: value,
    minValueMessage: message
  }),
  
  maxValue: (value, message) => ({
    maxValue: value,
    maxValueMessage: message
  }),
  
  pattern: (regex, message) => ({
    pattern: regex,
    patternMessage: message
  }),
  
  custom: (validateFn, message) => ({
    validate: validateFn,
    customMessage: message
  })
}
```

### Chart Data Hook (`src/hooks/useChartData.js`)
```javascript
import { useMemo } from 'react'
import { format, subDays, eachDayOfInterval, startOfDay } from 'date-fns'

export const useChartData = (campaigns, dateRange, customStartDate, customEndDate) => {
  // Generate revenue by day data
  const revenueByDayData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return []
    
    const { start, end } = getDateRangeBounds(dateRange, customStartDate, customEndDate)
    const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    
    // Determine the appropriate interval based on date range
    let interval = 1 // days
    if (daysDiff > 90) interval = 7 // weekly
    if (daysDiff > 365) interval = 30 // monthly
    
    const data = []
    
    if (interval === 1) {
      // Daily data
      const days = eachDayOfInterval({ start, end })
      
      days.forEach(date => {
        const campaignsOnDate = campaigns.filter(campaign => {
          const campaignStart = new Date(campaign.startDate)
          const campaignEnd = new Date(campaign.endDate)
          return campaignStart <= date && campaignEnd >= date
        })
        
        const dailyRevenue = campaignsOnDate.reduce((acc, campaign) => {
          const campaignStart = new Date(campaign.startDate)
          const campaignEnd = new Date(campaign.endDate)
          const campaignDuration = Math.ceil((campaignEnd - campaignStart) / (1000 * 60 * 60 * 24)) + 1
          const dailyCampaignRevenue = campaign.metrics.revenue / campaignDuration
          return acc + dailyCampaignRevenue
        }, 0)
        
        data.push({
          date: format(date, daysDiff <= 7 ? 'MMM dd' : 'MM/dd'),
          fullDate: format(date, 'yyyy-MM-dd'),
          revenue: Math.round(dailyRevenue * 100) / 100,
          campaigns: campaignsOnDate.length
        })
      })
    } else {
      // Aggregate data for longer periods
      for (let i = 0; i < Math.ceil(daysDiff / interval); i++) {
        const periodStart = new Date(start.getTime() + (i * interval * 24 * 60 * 60 * 1000))
        const periodEnd = new Date(Math.min(
          periodStart.getTime() + (interval * 24 * 60 * 60 * 1000),
          end.getTime()
        ))
        
        const campaignsInPeriod = campaigns.filter(campaign => {
          const campaignStart = new Date(campaign.startDate)
          const campaignEnd = new Date(campaign.endDate)
          return !(campaignEnd < periodStart || campaignStart > periodEnd)
        })
        
        const periodRevenue = campaignsInPeriod.reduce((acc, campaign) => {
          // Calculate overlap between campaign and period
          const overlapStart = new Date(Math.max(
            new Date(campaign.startDate).getTime(),
            periodStart.getTime()
          ))
          const overlapEnd = new Date(Math.min(
            new Date(campaign.endDate).getTime(),
            periodEnd.getTime()
          ))
          
          if (overlapStart <= overlapEnd) {
            const overlapDays = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)) + 1
            const campaignDuration = Math.ceil(
              (new Date(campaign.endDate) - new Date(campaign.startDate)) / (1000 * 60 * 60 * 24)
            ) + 1
            const proportionalRevenue = (campaign.metrics.revenue * overlapDays) / campaignDuration
            return acc + proportionalRevenue
          }
          
          return acc
        }, 0)
        
        data.push({
          date: interval === 7 
            ? `Week of ${format(periodStart, 'MM/dd')}` 
            : format(periodStart, 'MMM yyyy'),
          fullDate: format(periodStart, 'yyyy-MM-dd'),
          revenue: Math.round(periodRevenue * 100) / 100,
          campaigns: campaignsInPeriod.length
        })
      }
    }
    
    return data
  }, [campaigns, dateRange, customStartDate, customEndDate])
  
  // Generate revenue by vendor data
  const revenueByVendorData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return []
    
    const vendorData = campaigns.reduce((acc, campaign) => {
      if (!acc[campaign.vendor]) {
        acc[campaign.vendor] = {
          vendor: campaign.vendor,
          revenue: 0,
          cost: 0,
          campaigns: 0,
          avgROAS: 0
        }
      }
      
      acc[campaign.vendor].revenue += campaign.metrics.revenue
      acc[campaign.vendor].cost += campaign.metrics.cost
      acc[campaign.vendor].campaigns += 1
      
      return acc
    }, {})
    
    // Calculate ROAS and sort by revenue
    return Object.values(vendorData)
      .map(vendor => ({
        ...vendor,
        revenue: Math.round(vendor.revenue * 100) / 100,
        cost: Math.round(vendor.cost * 100) / 100,
        roas: vendor.cost > 0 ? Math.round((vendor.revenue / vendor.cost) * 10000) / 100 : 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [campaigns])
  
  // Generate performance trends data
  const performanceTrendsData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return []
    
    const { start, end } = getDateRangeBounds(dateRange, customStartDate, customEndDate)
    const days = eachDayOfInterval({ start, end })
    
    return days.map(date => {
      const campaignsOnDate = campaigns.filter(campaign => {
        const campaignStart = new Date(campaign.startDate)
        const campaignEnd = new Date(campaign.endDate)
        return campaignStart <= date && campaignEnd >= date
      })
      
      const dayMetrics = campaignsOnDate.reduce((acc, campaign) => {
        const campaignStart = new Date(campaign.startDate)
        const campaignEnd = new Date(campaign.endDate)
        const duration = Math.ceil((campaignEnd - campaignStart) / (1000 * 60 * 60 * 24)) + 1
        
        // Distribute metrics across campaign duration
        acc.clicks += campaign.metrics.uniqueClicks / duration
        acc.cost += campaign.metrics.cost / duration
        acc.conversions += campaign.metrics.sales / duration
        acc.revenue += campaign.metrics.revenue / duration
        
        return acc
      }, { clicks: 0, cost: 0, conversions: 0, revenue: 0 })
      
      return {
        date: format(date, 'MM/dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        clicks: Math.round(dayMetrics.clicks),
        cost: Math.round(dayMetrics.cost * 100) / 100,
        conversions: Math.round(dayMetrics.conversions * 10) / 10,
        revenue: Math.round(dayMetrics.revenue * 100) / 100,
        cpc: dayMetrics.clicks > 0 ? Math.round((dayMetrics.cost / dayMetrics.clicks) * 100) / 100 : 0,
        cpa: dayMetrics.conversions > 0 ? Math.round((dayMetrics.cost / dayMetrics.conversions) * 100) / 100 : 0,
        roas: dayMetrics.cost > 0 ? Math.round((dayMetrics.revenue / dayMetrics.cost) * 10000) / 100 : 0
      }
    })
  }, [campaigns, dateRange, customStartDate, customEndDate])
  
  // Generate funnel data
  const funnelData = useMemo(() => {
    if (!campaigns || campaigns.length === 0) return []
    
    const totals = campaigns.reduce((acc, campaign) => {
      acc.rawClicks += campaign.metrics.rawClicks
      acc.uniqueClicks += campaign.metrics.uniqueClicks
      acc.rawReg += campaign.metrics.rawReg
      acc.confirmReg += campaign.metrics.confirmReg
      acc.sales += campaign.metrics.sales
      return acc
    }, { rawClicks: 0, uniqueClicks: 0, rawReg: 0, confirmReg: 0, sales: 0 })
    
    const funnel = [
      { stage: 'Raw Clicks', value: totals.rawClicks, percentage: 100 },
      { stage: 'Unique Clicks', value: totals.uniqueClicks, percentage: (totals.uniqueClicks / totals.rawClicks) * 100 },
      { stage: 'Raw Registrations', value: totals.rawReg, percentage: (totals.rawReg / totals.uniqueClicks) * 100 },
      { stage: 'Confirmed Registrations', value: totals.confirmReg, percentage: (totals.confirmReg / totals.rawReg) * 100 },
      { stage: 'Sales', value: totals.sales, percentage: (totals.sales / totals.confirmReg) * 100 }
    ]
    
    return funnel.map(item => ({
      ...item,
      percentage: Math.round(item.percentage * 10) / 10
    }))
  }, [campaigns])
  
  return {
    revenueByDayData,
    revenueByVendorData,
    performanceTrendsData,
    funnelData,
    isEmpty: !campaigns || campaigns.length === 0
  }
}

// Helper function (reused from useCampaignData)
function getDateRangeBounds(dateRange, customStartDate, customEndDate) {
  const today = new Date()
  let start, end
  
  switch (dateRange) {
    case 'Current Day':
      start = end = startOfDay(today)
      break
    case 'Yesterday':
      start = end = startOfDay(subDays(today, 1))
      break
    case 'Last 7 Days':
      start = startOfDay(subDays(today, 7))
      end = startOfDay(today)
      break
    case 'Last 14 Days':
      start = startOfDay(subDays(today, 14))
      end = startOfDay(today)
      break
    case 'Last 30 Days':
      start = startOfDay(subDays(today, 30))
      end = startOfDay(today)
      break
    case 'Last 90 Days':
      start = startOfDay(subDays(today, 90))
      end = startOfDay(today)
      break
    case 'Custom':
      if (customStartDate && customEndDate) {
        start = startOfDay(new Date(customStartDate))
        end = startOfDay(new Date(customEndDate))
      } else {
        start = startOfDay(subDays(today, 30))
        end = startOfDay(today)
      }
      break
    default:
      start = startOfDay(subDays(today, 30))
      end = startOfDay(today)
  }
  
  return { start, end }
}
```

### Selection Management Hook (`src/hooks/useSelection.js`)
```javascript
import { useState, useCallback, useMemo } from 'react'

export const useSelection = (items = [], options = {}) => {
  const {
    multiple = true,
    getId = (item) => item.id,
    onChange,
    initialSelection = []
  } = options
  
  const [selectedIds, setSelectedIds] = useState(new Set(initialSelection))
  
  // Get selected items
  const selectedItems = useMemo(() => {
    return items.filter(item => selectedIds.has(getId(item)))
  }, [items, selectedIds, getId])
  
  // Check if item is selected
  const isSelected = useCallback((item) => {
    return selectedIds.has(getId(item))
  }, [selectedIds, getId])
  
  // Check if all items are selected
  const isAllSelected = useMemo(() => {
    return items.length > 0 && items.every(item => selectedIds.has(getId(item)))
  }, [items, selectedIds, getId])
  
  // Check if some items are selected (for indeterminate state)
  const isSomeSelected = useMemo(() => {
    return selectedIds.size > 0 && !isAllSelected
  }, [selectedIds.size, isAllSelected])
  
  // Select item
  const select = useCallback((item) => {
    const id = getId(item)
    
    setSelectedIds(prev => {
      const next = new Set(prev)
      
      if (multiple) {
        next.add(id)
      } else {
        next.clear()
        next.add(id)
      }
      
      onChange?.(items.filter(i => next.has(getId(i))))
      return next
    })
  }, [items, getId, multiple, onChange])
  
  // Deselect item
  const deselect = useCallback((item) => {
    const id = getId(item)
    
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      onChange?.(items.filter(i => next.has(getId(i))))
      return next
    })
  }, [items, getId, onChange])
  
  // Toggle item selection
  const toggle = useCallback((item) => {
    if (isSelected(item)) {
      deselect(item)
    } else {
      select(item)
    }
  }, [isSelected, select, deselect])
  
  // Select all items
  const selectAll = useCallback(() => {
    const allIds = new Set(items.map(getId))
    setSelectedIds(allIds)
    onChange?.(items)
  }, [items, getId, onChange])
  
  // Deselect all items
  const deselectAll = useCallback(() => {
    setSelectedIds(new Set())
    onChange?.([])
  }, [onChange])
  
  // Toggle all items selection
  const toggleAll = useCallback(() => {
    if (isAllSelected) {
      deselectAll()
    } else {
      selectAll()
    }
  }, [isAllSelected, selectAll, deselectAll])
  
  // Select range of items (useful for shift+click)
  const selectRange = useCallback((fromItem, toItem) => {
    if (!multiple) return
    
    const fromIndex = items.findIndex(item => getId(item) === getId(fromItem))
    const toIndex = items.findIndex(item => getId(item) === getId(toItem))
    
    if (fromIndex === -1 || toIndex === -1) return
    
    const start = Math.min(fromIndex, toIndex)
    const end = Math.max(fromIndex, toIndex)
    
    const rangeIds = items.slice(start, end + 1).map(getId)
    
    setSelectedIds(prev => {
      const next = new Set(prev)
      rangeIds.forEach(id => next.add(id))
      onChange?.(items.filter(i => next.has(getId(i))))
      return next
    })
  }, [items, getId, multiple, onChange])
  
  // Set selection programmatically
  const setSelection = useCallback((newSelection) => {
    const ids = new Set(newSelection.map(getId))
    setSelectedIds(ids)
    onChange?.(newSelection)
  }, [getId, onChange])
  
  // Clear selection
  const clear = useCallback(() => {
    setSelectedIds(new Set())
    onChange?.([])
  }, [onChange])
  
  return {
    // Selected data
    selectedItems,
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    
    // Selection state
    isSelected,
    isAllSelected,
    isSomeSelected,
    hasSelection: selectedIds.size > 0,
    
    // Actions
    select,
    deselect,
    toggle,
    selectAll,
    deselectAll,
    toggleAll,
    selectRange,
    setSelection,
    clear
  }
}
```

## Testing Criteria
- [ ] Business logic is completely extracted from UI components
- [ ] Custom hooks are reusable and work with different data sets
- [ ] Form validation works correctly with various validation rules
- [ ] Data processing hooks handle edge cases appropriately
- [ ] Selection management works with single and multiple selection
- [ ] Chart data generation produces correct data structures
- [ ] All hooks are properly memoized to prevent unnecessary re-renders
- [ ] Existing functionality is preserved after refactoring

## Definition of Done
- All business logic extracted from components into custom hooks
- Components focused purely on presentation and UI interaction
- Reusable hooks that can be used across different parts of the application
- Comprehensive form validation system with flexible rules
- Data processing logic properly abstracted and optimized
- Clean separation of concerns between data, business logic, and UI
- Improved testability of business logic
- All existing functionality preserved

## Files to Create
- `src/hooks/useCampaignData.js`
- `src/hooks/useFormValidation.js`  
- `src/hooks/useChartData.js`
- `src/hooks/useSelection.js`
- `src/hooks/usePagination.js`
- `src/hooks/useSearch.js`
- `src/hooks/useSort.js`
- `src/utils/calculations.js` (enhanced)
- `src/utils/validation.js`

## Dependencies
- Completed Phase 2 Task 3 (Centralized Error Handling)
- Date-fns for date operations

## Estimated Time
8-10 hours