import React from 'react';

export default function LoadingSpinner({ size = 'md', message = '' }) {
  return (
    <div className="spinner-container" role="status" aria-label="Loading">
      <div className={`spinner ${size}`}></div>
      {message && <p className="spinner-text">{message}</p>}
      <span className="sr-only">Loading...</span>
    </div>
  );
}
