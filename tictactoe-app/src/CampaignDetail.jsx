import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Save, Edit2, Calendar, DollarSign, User, Clock, 
  MessageSquare, History, TrendingUp, MousePointer, Users, 
  ShoppingCart, Activity, Plus, X, Upload, FileText, Download,
  Image, File, Trash2, ExternalLink, ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';

const CampaignDetail = ({ campaign, onBack, onSave, currentUser = 'Current User' }) => {
  // State for editable fields
  const [isEditing, setIsEditing] = useState(false);
  const [editedCampaign, setEditedCampaign] = useState(campaign);
  const [newNote, setNewNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [visualMedia, setVisualMedia] = useState([]);
  const [showAddMedia, setShowAddMedia] = useState(false);
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaDescription, setNewMediaDescription] = useState('');

  // Initialize with proper structure if missing fields
  useEffect(() => {
    setEditedCampaign({
      ...campaign,
      manager: campaign.manager || 'Unassigned',
      adPlacementDomain: campaign.adPlacementDomain || '',
      device: campaign.device || 'Both',
      targeting: campaign.targeting || 'Global',
      repContactInfo: campaign.repContactInfo || '',
      notes: campaign.notes || [],
      documents: campaign.documents || [],
      visualMedia: campaign.visualMedia || [],
      history: campaign.history || [],
      createdAt: campaign.createdAt || new Date().toISOString(),
      modifiedAt: campaign.modifiedAt || new Date().toISOString()
    });
    setDocuments(campaign.documents || []);
    setVisualMedia(campaign.visualMedia || []);
  }, [campaign]);

  // Responsive helpers (consistent with MarketingManagerV4)
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getResponsivePadding = () => windowWidth >= 768 ? '24px' : '16px';
  const getResponsiveGap = () => windowWidth >= 768 ? '24px' : '16px';
  const getResponsiveGridColumns = () => windowWidth >= 768 ? 'repeat(2, 1fr)' : '1fr';
  const getResponsiveFontSize = (mobile, desktop = null) => windowWidth >= 768 ? (desktop || mobile) : mobile;

  // Handlers
  const handleSave = () => {
    const changes = [];
    
    // Track changes for history
    if (editedCampaign.name !== campaign.name) {
      changes.push(`Changed campaign name from "${campaign.name}" to "${editedCampaign.name}"`);
    }
    if (editedCampaign.status !== campaign.status) {
      changes.push(`Changed status from "${campaign.status}" to "${editedCampaign.status}"`);
    }
    if (editedCampaign.metrics.cost !== campaign.metrics.cost) {
      changes.push(`Updated cost from $${campaign.metrics.cost.toFixed(2)} to $${editedCampaign.metrics.cost.toFixed(2)}`);
    }
    if (editedCampaign.startDate !== campaign.startDate) {
      changes.push(`Changed start date from ${campaign.startDate} to ${editedCampaign.startDate}`);
    }
    if (editedCampaign.endDate !== campaign.endDate) {
      changes.push(`Changed end date from ${campaign.endDate} to ${editedCampaign.endDate}`);
    }
    if (editedCampaign.manager !== campaign.manager) {
      changes.push(`Changed manager from "${campaign.manager}" to "${editedCampaign.manager}"`);
    }
    if (editedCampaign.adPlacementDomain !== campaign.adPlacementDomain) {
      changes.push(`Changed ad placement domain from "${campaign.adPlacementDomain}" to "${editedCampaign.adPlacementDomain}"`);
    }
    if (editedCampaign.device !== campaign.device) {
      changes.push(`Changed device targeting from "${campaign.device}" to "${editedCampaign.device}"`);
    }
    if (editedCampaign.targeting !== campaign.targeting) {
      changes.push(`Changed geographic targeting from "${campaign.targeting}" to "${editedCampaign.targeting}"`);
    }
    if (editedCampaign.repContactInfo !== campaign.repContactInfo) {
      changes.push(`Updated rep contact information`);
    }

    // Add history entries
    const updatedHistory = [...(editedCampaign.history || [])];
    changes.forEach(change => {
      updatedHistory.push({
        id: Date.now() + Math.random(),
        action: change,
        user: currentUser,
        timestamp: new Date().toISOString()
      });
    });

    const updatedCampaign = {
      ...editedCampaign,
      history: updatedHistory,
      modifiedAt: new Date().toISOString()
    };

    onSave(updatedCampaign);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      const updatedNotes = [...(editedCampaign.notes || []), {
        id: Date.now(),
        text: newNote,
        user: currentUser,
        timestamp: new Date().toISOString()
      }];

      const updatedHistory = [...(editedCampaign.history || []), {
        id: Date.now() + Math.random(),
        action: 'Added a note',
        user: currentUser,
        timestamp: new Date().toISOString()
      }];

      const updatedCampaign = {
        ...editedCampaign,
        notes: updatedNotes,
        history: updatedHistory,
        modifiedAt: new Date().toISOString()
      };

      setEditedCampaign(updatedCampaign);
      onSave(updatedCampaign);
      setNewNote('');
      setShowAddNote(false);
    }
  };

  // Document handlers
  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      const isImage = file.type.startsWith('image/');
      
      reader.onload = (e) => {
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date().toISOString(),
          uploadedBy: currentUser,
          data: e.target.result,
          isImage: isImage
        };
        
        const updatedDocs = [...documents, newDoc];
        setDocuments(updatedDocs);
        
        // Add to history
        const updatedHistory = [...(editedCampaign.history || []), {
          id: Date.now() + Math.random(),
          action: `Uploaded document: ${file.name}`,
          user: currentUser,
          timestamp: new Date().toISOString()
        }];
        
        const updatedCampaign = {
          ...editedCampaign,
          documents: updatedDocs,
          history: updatedHistory,
          modifiedAt: new Date().toISOString()
        };
        
        setEditedCampaign(updatedCampaign);
        onSave(updatedCampaign);
      };
      
      reader.readAsDataURL(file);
    });
  };

  const handleDocumentDelete = (docId) => {
    const docToDelete = documents.find(doc => doc.id === docId);
    const updatedDocs = documents.filter(doc => doc.id !== docId);
    setDocuments(updatedDocs);
    
    // Add to history
    const updatedHistory = [...(editedCampaign.history || []), {
      id: Date.now() + Math.random(),
      action: `Deleted document: ${docToDelete.name}`,
      user: currentUser,
      timestamp: new Date().toISOString()
    }];
    
    const updatedCampaign = {
      ...editedCampaign,
      documents: updatedDocs,
      history: updatedHistory,
      modifiedAt: new Date().toISOString()
    };
    
    setEditedCampaign(updatedCampaign);
    onSave(updatedCampaign);
  };

  const handleDocumentDownload = (doc) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Visual Media handlers
  const handleAddMedia = () => {
    if (newMediaUrl.trim()) {
      const newMedia = {
        id: Date.now() + Math.random(),
        url: newMediaUrl,
        description: newMediaDescription || 'Ad Creative',
        addedDate: new Date().toISOString(),
        addedBy: currentUser
      };
      
      const updatedMedia = [...visualMedia, newMedia];
      setVisualMedia(updatedMedia);
      
      // Add to history
      const updatedHistory = [...(editedCampaign.history || []), {
        id: Date.now() + Math.random(),
        action: `Added visual media: ${newMedia.description}`,
        user: currentUser,
        timestamp: new Date().toISOString()
      }];
      
      const updatedCampaign = {
        ...editedCampaign,
        visualMedia: updatedMedia,
        history: updatedHistory,
        modifiedAt: new Date().toISOString()
      };
      
      setEditedCampaign(updatedCampaign);
      onSave(updatedCampaign);
      
      // Reset form
      setNewMediaUrl('');
      setNewMediaDescription('');
      setShowAddMedia(false);
    }
  };

  const handleDeleteMedia = (mediaId) => {
    const mediaToDelete = visualMedia.find(media => media.id === mediaId);
    const updatedMedia = visualMedia.filter(media => media.id !== mediaId);
    setVisualMedia(updatedMedia);
    
    // Add to history
    const updatedHistory = [...(editedCampaign.history || []), {
      id: Date.now() + Math.random(),
      action: `Removed visual media: ${mediaToDelete.description}`,
      user: currentUser,
      timestamp: new Date().toISOString()
    }];
    
    const updatedCampaign = {
      ...editedCampaign,
      visualMedia: updatedMedia,
      history: updatedHistory,
      modifiedAt: new Date().toISOString()
    };
    
    setEditedCampaign(updatedCampaign);
    onSave(updatedCampaign);
  };

  // Calculate metrics
  const calculateCPCUnique = (cost, uniqueClicks) => uniqueClicks > 0 ? (cost / uniqueClicks).toFixed(2) : '0.00';
  const calculateCPRConfirm = (cost, confirmReg) => confirmReg > 0 ? (cost / confirmReg).toFixed(2) : '0.00';
  const calculateCPS = (cost, sales) => sales > 0 ? (cost / sales).toFixed(2) : '0.00';
  const calculateROAS = (revenue, cost) => cost > 0 ? ((revenue / cost) * 100).toFixed(1) : '0.0';

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      padding: windowWidth >= 768 ? '16px' : '8px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              onClick={onBack}
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
              onMouseEnter={(e) => e.target.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#f8f8f8'}
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    color: '#1a1a1a',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#047857'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#059669'}
                >
                  <Save size={16} />
                  Save Changes
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
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
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#2563eb'}
              >
                <Edit2 size={16} />
                Edit Campaign
              </button>
            )}
          </div>
        </div>

        {/* Campaign Info Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0'
        }}>
          <h2 style={{
            margin: '0 0 24px 0',
            color: '#1a1a1a',
            fontSize: getResponsiveFontSize('1.5rem', '1.75rem'),
            fontWeight: '600'
          }}>
            Campaign Information
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: getResponsiveGridColumns(),
            gap: getResponsiveGap()
          }}>
            {/* Campaign Name */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Campaign Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCampaign.name}
                  onChange={(e) => setEditedCampaign({...editedCampaign, name: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.name}
                </div>
              )}
            </div>

            {/* Campaign ID */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Campaign ID
              </label>
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#666666'
              }}>
                {editedCampaign.id}
              </div>
            </div>

            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Status
              </label>
              {isEditing ? (
                <select
                  value={editedCampaign.status}
                  onChange={(e) => setEditedCampaign({...editedCampaign, status: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="Live" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Live</option>
                  <option value="Paused" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Paused</option>
                  <option value="Ended" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Ended</option>
                </select>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px'
                }}>
                  <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: '500',
                    backgroundColor: editedCampaign.status === 'Live' ? '#dcfce7' : 
                                   editedCampaign.status === 'Paused' ? '#fef3c7' : '#fee2e2',
                    color: editedCampaign.status === 'Live' ? '#15803d' : 
                          editedCampaign.status === 'Paused' ? '#a16207' : '#dc2626'
                  }}>
                    {editedCampaign.status}
                  </span>
                </div>
              )}
            </div>

            {/* Vendor */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Vendor
              </label>
              <div style={{
                padding: '12px 16px',
                backgroundColor: '#f8f8f8',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#1a1a1a'
              }}>
                {editedCampaign.vendor}
              </div>
            </div>

            {/* Cost */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <DollarSign size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Campaign Cost
              </label>
              {isEditing ? (
                <input
                  type="number"
                  value={editedCampaign.metrics.cost}
                  onChange={(e) => setEditedCampaign({
                    ...editedCampaign, 
                    metrics: {...editedCampaign.metrics, cost: parseFloat(e.target.value) || 0}
                  })}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a',
                  fontWeight: '600'
                }}>
                  ${editedCampaign.metrics.cost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              )}
            </div>

            {/* Manager */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <User size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Campaign Manager
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCampaign.manager}
                  onChange={(e) => setEditedCampaign({...editedCampaign, manager: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.manager}
                </div>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                Start Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedCampaign.startDate}
                  onChange={(e) => setEditedCampaign({...editedCampaign, startDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {format(new Date(editedCampaign.startDate), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            {/* End Date */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                <Calendar size={14} style={{ display: 'inline', marginRight: '4px' }} />
                End Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editedCampaign.endDate}
                  onChange={(e) => setEditedCampaign({...editedCampaign, endDate: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {format(new Date(editedCampaign.endDate), 'MMM dd, yyyy')}
                </div>
              )}
            </div>

            {/* Ad Placement Domain */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Ad Placement Domain
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCampaign.adPlacementDomain}
                  onChange={(e) => setEditedCampaign({...editedCampaign, adPlacementDomain: e.target.value})}
                  placeholder="e.g., google.com, facebook.com"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.adPlacementDomain || 'Not specified'}
                </div>
              )}
            </div>

            {/* Device */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Device Targeting
              </label>
              {isEditing ? (
                <select
                  value={editedCampaign.device}
                  onChange={(e) => setEditedCampaign({...editedCampaign, device: e.target.value})}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    backgroundColor: '#ffffff',
                    color: '#1a1a1a',
                    cursor: 'pointer',
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 12px center',
                    backgroundSize: '16px',
                    paddingRight: '40px'
                  }}
                >
                  <option value="Desktop" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Desktop</option>
                  <option value="Mobile" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Mobile</option>
                  <option value="Both" style={{ backgroundColor: '#ffffff', color: '#1a1a1a', padding: '8px' }}>Both</option>
                </select>
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.device}
                </div>
              )}
            </div>

            {/* Geographic Targeting */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Geographic Targeting
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCampaign.targeting}
                  onChange={(e) => setEditedCampaign({...editedCampaign, targeting: e.target.value})}
                  placeholder="e.g., United States, Europe, Global"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.targeting}
                </div>
              )}
            </div>

            {/* Rep Contact Information */}
            <div>
              <label style={{
                display: 'block',
                color: '#666666',
                fontSize: '14px',
                fontWeight: '500',
                marginBottom: '8px'
              }}>
                Rep Contact Information
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editedCampaign.repContactInfo}
                  onChange={(e) => setEditedCampaign({...editedCampaign, repContactInfo: e.target.value})}
                  placeholder="Email or phone number"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              ) : (
                <div style={{
                  padding: '12px 16px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#1a1a1a'
                }}>
                  {editedCampaign.repContactInfo || 'Not specified'}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#1a1a1a',
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Activity size={20} style={{ marginRight: '8px', color: '#2563eb' }} />
            Performance Metrics
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: windowWidth >= 1024 ? 'repeat(4, 1fr)' : windowWidth >= 768 ? 'repeat(2, 1fr)' : '1fr',
            gap: '16px'
          }}>
            {/* Unique Clicks */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              borderLeft: '4px solid #2563eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <MousePointer size={16} style={{ marginRight: '6px', color: '#2563eb' }} />
                <span style={{ color: '#666666', fontSize: '13px', fontWeight: '500' }}>Unique Clicks</span>
              </div>
              <div style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '600' }}>
                {editedCampaign.metrics.uniqueClicks.toLocaleString()}
              </div>
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                CPC: ${calculateCPCUnique(editedCampaign.metrics.cost, editedCampaign.metrics.uniqueClicks)}
              </div>
            </div>

            {/* Confirmed Registrations */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              borderLeft: '4px solid #7c3aed'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <Users size={16} style={{ marginRight: '6px', color: '#7c3aed' }} />
                <span style={{ color: '#666666', fontSize: '13px', fontWeight: '500' }}>Confirm Reg</span>
              </div>
              <div style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '600' }}>
                {editedCampaign.metrics.confirmReg.toLocaleString()}
              </div>
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                CPR: ${calculateCPRConfirm(editedCampaign.metrics.cost, editedCampaign.metrics.confirmReg)}
              </div>
            </div>

            {/* Sales */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              borderLeft: '4px solid #dc2626'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <ShoppingCart size={16} style={{ marginRight: '6px', color: '#dc2626' }} />
                <span style={{ color: '#666666', fontSize: '13px', fontWeight: '500' }}>Sales</span>
              </div>
              <div style={{ color: '#1a1a1a', fontSize: '1.5rem', fontWeight: '600' }}>
                {editedCampaign.metrics.sales.toLocaleString()}
              </div>
              <div style={{ color: '#666666', fontSize: '12px', marginTop: '4px' }}>
                CPS: ${calculateCPS(editedCampaign.metrics.cost, editedCampaign.metrics.sales)}
              </div>
            </div>

            {/* ROAS */}
            <div style={{
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              borderLeft: editedCampaign.metrics.revenue >= 0 ? '4px solid #059669' : '4px solid #dc2626'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <TrendingUp size={16} style={{ marginRight: '6px', color: editedCampaign.metrics.revenue >= 0 ? '#059669' : '#dc2626' }} />
                <span style={{ color: '#666666', fontSize: '13px', fontWeight: '500' }}>ROAS</span>
              </div>
              <div style={{ 
                color: editedCampaign.metrics.revenue >= 0 ? '#059669' : '#dc2626', 
                fontSize: '1.5rem', 
                fontWeight: '600' 
              }}>
                {calculateROAS(editedCampaign.metrics.revenue, editedCampaign.metrics.cost)}%
              </div>
              <div style={{ 
                color: editedCampaign.metrics.revenue >= 0 ? '#059669' : '#dc2626', 
                fontSize: '12px', 
                marginTop: '4px',
                fontWeight: '500'
              }}>
                Revenue: ${editedCampaign.metrics.revenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Media Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              color: '#1a1a1a',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <ImageIcon size={20} style={{ marginRight: '8px', color: '#059669' }} />
              Visual Media
            </h3>
            {!showAddMedia && (
              <button
                onClick={() => setShowAddMedia(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Add Media
              </button>
            )}
          </div>

          {showAddMedia && (
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              border: '1px solid #e0e0e0'
            }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  color: '#666666',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}>
                  Media URL
                </label>
                <input
                  type="url"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://example.com/ad-creative.jpg"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{ marginBottom: '12px' }}>
                <label style={{
                  display: 'block',
                  color: '#666666',
                  fontSize: '13px',
                  fontWeight: '500',
                  marginBottom: '6px'
                }}>
                  Description (optional)
                </label>
                <input
                  type="text"
                  value={newMediaDescription}
                  onChange={(e) => setNewMediaDescription(e.target.value)}
                  placeholder="Banner 728x90"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>
              <div style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowAddMedia(false);
                    setNewMediaUrl('');
                    setNewMediaDescription('');
                  }}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMedia}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#059669',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Add Media
                </button>
              </div>
            </div>
          )}

          {visualMedia.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              border: '1px dashed #d0d0d0'
            }}>
              <ImageIcon size={48} style={{ color: '#999999', marginBottom: '16px' }} />
              <p style={{
                margin: '0 0 8px 0',
                color: '#666666',
                fontSize: '14px'
              }}>
                No visual media added yet
              </p>
              <p style={{
                margin: 0,
                color: '#999999',
                fontSize: '12px'
              }}>
                Add banner ads, display creatives, and other visual assets
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth >= 1200 ? 'repeat(3, 1fr)' : 
                                 windowWidth >= 768 ? 'repeat(2, 1fr)' : '1fr',
              gap: '20px'
            }}>
              {visualMedia.map(media => (
                <div
                  key={media.id}
                  style={{
                    position: 'relative',
                    backgroundColor: '#ffffff',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Image Preview */}
                  <a 
                    href={media.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ display: 'block', textDecoration: 'none' }}
                  >
                    <div style={{
                      height: '200px',
                      backgroundColor: '#f8f8f8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      cursor: 'pointer'
                    }}>
                      <img 
                        src={media.url} 
                        alt={media.description}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'contain',
                          backgroundColor: '#ffffff'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `
                            <div style="text-align: center; padding: 20px;">
                              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#999999" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                              </svg>
                              <p style="margin: 8px 0 0 0; color: #999999; font-size: 12px;">
                                Unable to load image
                              </p>
                            </div>
                          `;
                        }}
                      />
                      
                      {/* Click overlay */}
                      <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                      >
                        <ExternalLink size={24} style={{ color: '#ffffff' }} />
                      </div>
                    </div>
                  </a>

                  {/* Media Info */}
                  <div style={{
                    padding: '16px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'start',
                      marginBottom: '8px'
                    }}>
                      <h4 style={{
                        margin: 0,
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#1a1a1a',
                        flex: 1,
                        marginRight: '8px'
                      }}>
                        {media.description}
                      </h4>
                      <button
                        onClick={() => {
                          if (window.confirm(`Remove ${media.description}?`)) {
                            handleDeleteMedia(media.id);
                          }
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fee2e2'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <Trash2 size={16} style={{ color: '#dc2626' }} />
                      </button>
                    </div>
                    <a 
                      href={media.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        color: '#2563eb',
                        fontSize: '12px',
                        textDecoration: 'none',
                        wordBreak: 'break-all',
                        lineHeight: '1.4'
                      }}
                      onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                      onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                    >
                      <ExternalLink size={12} />
                      {media.url}
                    </a>
                    <p style={{
                      margin: '8px 0 0 0',
                      fontSize: '11px',
                      color: '#999999'
                    }}>
                      Added {format(new Date(media.addedDate), 'MMM dd, yyyy')} by {media.addedBy}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upload Documents Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              color: '#1a1a1a',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <FileText size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
              Campaign Documents
            </h3>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: '#7c3aed',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: '500',
              cursor: 'pointer'
            }}>
              <Upload size={16} />
              Upload Document
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif"
              />
            </label>
          </div>

          {documents.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              border: '1px dashed #d0d0d0'
            }}>
              <FileText size={48} style={{ color: '#999999', marginBottom: '16px' }} />
              <p style={{
                margin: '0 0 8px 0',
                color: '#666666',
                fontSize: '14px'
              }}>
                No documents uploaded yet
              </p>
              <p style={{
                margin: 0,
                color: '#999999',
                fontSize: '12px'
              }}>
                Upload contracts, briefs, or other campaign-related documents
              </p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: windowWidth >= 1200 ? 'repeat(4, 1fr)' : 
                                 windowWidth >= 768 ? 'repeat(3, 1fr)' : 
                                 windowWidth >= 480 ? 'repeat(2, 1fr)' : '1fr',
              gap: '16px'
            }}>
              {documents.map(doc => (
                <div
                  key={doc.id}
                  style={{
                    position: 'relative',
                    backgroundColor: '#f8f8f8',
                    border: '1px solid #e0e0e0',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onClick={() => handleDocumentDownload(doc)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {/* Document Preview */}
                  <div style={{
                    height: '160px',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden'
                  }}>
                    {doc.isImage ? (
                      <img 
                        src={doc.data} 
                        alt={doc.name}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        padding: '20px'
                      }}>
                        {doc.type.includes('pdf') ? (
                          <FileText size={48} style={{ color: '#dc2626' }} />
                        ) : doc.type.includes('word') || doc.type.includes('doc') ? (
                          <FileText size={48} style={{ color: '#2563eb' }} />
                        ) : doc.type.includes('excel') || doc.type.includes('sheet') ? (
                          <FileText size={48} style={{ color: '#059669' }} />
                        ) : (
                          <File size={48} style={{ color: '#666666' }} />
                        )}
                        <p style={{
                          margin: '8px 0 0 0',
                          color: '#666666',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}>
                          {doc.type.split('/')[1]?.toUpperCase() || 'FILE'}
                        </p>
                      </div>
                    )}
                    
                    {/* Download overlay */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0,
                      transition: 'opacity 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                    >
                      <Download size={24} style={{ color: '#ffffff' }} />
                    </div>
                  </div>

                  {/* Document Info */}
                  <div style={{
                    padding: '12px',
                    borderTop: '1px solid #e0e0e0'
                  }}>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '13px',
                      fontWeight: '600',
                      color: '#1a1a1a',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {doc.name}
                    </p>
                    <p style={{
                      margin: '0 0 4px 0',
                      fontSize: '11px',
                      color: '#666666'
                    }}>
                      {formatFileSize(doc.size)}
                    </p>
                    <p style={{
                      margin: 0,
                      fontSize: '11px',
                      color: '#999999'
                    }}>
                      {format(new Date(doc.uploadDate), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`Delete ${doc.name}?`)) {
                        handleDocumentDelete(doc.id);
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
                  >
                    <Trash2 size={16} style={{ color: '#dc2626' }} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notes Section */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          marginBottom: getResponsiveGap(),
          border: '1px solid #e0e0e0'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px'
          }}>
            <h3 style={{
              margin: 0,
              color: '#1a1a1a',
              fontSize: '1.25rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center'
            }}>
              <MessageSquare size={20} style={{ marginRight: '8px', color: '#2563eb' }} />
              Campaign Notes
            </h3>
            {!showAddNote && (
              <button
                onClick={() => setShowAddNote(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                <Plus size={16} />
                Add Note
              </button>
            )}
          </div>

          {showAddNote && (
            <div style={{
              marginBottom: '16px',
              padding: '16px',
              backgroundColor: '#f8f8f8',
              borderRadius: '6px',
              border: '1px solid #e0e0e0'
            }}>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Enter your note here..."
                style={{
                  width: '100%',
                  minHeight: '80px',
                  padding: '12px',
                  border: '1px solid #d0d0d0',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '12px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowAddNote(false);
                    setNewNote('');
                  }}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#ffffff',
                    border: '1px solid #d0d0d0',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  style={{
                    padding: '6px 16px',
                    backgroundColor: '#2563eb',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Save Note
                </button>
              </div>
            </div>
          )}

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {editedCampaign.notes && editedCampaign.notes.length > 0 ? (
              editedCampaign.notes.map(note => (
                <div key={note.id} style={{
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: '#fafafa',
                  marginBottom: '8px',
                  borderRadius: '6px'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                    alignItems: 'center'
                  }}>
                    <span style={{
                      color: '#2563eb',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      {note.user}
                    </span>
                    <span style={{
                      color: '#666666',
                      fontSize: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <Clock size={12} />
                      {format(new Date(note.timestamp), 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  <p style={{
                    margin: 0,
                    color: '#1a1a1a',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    {note.text}
                  </p>
                </div>
              ))
            ) : (
              <p style={{
                color: '#666666',
                fontSize: '14px',
                textAlign: 'center',
                padding: '20px'
              }}>
                No notes added yet
              </p>
            )}
          </div>
        </div>

        {/* Change History */}
        <div style={{
          backgroundColor: '#ffffff',
          padding: getResponsivePadding(),
          borderRadius: '8px',
          border: '1px solid #e0e0e0'
        }}>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#1a1a1a',
            fontSize: '1.25rem',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center'
          }}>
            <History size={20} style={{ marginRight: '8px', color: '#7c3aed' }} />
            Change History
          </h3>

          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {editedCampaign.history && editedCampaign.history.length > 0 ? (
              editedCampaign.history.slice().reverse().map(entry => (
                <div key={entry.id} style={{
                  padding: '12px',
                  borderBottom: '1px solid #f0f0f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{
                      margin: '0 0 4px 0',
                      color: '#1a1a1a',
                      fontSize: '14px'
                    }}>
                      {entry.action}
                    </p>
                    <p style={{
                      margin: 0,
                      color: '#666666',
                      fontSize: '12px'
                    }}>
                      by {entry.user}
                    </p>
                  </div>
                  <span style={{
                    color: '#666666',
                    fontSize: '12px',
                    whiteSpace: 'nowrap',
                    marginLeft: '16px'
                  }}>
                    {format(new Date(entry.timestamp), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              ))
            ) : (
              <p style={{
                color: '#666666',
                fontSize: '14px',
                textAlign: 'center',
                padding: '20px'
              }}>
                No change history available
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignDetail;