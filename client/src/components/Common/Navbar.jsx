import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, LogOut, LayoutDashboard, Package, UserCircle, Pizza } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { itemCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand" aria-label="CrustCraft Home">
          <span className="brand-icon"><Pizza size={20} color="white" /></span>
          <span>CrustCraft</span>
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/menu">Menu</NavLink>
          <NavLink to="/custom-pizza">Custom Pizza</NavLink>
          {isAdmin && <NavLink to="/admin">Admin Panel</NavLink>}
        </div>

        <div className="navbar-actions">
          <Link to="/cart" className="cart-btn" aria-label={`Cart with ${itemCount} items`}>
            <ShoppingCart size={22} />
            {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
          </Link>

          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button
                className="user-menu-trigger"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                aria-label="User menu"
              >
                <User size={18} />
                <span>{user?.name?.split(' ')[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="user-menu-dropdown" role="menu">
                  <Link to="/dashboard" onClick={() => setUserMenuOpen(false)} role="menuitem">
                    <LayoutDashboard size={16} /> Dashboard
                  </Link>
                  <Link to="/orders" onClick={() => setUserMenuOpen(false)} role="menuitem">
                    <Package size={16} /> My Orders
                  </Link>
                  <Link to="/profile" onClick={() => setUserMenuOpen(false)} role="menuitem">
                    <UserCircle size={16} /> Profile
                  </Link>
                  <button onClick={handleLogout} role="menuitem">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Login</Link>
          )}

          <button className="mobile-menu-btn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu size={24} />
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <div className={`mobile-nav ${menuOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <button className="mobile-nav-close" onClick={() => setMenuOpen(false)} aria-label="Close menu">
          <X size={28} />
        </button>
        <Link to="/" onClick={() => setMenuOpen(false)}>Home</Link>
        <Link to="/menu" onClick={() => setMenuOpen(false)}>Menu</Link>
        <Link to="/custom-pizza" onClick={() => setMenuOpen(false)}>Custom Pizza</Link>
        <Link to="/cart" onClick={() => setMenuOpen(false)}>Cart ({itemCount})</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            <Link to="/orders" onClick={() => setMenuOpen(false)}>Orders</Link>
            <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
            <button onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ color: 'var(--color-danger)', textAlign: 'left', fontSize: 'var(--fs-xl)', fontFamily: 'var(--font-heading)', fontWeight: 600, padding: 'var(--space-3) 0', borderBottom: '1px solid var(--color-border)' }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" onClick={() => setMenuOpen(false)}>Login</Link>
            <Link to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
