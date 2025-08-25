import React from 'react';
import { colors } from './design-system/tokens';

const ProgressIndicator = ({
  steps = [],
  currentStep = 0,
  variant = 'linear',
  size = 'medium',
  showLabels = true,
  showNumbers = true,
  orientation = 'horizontal',
  style = {}
}) => {
  const sizes = {
    small: {
      stepSize: 24,
      lineThickness: 2,
      fontSize: '12px',
      iconSize: 12
    },
    medium: {
      stepSize: 32,
      lineThickness: 3,
      fontSize: '14px',
      iconSize: 16
    },
    large: {
      stepSize: 40,
      lineThickness: 4,
      fontSize: '16px',
      iconSize: 20
    }
  };
  
  const currentSize = sizes[size] || sizes.medium;
  
  const getStepStatus = (index) => {
    if (index < currentStep) return 'completed';
    if (index === currentStep) return 'active';
    return 'pending';
  };
  
  const getStepColor = (status) => {
    switch (status) {
      case 'completed':
        return colors.success[500];
      case 'active':
        return colors.primary[500];
      case 'pending':
      default:
        return colors.neutral[300];
    }
  };
  
  const renderLinearProgress = () => {
    const containerStyles = {
      display: 'flex',
      flexDirection: orientation === 'horizontal' ? 'row' : 'column',
      alignItems: orientation === 'horizontal' ? 'center' : 'flex-start',
      gap: '0',
      ...style
    };
    
    return (
      <div style={containerStyles}>
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const color = getStepColor(status);
          const isLast = index === steps.length - 1;
          
          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: orientation === 'horizontal' ? 'row' : 'column',
                alignItems: 'center',
                flex: orientation === 'horizontal' && !isLast ? 1 : 'none'
              }}
            >
              {/* Step indicator */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: orientation === 'horizontal' ? 'column' : 'row',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <div
                  style={{
                    width: currentSize.stepSize,
                    height: currentSize.stepSize,
                    borderRadius: '50%',
                    backgroundColor: status === 'pending' ? 'white' : color,
                    border: `${currentSize.lineThickness}px solid ${color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    zIndex: 1,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {status === 'completed' ? (
                    <svg width={currentSize.iconSize} height={currentSize.iconSize} viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : showNumbers ? (
                    <span style={{
                      color: status === 'pending' ? color : 'white',
                      fontSize: currentSize.fontSize,
                      fontWeight: 600
                    }}>
                      {index + 1}
                    </span>
                  ) : null}
                </div>
                
                {showLabels && (
                  <div style={{
                    marginTop: orientation === 'horizontal' ? '8px' : '0',
                    marginLeft: orientation === 'vertical' ? '12px' : '0',
                    textAlign: orientation === 'horizontal' ? 'center' : 'left'
                  }}>
                    <div style={{
                      fontSize: currentSize.fontSize,
                      fontWeight: status === 'active' ? 600 : 400,
                      color: status === 'pending' ? colors.neutral[500] : colors.neutral[700]
                    }}>
                      {step.label || `Step ${index + 1}`}
                    </div>
                    {step.description && (
                      <div style={{
                        fontSize: `calc(${currentSize.fontSize} - 2px)`,
                        color: colors.neutral[500],
                        marginTop: '2px'
                      }}>
                        {step.description}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Connector line */}
              {!isLast && (
                <div
                  style={{
                    flex: orientation === 'horizontal' ? 1 : 'none',
                    height: orientation === 'horizontal' ? currentSize.lineThickness : '40px',
                    width: orientation === 'horizontal' ? 'auto' : currentSize.lineThickness,
                    backgroundColor: status === 'completed' ? color : colors.neutral[300],
                    margin: orientation === 'horizontal' ? `0 16px` : `8px ${currentSize.stepSize / 2}px`,
                    transition: 'background-color 0.3s ease'
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  };
  
  const renderCircularProgress = () => {
    const radius = 80;
    const strokeWidth = 8;
    const circumference = 2 * Math.PI * radius;
    const progress = currentStep / (steps.length - 1);
    const strokeDashoffset = circumference - (progress * circumference);
    
    return (
      <div style={{ position: 'relative', width: 200, height: 200, ...style }}>
        <svg width="200" height="200" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={colors.neutral[200]}
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Progress circle */}
          <circle
            cx="100"
            cy="100"
            r={radius}
            stroke={colors.primary[500]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{
              transition: 'stroke-dashoffset 0.5s ease'
            }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.neutral[800]
          }}>
            {currentStep + 1}/{steps.length}
          </div>
          {steps[currentStep] && (
            <div style={{
              fontSize: '14px',
              color: colors.neutral[600],
              marginTop: '4px'
            }}>
              {steps[currentStep].label}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  const renderDotsProgress = () => {
    return (
      <div style={{
        display: 'flex',
        gap: '8px',
        ...style
      }}>
        {steps.map((_, index) => {
          const status = getStepStatus(index);
          const isActive = status === 'active';
          
          return (
            <div
              key={index}
              style={{
                width: isActive ? '24px' : '8px',
                height: '8px',
                borderRadius: '4px',
                backgroundColor: getStepColor(status),
                transition: 'all 0.3s ease'
              }}
            />
          );
        })}
      </div>
    );
  };
  
  switch (variant) {
    case 'circular':
      return renderCircularProgress();
    case 'dots':
      return renderDotsProgress();
    case 'linear':
    default:
      return renderLinearProgress();
  }
};

// Pre-configured progress indicators
export const StepProgress = ({ steps, currentStep, ...props }) => (
  <ProgressIndicator
    steps={steps}
    currentStep={currentStep}
    variant="linear"
    showLabels={true}
    showNumbers={true}
    {...props}
  />
);

export const SimpleProgress = ({ total, current, ...props }) => {
  const steps = Array.from({ length: total }, (_, i) => ({
    label: ''
  }));
  
  return (
    <ProgressIndicator
      steps={steps}
      currentStep={current}
      variant="dots"
      showLabels={false}
      {...props}
    />
  );
};

export const CircularProgress = ({ percentage, label, ...props }) => {
  const radius = 40;
  const strokeWidth = 6;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100 * circumference);
  
  return (
    <div style={{ position: 'relative', width: 100, height: 100, ...props.style }}>
      <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={colors.neutral[200]}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke={colors.primary[500]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 0.5s ease'
          }}
        />
      </svg>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center'
      }}>
        <div style={{
          fontSize: '20px',
          fontWeight: 600,
          color: colors.neutral[800]
        }}>
          {percentage}%
        </div>
        {label && (
          <div style={{
            fontSize: '12px',
            color: colors.neutral[600]
          }}>
            {label}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressIndicator;