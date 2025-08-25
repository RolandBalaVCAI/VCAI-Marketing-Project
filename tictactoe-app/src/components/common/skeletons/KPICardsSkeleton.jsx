import React from 'react';
import Skeleton from '../Skeleton';
import Card from '../Card';
import { spacing } from '../design-system/tokens';

const KPICardSkeleton = () => (
  <Card padding="medium">
    <div style={{
      display: 'flex',
      alignItems: 'center',
      marginBottom: spacing[3]
    }}>
      <Skeleton width="20px" height="20px" style={{ marginRight: spacing[2] }} />
      <Skeleton width="100px" height="14px" />
    </div>
    <Skeleton width="120px" height="32px" style={{ marginBottom: spacing[2] }} />
    <Skeleton width="80px" height="12px" />
  </Card>
);

const KPICardsSkeleton = ({ cards = 6 }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: spacing[4],
      marginBottom: spacing[6]
    }}>
      {Array.from({ length: cards }, (_, index) => (
        <KPICardSkeleton key={index} />
      ))}
    </div>
  );
};

export default KPICardsSkeleton;