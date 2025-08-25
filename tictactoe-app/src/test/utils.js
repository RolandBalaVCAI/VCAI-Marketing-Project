import { render } from '@testing-library/react';
import { vi } from 'vitest';

// Mock data generators
export const createMockCampaign = (overrides = {}) => ({
  id: `camp_${Date.now()}`,
  name: 'Test Campaign',
  status: 'Active',
  vendor: 'Google Ads',
  startDate: '2024-01-01T00:00:00Z',
  endDate: '2024-12-31T23:59:59Z',
  manager: 'Test Manager',
  adPlacementDomain: 'example.com',
  device: ['desktop', 'mobile'],
  targeting: {
    interests: ['technology', 'business'],
    demographics: {
      ageRange: '25-54',
      gender: 'all'
    },
    location: ['United States']
  },
  repContactInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123'
  },
  metrics: {
    cost: 1000,
    revenue: 3000,
    rawClicks: 500,
    uniqueClicks: 400,
    impressions: 10000,
    confirmReg: 50,
    sales: 25
  },
  notes: [],
  documents: [],
  visualMedia: [],
  changeHistory: [],
  ...overrides
});

export const createMockCampaigns = (count = 5) => {
  return Array.from({ length: count }, (_, index) => 
    createMockCampaign({
      id: `camp_${index + 1}`,
      name: `Campaign ${index + 1}`,
      metrics: {
        cost: (index + 1) * 1000,
        revenue: (index + 1) * 2500,
        rawClicks: (index + 1) * 100,
        uniqueClicks: (index + 1) * 80,
        impressions: (index + 1) * 2000,
        confirmReg: (index + 1) * 10,
        sales: (index + 1) * 5
      }
    })
  );
};

export const createMockNote = (overrides = {}) => ({
  id: `note_${Date.now()}`,
  text: 'Test note',
  author: 'Test User',
  timestamp: new Date().toISOString(),
  ...overrides
});

export const createMockDocument = (overrides = {}) => ({
  id: `doc_${Date.now()}`,
  name: 'test-document.pdf',
  type: 'application/pdf',
  size: 1024000,
  uploadedBy: 'Test User',
  uploadDate: new Date().toISOString(),
  url: '/api/documents/test-document.pdf',
  ...overrides
});

export const createMockMedia = (overrides = {}) => ({
  id: `media_${Date.now()}`,
  name: 'test-image.jpg',
  type: 'image/jpeg',
  url: 'https://example.com/image.jpg',
  thumbnail: 'base64-thumbnail',
  uploadedBy: 'Test User',
  uploadDate: new Date().toISOString(),
  ...overrides
});

// Mock API responses
export const createMockAPIResponse = (data, success = true) => ({
  success,
  data,
  ...(success ? {} : { error: data })
});

export const createMockPaginationResponse = (items, page = 1, limit = 20) => {
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / limit);
  const startIndex = (page - 1) * limit;
  const paginatedItems = items.slice(startIndex, startIndex + limit);

  return createMockAPIResponse({
    campaigns: paginatedItems,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  });
};

// Mock API client
export const createMockAPIClient = () => ({
  getCampaigns: vi.fn(),
  getCampaign: vi.fn(),
  createCampaign: vi.fn(),
  updateCampaign: vi.fn(),
  deleteCampaign: vi.fn(),
  addNoteToCampaign: vi.fn(),
  uploadDocumentToCampaign: vi.fn(),
  addVisualMediaToCampaign: vi.fn(),
  getServerStats: vi.fn(),
  resetData: vi.fn()
});

// Custom render function with providers
export const renderWithProviders = (ui, options = {}) => {
  const { initialState = {}, ...renderOptions } = options;

  // Mock any required providers here
  const Wrapper = ({ children }) => {
    return children; // Add providers when needed
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Wait utilities
export const waitForLoadingToFinish = async () => {
  // Wait for any loading states to complete
  await new Promise(resolve => setTimeout(resolve, 0));
};

// Event helpers
export const createMockEvent = (type, properties = {}) => ({
  type,
  preventDefault: vi.fn(),
  stopPropagation: vi.fn(),
  target: {
    value: '',
    name: '',
    checked: false,
    ...properties.target
  },
  currentTarget: {
    value: '',
    name: '',
    checked: false,
    ...properties.currentTarget
  },
  ...properties
});

// Date helpers for tests
export const createDateRange = (daysFromNow = 0, daysLength = 30) => {
  const start = new Date();
  start.setDate(start.getDate() + daysFromNow);
  
  const end = new Date(start);
  end.setDate(end.getDate() + daysLength);
  
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString()
  };
};

// Assertion helpers
export const expectElementToBeInTheDocument = (element) => {
  expect(element).toBeInTheDocument();
};

export const expectElementToHaveText = (element, text) => {
  expect(element).toHaveTextContent(text);
};

export const expectElementToBeVisible = (element) => {
  expect(element).toBeVisible();
};

// Mock store helpers
export const createMockStore = (initialState = {}) => ({
  getState: () => initialState,
  setState: vi.fn(),
  subscribe: vi.fn(),
  destroy: vi.fn()
});

// File upload helpers
export const createMockFile = (name = 'test.txt', type = 'text/plain', size = 1024) => {
  const file = new File(['test content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Network helpers
export const createMockResponse = (data, status = 200, headers = {}) => ({
  status,
  statusText: status === 200 ? 'OK' : 'Error',
  headers: {
    'content-type': 'application/json',
    ...headers
  },
  data
});

// Error helpers
export const createMockError = (message = 'Test error', status = 500, category = 'server') => {
  const error = new Error(message);
  error.response = {
    status,
    data: {
      error: {
        category,
        message,
        severity: 'high',
        isRetryable: status >= 500
      }
    }
  };
  return error;
};