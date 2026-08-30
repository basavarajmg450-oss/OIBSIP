import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail } from '../utils/validators';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

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
      await login(email, password);
      addToast('Welcome back to CrustCraft!', 'success');
      const redirect = searchParams.get('redirect') || '/dashboard';
      navigate(redirect);
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid email or password';
      addToast(msg, 'error');
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      addToast('Please enter your email address first', 'warning');
      return;
    }
    setResending(true);
    try {
      const { resendVerification } = await import('../services/authService');
      const res = await resendVerification(email.trim());
      addToast(res.data.message || 'Verification email resent!', 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to resend verification email.', 'error');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="auth-header">
          <h1>Sign In</h1>
          <p>Welcome back! Let&apos;s get you some pizza.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="login-email" className="form-label">Email</label>
            <input
              id="login-email"
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={errors.email ? 'login-email-err' : undefined}
            />
            {errors.email && <p className="form-error" id="login-email-err">{errors.email}</p>}
          </div>
          <div className="form-group">
            <div className="flex-between mb-2">
              <label htmlFor="login-password" className="form-label" style={{ margin: 0 }}>Password</label>
              <Link to="/forgot-password" style={{ fontSize: 'var(--fs-xs)' }}>Forgot password?</Link>
            </div>
            <input
              id="login-password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={errors.password ? 'login-password-err' : undefined}
            />
            {errors.password && <p className="form-error" id="login-password-err">{errors.password}</p>}
          </div>
          {errors.form && (
            <div className="mb-4">
              <p className="form-error">{errors.form}</p>
              {errors.form.toLowerCase().includes('verify') && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm mt-2 w-full"
                  onClick={handleResendVerification}
                  disabled={resending}
                  style={{ color: 'var(--color-primary)', border: '1px dashed var(--color-primary)' }}
                >
                  {resending ? 'Resending Link...' : 'Resend Verification Email'}
                </button>
              )}
            </div>
          )}
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-divider">or</div>
        <div className="auth-footer" style={{ marginTop: 0 }}>
          Don&apos;t have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
