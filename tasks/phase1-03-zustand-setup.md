# Phase 1 Task 3: Install and Configure Zustand

## Objective
Set up Zustand as the central state management solution to replace local React state and provide a single source of truth for application data.

## Current State
- State managed locally within components using React hooks
- Data passed down through props
- Multiple sources of truth for similar data
- Potential for state synchronization issues

## Target State
- Centralized state management with Zustand
- Single source of truth for all application data
- Predictable state updates with clear actions
- Optimistic updates for better user experience

## Implementation Steps

### 1. Verify Zustand Installation
Zustand should already be installed from the previous task, but verify:
```bash
npm list zustand
```

### 2. Create Base Store Structure
Create `src/stores/index.js` with store combination utility:
```javascript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

// Utility to combine stores
export const combineStores = (...stores) => create(
  devtools(
    (set, get) => {
      const combined = stores.reduce((acc, createStore) => {
        const store = createStore(set, get)
        return { ...acc, ...store }
      }, {})
      return combined
    },
    { name: 'marketing-dashboard' }
  )
)
```

### 3. Create Campaigns Store
Create `src/stores/campaignsStore.js`:
- Store campaign data and loading states
- Actions for CRUD operations
- Optimistic updates for immediate UI feedback
- Error state management

### 4. Create Filters Store
Create `src/stores/filtersStore.js`:
- Manage all filter states (vendors, date ranges, status)
- Pagination state
- Search terms and sort configuration

### 5. Create UI Store
Create `src/stores/uiStore.js`:
- Modal and dialog states
- Loading indicators
- Error messages and notifications
- View states (dashboard vs detail)

## Store Architecture

### Campaigns Store Structure
```javascript
{
  // Data
  campaigns: [],
  selectedCampaign: null,
  
  // Loading states
  isLoading: false,
  isUpdating: false,
  
  // Error states
  error: null,
  
  // Actions
  fetchCampaigns: async (filters) => { ... },
  createCampaign: async (campaignData) => { ... },
  updateCampaign: async (id, updates) => { ... },
  deleteCampaign: async (id) => { ... },
  selectCampaign: (campaign) => { ... },
  
  // Optimistic actions
  optimisticUpdate: (id, updates) => { ... },
  revertOptimisticUpdate: (id) => { ... }
}
```

### Filters Store Structure
```javascript
{
  // Filter states
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
  
  // Actions
  setVendorFilter: (vendors) => { ... },
  setDateRange: (range) => { ... },
  setStatusFilter: (status) => { ... },
  setSort: (key, direction) => { ... },
  resetFilters: () => { ... }
}
```

### UI Store Structure
```javascript
{
  // View states
  currentView: 'dashboard',
  
  // Modal states
  showAddNote: false,
  showAddMedia: false,
  showVendorDropdown: false,
  
  // Global UI states
  sidebarCollapsed: false,
  theme: 'light',
  
  // Notification system
  notifications: [],
  
  // Actions
  setCurrentView: (view) => { ... },
  toggleModal: (modalName) => { ... },
  addNotification: (message, type) => { ... },
  removeNotification: (id) => { ... }
}
```

## Key Features to Implement

### 1. Devtools Integration
- Enable Redux DevTools for debugging
- Clear action naming for easy tracking
- State snapshots and time travel

### 2. Persistence
- Persist filters and UI preferences to localStorage
- Selective persistence (don't persist sensitive data)

### 3. Optimistic Updates
- Immediate UI updates for better UX
- Rollback mechanism for failed operations
- Loading states during async operations

### 4. Error Handling
- Centralized error state management
- User-friendly error messages
- Retry mechanisms for failed operations

## Integration Pattern
Each store should follow this pattern:
```javascript
const useStore = create(
  devtools(
    (set, get) => ({
      // State
      data: initialState,
      
      // Computed values (getters)
      filteredData: () => {
        const { data, filters } = get()
        return filterData(data, filters)
      },
      
      // Actions
      updateData: (newData) => set(
        { data: newData },
        false,
        'UPDATE_DATA'
      ),
      
      // Async actions
      fetchData: async () => {
        set({ isLoading: true }, false, 'FETCH_START')
        try {
          const data = await api.fetchData()
          set({ data, isLoading: false }, false, 'FETCH_SUCCESS')
        } catch (error) {
          set({ error, isLoading: false }, false, 'FETCH_ERROR')
        }
      }
    }),
    { name: 'store-name' }
  )
)
```

## Testing Criteria
- [ ] All stores created with proper structure
- [ ] DevTools integration working
- [ ] Actions properly named and traceable
- [ ] State updates work correctly
- [ ] No state mutation (immutable updates)
- [ ] Error states handled appropriately

## Definition of Done
- Complete Zustand store architecture implemented
- All application state centralized in stores
- Proper action naming and DevTools integration
- Error handling and loading states in place
- Optimistic updates for better UX
- Clean separation between UI state and data state
- Persistence for user preferences

## Files to Create
- `src/stores/index.js`
- `src/stores/campaignsStore.js`
- `src/stores/filtersStore.js`
- `src/stores/uiStore.js`

## Dependencies
- Completed Phase 1 Task 2 (Mock API Service)
- Zustand package installed

## Estimated Time
3-4 hours