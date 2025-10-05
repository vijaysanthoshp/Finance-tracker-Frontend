import api from './api';

const transferAPI = {
  // Get all transfers for the authenticated user
  getAll: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.accountId) queryParams.append('accountId', params.accountId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const queryString = queryParams.toString();
    const url = queryString ? `/transfers?${queryString}` : '/transfers';
    
    return api.get(url);
  },

  // Get a specific transfer by ID
  getById: async (transferId) => {
    return api.get(`/transfers/${transferId}`);
  },

  // Create a new transfer
  create: async (transferData) => {
    return api.post('/transfers', transferData);
  },

  // Update a transfer
  update: async (transferId, transferData) => {
    return api.put(`/transfers/${transferId}`, transferData);
  },

  // Delete a transfer
  delete: async (transferId) => {
    return api.delete(`/transfers/${transferId}`);
  },

  // Get transfer statistics
  getStats: async (accountId, startDate, endDate) => {
    const params = new URLSearchParams();
    if (accountId) params.append('accountId', accountId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    return api.get(`/transfers/stats?${params.toString()}`);
  }
};

export default transferAPI;