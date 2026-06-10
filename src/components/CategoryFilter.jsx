import React from 'react';
import { CATEGORIES } from '../data/store';

export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="cat-wrapper">
      <div className="cat-scroll">
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            className={`chip ${active === cat.id ? 'chip-active' : 'chip-default'}`}
            onClick={() => onChange(cat.id)}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      <style>{`
        .cat-wrapper {
          position: sticky;
          top: 64px;
          z-index: 90;
          background: rgba(255,251,238,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1.5px solid var(--border);
          padding: 14px 0;
        }
        .cat-scroll {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 0 20px;
          scrollbar-width: none;
          -ms-overflow-style: none;
          max-width: 1200px;
          margin: 0 auto;
        }
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}
