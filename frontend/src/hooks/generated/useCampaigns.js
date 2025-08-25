import { useState, useEffect } from 'react'
import { getMarketingDashboardAPI } from '../../generated/api'
import { useUIStore } from '../../stores/uiStore'

// Get the API functions
const api = getMarketingDashboardAPI()

// Campaign keys for cache management
export const campaignKeys = {
  all: ['campaigns'],
  lists: () => [...campaignKeys.all, 'list'],
  list: (filters) => [...campaignKeys.lists(), filters],
  details: () => [...campaignKeys.all, 'detail'],
  detail: (id) => [...campaignKeys.details(), id]
}

// List campaigns hook
export const useCampaigns = (filters = {}, options = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const fetchCampaigns = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getCampaigns(filters)
      setData(response.data)
      
      if (options.onSuccess) {
        options.onSuccess(response.data)
      }
    } catch (err) {
      setError(err)
      if (options.onError) {
        options.onError(err)
      } else {
        addNotification(`Failed to load campaigns: ${err.message}`, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (options.enabled !== false) {
      fetchCampaigns()
    }
  }, [
    filters.vendor?.join(','),
    filters.status,
    filters.search,
    filters.sortBy,
    filters.sortOrder,
    filters.page,
    filters.limit,
    options.enabled
  ])

  return {
    data,
    isLoading,
    error,
    refetch: fetchCampaigns,
    isEmpty: !data || (data.campaigns && data.campaigns.length === 0)
  }
}

// Get single campaign hook
export const useCampaign = (id, options = {}) => {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const fetchCampaign = async () => {
    if (!id) return
    
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.getCampaignsId(id)
      setData(response.data)
      
      if (options.onSuccess) {
        options.onSuccess(response.data)
      }
    } catch (err) {
      setError(err)
      if (options.onError) {
        options.onError(err)
      } else {
        addNotification(`Failed to load campaign: ${err.message}`, 'error')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (id && options.enabled !== false) {
      fetchCampaign()
    }
  }, [id, options.enabled])

  return {
    data,
    isLoading,
    error,
    refetch: fetchCampaign
  }
}

// Create campaign mutation hook
export const useCreateCampaign = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const mutate = async (newCampaign) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.postCampaigns(newCampaign)
      
      addNotification('Campaign created successfully', 'success')
      
      if (options.onSuccess) {
        options.onSuccess(response.data, newCampaign)
      }
      
      return response.data
    } catch (err) {
      setError(err)
      
      if (options.onError) {
        options.onError(err, newCampaign)
      } else {
        addNotification(`Failed to create campaign: ${err.message}`, 'error')
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error
  }
}

// Update campaign mutation hook
export const useUpdateCampaign = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const mutate = async ({ id, updates }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.putCampaignsId(id, updates)
      
      addNotification('Campaign updated successfully', 'success')
      
      if (options.onSuccess) {
        options.onSuccess(response.data, { id, updates })
      }
      
      return response.data
    } catch (err) {
      setError(err)
      
      if (options.onError) {
        options.onError(err, { id, updates })
      } else {
        addNotification(`Failed to update campaign: ${err.message}`, 'error')
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error
  }
}

// Delete campaign mutation hook
export const useDeleteCampaign = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const mutate = async (id) => {
    try {
      setIsLoading(true)
      setError(null)
      
      await api.deleteCampaignsId(id)
      
      addNotification('Campaign deleted successfully', 'success')
      
      if (options.onSuccess) {
        options.onSuccess(undefined, id)
      }
    } catch (err) {
      setError(err)
      
      if (options.onError) {
        options.onError(err, id)
      } else {
        addNotification(`Failed to delete campaign: ${err.message}`, 'error')
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error
  }
}

// Add note mutation hook
export const useAddNoteToCampaign = (options = {}) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const { addNotification } = useUIStore()

  const mutate = async ({ id, text, user }) => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await api.postCampaignsIdNotes(id, { text, user })
      
      addNotification('Note added successfully', 'success')
      
      if (options.onSuccess) {
        options.onSuccess(response.data, { id, text, user })
      }
      
      return response.data
    } catch (err) {
      setError(err)
      
      if (options.onError) {
        options.onError(err, { id, text, user })
      } else {
        addNotification(`Failed to add note: ${err.message}`, 'error')
      }
      
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    mutate,
    isLoading,
    error
  }
}