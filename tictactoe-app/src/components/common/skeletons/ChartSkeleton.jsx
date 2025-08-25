import React from 'react';
import Skeleton from '../Skeleton';
import Card from '../Card';
import { spacing } from '../design-system/tokens';

const ChartSkeleton = ({ title = true, height = '300px' }) => {
  return (
    <Card padding="medium">
      {title && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: spacing[5]
        }}>
          <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
          <Skeleton width="150px" height="20px" />
        </div>
      )}
      
      <div style={{
        height,
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'space-between',
        gap: spacing[2],
        marginBottom: spacing[4]
      }}>
        {/* Chart bars/lines simulation */}
        {Array.from({ length: 12 }, (_, index) => {
          const randomHeight = Math.random() * 0.7 + 0.3; // 30-100% height
          return (
            <Skeleton
              key={index}
              width="20px"
              height={`${randomHeight * 80}%`}
              style={{ alignSelf: 'flex-end' }}
            />
          );
        })}
      </div>
      
      {/* X-axis labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: spacing[2]
      }}>
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} width="40px" height="12px" />
        ))}
      </div>
    </Card>
  );
};

export default ChartSkeleton;