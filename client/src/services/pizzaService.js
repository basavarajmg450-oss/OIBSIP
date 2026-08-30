import api from './api';

export const getAllPizzas = (params = {}) => api.get('/pizzas', { params });
export const getPizzaById = (id) => api.get(`/pizzas/${id}`);
export const getCustomPizzaOptions = () => api.get('/pizzas/custom-options');
