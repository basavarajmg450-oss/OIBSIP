import api from './api';

export const confirmOrder = (data) => api.post('/orders/confirm', data);
export const createOrder = (data) => api.post('/orders/confirm', data);
export const getUserOrders = () => api.get('/orders');
export const getOrderById = (id) => api.get(`/orders/${id}`);
