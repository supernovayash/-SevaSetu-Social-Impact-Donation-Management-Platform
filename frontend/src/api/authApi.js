import api from './axios';

export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },

  registerDonor: async (data) => {
    const response = await api.post('/api/auth/register/donor', data);
    return response.data;
  },

  registerInstitution: async (data) => {
    const response = await api.post('/api/auth/register/institution', data);
    return response.data;
  },

  registerVolunteer: async (data) => {
    const response = await api.post('/api/auth/register/volunteer', data);
    return response.data;
  },
};
