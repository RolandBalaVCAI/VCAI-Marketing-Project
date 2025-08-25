import { format, subDays, isWithinInterval, parseISO } from 'date-fns';

// Date formatting utilities
export const formatDate = (date, formatString = 'yyyy-MM-dd') => {
  if (!date) return '';
  return format(new Date(date), formatString);
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy HH:mm');
};

export const formatDateShort = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd');
};

// Date range utilities
export const getDateRangeForFilter = (filter, customStart, customEnd) => {
  const today = new Date();
  
  switch (filter) {
    case 'Current Day':
      return { start: today, end: today };
    case 'Yesterday':
      const yesterday = subDays(today, 1);
      return { start: yesterday, end: yesterday };
    case 'Last 7 Days':
      return { start: subDays(today, 7), end: today };
    case 'Last 14 Days':
      return { start: subDays(today, 14), end: today };
    case 'Last 30 Days':
      return { start: subDays(today, 30), end: today };
    case 'Last 90 Days':
      return { start: subDays(today, 90), end: today };
    case 'Custom':
      if (customStart && customEnd) {
        return { 
          start: new Date(customStart + 'T00:00:00'),
          end: new Date(customEnd + 'T23:59:59')
        };
      }
      // Fallback to last 30 days
      return { start: subDays(today, 30), end: today };
    default:
      return { start: subDays(today, 30), end: today };
  }
};

// Check if a campaign is within date range
export const isCampaignInDateRange = (campaign, startDate, endDate) => {
  if (!campaign.startDate || !startDate || !endDate) return true;
  
  const campaignStart = parseISO(campaign.startDate);
  const campaignEnd = campaign.endDate ? parseISO(campaign.endDate) : campaignStart;
  
  // Check if campaign period overlaps with filter range
  return isWithinInterval(campaignStart, { start: startDate, end: endDate }) ||
         isWithinInterval(campaignEnd, { start: startDate, end: endDate }) ||
         (campaignStart <= startDate && campaignEnd >= endDate);
};

// Generate date range for charts
export const generateDateRange = (startDate, endDate, interval = 'day') => {
  const dates = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(new Date(current));
    
    if (interval === 'day') {
      current.setDate(current.getDate() + 1);
    } else if (interval === 'week') {
      current.setDate(current.getDate() + 7);
    } else if (interval === 'month') {
      current.setMonth(current.getMonth() + 1);
    }
  }
  
  return dates;
};

// Get relative time description
export const getRelativeTime = (date) => {
  if (!date) return '';
  
  const now = new Date();
  const targetDate = new Date(date);
  const diffMs = now - targetDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} week${Math.floor(diffDays / 7) > 1 ? 's' : ''} ago`;
  
  return formatDate(date, 'MMM dd, yyyy');
};

// Validate date range inputs
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return false;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  
  // Check if start date is before or equal to end date
  return start <= end;
};