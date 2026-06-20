import React, { useState } from 'react';
import { Tag, Repeat, ChevronRight, Share2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { STATUSES, PRODUCT_TYPES, CATEGORIES } from '../data/store';

// Gradient placeholder backgrounds per category
const PLACEHOLDER_COLORS = {
  hogar:      { bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)', emoji: '🏠' },
  gadgets:    { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', emoji: '🔌' },
  mascotas:   { bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD9)', emoji: '🐾' },
  bienestar:  { bg: 'linear-gradient(135deg,#EDE7F6,#D1C4E9)', emoji: '✨' },
  ofertas:    { bg: 'linear-gradient(135deg,#FFF8E1,#FFECB3)', emoji: '🔥' },
  muebles:    { bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)', emoji: '🛋️' },
  electronica:{ bg: 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', emoji: '📱' },
  personal:   { bg: 'linear-gradient(135deg,#FFF0F5,#FFD6E7)', emoji: '👗' },
};

function ProductImage({ product }) {
  const ph = PLACEHOLDER_COLORS[product.category] || { bg: 'linear-gradient(135deg,#FFF8D6,#FFE89A)', emoji: '📦' };
  const src = product.images?.[0] || product.image || null;
  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        className="pcard-photo"
        loading="lazy"
      />
    );
  }
  return (
    <div className="pcard-placeholder" style={{ background: ph.bg }}>
      <span style={{ fontSize: '3rem', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.10))' }}>{ph.emoji}</span>
    </div>
  );
}

export default function ProductCard({ product, onClick }) {
  const [copied, setCopied] = useState(false);
  const isOneOff = product.type === PRODUCT_TYPES.ONE_OFF;
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label || product.category;

  async function handleShare(e) {
    e.stopPropagation();
    e.preventDefault(); // Prevent <Link> from navigating to the product page
    const url = `${window.location.origin}${import.meta.env.BASE_URL}p/${product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Bazarito`,
          text: `Mira este producto en Bazarito Cancún: ${product.name}`,
          url: url
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    /*
      SEO: Use a standard div for the card body to avoid nesting interactive
      elements (like share buttons), which breaks native event bubbling.
      To ensure Googlebot can crawl /p/:id pages, we make the CTA at the bottom
      a semantic <Link> element.
    */
    <div
      className="pcard"
      onClick={() => onClick(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick(product);
        }
      }}
      aria-label={`Ver detalles de ${product.name}`}
    >

      {/* ── Image ── */}
      <div className="pcard-img">
        <ProductImage product={product} />

        {/* Share Button — top right */}
        <button className="pcard-share-btn" onClick={handleShare} aria-label="Compartir producto">
          {copied ? <Check size={16} /> : <Share2 size={16} />}
        </button>

        {/* Type badge — top left */}
        <div className="pcard-badges">
          {isOneOff ? (
            <span className="badge badge-orange pcard-badge">
              <Tag size={10} /> Única
            </span>
          ) : (
            <span className="badge badge-teal pcard-badge">
              <Repeat size={10} /> Disponible
            </span>
          )}
        </div>
      </div>

      {/* ── Body ── */}
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

        {/* ── Price CTA — links semantic URL for SEO, opens modal for users ── */}
        <Link
          to={`/p/${product.id}`}
          className="pcard-cta"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClick(product);
          }}
          aria-label={`Ver detalles de ${product.name}`}
        >
          <div className="pcard-cta-price">
            <span className="pcard-price">${product.price.toLocaleString('es-MX')}</span>
            <span className="pcard-currency">MXN</span>
          </div>
          <div className="pcard-cta-action">
            <span>Ver</span>
            <ChevronRight size={15} strokeWidth={2.5} />
          </div>
        </Link>
      </div>

      <style>{`
        /* ── Card shell ── */
        .pcard {
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--border);
          overflow: hidden;
          cursor: pointer;
          transition:
            transform 240ms cubic-bezier(0.34,1.56,0.64,1),
            box-shadow 240ms ease,
            border-color 150ms ease;
          display: flex; flex-direction: column;
          box-shadow: var(--shadow-sm);
        }
        .pcard:hover {
          border-color: var(--yellow);
          box-shadow: 0 8px 28px rgba(26,18,8,0.13);
          transform: translateY(-5px);
        }
        .pcard:active { transform: translateY(-2px); }

        /* ── Image area ── */
        .pcard-img {
          position: relative;
          height: 185px;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-muted);
        }
        .pcard-photo {
          width: 100%; height: 100%; object-fit: cover;
          display: block;
          transition: transform 380ms ease;
        }
        .pcard:hover .pcard-photo { transform: scale(1.05); }
        .pcard-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center;
        }

        /* ── Type badge ── */
        .pcard-badges {
          position: absolute; top: 10px; left: 10px;
          display: flex; flex-direction: column; gap: 4px; z-index: 2;
        }
        .pcard-badge {
          font-size: 0.67rem !important;
          padding: 3px 8px !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
        }

        /* ── Body ── */
        .pcard-body {
          padding: 13px 13px 14px;
          display: flex; flex-direction: column; gap: 6px;
          flex: 1;
        }
        .pcard-cat {
          font-size: 0.7rem; font-weight: 700;
          color: var(--teal); text-transform: uppercase;
          letter-spacing: 0.07em;
        }
        .pcard-name {
          font-family: var(--font-display);
          font-size: 0.93rem; font-weight: 700;
          color: var(--text-primary); line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          flex: 1;
        }

        /* ── Variant chips ── */
        .pcard-variants { display: flex; flex-wrap: wrap; gap: 4px; }
        .pcard-variant-chip {
          font-size: 0.67rem;
          background: var(--bg-muted); border: 1px solid var(--border);
          border-radius: var(--radius-full); padding: 2px 8px;
          color: var(--text-secondary); white-space: nowrap;
        }
        .pcard-variant-chip strong { color: var(--text-primary); }

        .pcard-cta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 8px;
          margin-top: 6px;
          width: 100%;
          padding: 10px 14px;
          background: var(--yellow);
          border: none; border-radius: var(--radius-full);
          cursor: pointer;
          font-family: var(--font-display);
          box-shadow: 0 3px 12px rgba(255,208,0,0.4);
          transition: all 200ms cubic-bezier(0.34,1.56,0.64,1);
          text-decoration: none;
        }
        .pcard-cta:hover {
          background: var(--yellow-light);
          box-shadow: 0 5px 18px rgba(255,208,0,0.55);
          transform: translateY(-1px);
        }
        .pcard-cta:active { transform: translateY(0); }

        .pcard-cta-price {
          display: flex; align-items: baseline; gap: 4px;
        }
        .pcard-price {
          font-size: 1.1rem; font-weight: 900;
          color: var(--black); line-height: 1;
        }
        .pcard-currency {
          font-size: 0.65rem; font-weight: 700;
          color: var(--text-secondary); letter-spacing: 0.04em;
        }
        .pcard-cta-action {
          display: flex; align-items: center; gap: 3px;
          background: rgba(26,18,8,0.1);
          border-radius: var(--radius-full);
          padding: 4px 10px 4px 12px;
          font-size: 0.78rem; font-weight: 800;
          color: var(--black); white-space: nowrap;
        }

        .pcard-share-btn {
          position: absolute;
          top: 10px;
          right: 10px;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--text-primary);
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          z-index: 5;
          transition: all 0.2s ease;
        }
        .pcard-share-btn:hover {
          background: white;
          transform: scale(1.1);
        }
        .pcard-share-btn:active {
          transform: scale(0.95);
        }

        @media (max-width: 480px) {
          .pcard-img  { height: 155px; }
          .pcard-body { padding: 11px 11px 13px; }
          .pcard-cta  { padding: 9px 12px; }
          .pcard-price { font-size: 1rem; }
        }
      `}</style>
    </div>
  );
}
