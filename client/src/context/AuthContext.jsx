import React, { createContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      setLoading(false);
      return;
    }
    try {
      const res = await authService.getMe();
      setUser(res.data.data);
      setToken(storedToken);
    } catch (err) {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const adminLogin = async (email, password) => {
    const { adminLogin: adminLoginApi } = await import('../services/adminService');
    const res = await adminLoginApi({ email, password });
    const { token: newToken, user: userData } = res.data.data;
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{
      user, token, loading, isAuthenticated, isAdmin,
      login, adminLogin, register, logout, loadUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};
