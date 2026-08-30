import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail } from '../utils/validators';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!email.trim()) e.email = 'Email is required';
    else if (!validateEmail(email)) e.email = 'Invalid email format';
    if (!password) e.password = 'Password is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await adminLogin(email, password);
      addToast('Welcome back, Admin!', 'success');
      navigate('/admin');
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid admin credentials';
      addToast(msg, 'error');
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page" style={{ background: '#09090b' }}>
      <div className="auth-card animate-slideUp" style={{ background: '#18181b', borderColor: '#27272a' }}>
        <div className="auth-header">
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-3)' }}>🍕⚙️</div>
          <h1 style={{ color: 'var(--color-primary)' }}>Admin Dashboard Access</h1>
          <p className="text-muted">Enter administrative credentials to continue.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="admin-email" className="form-label">Email Address</label>
            <input
              id="admin-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="admin@crustcraft.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ background: '#09090b', borderColor: '#27272a' }}
            />
            {errors.email && <p className="form-error">{errors.email}</p>}
          </div>

          <div className="form-group">
            <label htmlFor="admin-password" className="form-label">Password</label>
            <input
              id="admin-password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ background: '#09090b', borderColor: '#27272a' }}
            />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {errors.form && <p className="form-error mb-4">{errors.form}</p>}

          <button type="submit" className="btn btn-primary w-full btn-lg mt-4" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
