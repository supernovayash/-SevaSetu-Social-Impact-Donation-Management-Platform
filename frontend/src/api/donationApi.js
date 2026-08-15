import api from './axios';

export const donationApi = {
  createDonation: async (donationData) => {
    const response = await api.post('/api/donations', donationData);
    return response.data;
  },

  getMyHistory: async () => {
    const response = await api.get('/api/donations/my-history');
    return response.data;
  },

  getOpenDonations: async () => {
    const response = await api.get('/api/donations/open');
    return response.data;
  },

  claimDonation: async (id) => {
    const response = await api.patch(`/api/donations/${id}/claim`);
    return response.data;
  },

  getTimeline: async (id) => {
    const response = await api.get(`/api/donations/${id}/timeline`);
    return response.data;
  },

  updateStatus: async (id, status, note = '') => {
    const response = await api.patch(`/api/donations/${id}/status`, null, {
      params: { status, note },
    });
    return response.data;
  },
};
