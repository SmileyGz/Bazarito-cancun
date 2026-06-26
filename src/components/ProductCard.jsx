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
    e.preventDefault();
    const url = `${window.location.origin}${import.meta.env.BASE_URL}p/${product.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product.name} | Bazarito`,
          text: `Mira este producto en Bazarito Cancún: ${product.name}`,
          url: url
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error sharing via Web Share:', err);
      }
    }

    // Robust Clipboard Copy with textarea fallback (crucial for Messenger / In-app Webviews)
    let copySuccess = false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        copySuccess = true;
      } catch (err) {
        console.warn('navigator.clipboard failed, trying textarea fallback:', err);
      }
    }

    if (!copySuccess) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = url;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        copySuccess = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch (err) {
        console.error('Fallback copy failed:', err);
      }
    }

    if (copySuccess) {
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
          {product.price > 200 && !isOneOff && (
            <span className="badge pcard-badge" style={{ backgroundColor: '#FFEB3B', color: '#000', fontWeight: 'bold' }}>
              🔥 Más Vendido
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
    </div>
  );
}
