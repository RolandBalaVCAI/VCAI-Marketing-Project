# Phase 1 Task 8: Add Optimistic Updates for Better UX

## Objective
Implement optimistic updates throughout the application to provide immediate user feedback for all actions, with proper rollback mechanisms for failed operations.

## Current State
- Basic optimistic updates in some store actions
- Inconsistent loading states across the application
- No visual feedback for user actions
- Error handling could be improved

## Target State
- Comprehensive optimistic updates for all user actions
- Consistent loading and success states
- Proper rollback mechanisms for failed operations
- Enhanced user experience with immediate feedback

## Implementation Steps

### 1. Enhance Campaign Store with Optimistic Updates
Improve existing optimistic update mechanisms:
- Better state management for pending operations
- Improved error handling and rollback
- Visual indicators for optimistic operations

### 2. Create Optimistic Update Utilities
Create helper functions for consistent optimistic behavior:
- Generic optimistic update patterns
- Rollback mechanisms
- State synchronization utilities

### 3. Implement Loading States
Add comprehensive loading states:
- Global loading indicators
- Per-action loading states
- Skeleton screens for data loading

### 4. Add Success Feedback
Implement success indicators:
- Toast notifications for completed actions
- Visual confirmation for updates
- Progress indicators for long operations

## Detailed Implementation

### Optimistic Update Utilities (`src/utils/optimisticUpdates.js`)
```javascript
import { useUIStore } from '../stores/uiStore'

// Generic optimistic update helper
export const createOptimisticUpdate = ({
  updateFunction,
  rollbackFunction,
  successMessage,
  errorMessage,
  loadingStateKey
}) => {
  return async (...args) => {
    const { addNotification } = useUIStore.getState()
    
    // Store original state for rollback
    const originalState = rollbackFunction ? rollbackFunction() : null
    
    try {
      // Apply optimistic update immediately
      const optimisticResult = updateFunction(...args)
      
      // Show loading indicator if specified
      if (loadingStateKey) {
        useUIStore.getState().setLoading(loadingStateKey, true)
      }
      
      // Wait for actual operation to complete
      const result = await optimisticResult
      
      // Show success notification
      if (successMessage) {
        addNotification(successMessage, 'success', 3000)
      }
      
      return result
    } catch (error) {
      // Rollback optimistic changes
      if (rollbackFunction && originalState) {
        rollbackFunction(originalState)
      }
      
      // Show error notification
      const message = errorMessage || `Operation failed: ${error.message}`
      addNotification(message, 'error', 5000)
      
      throw error
    } finally {
      // Clear loading state
      if (loadingStateKey) {
        useUIStore.getState().setLoading(loadingStateKey, false)
      }
    }
  }
}

// Optimistic list operations
export const optimisticListOperations = {
  // Add item to list optimistically
  add: (list, item, getId = (item) => item.id) => {
    const optimisticItem = {
      ...item,
      id: getId(item) || `temp-${Date.now()}`,
      _optimistic: true,
      _timestamp: Date.now()
    }
    
    return [...list, optimisticItem]
  },
  
  // Update item in list optimistically
  update: (list, itemId, updates) => {
    return list.map(item => 
      item.id === itemId 
        ? { ...item, ...updates, _optimistic: true, _timestamp: Date.now() }
        : item
    )
  },
  
  // Remove item from list optimistically
  remove: (list, itemId) => {
    return list.filter(item => item.id !== itemId)
  },
  
  // Confirm optimistic operation (remove optimistic flags)
  confirm: (list, itemId, confirmedData = {}) => {
    return list.map(item => 
      item.id === itemId
        ? { ...item, ...confirmedData, _optimistic: false }
        : item
    )
  },
  
  // Rollback optimistic operation
  rollback: (list, itemId) => {
    return list.filter(item => !(item.id === itemId && item._optimistic))
  }
}

// Optimistic UI helpers
export const optimisticUI = {
  // Show optimistic success for a brief moment
  showOptimisticSuccess: (element, duration = 2000) => {
    if (!element) return
    
    const originalStyle = element.style.cssText
    element.style.cssText += '; border: 2px solid #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);'
    
    setTimeout(() => {
      element.style.cssText = originalStyle
    }, duration)
  },
  
  // Show optimistic loading state
  showOptimisticLoading: (element, isLoading) => {
    if (!element) return
    
    if (isLoading) {
      element.style.opacity = '0.6'
      element.style.pointerEvents = 'none'
      element.style.cursor = 'wait'
    } else {
      element.style.opacity = ''
      element.style.pointerEvents = ''
      element.style.cursor = ''
    }
  }
}
```

### Enhanced Campaign Store (`src/stores/campaignStore.js`)
```javascript
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { campaignApi } from '../api/endpoints/campaigns'
import { optimisticListOperations, createOptimisticUpdate } from '../utils/optimisticUpdates'

export const useCampaignStore = create(
  devtools(
    (set, get) => ({
      // State
      campaigns: [],
      selectedCampaign: null,
      isLoading: false,
      loadingStates: {}, // Track loading for specific operations
      error: null,
      
      // Helper to update loading states
      setLoading: (key, isLoading) => set(
        state => ({
          loadingStates: { ...state.loadingStates, [key]: isLoading }
        }),
        false,
        `SET_LOADING_${key.toUpperCase()}`
      ),
      
      // Optimistic campaign update
      updateCampaign: createOptimisticUpdate({
        updateFunction: async (id, updates) => {
          const { campaigns, selectedCampaign } = get()
          
          // Apply optimistic update immediately
          const optimisticCampaigns = optimisticListOperations.update(campaigns, id, updates)
          const optimisticSelected = selectedCampaign?.id === id 
            ? { ...selectedCampaign, ...updates, _optimistic: true }
            : selectedCampaign
          
          set({
            campaigns: optimisticCampaigns,
            selectedCampaign: optimisticSelected
          }, false, 'UPDATE_CAMPAIGN_OPTIMISTIC')
          
          // Perform actual API call
          const response = await campaignApi.update(id, updates)
          
          // Confirm optimistic update with real data
          const confirmedCampaigns = optimisticListOperations.confirm(
            get().campaigns, 
            id, 
            response.data
          )
          const confirmedSelected = selectedCampaign?.id === id 
            ? response.data 
            : get().selectedCampaign
          
          set({
            campaigns: confirmedCampaigns,
            selectedCampaign: confirmedSelected
          }, false, 'UPDATE_CAMPAIGN_CONFIRMED')
          
          return response.data
        },
        rollbackFunction: (originalState) => {
          if (originalState) {
            set({
              campaigns: originalState.campaigns,
              selectedCampaign: originalState.selectedCampaign
            }, false, 'UPDATE_CAMPAIGN_ROLLBACK')
          }
        },
        successMessage: 'Campaign updated successfully',
        errorMessage: 'Failed to update campaign',
        loadingStateKey: 'updateCampaign'
      }),
      
      // Optimistic note addition
      addNote: createOptimisticUpdate({
        updateFunction: async (campaignId, noteText, user) => {
          const { campaigns, selectedCampaign } = get()
          
          const newNote = {
            id: `temp-note-${Date.now()}`,
            text: noteText,
            user: user,
            timestamp: new Date().toISOString(),
            _optimistic: true
          }
          
          const historyEntry = {
            id: `temp-history-${Date.now()}`,
            action: 'Added a note',
            user: user,
            timestamp: new Date().toISOString(),
            _optimistic: true
          }
          
          // Apply optimistic update
          const updateCampaign = (campaign) => ({
            ...campaign,
            notes: [...(campaign.notes || []), newNote],
            history: [...(campaign.history || []), historyEntry],
            _optimistic: true
          })
          
          const optimisticCampaigns = campaigns.map(c => 
            c.id === campaignId ? updateCampaign(c) : c
          )
          const optimisticSelected = selectedCampaign?.id === campaignId 
            ? updateCampaign(selectedCampaign) 
            : selectedCampaign
          
          set({
            campaigns: optimisticCampaigns,
            selectedCampaign: optimisticSelected
          }, false, 'ADD_NOTE_OPTIMISTIC')
          
          // Perform actual API call
          const response = await campaignApi.addNote(campaignId, noteText, user)
          
          // Confirm with real data
          const confirmCampaign = (campaign) => ({
            ...campaign,
            notes: campaign.notes.map(note => 
              note.id === newNote.id ? response.note : note
            ),
            history: campaign.history.map(entry => 
              entry.id === historyEntry.id ? response.historyEntry : entry
            ),
            _optimistic: false
          })
          
          set({
            campaigns: get().campaigns.map(c => 
              c.id === campaignId ? confirmCampaign(c) : c
            ),
            selectedCampaign: get().selectedCampaign?.id === campaignId 
              ? confirmCampaign(get().selectedCampaign) 
              : get().selectedCampaign
          }, false, 'ADD_NOTE_CONFIRMED')
          
          return response
        },
        rollbackFunction: (originalState) => {
          if (originalState) {
            set({
              campaigns: originalState.campaigns,
              selectedCampaign: originalState.selectedCampaign
            }, false, 'ADD_NOTE_ROLLBACK')
          }
        },
        successMessage: 'Note added successfully',
        errorMessage: 'Failed to add note',
        loadingStateKey: 'addNote'
      }),
      
      // Optimistic document upload
      uploadDocument: createOptimisticUpdate({
        updateFunction: async (campaignId, file, user) => {
          const { campaigns, selectedCampaign } = get()
          
          // Create optimistic document
          const optimisticDoc = {
            id: `temp-doc-${Date.now()}`,
            name: file.name,
            type: file.type,
            size: file.size,
            uploadDate: new Date().toISOString(),
            uploadedBy: user,
            data: URL.createObjectURL(file), // Temporary URL for preview
            _optimistic: true,
            _uploading: true
          }
          
          const historyEntry = {
            id: `temp-history-${Date.now()}`,
            action: `Uploaded document: ${file.name}`,
            user: user,
            timestamp: new Date().toISOString(),
            _optimistic: true
          }
          
          // Apply optimistic update
          const updateCampaign = (campaign) => ({
            ...campaign,
            documents: [...(campaign.documents || []), optimisticDoc],
            history: [...(campaign.history || []), historyEntry],
            _optimistic: true
          })
          
          set({
            campaigns: campaigns.map(c => 
              c.id === campaignId ? updateCampaign(c) : c
            ),
            selectedCampaign: selectedCampaign?.id === campaignId 
              ? updateCampaign(selectedCampaign) 
              : selectedCampaign
          }, false, 'UPLOAD_DOCUMENT_OPTIMISTIC')
          
          // Perform actual upload
          const response = await campaignApi.uploadDocument(campaignId, file, user)
          
          // Confirm with real data
          const confirmCampaign = (campaign) => ({
            ...campaign,
            documents: campaign.documents.map(doc => 
              doc.id === optimisticDoc.id 
                ? { ...response.document, _optimistic: false, _uploading: false }
                : doc
            ),
            history: campaign.history.map(entry => 
              entry.id === historyEntry.id ? response.historyEntry : entry
            ),
            _optimistic: false
          })
          
          set({
            campaigns: get().campaigns.map(c => 
              c.id === campaignId ? confirmCampaign(c) : c
            ),
            selectedCampaign: get().selectedCampaign?.id === campaignId 
              ? confirmCampaign(get().selectedCampaign) 
              : get().selectedCampaign
          }, false, 'UPLOAD_DOCUMENT_CONFIRMED')
          
          // Clean up temporary URL
          URL.revokeObjectURL(optimisticDoc.data)
          
          return response
        },
        rollbackFunction: (originalState) => {
          if (originalState) {
            set({
              campaigns: originalState.campaigns,
              selectedCampaign: originalState.selectedCampaign
            }, false, 'UPLOAD_DOCUMENT_ROLLBACK')
          }
        },
        successMessage: 'Document uploaded successfully',
        errorMessage: 'Failed to upload document',
        loadingStateKey: 'uploadDocument'
      }),
      
      // Helper to get loading state
      isLoadingOperation: (operation) => {
        return get().loadingStates[operation] || false
      },
      
      // Clear all optimistic states (useful for debugging)
      clearOptimisticStates: () => set(
        state => ({
          campaigns: state.campaigns.map(campaign => ({
            ...campaign,
            _optimistic: false,
            notes: campaign.notes?.map(note => ({ ...note, _optimistic: false })) || [],
            documents: campaign.documents?.map(doc => ({ ...doc, _optimistic: false })) || [],
            history: campaign.history?.map(entry => ({ ...entry, _optimistic: false })) || []
          })),
          selectedCampaign: state.selectedCampaign 
            ? {
                ...state.selectedCampaign,
                _optimistic: false,
                notes: state.selectedCampaign.notes?.map(note => ({ ...note, _optimistic: false })) || [],
                documents: state.selectedCampaign.documents?.map(doc => ({ ...doc, _optimistic: false })) || [],
                history: state.selectedCampaign.history?.map(entry => ({ ...entry, _optimistic: false })) || []
              }
            : null
        }),
        false,
        'CLEAR_OPTIMISTIC_STATES'
      )
    }),
    { name: 'campaign-store' }
  )
)
```

### Loading Components (`src/components/common/LoadingSpinner.jsx`)
```javascript
import React from 'react'
import { Loader2 } from 'lucide-react'

const LoadingSpinner = ({ 
  size = 24, 
  message = 'Loading...', 
  show = true,
  inline = false 
}) => {
  if (!show) return null
  
  const containerStyle = inline 
    ? { display: 'inline-flex', alignItems: 'center', gap: '8px' }
    : {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        border: '1px solid #e0e0e0'
      }
  
  return (
    <div style={containerStyle}>
      <Loader2 
        size={size} 
        style={{ 
          color: '#2563eb', 
          animation: 'spin 1s linear infinite' 
        }} 
      />
      {message && (
        <span style={{
          color: '#666666',
          fontSize: '14px',
          fontWeight: '500',
          marginTop: inline ? 0 : '8px'
        }}>
          {message}
        </span>
      )}
    </div>
  )
}

export default LoadingSpinner
```

### Skeleton Components (`src/components/common/Skeleton.jsx`)
```javascript
import React from 'react'

const Skeleton = ({ 
  width = '100%', 
  height = '20px', 
  borderRadius = '4px',
  className = '',
  ...props 
}) => {
  return (
    <div
      className={className}
      style={{
        width,
        height,
        borderRadius,
        backgroundColor: '#f3f4f6',
        backgroundImage: 'linear-gradient(90deg, #f3f4f6 0%, #e5e7eb 50%, #f3f4f6 100%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-loading 1.5s ease-in-out infinite',
        ...props.style
      }}
      {...props}
    />
  )
}

// Add keyframes to global CSS or styled component
const SkeletonKeyframes = () => (
  <style>{`
    @keyframes skeleton-loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `}</style>
)

export default Skeleton
export { SkeletonKeyframes }
```

## Testing Criteria
- [ ] All user actions provide immediate visual feedback
- [ ] Optimistic updates work correctly for campaigns, notes, and documents
- [ ] Failed operations rollback properly
- [ ] Loading states display consistently across the app
- [ ] Success notifications appear for completed actions
- [ ] Error notifications show appropriate messages
- [ ] No visual glitches during optimistic updates
- [ ] Performance remains smooth with optimistic updates

## Definition of Done
- Comprehensive optimistic updates implemented for all user actions
- Consistent loading and success states throughout the app
- Proper rollback mechanisms for failed operations
- Enhanced user experience with immediate feedback
- No degradation in app performance
- All existing functionality preserved
- Proper error handling and user notifications

## Files to Create/Modify
- `src/utils/optimisticUpdates.js`
- `src/components/common/LoadingSpinner.jsx`
- `src/components/common/Skeleton.jsx`
- Update `src/stores/campaignStore.js`
- Update relevant hooks to use optimistic patterns

## Dependencies
- Completed Phase 1 Task 7 (Refactor CampaignDetail)
- UI Store with notification system

## Estimated Time
4-6 hours