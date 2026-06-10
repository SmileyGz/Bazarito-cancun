import React, { useState } from 'react';
import { X, MessageCircle, Tag, Repeat, Truck, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUSES, PRODUCT_TYPES, CATEGORIES, getMessengerLink } from '../data/store';

const PLACEHOLDER_COLORS = {
  hogar:      { bg: '#FFF3E0', emoji: '🏠' },
  gadgets:    { bg: '#E8F5E9', emoji: '🔌' },
  mascotas:   { bg: '#FCE4EC', emoji: '🐾' },
  bienestar:  { bg: '#EDE7F6', emoji: '✨' },
  ofertas:    { bg: '#FFF8E1', emoji: '🔥' },
  muebles:    { bg: '#E3F2FD', emoji: '🛋️' },
  electronica:{ bg: '#F3E5F5', emoji: '📱' },
};

// Image gallery with prev/next arrows
function ImageGallery({ images, placeholder }) {
  const [idx, setIdx] = useState(0);
  const hasMultiple = images.length > 1;

  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  if (images.length === 0) {
    return (
      <div className="pmg-empty" style={{ background: placeholder.bg }}>
        <span style={{ fontSize:'5rem' }}>{placeholder.emoji}</span>
      </div>
    );
  }

  return (
    <div className="pmg">
      <img key={idx} src={images[idx]} alt={`Foto ${idx + 1}`} className="pmg-img" />

      {hasMultiple && (
        <>
          <button className="pmg-arrow pmg-left"  onClick={prev}><ChevronLeft  size={20} /></button>
          <button className="pmg-arrow pmg-right" onClick={next}><ChevronRight size={20} /></button>
          {/* Dots */}
          <div className="pmg-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`pmg-dot ${i === idx ? 'pmg-dot-active' : ''}`}
                onClick={e => { e.stopPropagation(); setIdx(i); }}
              />
            ))}
          </div>
        </>
      )}

      <style>{`
        .pmg { position: relative; width: 100%; height: 100%; }
        .pmg-img { width: 100%; height: 100%; object-fit: cover; display: block; animation: fadeIn 0.2s ease; }
        .pmg-empty { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
        .pmg-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          background: rgba(255,255,255,0.9); border: none; border-radius: var(--radius-full);
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; box-shadow: var(--shadow-sm);
          color: var(--text-primary);
          transition: all var(--dur-fast);
          z-index: 5;
        }
        .pmg-arrow:hover { background: white; transform: translateY(-50%) scale(1.1); }
        .pmg-left  { left: 10px; }
        .pmg-right { right: 10px; }
        .pmg-dots { position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; }
        .pmg-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.55); border: none; cursor: pointer;
          transition: all var(--dur-fast);
        }
        .pmg-dot-active { background: white; transform: scale(1.2); }
      `}</style>
    </div>
  );
}

export default function ProductModal({ product, onClose }) {
  if (!product) return null;

  const isSold   = product.status === STATUSES.SOLD;
  const isOneOff = product.type   === PRODUCT_TYPES.ONE_OFF;
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label || product.category;
  const ph       = PLACEHOLDER_COLORS[product.category] || { bg: '#FFF8D6', emoji: '📦' };
  const margin   = Math.round(((product.price - product.cost) / product.cost) * 100);

  // Support images[] array and legacy image string
  const images = product.images?.length
    ? product.images
    : (product.image ? [product.image] : []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box pmodal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="pmodal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Image gallery */}
        <div className="pmodal-img">
          <ImageGallery images={images} placeholder={ph} />
          {isSold && (
            <div className="pmodal-sold-overlay">
              <span>VENDIDO</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="pmodal-body">
          {/* Tags */}
          <div className="pmodal-tags">
            <span className="badge badge-gray">{catLabel}</span>
            {isOneOff
              ? <span className="badge badge-orange"><Tag size={10} /> Pieza única</span>
              : <span className="badge badge-teal"><Repeat size={10} /> En stock</span>
            }
            {images.length > 1 && (
              <span className="badge badge-gray">📷 {images.length} fotos</span>
            )}
          </div>

          <h2 className="pmodal-name">{product.name}</h2>

          {product.description && (
            <p className="pmodal-desc">{product.description}</p>
          )}

          {/* Price */}
          <div className="pmodal-price-row">
            <div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, marginBottom:2 }}>PRECIO</p>
              <span className="pmodal-price">${product.price.toLocaleString('es-MX')} MXN</span>
            </div>
            <span className="badge badge-yellow" style={{ fontSize:'0.85rem', padding:'6px 14px' }}>
              +{margin}% margen
            </span>
          </div>

          {/* Delivery info */}
          <div className="pmodal-delivery">
            <div className="pmodal-ditem">
              <MapPin size={16} className="pmodal-dicon" />
              <div>
                <p className="pmodal-dlabel">Pickup gratis</p>
                <p className="pmodal-dval">Región 96, Cancún</p>
              </div>
            </div>
            <div className="pmodal-ditem">
              <Truck size={16} className="pmodal-dicon" />
              <div>
                <p className="pmodal-dlabel">Entrega a domicilio</p>
                <p className="pmodal-dval">$50 (1–6 km) · $80 (6–10 km)</p>
              </div>
            </div>
            <div className="pmodal-ditem">
              <Clock size={16} className="pmodal-dicon" />
              <div>
                <p className="pmodal-dlabel">Horario nocturno</p>
                <p className="pmodal-dval">Después de 8 PM +$30</p>
              </div>
            </div>
          </div>

          {/* CTA */}
          {!isSold ? (
            <a
              href={getMessengerLink(product.name)}
              target="_blank"
              rel="noopener noreferrer"
              className="messenger-btn"
            >
              <MessageCircle size={22} />
              Preguntar por este producto
            </a>
          ) : (
            <div className="pmodal-sold-msg">
              <span>😔 Este producto ya fue vendido</span>
              <a href={getMessengerLink('algo similar a ' + product.name)} target="_blank" rel="noopener noreferrer"
                className="btn btn-outline" style={{ marginTop:8, width:'100%', justifyContent:'center' }}>
                <MessageCircle size={16} />
                ¿Tienes algo similar?
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .pmodal {
          width: 100%; max-width: 480px;
          max-height: 92vh; overflow-y: auto;
          position: relative;
        }
        .pmodal-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 36px; height: 36px;
          background: rgba(255,255,255,0.9); border-radius: var(--radius-full);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-secondary); box-shadow: var(--shadow-sm);
          cursor: pointer; border: none; transition: all var(--dur-fast);
        }
        .pmodal-close:hover { background: white; color: var(--text-primary); }
        .pmodal-img {
          height: 280px; position: relative; overflow: hidden;
          background: var(--bg-muted);
        }
        .pmodal-sold-overlay {
          position: absolute; inset: 0;
          background: rgba(26,18,8,0.5);
          display: flex; align-items: center; justify-content: center;
          z-index: 4;
        }
        .pmodal-sold-overlay span {
          background: var(--orange); color: white;
          font-family: var(--font-display); font-weight: 900;
          font-size: 1.3rem; padding: 8px 24px;
          border-radius: var(--radius-full); letter-spacing: 0.1em;
        }
        .pmodal-body { padding: 24px; display: flex; flex-direction: column; gap: 16px; }
        .pmodal-tags { display: flex; gap: 8px; flex-wrap: wrap; }
        .pmodal-name { font-size: 1.4rem; font-weight: 800; color: var(--text-primary); line-height: 1.3; }
        .pmodal-desc { font-size: 0.95rem; color: var(--text-secondary); line-height: 1.6; }
        .pmodal-price-row {
          display: flex; align-items: center; justify-content: space-between;
          padding: 14px; background: var(--bg-muted);
          border-radius: var(--radius-md); border: 1.5px solid var(--border);
        }
        .pmodal-price { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: var(--teal-dark); }
        .pmodal-delivery {
          display: flex; flex-direction: column; gap: 10px;
          padding: 14px; background: var(--bg-card);
          border: 1.5px solid var(--border); border-radius: var(--radius-md);
        }
        .pmodal-ditem { display: flex; align-items: flex-start; gap: 10px; }
        .pmodal-dicon { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
        .pmodal-dlabel { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); }
        .pmodal-dval   { font-size: 0.82rem; color: var(--text-muted); }
        .pmodal-sold-msg {
          background: var(--bg-muted); padding: 16px; border-radius: var(--radius-md);
          text-align: center; font-weight: 600; color: var(--text-secondary);
          font-size: 0.9rem; display: flex; flex-direction: column; align-items: center;
        }
      `}</style>
    </div>
  );
}
