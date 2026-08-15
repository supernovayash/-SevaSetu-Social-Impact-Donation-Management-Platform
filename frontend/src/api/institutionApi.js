import api from './axios';

export const institutionApi = {
  getMyInstitution: async () => {
    const response = await api.get('/api/institutions/me');
    return response.data;
  },
};
