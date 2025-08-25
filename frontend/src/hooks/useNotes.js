import { useState } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useUIStore } from '../stores/uiStore';

export const useNotes = (campaignId) => {
  const { addNoteToCampaign, addNoteOptimistic } = useCampaignsStore();
  const { addNotification } = useUIStore();
  
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleAddNote = async () => {
    if (!newNote.trim()) {
      addNotification('Please enter a note', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const noteData = {
        text: newNote.trim(),
        user: 'Current User', // TODO: Get from auth context
        timestamp: new Date().toISOString()
      };
      
      // Use optimistic update method if available, otherwise fallback to regular method
      await (addNoteOptimistic || addNoteToCampaign)(campaignId, noteData);
      
      setNewNote('');
      setShowAddNote(false);
    } catch (error) {
      // Error handling is now done in the optimistic update wrapper
      console.error('Failed to add note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelAddNote = () => {
    setNewNote('');
    setShowAddNote(false);
  };
  
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
  };
};