// API endpoints index - centralized export of all endpoints

export { campaignsAPI, default as campaigns } from './campaigns';

// Add other endpoint modules here as they're created
// export { vendorsAPI, default as vendors } from './vendors';
// export { analyticsAPI, default as analytics } from './analytics';

// Combined API object for easy access
export const api = {
  campaigns: require('./campaigns').default
  // vendors: require('./vendors').default,
  // analytics: require('./analytics').default
};

export default api;