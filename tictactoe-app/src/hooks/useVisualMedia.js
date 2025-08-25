import { useState } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useUIStore } from '../stores/uiStore';

export const useVisualMedia = (campaignId) => {
  const { addVisualMediaToCampaign, addVisualMediaOptimistic } = useCampaignsStore();
  const { addNotification } = useUIStore();
  
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const validateImageUrl = (url) => {
    if (!url.trim()) {
      return { valid: false, error: 'Please enter an image URL' };
    }
    
    try {
      new URL(url);
    } catch {
      return { valid: false, error: 'Please enter a valid URL' };
    }
    
    // Check if URL looks like an image
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const hasImageExtension = imageExtensions.some(ext => 
      url.toLowerCase().includes(ext)
    );
    
    // Also allow common image hosting domains
    const imageHosts = ['imgur.com', 'via.placeholder.com', 'picsum.photos', 'unsplash.com'];
    const isImageHost = imageHosts.some(host => 
      url.toLowerCase().includes(host)
    );
    
    if (!hasImageExtension && !isImageHost) {
      return { valid: false, error: 'URL does not appear to be an image' };
    }
    
    return { valid: true };
  };
  
  const handleAddMedia = async () => {
    const validation = validateImageUrl(newMediaUrl);
    if (!validation.valid) {
      addNotification(validation.error, 'warning');
      return;
    }
    
    if (!newMediaDescription.trim()) {
      addNotification('Please enter a description', 'warning');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const mediaData = {
        url: newMediaUrl.trim(),
        description: newMediaDescription.trim(),
        addedBy: 'Current User', // TODO: Get from auth context
        addedDate: new Date().toISOString()
      };
      
      // Use optimistic update method if available
      await (addVisualMediaOptimistic || addVisualMediaToCampaign)(campaignId, mediaData);
      
      setNewMediaUrl('');
      setNewMediaDescription('');
      setShowAddMedia(false);
    } catch (error) {
      // Error handling is now done in the optimistic update wrapper
      console.error('Failed to add visual media:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const cancelAddMedia = () => {
    setNewMediaUrl('');
    setNewMediaDescription('');
    setShowAddMedia(false);
  };
  
  const handleMediaDelete = async (mediaId, mediaDescription) => {
    if (!window.confirm(`Are you sure you want to delete "${mediaDescription}"?`)) {
      return;
    }
    
    try {
      // For now, we'll need to implement this through campaign update
      // In a real app, this would be a separate endpoint
      addNotification(`Media deletion not yet implemented`, 'warning');
    } catch (error) {
      addNotification(`Failed to delete media: ${error.message}`, 'error');
    }
  };
  
  return {
    // State
    showAddMedia,
    newMediaUrl,
    newMediaDescription,
    isSubmitting,
    
    // Actions
    setShowAddMedia,
    setNewMediaUrl,
    setNewMediaDescription,
    handleAddMedia,
    cancelAddMedia,
    handleMediaDelete,
    validateImageUrl
  };
};