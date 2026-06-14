import React from 'react';
import { Tag, Repeat } from 'lucide-react';
import { STATUSES, PRODUCT_TYPES, CATEGORIES } from '../data/store';

// Vibrant placeholder colours per category
const PLACEHOLDER_COLORS = {
  hogar:      { bg: '#FFF3E0', accent: '#FF6F00', emoji: '🏠' },
  gadgets:    { bg: '#E8F5E9', accent: '#2E7D32', emoji: '🔌' },
  mascotas:   { bg: '#FCE4EC', accent: '#C62828', emoji: '🐾' },
  bienestar:  { bg: '#EDE7F6', accent: '#6A1B9A', emoji: '✨' },
  ofertas:    { bg: '#FFF8E1', accent: '#F57F17', emoji: '🔥' },
  muebles:    { bg: '#E3F2FD', accent: '#1565C0', emoji: '🛋️' },
  electronica:{ bg: '#F3E5F5', accent: '#7B1FA2', emoji: '📱' },
  personal:   { bg: '#FFF0F5', accent: '#C2185B', emoji: '👗' },
};

function ProductImage({ product }) {
  const ph = PLACEHOLDER_COLORS[product.category] || { bg: '#FFF8D6', accent: '#1A7A6D', emoji: '📦' };
  // Support both images[] array and legacy image string
  const src = product.images?.[0] || product.image || null;
  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        loading="lazy"
      />
    );
  }
  return (
    <div style={{
      width: '100%', height: '100%',
      background: ph.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexDirection: 'column', gap: 4,
    }}>
      <span style={{ fontSize: '2.8rem' }}>{ph.emoji}</span>
    </div>
  );
}

export default function ProductCard({ product, onClick }) {
  const isSold     = product.status === STATUSES.SOLD;
  const isOneOff   = product.type   === PRODUCT_TYPES.ONE_OFF;
  const catLabel   = CATEGORIES.find(c => c.id === product.category)?.label || product.category;

  return (
    <div className={`pcard ${isSold ? 'pcard-sold' : ''}`} onClick={() => onClick(product)}>
      {/* Image */}
      <div className="pcard-img">
        <ProductImage product={product} />
        {/* Badges */}
        <div className="pcard-badges">
          {isOneOff && !isSold && (
            <span className="badge badge-orange pcard-badge">
              <Tag size={10} /> Única
            </span>
          )}
          {!isOneOff && (
            <span className="badge badge-teal pcard-badge">
              <Repeat size={10} /> Stock
            </span>
          )}
        </div>
        {isSold && (
          <div className="pcard-sold-overlay">
            <span>VENDIDO</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="pcard-body">
        <p className="pcard-cat">{catLabel}</p>
        <h3 className="pcard-name">{product.name}</h3>

        {/* Variant chips */}
        {product.variants?.length > 0 && (
          <div className="pcard-variants">
            {product.variants.slice(0, 3).map((v, i) => (
              <span key={i} className="pcard-variant-chip">
                {v.key}: <strong>{v.value}</strong>
              </span>
            ))}
          </div>
        )}

        <div className="pcard-price-row">
          <span className="pcard-price">
            ${product.price.toLocaleString('es-MX')}
          </span>
          <span className="pcard-currency">MXN</span>
        </div>
      </div>

      <style>{`
        .pcard {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          transition: all var(--dur-med) var(--ease-smooth);
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
        }
        .pcard:hover {
          border-color: var(--yellow);
          box-shadow: var(--shadow-md);
          transform: translateY(-4px);
        }
        .pcard-sold { opacity: 0.65; }
        .pcard-img {
          position: relative;
          height: 180px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-muted);
        }
        .pcard-badges {
          position: absolute;
          top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 4px;
        }
        .pcard-badge {
          font-size: 0.68rem !important;
          padding: 3px 8px !important;
          box-shadow: var(--shadow-sm);
        }
        .pcard-sold-overlay {
          position: absolute;
          inset: 0;
          background: rgba(26,18,8,0.55);
          display: flex; align-items: center; justify-content: center;
        }
        .pcard-sold-overlay span {
          background: var(--orange);
          color: white;
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          padding: 6px 18px;
          border-radius: var(--radius-full);
          letter-spacing: 0.08em;
        }
        .pcard-body {
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
        }
        .pcard-cat {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--teal);
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }
        .pcard-name {
          font-family: var(--font-display);
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-primary);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .pcard-price-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 2px;
        }
        .pcard-price {
          font-family: var(--font-display);
          font-size: 1.15rem;
          font-weight: 900;
          color: var(--teal-dark);
        }
        .pcard-currency {
          font-size: 0.72rem;
          font-weight: 700;
          color: var(--text-muted);
          letter-spacing: 0.04em;
          align-self: flex-end;
          padding-bottom: 2px;
        }
        .pcard-btn {
          font-size: 0.85rem !important;
          padding: 10px 16px !important;
          margin-top: 4px;
        }
        .pcard-variants {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
        }
        .pcard-variant-chip {
          font-size: 0.68rem;
          background: var(--bg-muted);
          border: 1px solid var(--border);
          border-radius: var(--radius-full);
          padding: 2px 8px;
          color: var(--text-secondary);
          white-space: nowrap;
        }
        .pcard-variant-chip strong {
          color: var(--text-primary);
        }
        @media (max-width: 480px) {
          .pcard-img { height: 150px; }
          .pcard-body { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
