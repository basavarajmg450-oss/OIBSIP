import React from 'react';

export default function StatCard({ label, value, icon, variant = '' }) {
  return (
    <div className={`stat-card ${variant}`}>
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div className="stat-card-label">{label}</div>
      <div className="stat-card-value">{value}</div>
    </div>
  );
}
