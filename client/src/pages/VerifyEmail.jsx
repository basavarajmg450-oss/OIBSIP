import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import { useToast } from '../hooks/useToast';
import LoadingSpinner from '../components/Common/LoadingSpinner';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');
  const { addToast } = useToast();
  const verifiedRef = useRef(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setErrorMsg('Invalid or missing verification token.');
      return;
    }

    if (verifiedRef.current) return;
    verifiedRef.current = true;

    const doVerification = async () => {
      try {
        await verifyEmail(token);
        setStatus('success');
        addToast('Email verified successfully! You can now log in.', 'success');
      } catch (err) {
        setStatus('error');
        setErrorMsg(err.response?.data?.message || 'Verification failed. The token may be invalid or expired.');
        addToast(err.response?.data?.message || 'Verification failed.', 'error');
      }
    };

    doVerification();
  }, [searchParams, addToast]);

  return (
    <div className="auth-page">
      <div className="auth-card text-center animate-slideUp">
        {status === 'loading' && (
          <>
            <LoadingSpinner size="lg" />
            <h1 className="mt-4">Verifying Email</h1>
            <p className="text-muted">Please wait while we verify your email address...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>✅</div>
            <h1>Verification Successful</h1>
            <p className="text-muted mb-6">Your email address has been verified. You can now access all features of CrustCraft.</p>
            <Link to="/login" className="btn btn-primary w-full">Go to Login</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: '64px', marginBottom: 'var(--space-4)' }}>❌</div>
            <h1>Verification Failed</h1>
            <p className="text-danger mb-6">{errorMsg}</p>
            <div className="flex flex-col gap-3 w-full">
              <Link to="/register" className="btn btn-primary">Create New Account</Link>
              <Link to="/login" className="btn btn-ghost">Back to Login</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
