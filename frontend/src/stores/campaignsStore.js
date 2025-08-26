import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import apiClient from '../api/client';
import { useAPIErrorHandler } from '../api/errorHandler';
import { createAsyncAction, createOptimisticAction, logStoreState } from './index';
import { optimisticListOperations, optimisticStateHelpers, withOptimisticUpdate } from '../utils/optimisticUpdates';

// Initial state
const initialState = {
  // Data
  campaigns: [],
  selectedCampaign: null,
  totalCampaigns: 0,
  
  // Loading states
  isLoading: false,
  isUpdating: false,
  isSaving: false,
  
  // Error states
  error: null,
  
  // Pagination
  currentPage: 1,
  totalPages: 0,
  hasNextPage: false,
  hasPreviousPage: false,
  
  // Optimistic updates tracking
  optimisticUpdates: new Map()
};

// Create campaigns store
export const useCampaignsStore = create(
  devtools(
    (set, get) => ({
      ...initialState,
      
      // Computed getters
      getCampaignById: (id) => {
        const { campaigns } = get();
        return campaigns.find(campaign => campaign.id === id);
      },
      
      getCampaignsByVendor: (vendor) => {
        const { campaigns } = get();
        return campaigns.filter(campaign => campaign.vendor === vendor);
      },
      
      getActiveCampaigns: () => {
        const { campaigns } = get();
        return campaigns.filter(campaign => campaign.status === 'Live');
      },
      
      // Actions
      
      // Fetch campaigns with filters  
      fetchCampaigns: async (filters = {}) => {
        set({ isLoading: true }, false, 'FETCH_CAMPAIGNS_START');
        
        try {
          const response = await apiClient.getCampaigns(filters);
          
          console.log('📦 Raw API response:', response);
          
          if (response.success) {
            console.log('✅ Setting campaigns in store:', {
              campaignCount: response.data?.length || 0,
              totalCampaigns: response.meta?.total || 0,
              firstCampaign: response.data?.[0]?.name || 'None'
            });
            
            set({
              campaigns: response.data || [],
              totalCampaigns: response.meta?.total || 0,
              currentPage: response.meta?.page || 1,
              totalPages: response.meta?.pages || 1,
              hasNextPage: response.meta?.hasNext || false,
              hasPreviousPage: response.meta?.hasPrev || false,
              isLoading: false,
              error: null
            }, false, 'FETCH_CAMPAIGNS_SUCCESS');
            
            return response.data;
          } else {
            throw response.error;
          }
        } catch (error) {
          console.error('❌ fetchCampaigns error:', error);
          set({ 
            campaigns: [],
            isLoading: false,
            error: {
              message: error.message || 'Failed to fetch campaigns',
              code: error.code || 'FETCH_ERROR',
              timestamp: new Date().toISOString()
            }
          }, false, 'FETCH_CAMPAIGNS_ERROR');
          throw error;
        }
      },
      
      // Fetch single campaign
      fetchCampaignById: createAsyncAction('FETCH_CAMPAIGN', async (id, { set, get }) => {
        try {
          const response = await apiClient.getCampaignById(id);
          
          if (response.success) {
            set({
              selectedCampaign: response.data,
              error: null
            }, false, 'FETCH_CAMPAIGN_SUCCESS');
            
            // Also update the campaign in the campaigns array if it exists
            const { campaigns } = get();
            const campaignIndex = campaigns.findIndex(c => c.id === id);
            if (campaignIndex !== -1) {
              const updatedCampaigns = [...campaigns];
              updatedCampaigns[campaignIndex] = response.data;
              set({ campaigns: updatedCampaigns }, false, 'UPDATE_CAMPAIGN_IN_LIST');
            }
            
            return response.data;
          } else {
            throw response.error;
          }
        } catch (error) {
          set({
            selectedCampaign: null,
            error: {
              message: error.message || 'Failed to fetch campaign',
              code: error.code || 'FETCH_ERROR',
              timestamp: new Date().toISOString()
            }
          }, false, 'FETCH_CAMPAIGN_ERROR');
          throw error;
        }
      }),
      
      // Create new campaign
      createCampaign: createAsyncAction('CREATE_CAMPAIGN', async (campaignData, { set, get }) => {
        set({ isSaving: true }, false, 'CREATE_CAMPAIGN_START');
        
        try {
          const response = await apiClient.createCampaign(campaignData);
          
          if (response.success) {
            const { campaigns } = get();
            const updatedCampaigns = [response.data, ...campaigns];
            
            set({
              campaigns: updatedCampaigns,
              selectedCampaign: response.data,
              totalCampaigns: get().totalCampaigns + 1,
              isSaving: false,
              error: null
            }, false, 'CREATE_CAMPAIGN_SUCCESS');
            
            return response.data;
          } else {
            throw response.error;
          }
        } catch (error) {
          set({
            isSaving: false,
            error: {
              message: error.message || 'Failed to create campaign',
              code: error.code || 'CREATE_ERROR',
              timestamp: new Date().toISOString()
            }
          }, false, 'CREATE_CAMPAIGN_ERROR');
          throw error;
        }
      }),
      
      // Update existing campaign with optimistic updates
      updateCampaign: (id, updates) => {
        const { campaigns, optimisticUpdates } = get();
        const campaignIndex = campaigns.findIndex(c => c.id === id);
        
        if (campaignIndex === -1) {
          throw new Error(`Campaign with id ${id} not found`);
        }
        
        // Store original for potential rollback
        const originalCampaign = campaigns[campaignIndex];
        optimisticUpdates.set(id, originalCampaign);
        
        // Apply optimistic update immediately
        const updatedCampaigns = [...campaigns];
        updatedCampaigns[campaignIndex] = {
          ...originalCampaign,
          ...updates,
          modifiedAt: new Date().toISOString()
        };
        
        set({
          campaigns: updatedCampaigns,
          optimisticUpdates: new Map(optimisticUpdates),
          isUpdating: true
        }, false, 'UPDATE_CAMPAIGN_OPTIMISTIC');
        
        // Update selected campaign if it's the one being updated
        const { selectedCampaign } = get();
        if (selectedCampaign && selectedCampaign.id === id) {
          set({
            selectedCampaign: updatedCampaigns[campaignIndex]
          }, false, 'UPDATE_SELECTED_CAMPAIGN');
        }
        
        // Perform actual API call
        apiClient.updateCampaign(id, updates)
          .then((response) => {
            if (response.success) {
              // Confirm the update with server data
              const { campaigns, optimisticUpdates } = get();
              const campaignIndex = campaigns.findIndex(c => c.id === id);
              
              if (campaignIndex !== -1) {
                const confirmedCampaigns = [...campaigns];
                confirmedCampaigns[campaignIndex] = response.data;
                
                // Remove from optimistic updates
                optimisticUpdates.delete(id);
                
                set({
                  campaigns: confirmedCampaigns,
                  optimisticUpdates: new Map(optimisticUpdates),
                  isUpdating: false,
                  error: null
                }, false, 'UPDATE_CAMPAIGN_SUCCESS');
                
                // Update selected campaign if needed
                const { selectedCampaign } = get();
                if (selectedCampaign && selectedCampaign.id === id) {
                  set({
                    selectedCampaign: response.data
                  }, false, 'UPDATE_SELECTED_CAMPAIGN_CONFIRMED');
                }
              }
            } else {
              throw response.error;
            }
          })
          .catch((error) => {
            // Revert optimistic update
            const { campaigns, optimisticUpdates } = get();
            const originalCampaign = optimisticUpdates.get(id);
            
            if (originalCampaign) {
              const campaignIndex = campaigns.findIndex(c => c.id === id);
              if (campaignIndex !== -1) {
                const revertedCampaigns = [...campaigns];
                revertedCampaigns[campaignIndex] = originalCampaign;
                
                optimisticUpdates.delete(id);
                
                set({
                  campaigns: revertedCampaigns,
                  optimisticUpdates: new Map(optimisticUpdates),
                  isUpdating: false,
                  error: {
                    message: error.message || 'Failed to update campaign',
                    code: error.code || 'UPDATE_ERROR',
                    timestamp: new Date().toISOString()
                  }
                }, false, 'UPDATE_CAMPAIGN_REVERT');
                
                // Revert selected campaign if needed
                const { selectedCampaign } = get();
                if (selectedCampaign && selectedCampaign.id === id) {
                  set({
                    selectedCampaign: originalCampaign
                  }, false, 'REVERT_SELECTED_CAMPAIGN');
                }
              }
            }
          });
      },
      
      // Delete campaign
      deleteCampaign: createAsyncAction('DELETE_CAMPAIGN', async (id, { set, get }) => {
        try {
          const response = await apiClient.deleteCampaign(id);
          
          if (response.success) {
            const { campaigns, selectedCampaign } = get();
            const updatedCampaigns = campaigns.filter(c => c.id !== id);
            
            set({
              campaigns: updatedCampaigns,
              totalCampaigns: get().totalCampaigns - 1,
              selectedCampaign: selectedCampaign?.id === id ? null : selectedCampaign,
              error: null
            }, false, 'DELETE_CAMPAIGN_SUCCESS');
            
            return true;
          } else {
            throw response.error;
          }
        } catch (error) {
          set({
            error: {
              message: error.message || 'Failed to delete campaign',
              code: error.code || 'DELETE_ERROR',
              timestamp: new Date().toISOString()
            }
          }, false, 'DELETE_CAMPAIGN_ERROR');
          throw error;
        }
      }),
      
      // Add note to campaign
      addNoteToCampaign: createAsyncAction('ADD_NOTE', async ({ id, noteData }, { set, get }) => {
        try {
          const response = await apiClient.addNoteToCampaign(id, noteData);
          
          if (response.success) {
            // Update the campaign in the campaigns array
            const { campaigns } = get();
            const campaignIndex = campaigns.findIndex(c => c.id === id);
            
            if (campaignIndex !== -1) {
              const updatedCampaigns = [...campaigns];
              const campaign = { ...updatedCampaigns[campaignIndex] };
              campaign.notes = campaign.notes || [];
              campaign.notes.unshift(response.data.note);
              campaign.history = campaign.history || [];
              campaign.history.unshift(response.data.historyEntry);
              campaign.modifiedAt = new Date().toISOString();
              
              updatedCampaigns[campaignIndex] = campaign;
              
              set({
                campaigns: updatedCampaigns,
                error: null
              }, false, 'ADD_NOTE_SUCCESS');
              
              // Update selected campaign if it's the one being updated
              const { selectedCampaign } = get();
              if (selectedCampaign && selectedCampaign.id === id) {
                set({
                  selectedCampaign: campaign
                }, false, 'UPDATE_SELECTED_CAMPAIGN_NOTE');
              }
            }
            
            return response.data;
          } else {
            throw response.error;
          }
        } catch (error) {
          set({
            error: {
              message: error.message || 'Failed to add note',
              code: error.code || 'ADD_NOTE_ERROR',
              timestamp: new Date().toISOString()
            }
          }, false, 'ADD_NOTE_ERROR');
          throw error;
        }
      }),
      
      // Enhanced optimistic update methods
      
      // Enhanced optimistic campaign update
      updateCampaignOptimistic: withOptimisticUpdate(
        async (id, updates) => {
          const response = await apiClient.updateCampaign(id, updates);
          if (!response.success) throw response.error;
          return response.data;
        },
        {
          optimisticUpdate: (id, updates) => {
            const { campaigns, selectedCampaign } = get();
            
            // Create optimistic update
            const optimisticCampaigns = optimisticListOperations.update(campaigns, id, {
              ...updates,
              modifiedAt: new Date().toISOString()
            });
            
            const optimisticSelected = selectedCampaign?.id === id 
              ? { ...selectedCampaign, ...updates, _optimistic: true }
              : selectedCampaign;
            
            set({
              campaigns: optimisticCampaigns,
              selectedCampaign: optimisticSelected
            }, false, 'UPDATE_CAMPAIGN_OPTIMISTIC');
          },
          rollback: () => {
            const { campaigns, selectedCampaign } = get();
            return { campaigns, selectedCampaign };
          },
          onSuccess: (result, id) => {
            const { campaigns, selectedCampaign } = get();
            
            // Confirm optimistic update with real data
            const confirmedCampaigns = optimisticListOperations.confirm(campaigns, id, result);
            const confirmedSelected = selectedCampaign?.id === id ? result : selectedCampaign;
            
            set({
              campaigns: confirmedCampaigns,
              selectedCampaign: confirmedSelected
            }, false, 'UPDATE_CAMPAIGN_CONFIRMED');
          },
          successMessage: 'Campaign updated successfully',
          errorMessage: 'Failed to update campaign'
        }
      ),
      
      // Enhanced optimistic note addition
      addNoteOptimistic: withOptimisticUpdate(
        async (campaignId, noteData) => {
          const response = await apiClient.addNoteToCampaign(campaignId, noteData);
          if (!response.success) throw response.error;
          return response.data;
        },
        {
          optimisticUpdate: (campaignId, noteData) => {
            const { campaigns, selectedCampaign } = get();
            
            // Create optimistic note and history entry
            const optimisticNote = optimisticStateHelpers.createOptimisticItem({
              text: noteData.text,
              user: noteData.user,
              timestamp: new Date().toISOString()
            }, 'note');
            
            const optimisticHistory = optimisticStateHelpers.createOptimisticHistoryEntry(
              'Added a note',
              noteData.user
            );
            
            // Update campaigns array
            const optimisticCampaigns = campaigns.map(campaign => 
              campaign.id === campaignId
                ? {
                    ...campaign,
                    notes: [optimisticNote, ...(campaign.notes || [])],
                    changeHistory: [optimisticHistory, ...(campaign.changeHistory || [])],
                    modifiedAt: new Date().toISOString(),
                    _optimistic: true
                  }
                : campaign
            );
            
            // Update selected campaign if needed
            const optimisticSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  notes: [optimisticNote, ...(selectedCampaign.notes || [])],
                  changeHistory: [optimisticHistory, ...(selectedCampaign.changeHistory || [])],
                  modifiedAt: new Date().toISOString(),
                  _optimistic: true
                }
              : selectedCampaign;
            
            set({
              campaigns: optimisticCampaigns,
              selectedCampaign: optimisticSelected
            }, false, 'ADD_NOTE_OPTIMISTIC');
          },
          rollback: () => {
            const { campaigns, selectedCampaign } = get();
            return { campaigns, selectedCampaign };
          },
          onSuccess: (result, campaignId) => {
            const { campaigns, selectedCampaign } = get();
            
            // Replace optimistic items with confirmed data
            const confirmedCampaigns = campaigns.map(campaign =>
              campaign.id === campaignId
                ? {
                    ...campaign,
                    notes: campaign.notes?.map(note => 
                      note._optimistic && note._optimisticType === 'note'
                        ? result.note
                        : note
                    ) || [],
                    changeHistory: campaign.changeHistory?.map(entry =>
                      entry._optimistic && entry.action === 'Added a note'
                        ? result.historyEntry
                        : entry
                    ) || [],
                    _optimistic: false
                  }
                : campaign
            );
            
            const confirmedSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  notes: selectedCampaign.notes?.map(note => 
                    note._optimistic && note._optimisticType === 'note'
                      ? result.note
                      : note
                  ) || [],
                  changeHistory: selectedCampaign.changeHistory?.map(entry =>
                    entry._optimistic && entry.action === 'Added a note'
                      ? result.historyEntry
                      : entry
                  ) || [],
                  _optimistic: false
                }
              : selectedCampaign;
            
            set({
              campaigns: confirmedCampaigns,
              selectedCampaign: confirmedSelected
            }, false, 'ADD_NOTE_CONFIRMED');
          },
          successMessage: 'Note added successfully',
          errorMessage: 'Failed to add note'
        }
      ),
      
      // Enhanced optimistic document upload
      uploadDocumentOptimistic: withOptimisticUpdate(
        async (campaignId, documentData) => {
          const response = await apiClient.uploadDocumentToCampaign(campaignId, documentData);
          if (!response.success) throw response.error;
          return response.data;
        },
        {
          optimisticUpdate: (campaignId, documentData) => {
            const { campaigns, selectedCampaign } = get();
            
            // Create optimistic document and history entry
            const optimisticDoc = optimisticStateHelpers.createOptimisticItem({
              name: documentData.name,
              type: documentData.type,
              size: documentData.size,
              data: documentData.data,
              uploadedBy: documentData.uploadedBy,
              uploadedDate: new Date().toISOString(),
              _uploading: true
            }, 'document');
            
            const optimisticHistory = optimisticStateHelpers.createOptimisticHistoryEntry(
              `Uploaded document: ${documentData.name}`,
              documentData.uploadedBy
            );
            
            // Update campaigns array
            const optimisticCampaigns = campaigns.map(campaign => 
              campaign.id === campaignId
                ? {
                    ...campaign,
                    documents: [...(campaign.documents || []), optimisticDoc],
                    changeHistory: [optimisticHistory, ...(campaign.changeHistory || [])],
                    modifiedAt: new Date().toISOString(),
                    _optimistic: true
                  }
                : campaign
            );
            
            // Update selected campaign if needed
            const optimisticSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  documents: [...(selectedCampaign.documents || []), optimisticDoc],
                  changeHistory: [optimisticHistory, ...(selectedCampaign.changeHistory || [])],
                  modifiedAt: new Date().toISOString(),
                  _optimistic: true
                }
              : selectedCampaign;
            
            set({
              campaigns: optimisticCampaigns,
              selectedCampaign: optimisticSelected
            }, false, 'UPLOAD_DOCUMENT_OPTIMISTIC');
          },
          rollback: () => {
            const { campaigns, selectedCampaign } = get();
            return { campaigns, selectedCampaign };
          },
          onSuccess: (result, campaignId) => {
            const { campaigns, selectedCampaign } = get();
            
            // Replace optimistic items with confirmed data
            const confirmedCampaigns = campaigns.map(campaign =>
              campaign.id === campaignId
                ? {
                    ...campaign,
                    documents: campaign.documents?.map(doc => 
                      doc._optimistic && doc._optimisticType === 'document' && doc._uploading
                        ? { ...result.document, _optimistic: false, _uploading: false }
                        : doc
                    ) || [],
                    changeHistory: campaign.changeHistory?.map(entry =>
                      entry._optimistic && entry.action.startsWith('Uploaded document:')
                        ? result.historyEntry
                        : entry
                    ) || [],
                    _optimistic: false
                  }
                : campaign
            );
            
            const confirmedSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  documents: selectedCampaign.documents?.map(doc => 
                    doc._optimistic && doc._optimisticType === 'document' && doc._uploading
                      ? { ...result.document, _optimistic: false, _uploading: false }
                      : doc
                  ) || [],
                  changeHistory: selectedCampaign.changeHistory?.map(entry =>
                    entry._optimistic && entry.action.startsWith('Uploaded document:')
                      ? result.historyEntry
                      : entry
                  ) || [],
                  _optimistic: false
                }
              : selectedCampaign;
            
            set({
              campaigns: confirmedCampaigns,
              selectedCampaign: confirmedSelected
            }, false, 'UPLOAD_DOCUMENT_CONFIRMED');
          },
          successMessage: 'Document uploaded successfully',
          errorMessage: 'Failed to upload document'
        }
      ),
      
      // Enhanced optimistic visual media addition
      addVisualMediaOptimistic: withOptimisticUpdate(
        async (campaignId, mediaData) => {
          const response = await apiClient.addVisualMediaToCampaign(campaignId, mediaData);
          if (!response.success) throw response.error;
          return response.data;
        },
        {
          optimisticUpdate: (campaignId, mediaData) => {
            const { campaigns, selectedCampaign } = get();
            
            // Create optimistic media and history entry
            const optimisticMedia = optimisticStateHelpers.createOptimisticItem({
              url: mediaData.url,
              description: mediaData.description,
              addedBy: mediaData.addedBy,
              addedDate: new Date().toISOString()
            }, 'media');
            
            const optimisticHistory = optimisticStateHelpers.createOptimisticHistoryEntry(
              `Added visual media: ${mediaData.description}`,
              mediaData.addedBy
            );
            
            // Update campaigns array
            const optimisticCampaigns = campaigns.map(campaign => 
              campaign.id === campaignId
                ? {
                    ...campaign,
                    visualMedia: [...(campaign.visualMedia || []), optimisticMedia],
                    changeHistory: [optimisticHistory, ...(campaign.changeHistory || [])],
                    modifiedAt: new Date().toISOString(),
                    _optimistic: true
                  }
                : campaign
            );
            
            // Update selected campaign if needed
            const optimisticSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  visualMedia: [...(selectedCampaign.visualMedia || []), optimisticMedia],
                  changeHistory: [optimisticHistory, ...(selectedCampaign.changeHistory || [])],
                  modifiedAt: new Date().toISOString(),
                  _optimistic: true
                }
              : selectedCampaign;
            
            set({
              campaigns: optimisticCampaigns,
              selectedCampaign: optimisticSelected
            }, false, 'ADD_VISUAL_MEDIA_OPTIMISTIC');
          },
          rollback: () => {
            const { campaigns, selectedCampaign } = get();
            return { campaigns, selectedCampaign };
          },
          onSuccess: (result, campaignId) => {
            const { campaigns, selectedCampaign } = get();
            
            // Replace optimistic items with confirmed data
            const confirmedCampaigns = campaigns.map(campaign =>
              campaign.id === campaignId
                ? {
                    ...campaign,
                    visualMedia: campaign.visualMedia?.map(media => 
                      media._optimistic && media._optimisticType === 'media'
                        ? result.media
                        : media
                    ) || [],
                    changeHistory: campaign.changeHistory?.map(entry =>
                      entry._optimistic && entry.action.startsWith('Added visual media:')
                        ? result.historyEntry
                        : entry
                    ) || [],
                    _optimistic: false
                  }
                : campaign
            );
            
            const confirmedSelected = selectedCampaign?.id === campaignId
              ? {
                  ...selectedCampaign,
                  visualMedia: selectedCampaign.visualMedia?.map(media => 
                    media._optimistic && media._optimisticType === 'media'
                      ? result.media
                      : media
                  ) || [],
                  changeHistory: selectedCampaign.changeHistory?.map(entry =>
                    entry._optimistic && entry.action.startsWith('Added visual media:')
                      ? result.historyEntry
                      : entry
                  ) || [],
                  _optimistic: false
                }
              : selectedCampaign;
            
            set({
              campaigns: confirmedCampaigns,
              selectedCampaign: confirmedSelected
            }, false, 'ADD_VISUAL_MEDIA_CONFIRMED');
          },
          successMessage: 'Visual media added successfully',
          errorMessage: 'Failed to add visual media'
        }
      ),
      
      // Helper to check if item is optimistic
      isOptimisticItem: (item) => optimisticStateHelpers.isOptimistic(item),
      
      // Helper to get optimistic items
      getOptimisticItems: (list) => optimisticStateHelpers.getOptimisticItems(list),
      
      // Clear all optimistic states (useful for debugging)
      clearOptimisticStates: () => {
        const { campaigns, selectedCampaign } = get();
        
        set({
          campaigns: optimisticListOperations.cleanOptimistic(campaigns.map(campaign => ({
            ...campaign,
            notes: optimisticListOperations.cleanOptimistic(campaign.notes || []),
            documents: optimisticListOperations.cleanOptimistic(campaign.documents || []),
            visualMedia: optimisticListOperations.cleanOptimistic(campaign.visualMedia || []),
            changeHistory: optimisticListOperations.cleanOptimistic(campaign.changeHistory || [])
          }))),
          selectedCampaign: selectedCampaign ? {
            ...selectedCampaign,
            notes: optimisticListOperations.cleanOptimistic(selectedCampaign.notes || []),
            documents: optimisticListOperations.cleanOptimistic(selectedCampaign.documents || []),
            visualMedia: optimisticListOperations.cleanOptimistic(selectedCampaign.visualMedia || []),
            changeHistory: optimisticListOperations.cleanOptimistic(selectedCampaign.changeHistory || []),
            _optimistic: false
          } : null
        }, false, 'CLEAR_OPTIMISTIC_STATES');
      },
      
      // UI Actions
      selectCampaign: (campaign) => {
        set({ selectedCampaign: campaign }, false, 'SELECT_CAMPAIGN');
      },
      
      clearSelectedCampaign: () => {
        set({ selectedCampaign: null }, false, 'CLEAR_SELECTED_CAMPAIGN');
      },
      
      clearError: () => {
        set({ error: null }, false, 'CLEAR_ERROR');
      },
      
      // Reset store
      reset: () => {
        set(initialState, false, 'RESET_CAMPAIGNS_STORE');
      },
      
      // Development helpers
      _debugState: () => {
        const state = get();
        logStoreState('Campaigns', state);
        return state;
      }
    }),
    { 
      name: 'campaigns-store',
      // Enable action tracking in devtools
      serialize: true 
    }
  )
);

export default useCampaignsStore;