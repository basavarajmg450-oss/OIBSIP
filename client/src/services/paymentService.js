import api from './api';

export const createPaymentSession = (data) => api.post('/payments/create-session', data);
export const createPaymentOrder = (data) => api.post('/payments/create-session', data);
export const verifyPayment = (data) => api.post('/payments/verify', data);
