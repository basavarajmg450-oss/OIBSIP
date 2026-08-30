import api from './api';

export const register = (data) => api.post('/auth/register', data);
export const verifyEmail = (token) => api.get(`/auth/verify-email?token=${token}`);
export const login = (data) => api.post('/auth/login', data);
export const forgotPassword = (email) => api.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) => api.post('/auth/reset-password', { token, newPassword });
export const getMe = () => api.get('/users/me');
export const updateProfile = (data) => api.put('/users/me', data);
export const resendVerification = (email) => api.post('/auth/resend-verification', { email });

