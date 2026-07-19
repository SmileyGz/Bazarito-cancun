import React, { useState, useEffect, useRef } from 'react';
import { Tag, Repeat, ChevronRight, Share2, Check, Home, Plug, PawPrint, Sparkles, Flame, Armchair, Smartphone, Shirt, Package } from 'lucide-react';
import Link from 'next/link';
import { STATUSES, PRODUCT_TYPES, CATEGORIES, filterValidImages } from '../data/store';

// Gradient placeholder backgrounds per category
const PLACEHOLDER_COLORS = {
  hogar:      { bg: 'linear-gradient(135deg,#FFF3E0,#FFE0B2)', icon: Home },
  gadgets:    { bg: 'linear-gradient(135deg,#E8F5E9,#C8E6C9)', icon: Plug },
  mascotas:   { bg: 'linear-gradient(135deg,#FCE4EC,#F8BBD9)', icon: PawPrint },
  bienestar:  { bg: 'linear-gradient(135deg,#EDE7F6,#D1C4E9)', icon: Sparkles },
  ofertas:    { bg: 'linear-gradient(135deg,#FFF8E1,#FFECB3)', icon: Flame },
  muebles:    { bg: 'linear-gradient(135deg,#E3F2FD,#BBDEFB)', icon: Armchair },
  electronica:{ bg: 'linear-gradient(135deg,#F3E5F5,#E1BEE7)', icon: Smartphone },
  personal:   { bg: 'linear-gradient(135deg,#FFF0F5,#FFD6E7)', icon: Shirt },
};
import { supabase } from '../lib/supabase';

function ProductImage({ product }) {
  const [src, setSrc] = useState(filterValidImages(product.images)?.[0] || filterValidImages([product.image])?.[0] || null);
  const [loading, setLoading] = useState(!src);
  const ref = useRef(null);
  const ph = PLACEHOLDER_COLORS[product.category] || { bg: 'linear-gradient(135deg,#FFF8D6,#FFE89A)', icon: Package };

  useEffect(() => {
    if (src || !loading) return;
    
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        let mounted = true;
        async function loadImg() {
          const { data } = await supabase.from('products').select('images').eq('id', product.id).single();
          if (mounted) {
             setSrc(filterValidImages(data?.images)?.[0] || null);
             setLoading(false);
          }
        }
        loadImg();
        observer.disconnect();
      }
    }, { rootMargin: '200px' });
    
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [product.id, src, loading]);

  if (loading) {
    return (
      <div ref={ref} className="pcard-placeholder" style={{ background: ph.bg, opacity: 0.7 }}>
        <div style={{ width:24, height:24, border:'3px solid rgba(0,0,0,0.1)', borderTopColor:'#333', borderRadius:'50%', animation:'spin 1s linear infinite' }} />
      </div>
    );
  }

  if (src) {
    return (
      <img
        src={src}
        alt={product.name}
        className="pcard-photo"
        loading="lazy"
        onError={e => {
          e.target.onerror = null;
          setSrc(null);
        }}
      />
    );
  }
  return (
    <div className="pcard-placeholder" style={{ background: ph.bg, color: 'rgba(0,0,0,0.2)' }}>
      {React.createElement(ph.icon, { size: 48, strokeWidth: 1.5 })}
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
    const url = `${window.location.origin}/p/${product.id}`;
    
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
          {product.stock != null && product.stock <= 5 && !isOneOff && (
            <span className="badge badge-orange pcard-badge urgency-pulse" style={{ backgroundColor: '#FF5722' }}>
              ⚡ Últimas {product.stock}
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
          href={`/p/${product.id}`}
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
