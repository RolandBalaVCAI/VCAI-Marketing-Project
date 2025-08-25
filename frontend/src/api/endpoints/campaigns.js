import mockAPIServer from '../mock/server';
// import { apiRequest } from '../client'; // For future real API integration

// Campaign API endpoints with enhanced HTTP client integration
export const campaignsAPI = {
  // GET /api/campaigns - List campaigns with filtering, sorting, and pagination
  async getCampaigns(params = {}) {
    try {
      const response = await mockAPIServer.getCampaigns(params);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // GET /api/campaigns/:id - Get single campaign by ID
  async getCampaignById(id) {
    try {
      const response = await mockAPIServer.getCampaignById(id);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // POST /api/campaigns - Create new campaign
  async createCampaign(campaignData) {
    try {
      const response = await mockAPIServer.createCampaign(campaignData);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // PUT /api/campaigns/:id - Update existing campaign
  async updateCampaign(id, updates) {
    try {
      const response = await mockAPIServer.updateCampaign(id, updates);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // DELETE /api/campaigns/:id - Delete campaign
  async deleteCampaign(id) {
    try {
      const response = await mockAPIServer.deleteCampaign(id);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // POST /api/campaigns/:id/notes - Add note to campaign
  async addNoteToCampaign(id, noteData) {
    try {
      const response = await mockAPIServer.addNoteToCampaign(id, noteData);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // POST /api/campaigns/:id/documents - Upload document to campaign
  async uploadDocumentToCampaign(id, documentData) {
    try {
      const response = await mockAPIServer.uploadDocumentToCampaign(id, documentData);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // POST /api/campaigns/:id/media - Add visual media to campaign
  async addVisualMediaToCampaign(id, mediaData) {
    try {
      const response = await mockAPIServer.addVisualMediaToCampaign(id, mediaData);
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500,
          details: error.details || {}
        }
      };
    }
  },

  // Utility endpoints
  async getServerStats() {
    try {
      const stats = mockAPIServer.getServerStats();
      return {
        success: true,
        data: stats,
        meta: {}
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500
        }
      };
    }
  },

  async resetData() {
    try {
      const response = await mockAPIServer.resetData();
      return {
        success: true,
        ...response
      };
    } catch (error) {
      return {
        success: false,
        error: {
          code: error.code || 'UNKNOWN_ERROR',
          message: error.message || 'An unexpected error occurred',
          status: error.status || 500
        }
      };
    }
  }
};

// Enhanced campaign API that will use real HTTP requests when ready
export const campaignApi = {
  // Get all campaigns with filtering
  getAll: async (filters = {}) => {
    // For now, use mock server
    return await mockAPIServer.getCampaigns(filters);
    
    // When ready for real API:
    // const response = await apiRequest.get('/campaigns', { params: filters });
    // return { success: true, data: response.data.data, meta: response.data.meta };
  },
  
  // Get single campaign
  getById: async (id) => {
    return await mockAPIServer.getCampaignById(id);
    // const response = await apiRequest.get(`/campaigns/${id}`);
    // return { success: true, data: response.data.data };
  },
  
  // Create new campaign
  create: async (campaignData) => {
    return await mockAPIServer.createCampaign(campaignData);
    // const response = await apiRequest.post('/campaigns', campaignData);
    // return { success: true, data: response.data.data };
  },
  
  // Update campaign
  update: async (id, updates) => {
    return await mockAPIServer.updateCampaign(id, updates);
    // const response = await apiRequest.put(`/campaigns/${id}`, updates);
    // return { success: true, data: response.data.data };
  },
  
  // Delete campaign
  delete: async (id) => {
    return await mockAPIServer.deleteCampaign(id);
    // const response = await apiRequest.delete(`/campaigns/${id}`);
    // return { success: true, message: 'Campaign deleted successfully' };
  },
  
  // Add note to campaign
  addNote: async (campaignId, noteText, user) => {
    return await mockAPIServer.addNoteToCampaign(campaignId, { text: noteText, user });
    // const response = await apiRequest.post(`/campaigns/${campaignId}/notes`, { text: noteText, user });
    // return { success: true, data: response.data.data };
  },
  
  // Upload document
  uploadDocument: async (campaignId, file, user) => {
    return await mockAPIServer.uploadDocumentToCampaign(campaignId, { file, user });
    // const formData = new FormData();
    // formData.append('document', file);
    // formData.append('uploadedBy', user);
    // const response = await apiRequest.post(`/campaigns/${campaignId}/documents`, formData, {
    //   headers: { 'Content-Type': 'multipart/form-data' }
    // });
    // return { success: true, data: response.data.data };
  },
  
  // Add visual media
  addMedia: async (campaignId, mediaData, user) => {
    return await mockAPIServer.addVisualMediaToCampaign(campaignId, { ...mediaData, user });
    // const response = await apiRequest.post(`/campaigns/${campaignId}/media`, { ...mediaData, addedBy: user });
    // return { success: true, data: response.data.data };
  }
};

export default campaignsAPI;