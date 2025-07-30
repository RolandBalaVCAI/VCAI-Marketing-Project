# Phase 1 Task 4: Create Zustand Stores

## Objective
Implement the actual Zustand stores with all necessary state management, actions, and business logic to replace the local component state.

## Current State
- Store structure and patterns defined in previous task
- Mock API service available for data operations
- Components still using local React state

## Target State
- Fully functional Zustand stores managing all application state
- Clean separation between data fetching, state management, and UI
- Optimistic updates and error handling implemented

## Implementation Steps

### 1. Implement Campaign Store
Create comprehensive campaign management with:
- CRUD operations for campaigns
- Notes, documents, and media management
- Change history tracking
- Optimistic updates for better UX

### 2. Implement Filters Store
Create filtering and pagination logic:
- Vendor, status, and date range filters
- Search functionality
- Sorting configuration
- Pagination state

### 3. Implement UI Store
Create UI state management:
- Modal and dropdown states
- View navigation
- Notification system
- Loading indicators

### 4. Add Store Selectors
Create efficient selectors to prevent unnecessary re-renders:
- Memoized computed values
- Filtered and sorted data
- Pagination calculations

## Detailed Implementation

### Campaign Store (`src/stores/campaignsStore.js`)
```javascript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { campaignApi } from '../api/endpoints/campaigns'

export const useCampaignStore = create(
  devtools(
    (set, get) => ({
      // State
      campaigns: [],
      selectedCampaign: null,
      isLoading: false,
      isUpdating: {},  // Track loading per campaign ID
      error: null,
      
      // Actions
      fetchCampaigns: async (filters = {}) => {
        set({ isLoading: true, error: null }, false, 'FETCH_CAMPAIGNS_START')
        try {
          const response = await campaignApi.getAll(filters)
          set({ 
            campaigns: response.data, 
            isLoading: false 
          }, false, 'FETCH_CAMPAIGNS_SUCCESS')
        } catch (error) {
          set({ 
            error: error.message, 
            isLoading: false 
          }, false, 'FETCH_CAMPAIGNS_ERROR')
        }
      },
      
      getCampaign: async (id) => {
        const { campaigns } = get()
        const existing = campaigns.find(c => c.id === id)
        if (existing) {
          set({ selectedCampaign: existing }, false, 'SELECT_CAMPAIGN')
          return existing
        }
        
        try {
          const response = await campaignApi.getById(id)
          set({ selectedCampaign: response.data }, false, 'GET_CAMPAIGN_SUCCESS')
          return response.data
        } catch (error) {
          set({ error: error.message }, false, 'GET_CAMPAIGN_ERROR')
          throw error
        }
      },
      
      updateCampaign: async (id, updates) => {
        // Optimistic update
        const { campaigns, selectedCampaign } = get()
        const optimisticCampaigns = campaigns.map(c => 
          c.id === id ? { ...c, ...updates } : c
        )
        const optimisticSelected = selectedCampaign?.id === id 
          ? { ...selectedCampaign, ...updates } 
          : selectedCampaign
          
        set({ 
          campaigns: optimisticCampaigns,
          selectedCampaign: optimisticSelected,
          isUpdating: { ...get().isUpdating, [id]: true }
        }, false, 'UPDATE_CAMPAIGN_OPTIMISTIC')
        
        try {
          const response = await campaignApi.update(id, updates)
          set({ 
            campaigns: campaigns.map(c => 
              c.id === id ? response.data : c
            ),
            selectedCampaign: selectedCampaign?.id === id 
              ? response.data 
              : selectedCampaign,
            isUpdating: { ...get().isUpdating, [id]: false }
          }, false, 'UPDATE_CAMPAIGN_SUCCESS')
          return response.data
        } catch (error) {
          // Revert optimistic update
          set({ 
            campaigns,
            selectedCampaign,
            isUpdating: { ...get().isUpdating, [id]: false },
            error: error.message
          }, false, 'UPDATE_CAMPAIGN_ERROR')
          throw error
        }
      },
      
      addNote: async (campaignId, noteText, currentUser) => {
        const note = {
          id: Date.now(),
          text: noteText,
          user: currentUser,
          timestamp: new Date().toISOString()
        }
        
        // Optimistic update
        const { campaigns, selectedCampaign } = get()
        const updateCampaign = (campaign) => ({
          ...campaign,
          notes: [...(campaign.notes || []), note],
          history: [...(campaign.history || []), {
            id: Date.now() + Math.random(),
            action: 'Added a note',
            user: currentUser,
            timestamp: new Date().toISOString()
          }]
        })
        
        set({
          campaigns: campaigns.map(c => 
            c.id === campaignId ? updateCampaign(c) : c
          ),
          selectedCampaign: selectedCampaign?.id === campaignId 
            ? updateCampaign(selectedCampaign) 
            : selectedCampaign
        }, false, 'ADD_NOTE_OPTIMISTIC')
        
        try {
          await campaignApi.addNote(campaignId, noteText, currentUser)
        } catch (error) {
          // Revert on error
          set({ campaigns, selectedCampaign, error: error.message })
          throw error
        }
      },
      
      // ... similar patterns for documents, media, etc.
      
      clearError: () => set({ error: null }, false, 'CLEAR_ERROR'),
      clearSelection: () => set({ selectedCampaign: null }, false, 'CLEAR_SELECTION')
    }),
    { name: 'campaign-store' }
  )
)
```

### Filters Store (`src/stores/filtersStore.js`)
```javascript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useFiltersStore = create(
  devtools(
    persist(
      (set, get) => ({
        // Filter state
        selectedVendors: [],
        dateRange: 'Last 30 Days',
        customStartDate: '',
        customEndDate: '',
        statusFilter: 'All',
        searchTerm: '',
        
        // Pagination
        currentPage: 1,
        itemsPerPage: 10,
        
        // Sorting
        sortConfig: { key: 'revenue', direction: 'desc' },
        
        // Computed selectors
        getFilters: () => {
          const state = get()
          return {
            vendors: state.selectedVendors,
            dateRange: state.dateRange,
            customDates: {
              start: state.customStartDate,
              end: state.customEndDate
            },
            status: state.statusFilter,
            search: state.searchTerm,
            page: state.currentPage,
            limit: state.itemsPerPage,
            sort: state.sortConfig
          }
        },
        
        // Actions
        setVendorFilter: (vendors) => set({ 
          selectedVendors: vendors,
          currentPage: 1  // Reset pagination
        }, false, 'SET_VENDOR_FILTER'),
        
        setDateRange: (range) => set({ 
          dateRange: range,
          currentPage: 1
        }, false, 'SET_DATE_RANGE'),
        
        setCustomDates: (startDate, endDate) => set({
          customStartDate: startDate,
          customEndDate: endDate,
          dateRange: 'Custom',
          currentPage: 1
        }, false, 'SET_CUSTOM_DATES'),
        
        setStatusFilter: (status) => set({ 
          statusFilter: status,
          currentPage: 1
        }, false, 'SET_STATUS_FILTER'),
        
        setSearchTerm: (term) => set({ 
          searchTerm: term,
          currentPage: 1
        }, false, 'SET_SEARCH_TERM'),
        
        setSort: (key, direction) => set({ 
          sortConfig: { key, direction },
          currentPage: 1
        }, false, 'SET_SORT'),
        
        setPage: (page) => set({ 
          currentPage: page 
        }, false, 'SET_PAGE'),
        
        resetFilters: () => set({
          selectedVendors: [],
          dateRange: 'Last 30 Days',
          customStartDate: '',
          customEndDate: '',
          statusFilter: 'All',
          searchTerm: '',
          currentPage: 1,
          sortConfig: { key: 'revenue', direction: 'desc' }
        }, false, 'RESET_FILTERS')
      }),
      {
        name: 'filters-storage',
        partialize: (state) => ({
          dateRange: state.dateRange,
          statusFilter: state.statusFilter,
          itemsPerPage: state.itemsPerPage,
          sortConfig: state.sortConfig
        })
      }
    ),
    { name: 'filters-store' }
  )
)
```

### UI Store (`src/stores/uiStore.js`)
```javascript
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export const useUIStore = create(
  devtools(
    persist(
      (set, get) => ({
        // View state
        currentView: 'dashboard',
        
        // Modal states
        showAddNote: false,
        showAddMedia: false,
        showVendorDropdown: false,
        
        // UI preferences
        sidebarCollapsed: false,
        theme: 'light',
        
        // Notifications
        notifications: [],
        
        // Loading states (global)
        globalLoading: false,
        
        // Actions
        setCurrentView: (view) => set({ 
          currentView: view 
        }, false, 'SET_CURRENT_VIEW'),
        
        toggleModal: (modalName, isOpen) => set({ 
          [modalName]: isOpen ?? !get()[modalName] 
        }, false, 'TOGGLE_MODAL'),
        
        addNotification: (message, type = 'info', duration = 5000) => {
          const notification = {
            id: Date.now(),
            message,
            type,
            timestamp: Date.now()
          }
          
          set({ 
            notifications: [...get().notifications, notification] 
          }, false, 'ADD_NOTIFICATION')
          
          // Auto remove after duration
          if (duration > 0) {
            setTimeout(() => {
              get().removeNotification(notification.id)
            }, duration)
          }
        },
        
        removeNotification: (id) => set({ 
          notifications: get().notifications.filter(n => n.id !== id) 
        }, false, 'REMOVE_NOTIFICATION'),
        
        clearNotifications: () => set({ 
          notifications: [] 
        }, false, 'CLEAR_NOTIFICATIONS'),
        
        setGlobalLoading: (loading) => set({ 
          globalLoading: loading 
        }, false, 'SET_GLOBAL_LOADING'),
        
        setTheme: (theme) => set({ 
          theme 
        }, false, 'SET_THEME'),
        
        toggleSidebar: () => set({ 
          sidebarCollapsed: !get().sidebarCollapsed 
        }, false, 'TOGGLE_SIDEBAR')
      }),
      {
        name: 'ui-storage',
        partialize: (state) => ({
          theme: state.theme,
          sidebarCollapsed: state.sidebarCollapsed
        })
      }
    ),
    { name: 'ui-store' }
  )
)
```

## Testing Criteria
- [ ] All stores properly created and functional
- [ ] DevTools integration shows clear action names
- [ ] Optimistic updates work correctly
- [ ] Error handling prevents app crashes
- [ ] Persistence works for appropriate state
- [ ] No state mutations (immutable updates)
- [ ] Selectors provide computed values efficiently

## Definition of Done
- Complete implementation of all three stores
- Proper error handling and loading states
- Optimistic updates for better UX
- Persistence for user preferences
- Clear action naming for debugging
- Efficient selectors for computed values
- No direct state mutations

## Files to Create
- `src/stores/campaignStore.js`
- `src/stores/filtersStore.js`
- `src/stores/uiStore.js`

## Dependencies
- Completed Phase 1 Task 3 (Zustand Setup)
- Mock API service available

## Estimated Time
4-6 hours