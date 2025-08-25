import React from 'react';
import { colors } from './design-system/tokens';

const EmptyState = ({
  icon,
  title = 'No data found',
  description,
  action,
  actionText = 'Get Started',
  variant = 'default',
  style = {}
}) => {
  const variants = {
    default: {
      iconColor: colors.neutral[400],
      titleColor: colors.neutral[700],
      descriptionColor: colors.neutral[500]
    },
    search: {
      iconColor: colors.primary[400],
      titleColor: colors.neutral[700],
      descriptionColor: colors.neutral[500]
    },
    error: {
      iconColor: colors.error[400],
      titleColor: colors.error[700],
      descriptionColor: colors.error[600]
    },
    success: {
      iconColor: colors.success[400],
      titleColor: colors.success[700],
      descriptionColor: colors.success[600]
    }
  };
  
  const currentVariant = variants[variant] || variants.default;
  
  const containerStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    ...style
  };
  
  const iconContainerStyles = {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: colors.neutral[100],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px'
  };
  
  const titleStyles = {
    fontSize: '20px',
    fontWeight: 600,
    color: currentVariant.titleColor,
    marginBottom: '8px'
  };
  
  const descriptionStyles = {
    fontSize: '14px',
    color: currentVariant.descriptionColor,
    lineHeight: '1.5',
    maxWidth: '400px',
    marginBottom: action ? '24px' : 0
  };
  
  const actionButtonStyles = {
    padding: '10px 20px',
    backgroundColor: colors.primary[500],
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease'
  };
  
  // Default icons for different variants
  const defaultIcons = {
    default: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path 
          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" 
          stroke={currentVariant.iconColor} 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </svg>
    ),
    search: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="11" cy="11" r="8" stroke={currentVariant.iconColor} strokeWidth="2"/>
        <path d="M21 21l-4.35-4.35" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    error: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke={currentVariant.iconColor} strokeWidth="2"/>
        <path d="M15 9l-6 6M9 9l6 6" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    success: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M20 6L9 17l-5-5" stroke={currentVariant.iconColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    )
  };
  
  return (
    <div style={containerStyles}>
      <div style={iconContainerStyles}>
        {icon || defaultIcons[variant] || defaultIcons.default}
      </div>
      <h3 style={titleStyles}>{title}</h3>
      {description && (
        <p style={descriptionStyles}>{description}</p>
      )}
      {action && (
        <button 
          style={actionButtonStyles}
          onClick={action}
          onMouseOver={(e) => e.target.style.backgroundColor = colors.primary[600]}
          onMouseOut={(e) => e.target.style.backgroundColor = colors.primary[500]}
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

// Pre-configured empty states
export const NoDataEmptyState = (props) => (
  <EmptyState
    title="No data to display"
    description="There's no data available at the moment. Try adjusting your filters or check back later."
    variant="default"
    {...props}
  />
);

export const SearchEmptyState = ({ searchTerm, ...props }) => (
  <EmptyState
    title="No results found"
    description={`We couldn't find any results for "${searchTerm}". Try searching with different keywords.`}
    variant="search"
    {...props}
  />
);

export const ErrorEmptyState = (props) => (
  <EmptyState
    title="Something went wrong"
    description="We encountered an error while loading your data. Please try again."
    variant="error"
    actionText="Retry"
    {...props}
  />
);

export const NoCampaignsEmptyState = (props) => (
  <EmptyState
    title="No campaigns yet"
    description="Get started by creating your first marketing campaign."
    actionText="Create Campaign"
    icon={
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="6" width="18" height="15" rx="2" stroke={colors.primary[400]} strokeWidth="2"/>
        <path d="M3 10h18M7 2v4M17 2v4" stroke={colors.primary[400]} strokeWidth="2" strokeLinecap="round"/>
        <path d="M12 14v4M10 16h4" stroke={colors.primary[400]} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    }
    {...props}
  />
);

export const FilterEmptyState = (props) => (
  <EmptyState
    title="No matching campaigns"
    description="No campaigns match your current filters. Try adjusting your filter criteria."
    actionText="Clear Filters"
    icon={
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={colors.neutral[400]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    }
    {...props}
  />
);

export default EmptyState;