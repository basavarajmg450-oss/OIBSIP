import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Warehouse, LogOut, Pizza } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AdminLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
        <div className="admin-sidebar-brand">
          <Pizza size={22} /> CrustCraft Admin
        </div>
        <nav className="admin-nav">
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Orders
          </NavLink>
          <NavLink to="/admin/inventory" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
            <Warehouse size={18} /> Inventory
          </NavLink>
        </nav>
        <button className="admin-nav-link" onClick={handleLogout} style={{ marginTop: 'auto' }}>
          <LogOut size={18} /> Logout
        </button>
      </aside>
      <div className="admin-content">
        <Outlet />
      </div>
    </div>
  );
}
