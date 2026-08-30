import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { resetPassword } from '../services/authService';
import { useToast } from '../hooks/useToast';
import { validatePassword, getPasswordStrength } from '../utils/validators';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    const passErr = validatePassword(password);
    if (passErr) e.password = passErr;
    if (password !== confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await resetPassword(token, password);
      if (res.data?.success) {
        addToast(res.data.message || 'Password reset successful! You can now log in.', 'success');
        navigate('/login');
      } else {
        const msg = res.data?.message || 'Password reset failed. Please try again.';
        addToast(msg, 'error');
        setErrors({ form: msg });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. The link may have expired or is invalid.';
      addToast(msg, 'error');
      setErrors({ form: msg });
    } finally {
      setLoading(false);
    }
  };

  const strength = getPasswordStrength(password);

  return (
    <div className="auth-page">
      <div className="auth-card animate-slideUp">
        <div className="auth-header">
          <h1>Reset Password</h1>
          <p className="text-muted">Create a secure new password for your account.</p>
        </div>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="new-password" className="form-label">New Password</label>
            <input
              id="new-password"
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby="reset-strength-bar"
            />
            <div className="password-strength" id="reset-strength-bar" aria-label={`Password strength: ${strength}/4`}>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className={`password-strength-bar ${i <= strength ? (strength <= 1 ? 'weak' : strength <= 2 ? 'medium' : 'strong') : ''}`}></div>
              ))}
            </div>
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>
          <div className="form-group">
            <label htmlFor="confirm-password" className="form-label">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Re-enter new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>
          {errors.form && <p className="form-error mb-4">{errors.form}</p>}
          <button type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
            {loading ? 'Resetting password...' : 'Reset Password'}
          </button>
        </form>
        <div className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}
