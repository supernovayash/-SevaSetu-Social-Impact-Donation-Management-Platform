import api from './axios';

export const paymentApi = {
  createOrder: async (donationId) => {
    const response = await api.post(`/api/payments/order/${donationId}`);
    return response.data;
  },

  verifyPayment: async (payload) => {
    // payload: { razorpayOrderId, razorpayPaymentId, razorpaySignature }
    const response = await api.post('/api/payments/verify', payload);
    return response.data;
  },
};
