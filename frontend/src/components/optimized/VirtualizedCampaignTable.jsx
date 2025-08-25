import React, { memo, useMemo, useCallback, useState, useRef } from 'react';
import { ChevronDown, ChevronUp, Download, ExternalLink } from 'lucide-react';
import { formatCurrency, formatPercentage, calculateROAS } from '../../utils/calculations';

// Virtual scrolling constants
const ITEM_HEIGHT = 60; // Height of each row in pixels
const BUFFER_SIZE = 5; // Number of extra items to render outside viewport
const CONTAINER_HEIGHT = 400; // Height of the scrollable container

// Memoized Campaign Row Component
const CampaignRow = memo(({ 
  campaign, 
  index, 
  style, 
  onCampaignClick, 
  responsive 
}) => {
  const handleClick = useCallback(() => {
    onCampaignClick(campaign);
  }, [campaign, onCampaignClick]);

  const roas = useMemo(() => 
    calculateROAS(campaign.metrics?.revenue || 0, campaign.metrics?.cost || 0),
    [campaign.metrics?.revenue, campaign.metrics?.cost]
  );

  return (
    <div 
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: index % 2 === 0 ? '#ffffff' : '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        cursor: 'pointer',
        transition: 'background-color 0.2s ease',
        minHeight: ITEM_HEIGHT
      }}
      onClick={handleClick}
      onMouseEnter={(e) => {
        e.target.style.backgroundColor = '#f3f4f6';
      }}
      onMouseLeave={(e) => {
        e.target.style.backgroundColor = index % 2 === 0 ? '#ffffff' : '#f9fafb';
      }}
    >
      {/* Campaign Name */}
      <div style={{ 
        flex: '2', 
        fontWeight: '600', 
        color: '#1f2937',
        fontSize: responsive.getFontSize('0.9rem', '1rem')
      }}>
        {campaign.name}
      </div>
      
      {/* Vendor */}
      <div style={{ 
        flex: '1', 
        color: '#6b7280',
        fontSize: responsive.getFontSize('0.8rem', '0.9rem')
      }}>
        {campaign.vendor}
      </div>
      
      {/* Status */}
      <div style={{ flex: '1' }}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: responsive.getFontSize('0.7rem', '0.8rem'),
          fontWeight: '500',
          backgroundColor: campaign.status === 'Active' ? '#d1fae5' : 
                          campaign.status === 'Paused' ? '#fef3c7' : '#fee2e2',
          color: campaign.status === 'Active' ? '#065f46' : 
                 campaign.status === 'Paused' ? '#92400e' : '#991b1b'
        }}>
          {campaign.status}
        </span>
      </div>
      
      {/* Cost */}
      <div style={{ 
        flex: '1', 
        textAlign: 'right',
        fontSize: responsive.getFontSize('0.9rem', '1rem'),
        fontWeight: '600'
      }}>
        {formatCurrency(campaign.metrics?.cost || 0)}
      </div>
      
      {/* Revenue */}
      <div style={{ 
        flex: '1', 
        textAlign: 'right',
        fontSize: responsive.getFontSize('0.9rem', '1rem'),
        fontWeight: '600',
        color: '#10b981'
      }}>
        {formatCurrency(campaign.metrics?.revenue || 0)}
      </div>
      
      {/* ROAS */}
      <div style={{ 
        flex: '1', 
        textAlign: 'right',
        fontSize: responsive.getFontSize('0.9rem', '1rem'),
        fontWeight: '600',
        color: parseFloat(roas) >= 100 ? '#10b981' : '#ef4444'
      }}>
        {formatPercentage(roas)}
      </div>
      
      {/* Actions */}
      <div style={{ 
        flex: '0.5', 
        textAlign: 'right' 
      }}>
        <ExternalLink size={16} color="#6b7280" />
      </div>
    </div>
  );
});

CampaignRow.displayName = 'CampaignRow';

// Virtual List Component
const VirtualList = memo(({ 
  items, 
  itemHeight, 
  containerHeight, 
  renderItem,
  bufferSize = BUFFER_SIZE 
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const bufferStart = Math.max(0, visibleStart - bufferSize);
    const bufferEnd = Math.min(items.length - 1, visibleEnd + bufferSize);

    return { bufferStart, bufferEnd, visibleStart, visibleEnd };
  }, [scrollTop, itemHeight, containerHeight, items.length, bufferSize]);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const visibleItems = useMemo(() => {
    const { bufferStart, bufferEnd } = visibleRange;
    const items_slice = items.slice(bufferStart, bufferEnd + 1);
    
    return items_slice.map((item, index) => {
      const actualIndex = bufferStart + index;
      return renderItem(item, actualIndex, {
        position: 'absolute',
        top: actualIndex * itemHeight,
        left: 0,
        right: 0,
        height: itemHeight,
      });
    });
  }, [items, visibleRange, itemHeight, renderItem]);

  return (
    <div
      ref={containerRef}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: items.length * itemHeight,
          position: 'relative',
        }}
      >
        {visibleItems}
      </div>
    </div>
  );
});

VirtualList.displayName = 'VirtualList';

// Main Virtualized Campaign Table Component
const VirtualizedCampaignTable = memo(({
  campaigns,
  totalCampaigns,
  onCampaignClick,
  onExportCSV,
  responsive
}) => {
  const renderCampaignRow = useCallback((campaign, index, style) => (
    <CampaignRow
      key={campaign.id}
      campaign={campaign}
      index={index}
      style={style}
      onCampaignClick={onCampaignClick}
      responsive={responsive}
    />
  ), [onCampaignClick, responsive]);

  const shouldUseVirtualization = campaigns.length > 50;

  return (
    <div style={{
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      overflow: 'hidden',
      marginBottom: responsive.getMarginBottom()
    }}>
      {/* Table Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        <h2 style={{
          margin: 0,
          fontSize: responsive.getFontSize('1.2rem', '1.4rem'),
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Campaigns ({totalCampaigns})
        </h2>
        
        <button
          onClick={onExportCSV}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            backgroundColor: '#0066cc',
            color: '#ffffff',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: '500',
            fontSize: responsive.getFontSize('0.9rem', '1rem'),
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = '#0052a3';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = '#0066cc';
          }}
        >
          <Download size={16} />
          Export CSV
        </button>
      </div>

      {/* Column Headers */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '12px 16px',
        backgroundColor: '#f9fafb',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: '600',
        color: '#374151',
        fontSize: responsive.getFontSize('0.8rem', '0.9rem')
      }}>
        <div style={{ flex: '2' }}>Campaign Name</div>
        <div style={{ flex: '1' }}>Vendor</div>
        <div style={{ flex: '1' }}>Status</div>
        <div style={{ flex: '1', textAlign: 'right' }}>Cost</div>
        <div style={{ flex: '1', textAlign: 'right' }}>Revenue</div>
        <div style={{ flex: '1', textAlign: 'right' }}>ROAS</div>
        <div style={{ flex: '0.5', textAlign: 'right' }}>View</div>
      </div>

      {/* Campaign Rows */}
      {campaigns.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#6b7280',
          fontSize: responsive.getFontSize('1rem', '1.1rem')
        }}>
          No campaigns found. Try adjusting your filters.
        </div>
      ) : shouldUseVirtualization ? (
        <VirtualList
          items={campaigns}
          itemHeight={ITEM_HEIGHT}
          containerHeight={CONTAINER_HEIGHT}
          renderItem={renderCampaignRow}
          bufferSize={BUFFER_SIZE}
        />
      ) : (
        <div style={{ maxHeight: CONTAINER_HEIGHT, overflow: 'auto' }}>
          {campaigns.map((campaign, index) => (
            <CampaignRow
              key={campaign.id}
              campaign={campaign}
              index={index}
              style={{}}
              onCampaignClick={onCampaignClick}
              responsive={responsive}
            />
          ))}
        </div>
      )}
    </div>
  );
});

VirtualizedCampaignTable.displayName = 'VirtualizedCampaignTable';

export default VirtualizedCampaignTable;