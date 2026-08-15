import api from './axios';

export const needApi = {
  getNeeds: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.city) params.append('city', filters.city);
    if (filters.urgencyLevel) params.append('urgencyLevel', filters.urgencyLevel);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const response = await api.get(`/api/needs${queryString}`);
    return response.data;
  },

  getNeedById: async (id) => {
    const response = await api.get(`/api/needs/${id}`);
    return response.data;
  },

  createNeed: async (needData) => {
    const response = await api.post('/api/needs', needData);
    return response.data;
  },
};
