import React, { useState } from 'react';
import { X, Tag, Repeat, Truck, MapPin, Clock, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react';
import { STATUSES, PRODUCT_TYPES, CATEGORIES } from '../data/store';
import CheckoutModal from './CheckoutModal';

const PLACEHOLDER_COLORS = {
  hogar:      { bg: '#FFF3E0', emoji: '🏠' },
  gadgets:    { bg: '#E8F5E9', emoji: '🔌' },
  mascotas:   { bg: '#FCE4EC', emoji: '🐾' },
  bienestar:  { bg: '#EDE7F6', emoji: '✨' },
  ofertas:    { bg: '#FFF8E1', emoji: '🔥' },
  muebles:    { bg: '#E3F2FD', emoji: '🛋️' },
  electronica:{ bg: '#F3E5F5', emoji: '📱' },
  personal:   { bg: '#FFF0F5', emoji: '👗' },
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
          <button className="pmg-arrow pmg-left" aria-label="Foto anterior" onClick={prev}><ChevronLeft  size={20} /></button>
          <button className="pmg-arrow pmg-right" aria-label="Siguiente foto" onClick={next}><ChevronRight size={20} /></button>
          {/* Dots */}
          <div className="pmg-dots">
            {images.map((_, i) => (
              <button
                key={i}
                aria-label={`Ir a la foto ${i + 1}`}
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
  const [showCheckout, setShowCheckout] = useState(false);
  const [quantity, setQuantity] = useState(1);

  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const isSold   = product.status === STATUSES.SOLD;
  const isOneOff = product.type   === PRODUCT_TYPES.ONE_OFF;
  const deliveryEnabled = product.delivery_enabled !== false;
  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label || product.category;
  const ph       = PLACEHOLDER_COLORS[product.category] || { bg: '#FFF8D6', emoji: '📦' };

  // Support images[] array and legacy image string
  const images = product.images?.length
    ? product.images
    : (product.image ? [product.image] : []);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box pmodal" onClick={e => e.stopPropagation()}>
        {/* Close */}
        <button className="pmodal-close" aria-label="Cerrar detalles del producto" onClick={onClose}>
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

          {/* Variants */}
          {product.variants?.length > 0 && (
            <div className="pmodal-variants">
              {product.variants.map((v, i) => (
                <div key={i} className="pmodal-variant-row">
                  <span className="pmodal-variant-key">{v.key}</span>
                  <span className="pmodal-variant-val">{v.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price + Quantity selector */}
          <div className="pmodal-price-row">
            <div>
              <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', fontWeight:600, marginBottom:2 }}>PRECIO</p>
              <span className="pmodal-price">${product.price.toLocaleString('es-MX')} MXN</span>
            </div>
            {/* Quantity selector — only for stock products with known qty */}
            {!isOneOff && (
              <div className="pmodal-qty">
                <p style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, marginBottom:4, textTransform:'uppercase', letterSpacing:'0.06em' }}>Cantidad</p>
                <div className="pmodal-qty-controls">
                  <button
                    className="pmodal-qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Quitar una pieza"
                  >−</button>
                  <span className="pmodal-qty-val">{quantity}</span>
                  <button
                    className="pmodal-qty-btn"
                    onClick={() => setQuantity(q => Math.min(product.stock ?? 99, q + 1))}
                    disabled={product.stock != null && quantity >= product.stock}
                    aria-label="Añadir una pieza"
                  >+</button>
                </div>
                {product.stock != null && product.stock <= 5 && (
                  <p style={{ fontSize:'0.7rem', color:'var(--orange)', fontWeight:700, marginTop:4 }}>⚡ Solo {product.stock} disponibles</p>
                )}
              </div>
            )}
          </div>

          {/* Delivery info */}
          <div className="pmodal-delivery">
            <div className="pmodal-ditem">
              <MapPin size={16} className="pmodal-dicon" />
              <div>
                <p className="pmodal-dlabel">Recolección gratis</p>
                <p className="pmodal-dval">Región 96, Cancún · Producto listo en 15–30 min</p>
              </div>
            </div>
            {deliveryEnabled && (
              <>
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
                    <p className="pmodal-dval">Después de 8 PM $100</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Payment Methods */}
          <div className="pmodal-pay">
            <p className="pmodal-pay-title">Métodos de pago</p>
            <div className="pmodal-pay-methods">
              <span className="pmodal-pay-method">💳 Mercado Pago</span>
              {deliveryEnabled && (
                <span className="pmodal-pay-method">💵 Efectivo al recibir <span className="pmodal-pay-note">(envío $80 · depósito $50)</span></span>
              )}
              <span className="pmodal-pay-method">🏪 Efectivo en recolección <span className="pmodal-pay-note">(listo en 15–30 min)</span></span>
            </div>
          </div>

          {/* CTA */}
          {!isSold && (
            <button
              id="pmodal-order-btn"
              className="btn btn-teal"
              style={{ width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: '1rem' }}
              onClick={() => setShowCheckout(true)}
            >
              <ShoppingBag size={20} />
              {quantity > 1 ? `Pedir ${quantity} piezas` : 'Pedir Ahora - Paga al Recibir'}
            </button>
          )}
        </div>
      </div>

      {showCheckout && (
        <CheckoutModal product={product} quantity={quantity} onClose={() => setShowCheckout(false)} />
      )}

      <style>{`
        .pmodal {
          width: 100%; max-width: 480px;
          max-height: 92vh; overflow-y: auto;
          position: relative;
          padding-bottom: env(safe-area-inset-bottom);
        }
        .pmodal-close {
          position: absolute; top: max(14px, env(safe-area-inset-top)); right: 14px; z-index: 10;
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
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px;
          padding: 14px; background: var(--bg-muted);
          border-radius: var(--radius-md); border: 1.5px solid var(--border);
        }
        .pmodal-price { font-family: var(--font-display); font-size: 1.6rem; font-weight: 900; color: var(--teal-dark); }
        /* Quantity selector */
        .pmodal-qty { display: flex; flex-direction: column; align-items: flex-end; }
        .pmodal-qty-controls {
          display: flex; align-items: center; gap: 0;
          border: 2px solid var(--border); border-radius: var(--radius-full);
          overflow: hidden; background: var(--bg-card);
        }
        .pmodal-qty-btn {
          width: 34px; height: 34px;
          background: var(--bg-card); border: none;
          font-size: 1.2rem; font-weight: 700;
          color: var(--text-primary);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: background var(--dur-fast);
        }
        .pmodal-qty-btn:hover:not(:disabled) { background: var(--yellow); }
        .pmodal-qty-btn:disabled { color: var(--text-muted); cursor: not-allowed; }
        .pmodal-qty-val {
          min-width: 32px; text-align: center;
          font-family: var(--font-display); font-size: 1rem; font-weight: 800;
          color: var(--text-primary);
          border-left: 1.5px solid var(--border);
          border-right: 1.5px solid var(--border);
          padding: 0 4px;
          line-height: 34px;
        }
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
        /* Variants */
        .pmodal-variants {
          display: flex; flex-direction: column; gap: 0;
          border: 1.5px solid var(--border); border-radius: var(--radius-md);
          overflow: hidden;
        }
        .pmodal-variant-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 14px; font-size: 0.85rem;
          border-bottom: 1px solid var(--border);
        }
        .pmodal-variant-row:last-child { border-bottom: none; }
        .pmodal-variant-key { color: var(--text-muted); font-weight: 600; }
        .pmodal-variant-val { color: var(--text-primary); font-weight: 700; }
        /* Payment methods */
        .pmodal-pay {
          padding: 14px; background: var(--bg-muted);
          border: 1.5px solid var(--border); border-radius: var(--radius-md);
        }
        .pmodal-pay-title {
          font-size: 0.72rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em;
          color: var(--text-muted); margin-bottom: 8px;
        }
        .pmodal-pay-methods { display: flex; flex-direction: column; gap: 6px; }
        .pmodal-pay-method {
          font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
        }
        .pmodal-pay-note {
          font-size: 0.78rem; color: var(--text-muted); font-weight: 400;
        }
      `}</style>
    </div>
  );
}
