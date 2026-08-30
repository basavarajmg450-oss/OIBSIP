import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Providers
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { SocketProvider } from './context/SocketContext';
import { ToastProvider } from './context/ToastContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

// Common Components
import ProtectedRoute from './components/Common/ProtectedRoute';
import ToastContainer from './components/Common/Toast';

// Public Pages
import Home from './pages/Home';
import Menu from './pages/Menu';
import PizzaDetail from './pages/PizzaDetail';
import CustomPizza from './pages/CustomPizza';
import Cart from './pages/Cart';

// Auth Pages
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import AdminLogin from './pages/AdminLogin';

// User Protected Pages
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';

// Admin Protected Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminOrders from './pages/AdminOrders';
import AdminInventory from './pages/AdminInventory';

export default function App() {
  return (
    <Router>
      <ToastProvider>
        <AuthProvider>
          <SocketProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                <Routes>
                  {/* Public & Customer Routes wrapped in MainLayout */}
                  <Route path="/" element={<MainLayout />}>
                    <Route index element={<Home />} />
                    <Route path="menu" element={<Menu />} />
                    <Route path="pizza/:id" element={<PizzaDetail />} />
                    <Route path="custom-pizza" element={<CustomPizza />} />
                    <Route path="cart" element={<Cart />} />

                    {/* Auth routes */}
                    <Route path="register" element={<Register />} />
                    <Route path="verify-email" element={<VerifyEmail />} />
                    <Route path="login" element={<Login />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password/:token" element={<ResetPassword />} />

                    {/* Protected User Routes */}
                    <Route path="dashboard" element={
                      <ProtectedRoute>
                        <Dashboard />
                      </ProtectedRoute>
                    } />
                    <Route path="orders" element={
                      <ProtectedRoute>
                        <Orders />
                      </ProtectedRoute>
                    } />
                    <Route path="order/:id" element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="orders/:id" element={
                      <ProtectedRoute>
                        <OrderDetail />
                      </ProtectedRoute>
                    } />
                    <Route path="profile" element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } />
                    <Route path="checkout" element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    } />
                  </Route>

                  {/* Admin Auth Route (No Layout) */}
                  <Route path="/admin/login" element={<AdminLogin />} />

                  {/* Protected Admin Routes wrapped in AdminLayout */}
                  <Route path="/admin" element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="inventory" element={<AdminInventory />} />
                  </Route>

                  {/* Catch-all redirect */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
                
                {/* Global toast notification system overlay */}
                <ToastContainer />
              </div>
            </CartProvider>
          </SocketProvider>
        </AuthProvider>
      </ToastProvider>
    </Router>
  );
}
