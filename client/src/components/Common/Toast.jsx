import React, { useContext } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ToastContext } from '../../context/ToastContext';

const icons = {
  success: <CheckCircle size={18} color="var(--color-success)" />,
  error: <AlertCircle size={18} color="var(--color-danger)" />,
  warning: <AlertTriangle size={18} color="var(--color-warning)" />,
  info: <Info size={18} color="var(--color-info)" />,
};

export default function ToastContainer() {
  const { toasts, removeToast } = useContext(ToastContext);
  if (!toasts.length) return null;

  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`} role="alert">
          <span className="toast-icon">{icons[t.type] || icons.info}</span>
          <span className="toast-content"><span className="toast-message">{t.message}</span></span>
          <button className="toast-close" onClick={() => removeToast(t.id)} aria-label="Dismiss">
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
