import React from 'react';
import { Check } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

const STATUSES = ['Order Received', 'In Kitchen', 'Sent to Delivery', 'Delivered'];

export default function OrderStatusTracker({ currentStatus, statusHistory = [] }) {
  const currentIdx = STATUSES.indexOf(currentStatus);
  const isCancelled = currentStatus === 'Cancelled';

  return (
    <div className="status-tracker" role="progressbar" aria-valuenow={currentIdx + 1} aria-valuemin={1} aria-valuemax={STATUSES.length}>
      {STATUSES.map((status, idx) => {
        const isCompleted = idx < currentIdx;
        const isActive = idx === currentIdx;
        const historyEntry = statusHistory?.find(h => h.status === status);

        return (
          <div key={status} className="status-step">
            <div className={`status-dot ${isCompleted ? 'completed' : ''} ${isActive && !isCancelled ? 'active' : ''}`}>
              {isCompleted && <Check size={16} />}
              {isActive && !isCancelled && <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }}></span>}
            </div>
            <span className={`status-label ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
              {status}
            </span>
            {historyEntry && (
              <span className="status-time">{formatDate(historyEntry.timestamp)}</span>
            )}
          </div>
        );
      })}
      {isCancelled && (
        <div className="status-step">
          <div className="status-dot" style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger)', color: 'white' }}>✕</div>
          <span className="status-label" style={{ color: 'var(--color-danger)' }}>Cancelled</span>
        </div>
      )}
    </div>
  );
}
