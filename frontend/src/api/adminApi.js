import api from './axios';

export const adminApi = {
  getPendingInstitutions: async () => {
    const response = await api.get('/api/admin/institutions/pending');
    return response.data;
  },

  verifyInstitution: async (id, approve) => {
    const response = await api.patch(`/api/admin/institutions/${id}/verify`, null, {
      params: { approve },
    });
    return response.data;
  },
};
