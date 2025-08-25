import React from 'react';
import Skeleton from '../Skeleton';
import Card from '../Card';
import { spacing } from '../design-system/tokens';

const CampaignDetailSkeleton = () => {
  return (
    <div style={{ padding: spacing[4] }}>
      {/* Header */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: spacing[4] }}>
            <Skeleton width="120px" height="36px" />
          </div>
          <Skeleton width="100px" height="36px" />
        </div>
      </Card>
      
      {/* Campaign Info */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <Skeleton width="180px" height="24px" style={{ marginBottom: spacing[5] }} />
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: spacing[6]
        }}>
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index}>
              <Skeleton width="100px" height="14px" style={{ marginBottom: spacing[2] }} />
              <Skeleton width="100%" height="40px" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Performance Metrics */}
      <Card padding="medium" style={{ marginBottom: spacing[6] }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing[5]
        }}>
          <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
          <Skeleton width="180px" height="20px" />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: spacing[4]
        }}>
          {Array.from({ length: 4 }, (_, index) => (
            <div
              key={index}
              style={{
                padding: spacing[4],
                backgroundColor: '#f8f8f8',
                borderRadius: '6px',
                borderLeft: '4px solid #e0e0e0'
              }}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                marginBottom: spacing[2]
              }}>
                <Skeleton width="16px" height="16px" style={{ marginRight: spacing[2] }} />
                <Skeleton width="80px" height="13px" />
              </div>
              <Skeleton width="100px" height="24px" style={{ marginBottom: spacing[1] }} />
              <Skeleton width="60px" height="12px" />
            </div>
          ))}
        </div>
      </Card>
      
      {/* Sections */}
      {Array.from({ length: 3 }, (_, sectionIndex) => (
        <Card key={sectionIndex} padding="medium" style={{ marginBottom: spacing[6] }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: spacing[5]
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
              <Skeleton width="150px" height="20px" />
            </div>
            <Skeleton width="100px" height="32px" />
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: spacing[4]
          }}>
            {Array.from({ length: 4 }, (_, itemIndex) => (
              <div key={itemIndex}>
                <Skeleton width="100%" height="120px" style={{ marginBottom: spacing[3] }} />
                <Skeleton width="100%" height="16px" style={{ marginBottom: spacing[1] }} />
                <Skeleton width="70%" height="14px" />
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default CampaignDetailSkeleton;