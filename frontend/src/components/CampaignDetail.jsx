import React from 'react';
import { 
  ArrowLeft, Save, Edit2, Calendar, DollarSign, User, Clock, 
  MessageSquare, History, TrendingUp, MousePointer, Users, 
  ShoppingCart, Activity, Plus, X, Upload, FileText, Download,
  Image, File, Trash2, ExternalLink, ImageIcon
} from 'lucide-react';

import { useCampaignDetail } from '../hooks/useCampaignDetail';
import { useNotes } from '../hooks/useNotes';
import { useDocuments } from '../hooks/useDocuments';
import { useVisualMedia } from '../hooks/useVisualMedia';
import { useResponsive } from '../hooks/useResponsive';
import { formatCurrency, formatPercentage, calculateROAS } from '../utils/calculations';
import { formatDateTime, getRelativeTime } from '../utils/dateHelpers';

import ErrorBoundary from './common/ErrorBoundary';

const CampaignDetail = ({ campaign, onBack }) => {
  // Hooks
  const campaignDetail = useCampaignDetail(campaign, onBack);
  const notes = useNotes(campaign?.id);
  const documents = useDocuments(campaign?.id);
  const visualMedia = useVisualMedia(campaign?.id);
  const responsive = useResponsive();
  
  const {
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
  } = campaignDetail;
  
  // Loading state
  if (!campaign) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#666666'
      }}>
        Loading campaign details...
      </div>
    );
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
            campaignId={campaign.id}
            visualMedia={visualMedia}
            campaign={editedData}
            responsive={responsive}
          />
          
          {/* Documents */}
          <DocumentsSection
            campaignId={campaign.id}
            documents={documents}
            campaign={editedData}
            responsive={responsive}
          />
          
          {/* Notes */}
          <NotesSection
            campaignId={campaign.id}
            notes={notes}
            campaign={editedData}
            responsive={responsive}
          />
          
          {/* Change History */}
          <ChangeHistory
            history={editedData.changeHistory}
            responsive={responsive}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

// Campaign Information Component
const CampaignInfo = ({ campaign, isEditing, onUpdateField, onUpdateNestedField, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <h2 style={{ margin: '0 0 24px 0', color: '#1a1a1a', fontWeight: '600' }}>
      Campaign Information
    </h2>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: responsive.getGridColumns(),
      gap: responsive.getGap()
    }}>
      {/* Basic Info */}
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Campaign Name
        </label>
        {isEditing ? (
          <input
            type="text"
            value={campaign.name || ''}
            onChange={(e) => onUpdateField('name', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px', color: '#1a1a1a' }}>
            {campaign.name}
          </div>
        )}
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Status
        </label>
        {isEditing ? (
          <select
            value={campaign.status || 'Live'}
            onChange={(e) => onUpdateField('status', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="Live">Live</option>
            <option value="Paused">Paused</option>
            <option value="Ended">Ended</option>
          </select>
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px' }}>
            <span style={{
              padding: '4px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: '500',
              backgroundColor: campaign.status === 'Live' ? '#dcfce7' : 
                               campaign.status === 'Paused' ? '#fef3cd' : '#fee2e2',
              color: campaign.status === 'Live' ? '#166534' : 
                     campaign.status === 'Paused' ? '#92400e' : '#991b1b'
            }}>
              {campaign.status}
            </span>
          </div>
        )}
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Manager
        </label>
        {isEditing ? (
          <input
            type="text"
            value={campaign.manager || ''}
            onChange={(e) => onUpdateField('manager', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px', color: '#1a1a1a' }}>
            {campaign.manager || 'Unassigned'}
          </div>
        )}
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Ad Placement Domain
        </label>
        {isEditing ? (
          <input
            type="text"
            value={campaign.adPlacementDomain || ''}
            onChange={(e) => onUpdateField('adPlacementDomain', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px', color: '#1a1a1a' }}>
            {campaign.adPlacementDomain || 'Not specified'}
          </div>
        )}
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          Start Date
        </label>
        {isEditing ? (
          <input
            type="date"
            value={campaign.startDate || ''}
            onChange={(e) => onUpdateField('startDate', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px', color: '#1a1a1a' }}>
            {campaign.startDate || 'Not set'}
          </div>
        )}
      </div>
      
      <div>
        <label style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: '#374151' }}>
          End Date
        </label>
        {isEditing ? (
          <input
            type="date"
            value={campaign.endDate || ''}
            onChange={(e) => onUpdateField('endDate', e.target.value)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          />
        ) : (
          <div style={{ padding: '8px 0', fontSize: '14px', color: '#1a1a1a' }}>
            {campaign.endDate || 'Not set'}
          </div>
        )}
      </div>
    </div>
  </div>
);

// Performance Metrics Component
const PerformanceMetrics = ({ metrics = {}, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <h3 style={{ margin: '0 0 20px 0', color: '#1a1a1a', fontWeight: '600' }}>
      Performance Metrics
    </h3>
    
    <div style={{
      display: 'grid',
      gridTemplateColumns: responsive.getGridColumns(),
      gap: responsive.getGap()
    }}>
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <DollarSign size={24} style={{ color: '#0066cc', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Cost</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {formatCurrency(metrics.cost || 0)}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <TrendingUp size={24} style={{ color: '#10b981', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Revenue</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {formatCurrency(metrics.revenue || 0)}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <Activity size={24} style={{ color: '#f59e0b', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>ROAS</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {formatPercentage(parseFloat(calculateROAS(metrics.revenue || 0, metrics.cost || 0)))}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <MousePointer size={24} style={{ color: '#8b5cf6', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Clicks</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {(metrics.rawClicks || 0).toLocaleString()}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <Users size={24} style={{ color: '#06b6d4', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Registrations</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {(metrics.confirmReg || 0).toLocaleString()}
        </div>
      </div>
      
      <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
        <ShoppingCart size={24} style={{ color: '#ef4444', marginBottom: '8px' }} />
        <div style={{ fontSize: '12px', color: '#666666', marginBottom: '4px' }}>Sales</div>
        <div style={{ fontSize: '20px', fontWeight: '700', color: '#1a1a1a' }}>
          {(metrics.sales || 0).toLocaleString()}
        </div>
      </div>
    </div>
  </div>
);

// Visual Media Section Component
const VisualMediaSection = ({ campaignId, visualMedia, campaign, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ margin: 0, color: '#1a1a1a', fontWeight: '600' }}>
        Visual Media ({(campaign.visualMedia || []).length})
      </h3>
      <button
        onClick={() => visualMedia.setShowAddMedia(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <Plus size={16} />
        Add Media
      </button>
    </div>
    
    {/* Add Media Form */}
    {visualMedia.showAddMedia && (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', color: '#1a1a1a' }}>Add Visual Media</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Image URL
            </label>
            <input
              type="url"
              value={visualMedia.newMediaUrl}
              onChange={(e) => visualMedia.setNewMediaUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px', fontWeight: '500' }}>
              Description
            </label>
            <input
              type="text"
              value={visualMedia.newMediaDescription}
              onChange={(e) => visualMedia.setNewMediaDescription(e.target.value)}
              placeholder="Banner - 728x90"
              style={{
                width: '100%',
                padding: '8px',
                border: '1px solid #d1d5db',
                borderRadius: '4px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
          <button
            onClick={visualMedia.handleAddMedia}
            disabled={visualMedia.isSubmitting}
            style={{
              padding: '6px 12px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: visualMedia.isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: visualMedia.isSubmitting ? 0.6 : 1
            }}
          >
            {visualMedia.isSubmitting ? 'Adding...' : 'Add Media'}
          </button>
          <button
            onClick={visualMedia.cancelAddMedia}
            disabled={visualMedia.isSubmitting}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: visualMedia.isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: visualMedia.isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    
    {/* Media Grid */}
    {campaign.visualMedia && campaign.visualMedia.length > 0 ? (
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        {campaign.visualMedia.map((media, index) => (
          <div key={media.id || index} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden',
            backgroundColor: '#ffffff'
          }}>
            <img
              src={media.url}
              alt={media.description}
              style={{
                width: '100%',
                height: '120px',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div style={{
              display: 'none',
              height: '120px',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f3f4f6',
              color: '#6b7280'
            }}>
              <ImageIcon size={32} />
            </div>
            <div style={{ padding: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: '500', marginBottom: '4px' }}>
                {media.description}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                Added {getRelativeTime(media.addedDate)}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '2px dashed #d1d5db'
      }}>
        <ImageIcon size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <div>No visual media uploaded yet</div>
      </div>
    )}
  </div>
);

// Documents Section Component
const DocumentsSection = ({ campaignId, documents, campaign, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ margin: 0, color: '#1a1a1a', fontWeight: '600' }}>
        Documents ({(campaign.documents || []).length})
      </h3>
      <label style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        backgroundColor: '#2563eb',
        color: '#ffffff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px'
      }}>
        <Upload size={16} />
        Upload Document
        <input
          type="file"
          multiple
          onChange={(e) => documents.handleFileUpload(e.target.files)}
          style={{ display: 'none' }}
          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.txt,.csv"
        />
      </label>
    </div>
    
    {/* Upload Progress */}
    {Object.keys(documents.uploadProgress).length > 0 && (
      <div style={{ marginBottom: '16px' }}>
        {Object.entries(documents.uploadProgress).map(([fileName, progress]) => (
          <div key={fileName} style={{ marginBottom: '8px' }}>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>{fileName}</div>
            <div style={{
              width: '100%',
              height: '4px',
              backgroundColor: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${progress}%`,
                height: '100%',
                backgroundColor: '#059669',
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>
        ))}
      </div>
    )}
    
    {/* Documents List */}
    {campaign.documents && campaign.documents.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {campaign.documents.map((doc, index) => (
          <div key={doc.id || index} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FileText size={20} style={{ color: '#6b7280' }} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>{doc.name}</div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Uploaded {getRelativeTime(doc.uploadedDate)} by {doc.uploadedBy}
                </div>
              </div>
            </div>
            <button
              onClick={() => documents.handleDocumentDownload(doc)}
              style={{
                padding: '4px 8px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#2563eb',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              <Download size={16} />
            </button>
          </div>
        ))}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '2px dashed #d1d5db'
      }}>
        <FileText size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <div>No documents uploaded yet</div>
      </div>
    )}
  </div>
);

// Notes Section Component
const NotesSection = ({ campaignId, notes, campaign, responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
      <h3 style={{ margin: 0, color: '#1a1a1a', fontWeight: '600' }}>
        Notes ({(campaign.notes || []).length})
      </h3>
      <button
        onClick={() => notes.setShowAddNote(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px'
        }}
      >
        <Plus size={16} />
        Add Note
      </button>
    </div>
    
    {/* Add Note Form */}
    {notes.showAddNote && (
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '16px',
        borderRadius: '6px',
        marginBottom: '16px',
        border: '1px solid #e9ecef'
      }}>
        <textarea
          value={notes.newNote}
          onChange={(e) => notes.setNewNote(e.target.value)}
          placeholder="Enter your note here..."
          rows={3}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '14px',
            resize: 'vertical',
            marginBottom: '8px'
          }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={notes.handleAddNote}
            disabled={notes.isSubmitting}
            style={{
              padding: '6px 12px',
              backgroundColor: '#059669',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: notes.isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: notes.isSubmitting ? 0.6 : 1
            }}
          >
            {notes.isSubmitting ? 'Adding...' : 'Add Note'}
          </button>
          <button
            onClick={notes.cancelAddNote}
            disabled={notes.isSubmitting}
            style={{
              padding: '6px 12px',
              backgroundColor: '#6b7280',
              color: '#ffffff',
              border: 'none',
              borderRadius: '4px',
              cursor: notes.isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: notes.isSubmitting ? 0.6 : 1
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    )}
    
    {/* Notes List */}
    {campaign.notes && campaign.notes.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {campaign.notes.map((note, index) => (
          <div key={note.id || index} style={{
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#f9fafb'
          }}>
            <div style={{ fontSize: '14px', color: '#1a1a1a', marginBottom: '8px' }}>
              {note.text}
            </div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatDateTime(note.timestamp)} by {note.user}
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '2px dashed #d1d5db'
      }}>
        <MessageSquare size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <div>No notes added yet</div>
      </div>
    )}
  </div>
);

// Change History Component
const ChangeHistory = ({ history = [], responsive }) => (
  <div style={{
    backgroundColor: '#ffffff',
    padding: responsive.getPadding(),
    borderRadius: '8px',
    marginBottom: responsive.getGap(),
    border: '1px solid #e0e0e0'
  }}>
    <h3 style={{ margin: '0 0 20px 0', color: '#1a1a1a', fontWeight: '600' }}>
      Change History ({history.length})
    </h3>
    
    {history.length > 0 ? (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {history.slice().reverse().map((entry, index) => (
          <div key={entry.id || index} style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '12px',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            backgroundColor: '#f9fafb'
          }}>
            <History size={16} style={{ color: '#6b7280', marginTop: '2px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '14px', color: '#1a1a1a', marginBottom: '4px' }}>
                {entry.action}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {formatDateTime(entry.timestamp)} by {entry.user}
              </div>
            </div>
          </div>
        ))}
      </div>
    ) : (
      <div style={{
        textAlign: 'center',
        padding: '40px',
        color: '#6b7280',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        border: '2px dashed #d1d5db'
      }}>
        <History size={48} style={{ marginBottom: '12px', opacity: 0.5 }} />
        <div>No changes recorded yet</div>
      </div>
    )}
  </div>
);

export default CampaignDetail;