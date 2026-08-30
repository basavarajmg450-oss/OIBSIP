import api from './api';

export const adminLogin = (data) => api.post('/admin/login', data);
export const getDashboard = () => api.get('/admin/dashboard');
export const getOrders = (params = {}) => api.get('/admin/orders', { params });
export const getOrderById = (id) => api.get(`/admin/orders/${id}`);
export const updateOrderStatus = (id, status) => api.put(`/admin/orders/${id}/status`, { status });
export const getInventory = (params = {}) => api.get('/admin/inventory', { params });
export const addInventoryItem = (data) => api.post('/admin/inventory', data);
export const updateInventoryItem = (id, data) => api.put(`/admin/inventory/${id}`, data);
export const deleteInventoryItem = (id) => api.delete(`/admin/inventory/${id}`);
