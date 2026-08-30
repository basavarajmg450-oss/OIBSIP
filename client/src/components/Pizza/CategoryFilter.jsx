import React from 'react';

const CATEGORIES = ['All', 'Veg', 'Non-Veg', 'Specialty'];

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="category-filter" role="tablist" aria-label="Pizza categories">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`category-tab ${active === cat ? 'active' : ''}`}
          onClick={() => onChange(cat)}
          role="tab"
          aria-selected={active === cat}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
