import React, { memo } from 'react';
import { 
  DollarSign, MousePointer, Users, ShoppingCart, 
  TrendingUp, Activity
} from 'lucide-react';
import { formatCurrency, formatPercentage, formatNumber } from '../../utils/calculations';

// Memoized KPI Card Component
const KPICard = memo(({ 
  title, 
  value, 
  icon: Icon, 
  change, 
  changeType, 
  formatter = (val) => val,
  responsive 
}) => {
  const changeColor = changeType === 'positive' ? '#10b981' : 
                     changeType === 'negative' ? '#ef4444' : '#6b7280';
  
  return (
    <div style={{
      backgroundColor: '#ffffff',
      padding: responsive.getCardPadding(),
      borderRadius: '8px',
      border: '1px solid #e0e0e0',
      textAlign: 'center',
      minHeight: responsive.getCardMinHeight()
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        marginBottom: '8px'
      }}>
        <Icon 
          size={responsive.getIconSize()} 
          color="#0066cc" 
          strokeWidth={1.5}
        />
      </div>
      
      <h3 style={{
        margin: 0,
        fontSize: responsive.getFontSize('0.9rem', '1rem'),
        color: '#666',
        fontWeight: '500',
        marginBottom: '4px'
      }}>
        {title}
      </h3>
      
      <div style={{
        fontSize: responsive.getFontSize('1.5rem', '2rem'),
        fontWeight: '700',
        color: '#1a1a1a',
        marginBottom: change ? '4px' : '0'
      }}>
        {formatter(value)}
      </div>
      
      {change && (
        <div style={{
          fontSize: responsive.getFontSize('0.8rem', '0.9rem'),
          color: changeColor,
          fontWeight: '600'
        }}>
          {change > 0 ? '+' : ''}{formatPercentage(change)}
        </div>
      )}
    </div>
  );
});

KPICard.displayName = 'KPICard';

// Memoized KPI Cards Container
const MemoizedKPICards = memo(({ metrics, responsive }) => {
  if (!metrics) return null;

  const kpis = [
    {
      title: 'Total Revenue',
      value: metrics.totalRevenue || 0,
      icon: DollarSign,
      formatter: formatCurrency,
      change: metrics.revenueChange
    },
    {
      title: 'Total Cost',
      value: metrics.totalCost || 0,
      icon: Activity,
      formatter: formatCurrency,
      change: metrics.costChange
    },
    {
      title: 'Total Campaigns',
      value: metrics.totalCampaigns || 0,
      icon: TrendingUp,
      formatter: formatNumber,
      change: metrics.campaignChange
    },
    {
      title: 'Total Sales',
      value: metrics.totalSales || 0,
      icon: ShoppingCart,
      formatter: formatNumber,
      change: metrics.salesChange
    },
    {
      title: 'Unique Clicks',
      value: metrics.totalUniqueClicks || 0,
      icon: MousePointer,
      formatter: formatNumber,
      change: metrics.clicksChange
    },
    {
      title: 'Average ROAS',
      value: metrics.averageROAS || 0,
      icon: Users,
      formatter: (val) => formatPercentage(val),
      change: metrics.roasChange
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: responsive.getKPIGridColumns(),
      gap: responsive.getGridGap(),
      marginBottom: responsive.getMarginBottom()
    }}>
      {kpis.map((kpi) => (
        <KPICard
          key={kpi.title}
          title={kpi.title}
          value={kpi.value}
          icon={kpi.icon}
          formatter={kpi.formatter}
          change={kpi.change}
          changeType={kpi.change > 0 ? 'positive' : kpi.change < 0 ? 'negative' : 'neutral'}
          responsive={responsive}
        />
      ))}
    </div>
  );
});

MemoizedKPICards.displayName = 'MemoizedKPICards';

export default MemoizedKPICards;