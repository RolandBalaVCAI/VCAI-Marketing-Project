import { useState } from 'react';
import { useCampaignsStore } from '../stores/campaignsStore';
import { useUIStore } from '../stores/uiStore';

export const useDocuments = (campaignId) => {
  const { uploadDocumentToCampaign, uploadDocumentOptimistic } = useCampaignsStore();
  const { addNotification } = useUIStore();
  
  const [uploadProgress, setUploadProgress] = useState({});
  const [isUploading, setIsUploading] = useState(false);
  
  const validateFile = (file) => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/png',
      'image/jpeg',
      'image/gif',
      'text/plain',
      'text/csv'
    ];
    
    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }
    
    return { valid: true };
  };
  
  const handleFileUpload = async (files) => {
    const fileList = Array.from(files);
    const validFiles = [];
    
    // Validate all files first
    for (const file of fileList) {
      const validation = validateFile(file);
      if (!validation.valid) {
        addNotification(`${file.name}: ${validation.error}`, 'error');
        continue;
      }
      validFiles.push(file);
    }
    
    if (validFiles.length === 0) return;
    
    setIsUploading(true);
    
    // Upload files one by one
    for (const file of validFiles) {
      try {
        // Update progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));
        
        // Simulate upload progress (in real app, this would come from the upload)
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.min((prev[file.name] || 0) + 10, 90)
          }));
        }, 100);
        
        // Convert file to base64 for storage
        const fileData = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        
        const documentData = {
          name: file.name,
          type: file.type,
          size: file.size,
          data: fileData,
          uploadedBy: 'Current User', // TODO: Get from auth context
          uploadedDate: new Date().toISOString()
        };
        
        // Use optimistic update method if available
        await (uploadDocumentOptimistic || uploadDocumentToCampaign)(campaignId, documentData);
        
        clearInterval(progressInterval);
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
        
        // Remove progress after a delay
        setTimeout(() => {
          setUploadProgress(prev => {
            const { [file.name]: removed, ...rest } = prev;
            return rest;
          });
        }, 2000);
        
        addNotification(`${file.name} uploaded successfully`, 'success');
      } catch (error) {
        setUploadProgress(prev => {
          const { [file.name]: removed, ...rest } = prev;
          return rest;
        });
        addNotification(`Failed to upload ${file.name}: ${error.message}`, 'error');
      }
    }
    
    setIsUploading(false);
  };
  
  const handleDocumentDelete = async (documentId, documentName) => {
    if (!window.confirm(`Are you sure you want to delete ${documentName}?`)) {
      return;
    }
    
    try {
      // For now, we'll need to implement this through campaign update
      // In a real app, this would be a separate endpoint
      addNotification(`Document deletion not yet implemented`, 'warning');
    } catch (error) {
      addNotification(`Failed to delete ${documentName}: ${error.message}`, 'error');
    }
  };
  
  const handleDocumentDownload = (document) => {
    try {
      const link = document.createElement('a');
      link.href = document.data;
      link.download = document.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addNotification(`${document.name} downloaded`, 'success');
    } catch (error) {
      addNotification(`Failed to download ${document.name}`, 'error');
    }
  };
  
  return {
    // State
    uploadProgress,
    isUploading,
    
    // Actions
    handleFileUpload,
    handleDocumentDelete,
    handleDocumentDownload,
    validateFile
  };
};