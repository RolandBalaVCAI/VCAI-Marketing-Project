# Phase 1 Task 7: Refactor CampaignDetail to Use Zustand Store

## Objective
Refactor the CampaignDetail component to use Zustand stores, implementing optimistic updates and proper state management for campaign editing, notes, documents, and media.

## Current State
- CampaignDetail manages all state locally with React hooks
- Manual prop drilling and state updates
- No optimistic updates for better UX
- Complex state management for editing modes

## Target State
- Component consumes data from Zustand stores
- Optimistic updates for immediate UI feedback
- Simplified state management through custom hooks
- Clean separation of concerns

## Implementation Steps

### 1. Create Campaign Detail Hooks
Create `src/hooks/useCampaignDetail.js`:
- Handle campaign editing state and actions
- Manage optimistic updates for better UX
- Provide validation and error handling

### 2. Create Document Management Hook
Create `src/hooks/useDocuments.js`:
- Handle document upload and management
- File validation and processing
- Progress tracking for uploads

### 3. Create Notes Management Hook
Create `src/hooks/useNotes.js`:
- Handle note creation and management
- Real-time updates and validation

### 4. Refactor CampaignDetail Component
Remove local state and replace with store consumption:
- Implement optimistic updates
- Simplify component structure
- Extract complex logic to hooks

## Detailed Implementation

### Campaign Detail Hook (`src/hooks/useCampaignDetail.js`)
```javascript
import { useState, useEffect, useCallback } from 'react'
import { useCampaignStore } from '../stores/campaignStore'
import { useUIStore } from '../stores/uiStore'

export const useCampaignDetail = (campaignId) => {
  const {
    selectedCampaign,
    isUpdating,
    error,
    getCampaign,
    updateCampaign,
    clearError
  } = useCampaignStore()
  
  const { setCurrentView, addNotification } = useUIStore()
  
  const [isEditing, setIsEditing] = useState(false)
  const [editedData, setEditedData] = useState({})
  const [originalData, setOriginalData] = useState({})
  
  // Load campaign data
  useEffect(() => {
    if (campaignId) {
      getCampaign(campaignId)
    }
  }, [campaignId, getCampaign])
  
  // Update local editing state when campaign changes
  useEffect(() => {
    if (selectedCampaign) {
      setOriginalData(selectedCampaign)
      setEditedData(selectedCampaign)
    }
  }, [selectedCampaign])
  
  // Handle editing state
  const startEditing = useCallback(() => {
    setIsEditing(true)
    setEditedData({ ...selectedCampaign })
    setOriginalData({ ...selectedCampaign })
  }, [selectedCampaign])
  
  const cancelEditing = useCallback(() => {
    setIsEditing(false)
    setEditedData({ ...originalData })
    clearError()
  }, [originalData, clearError])
  
  // Field update handler
  const updateField = useCallback((field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }))
  }, [])
  
  // Nested field update handler (for metrics, etc.)
  const updateNestedField = useCallback((parentField, childField, value) => {
    setEditedData(prev => ({
      ...prev,
      [parentField]: {
        ...prev[parentField],
        [childField]: value
      }
    }))
  }, [])
  
  // Save changes with optimistic updates
  const saveChanges = useCallback(async () => {
    if (!selectedCampaign) return { success: false, error: 'No campaign selected' }
    
    try {
      // Calculate what changed
      const changes = calculateChanges(originalData, editedData)
      
      if (changes.length === 0) {
        setIsEditing(false)
        return { success: true, message: 'No changes to save' }
      }
      
      // Optimistic update with change tracking
      await updateCampaign(selectedCampaign.id, {
        ...editedData,
        history: [
          ...(editedData.history || []),
          ...changes.map(change => ({
            id: Date.now() + Math.random(),
            action: change,
            user: 'Current User', // TODO: Get from auth context
            timestamp: new Date().toISOString()
          }))
        ],
        modifiedAt: new Date().toISOString()
      })
      
      setIsEditing(false)
      setOriginalData({ ...editedData })
      addNotification('Campaign updated successfully', 'success')
      
      return { success: true }
    } catch (error) {
      addNotification(`Failed to update campaign: ${error.message}`, 'error')
      return { success: false, error: error.message }
    }
  }, [selectedCampaign, originalData, editedData, updateCampaign, addNotification])
  
  // Navigate back to dashboard
  const goBack = useCallback(() => {
    if (isEditing && hasUnsavedChanges()) {
      if (window.confirm('You have unsaved changes. Are you sure you want to leave?')) {
        setCurrentView('dashboard')
      }
    } else {
      setCurrentView('dashboard')
    }
  }, [isEditing, setCurrentView])
  
  // Helper functions
  const hasUnsavedChanges = () => {
    return JSON.stringify(editedData) !== JSON.stringify(originalData)
  }
  
  const calculateChanges = (original, edited) => {
    const changes = []
    
    if (original.name !== edited.name) {
      changes.push(`Changed campaign name from "${original.name}" to "${edited.name}"`)
    }
    if (original.status !== edited.status) {
      changes.push(`Changed status from "${original.status}" to "${edited.status}"`)
    }
    if (original.metrics?.cost !== edited.metrics?.cost) {
      changes.push(`Updated cost from $${original.metrics?.cost?.toFixed(2)} to $${edited.metrics?.cost?.toFixed(2)}`)
    }
    if (original.startDate !== edited.startDate) {
      changes.push(`Changed start date from ${original.startDate} to ${edited.startDate}`)
    }
    if (original.endDate !== edited.endDate) {
      changes.push(`Changed end date from ${original.endDate} to ${edited.endDate}`)
    }
    if (original.manager !== edited.manager) {
      changes.push(`Changed manager from "${original.manager}" to "${edited.manager}"`)
    }
    if (original.adPlacementDomain !== edited.adPlacementDomain) {
      changes.push(`Changed ad placement domain from "${original.adPlacementDomain}" to "${edited.adPlacementDomain}"`)
    }
    if (original.device !== edited.device) {
      changes.push(`Changed device targeting from "${original.device}" to "${edited.device}"`)
    }
    if (original.targeting !== edited.targeting) {
      changes.push(`Changed geographic targeting from "${original.targeting}" to "${edited.targeting}"`)
    }
    if (original.repContactInfo !== edited.repContactInfo) {
      changes.push(`Updated rep contact information`)
    }
    
    return changes
  }
  
  return {
    // Data
    campaign: selectedCampaign,
    editedData,
    
    // State
    isEditing,
    isUpdating: isUpdating[selectedCampaign?.id] || false,
    error,
    hasUnsavedChanges: hasUnsavedChanges(),
    
    // Actions
    startEditing,
    cancelEditing,
    updateField,
    updateNestedField,
    saveChanges,
    goBack,
    clearError
  }
}
```

### Notes Management Hook (`src/hooks/useNotes.js`)
```javascript
import { useState } from 'react'
import { useCampaignStore } from '../stores/campaignStore'
import { useUIStore } from '../stores/uiStore'

export const useNotes = (campaignId) => {
  const { addNote } = useCampaignStore()
  const { addNotification } = useUIStore()
  
  const [showAddNote, setShowAddNote] = useState(false)
  const [newNote, setNewNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      addNotification('Please enter a note', 'warning')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      await addNote(campaignId, newNote.trim(), 'Current User') // TODO: Get from auth
      setNewNote('')
      setShowAddNote(false)
      addNotification('Note added successfully', 'success')
    } catch (error) {
      addNotification(`Failed to add note: ${error.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const cancelAddNote = () => {
    setNewNote('')
    setShowAddNote(false)
  }
  
  return {
    // State
    showAddNote,
    newNote,
    isSubmitting,
    
    // Actions
    setShowAddNote,
    setNewNote,
    handleAddNote,
    cancelAddNote
  }
}
```

### Documents Management Hook (`src/hooks/useDocuments.js`)
```javascript
import { useState } from 'react'
import { useCampaignStore } from '../stores/campaignStore'
import { useUIStore } from '../stores/uiStore'

export const useDocuments = (campaignId) => {
  const { uploadDocument, deleteDocument } = useCampaignStore()
  const { addNotification } = useUIStore()
  
  const [uploadProgress, setUploadProgress] = useState({})
  const [isUploading, setIsUploading] = useState(false)
  
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024 // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif'
    ]
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' }
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' }
    }
    
    return { valid: true }
  }
  
  const handleFileUpload = async (files) => {
    const fileList = Array.from(files)
    const validFiles = []
    
    // Validate all files first
    for (const file of fileList) {
      const validation = validateFile(file)
      if (!validation.valid) {
        addNotification(`${file.name}: ${validation.error}`, 'error')
        continue
      }
      validFiles.push(file)
    }
    
    if (validFiles.length === 0) return
    
    setIsUploading(true)
    
    // Upload files one by one
    for (const file of validFiles) {
      try {
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }))
        
        // Simulate upload progress (in real app, this would come from the upload)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }))
        }, 100)
        
        await uploadDocument(campaignId, file, 'Current User')
        
        clearInterval(progressInterval)
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }))
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [file.name]: removed, ...rest } = prev
            return rest
          })
        }, 2000)
        
        addNotification(`${file.name} uploaded successfully`, 'success')
      } catch (error) {
        setUploadProgress(prev => {
          const { [file.name]: removed, ...rest } = prev
          return rest
        })
        addNotification(`Failed to upload ${file.name}: ${error.message}`, 'error')
      }
    }
    
    setIsUploading(false)
  }
  
  const handleDocumentDelete = async (documentId, documentName) => {
    if (!window.confirm(`Are you sure you want to delete ${documentName}?`)) {
      return
    }
    
    try {
      await deleteDocument(campaignId, documentId)
      addNotification(`${documentName} deleted successfully`, 'success')
    } catch (error) {
      addNotification(`Failed to delete ${documentName}: ${error.message}`, 'error')
    }
  }
  
  const handleDocumentDownload = (document) => {
    try {
      const link = document.createElement('a')
      link.href = document.data
      link.download = document.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      addNotification(`${document.name} downloaded`, 'success')
    } catch (error) {
      addNotification(`Failed to download ${document.name}`, 'error')
    }
  }
  
  return {
    // State
    uploadProgress,
    isUploading,
    
    // Actions
    handleFileUpload,
    handleDocumentDelete,
    handleDocumentDownload,
    validateFile
  }
}
```

### Refactored CampaignDetail Component
```javascript
import React from 'react'
import { 
  ArrowLeft, Save, Edit2, Calendar, DollarSign, User, Clock, 
  MessageSquare, History, TrendingUp, MousePointer, Users, 
  ShoppingCart, Activity, Plus, X, Upload, FileText, Download,
  Image, File, Trash2, ExternalLink, ImageIcon
} from 'lucide-react'
import { format } from 'date-fns'

import { useCampaignDetail } from '../hooks/useCampaignDetail'
import { useNotes } from '../hooks/useNotes'
import { useDocuments } from '../hooks/useDocuments'
import { useVisualMedia } from '../hooks/useVisualMedia'
import { useResponsive } from '../hooks/useResponsive'

import ErrorBoundary from './common/ErrorBoundary'
import LoadingSpinner from './common/LoadingSpinner'
import CampaignInfo from './campaign-detail/CampaignInfo'
import PerformanceMetrics from './campaign-detail/PerformanceMetrics'
import VisualMediaSection from './campaign-detail/VisualMediaSection'
import DocumentsSection from './campaign-detail/DocumentsSection'
import NotesSection from './campaign-detail/NotesSection'
import ChangeHistory from './campaign-detail/ChangeHistory'

const CampaignDetail = ({ campaignId }) => {
  // Hooks
  const campaignDetail = useCampaignDetail(campaignId)
  const notes = useNotes(campaignId)
  const documents = useDocuments(campaignId)
  const visualMedia = useVisualMedia(campaignId)
  const responsive = useResponsive()
  
  const {
    campaign,
    editedData,
    isEditing,
    isUpdating,
    error,
    hasUnsavedChanges,
    startEditing,
    cancelEditing,
    updateField,
    updateNestedField,
    saveChanges,
    goBack,
    clearError
  } = campaignDetail
  
  // Loading state
  if (!campaign) {
    return <LoadingSpinner />
  }
  
  return (
    <ErrorBoundary>
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        padding: responsive.getContainerPadding(),
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: '#ffffff',
            padding: responsive.getPadding(),
            borderRadius: '8px',
            marginBottom: responsive.getGap(),
            border: '1px solid #e0e0e0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={goBack}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#f8f8f8',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  color: '#1a1a1a',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
              >
                <ArrowLeft size={16} />
                Back to Dashboard
              </button>
              
              {hasUnsavedChanges && (
                <span style={{
                  color: '#f59e0b',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  • Unsaved changes
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              {isEditing ? (
                <>
                  <button
                    onClick={cancelEditing}
                    disabled={isUpdating}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f8f8f8',
                      border: '1px solid #d0d0d0',
                      borderRadius: '6px',
                      color: '#1a1a1a',
                      fontSize: '14px',
                      cursor: isUpdating ? 'not-allowed' : 'pointer',
                      opacity: isUpdating ? 0.6 : 1
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveChanges}
                    disabled={isUpdating || !hasUnsavedChanges}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '8px 16px',
                      backgroundColor: hasUnsavedChanges ? '#059669' : '#f8f8f8',
                      color: hasUnsavedChanges ? '#ffffff' : '#999999',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: (isUpdating || !hasUnsavedChanges) ? 'not-allowed' : 'pointer',
                      opacity: isUpdating ? 0.6 : 1
                    }}
                  >
                    <Save size={16} />
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <button
                  onClick={startEditing}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  <Edit2 size={16} />
                  Edit Campaign
                </button>
              )}
            </div>
          </div>
          
          {/* Error Display */}
          {error && (
            <div style={{
              backgroundColor: '#fee2e2',
              border: '1px solid #fca5a5',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: responsive.getGap(),
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span style={{ color: '#dc2626' }}>{error}</span>
              <button
                onClick={clearError}
                style={{
                  padding: '4px 8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: '#dc2626',
                  cursor: 'pointer'
                }}
              >
                <X size={16} />
              </button>
            </div>
          )}
          
          {/* Campaign Information */}
          <CampaignInfo
            campaign={editedData}
            isEditing={isEditing}
            onUpdateField={updateField}
            onUpdateNestedField={updateNestedField}
            responsive={responsive}
          />
          
          {/* Performance Metrics */}
          <PerformanceMetrics
            metrics={editedData.metrics}
            responsive={responsive}
          />
          
          {/* Visual Media */}
          <VisualMediaSection
            campaignId={campaignId}
            visualMedia={visualMedia}
            responsive={responsive}
          />
          
          {/* Documents */}
          <DocumentsSection
            campaignId={campaignId}
            documents={documents}
            responsive={responsive}
          />
          
          {/* Notes */}
          <NotesSection
            campaignId={campaignId}
            notes={notes}
            campaign={editedData}
            responsive={responsive}
          />
          
          {/* Change History */}
          <ChangeHistory
            history={editedData.history}
            responsive={responsive}
          />
        </div>
      </div>
    </ErrorBoundary>
  )
}

export default CampaignDetail
```

## Testing Criteria
- [ ] Component renders without errors after refactoring
- [ ] Campaign editing works with optimistic updates
- [ ] Notes can be added and display immediately
- [ ] Document upload and deletion work correctly
- [ ] Visual media management functions properly
- [ ] Change history tracks all modifications
- [ ] Error states display appropriately
- [ ] Loading states show during operations
- [ ] Navigation back to dashboard works
- [ ] Unsaved changes are properly tracked

## Definition of Done
- CampaignDetail completely refactored to use Zustand stores
- All local state removed in favor of store consumption
- Optimistic updates implemented for better UX
- Custom hooks abstract complex logic from UI
- Component focused on presentation
- Error handling and loading states properly implemented
- All existing functionality preserved
- Code is cleaner and more maintainable

## Files to Create/Modify
- `src/hooks/useCampaignDetail.js`
- `src/hooks/useNotes.js`
- `src/hooks/useDocuments.js`
- `src/hooks/useVisualMedia.js`
- Update `src/components/CampaignDetail.jsx`
- Create helper components in `src/components/campaign-detail/`

## Dependencies
- Completed Phase 1 Task 6 (Refactor MarketingManagerV4)
- All Zustand stores implemented

## Estimated Time
6-8 hours