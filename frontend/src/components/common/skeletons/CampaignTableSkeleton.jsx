import React from 'react';
import Skeleton from '../Skeleton';
import Card from '../Card';
import { spacing } from '../design-system/tokens';

const CampaignTableSkeleton = ({ rows = 5 }) => {
  return (
    <Card>
      {/* Header */}
      <div style={{
        padding: spacing[6],
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Skeleton width="200px" height="24px" />
        <Skeleton width="120px" height="36px" />
      </div>
      
      {/* Table Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
        gap: spacing[4],
        padding: `${spacing[4]} ${spacing[6]}`,
        backgroundColor: '#f8f8f8',
        borderBottom: '1px solid #f0f0f0'
      }}>
        {Array.from({ length: 8 }, (_, index) => (
          <Skeleton key={index} width="80%" height="16px" />
        ))}
      </div>
      
      {/* Table Rows */}
      {Array.from({ length: rows }, (_, rowIndex) => (
        <div
          key={rowIndex}
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr',
            gap: spacing[4],
            padding: `${spacing[4]} ${spacing[6]}`,
            borderBottom: rowIndex < rows - 1 ? '1px solid #f0f0f0' : 'none'
          }}
        >
          {/* Campaign Name */}
          <div>
            <Skeleton width="100%" height="16px" style={{ marginBottom: '4px' }} />
            <Skeleton width="60%" height="14px" />
          </div>
          
          {/* Status */}
          <Skeleton width="60px" height="24px" borderRadius="12px" />
          
          {/* Numeric columns */}
          {Array.from({ length: 6 }, (_, colIndex) => (
            <Skeleton key={colIndex} width="70%" height="16px" />
          ))}
        </div>
      ))}
      
      {/* Pagination */}
      <div style={{
        padding: spacing[4],
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Skeleton width="150px" height="16px" />
        <div style={{ display: 'flex', gap: spacing[2] }}>
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} width="32px" height="32px" />
          ))}
        </div>
      </div>
    </Card>
  );
};

export default CampaignTableSkeleton;