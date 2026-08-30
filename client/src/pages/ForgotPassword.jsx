import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import { useToast } from '../hooks/useToast';
import { validateEmail } from '../utils/validators';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const validate = () => {
    if (!email.trim()) {
      setError('Email is required');
      return false;
    }
    if (!validateEmail(email)) {
      setError('Invalid email format');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await forgotPassword(email);
      setSuccess(true);
      addToast('Reset password email sent! Please check your inbox.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send reset email.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div style={{ fontSize: '48px', marginBottom: 'var(--space-4)' }}>✉️</div>
          <h1>Email Sent</h1>
          <p className="text-muted mb-6">We have sent a password reset link to <strong>{email}</strong>. Please check your spam folder if you do not receive it in a few minutes.</p>
          <Link to="/login" className="btn btn-primary w-full">Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="auth-header">
          <h1>Forgot Password</h1>
          <p className="text-muted">Enter your email and we&apos;ll send you a link to reset your password.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="forgot-email" className="form-label">Email Address</label>
            <input
              id="forgot-email"
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? 'forgot-email-err' : undefined}
            />
            {error && <p className="form-error" id="forgot-email-err">{error}</p>}
          </div>
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Sending link...' : 'Send Reset Link'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
