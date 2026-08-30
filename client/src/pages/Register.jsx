import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { validateEmail, validatePassword, getPasswordStrength } from '../utils/validators';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { register } = useAuth();
  const { addToast } = useToast();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    else if (form.name.trim().length < 2) e.name = 'Name must be at least 2 characters';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Invalid email format';
    const passErr = validatePassword(form.password);
    if (passErr) e.password = passErr;
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      setSuccess(true);
      addToast('Registration successful! Please check your email.', 'success');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      addToast(msg, 'error');
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(form.password);

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-card text-center">
          <div style={{ fontSize: 48, marginBottom: 'var(--space-4)' }}>✉️</div>
          <h1 style={{ fontSize: 'var(--fs-xl)', marginBottom: 'var(--space-3)' }}>Check Your Email</h1>
          <p className="text-muted">We sent a verification link to <strong>{form.email}</strong>. Click the link to verify your account.</p>
          <Link to="/login" className="btn btn-primary mt-6 w-full">Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join CrustCraft and start ordering!</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="reg-name" className="form-label">Full Name</label>
            <input id="reg-name" type="text" className={`form-input ${errors.name ? 'error' : ''}`} placeholder="John Doe"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} aria-describedby={errors.name ? 'reg-name-err' : undefined} />
            {errors.name && <p className="form-error" id="reg-name-err">{errors.name}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="reg-email" className="form-label">Email</label>
            <input id="reg-email" type="email" className={`form-input ${errors.email ? 'error' : ''}`} placeholder="john@example.com"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} aria-describedby={errors.email ? 'reg-email-err' : undefined} />
            {errors.email && <p className="form-error" id="reg-email-err">{errors.email}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="reg-password" className="form-label">Password</label>
            <input id="reg-password" type="password" className={`form-input ${errors.password ? 'error' : ''}`} placeholder="Min 8 chars with a number"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} aria-describedby="reg-pass-strength" />
            <div className="password-strength" id="reg-pass-strength" aria-label={`Password strength: ${strength}/4`}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`password-strength-bar ${i <= strength ? (strength <= 1 ? 'weak' : strength <= 2 ? 'medium' : 'strong') : ''}`}></div>
              ))}
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="reg-confirm" className="form-label">Confirm Password</label>
            <input id="reg-confirm" type="password" className={`form-input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Re-enter password"
              value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>
          {errors.form && <p className="form-error mb-4">{errors.form}</p>}
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
