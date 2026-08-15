import api from './axios';

export const logisticsApi = {
  assignVolunteer: async ({ donationId, volunteerId, notes }) => {
    const response = await api.post('/api/logistics/assign', {
      donationId,
      volunteerId,
      notes,
    });
    return response.data;
  },

  markPickedUp: async (donationId) => {
    const response = await api.patch(`/api/logistics/${donationId}/picked-up`);
    return response.data;
  },

  markDelivered: async (donationId) => {
    const response = await api.patch(`/api/logistics/${donationId}/delivered`);
    return response.data;
  },

  submitProof: async ({ donationId, description, imageUrl }) => {
    const response = await api.post('/api/logistics/proof', {
      donationId,
      description,
      imageUrl,
    });
    return response.data;
  },
};
