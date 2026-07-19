"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Check, Home, Plug, PawPrint, Sparkles, Flame, Armchair, Smartphone, Shirt, Package, Share2, ShoppingBag, MapPin, Truck, Clock } from 'lucide-react';
import { filterValidImages } from '../../../src/data/store';
import CheckoutModal from '../../../src/components/CheckoutModal';

const PLACEHOLDER_COLORS = {
  hogar:      { bg: '#FFF3E0', icon: Home },
  gadgets:    { bg: '#E8F5E9', icon: Plug },
  mascotas:   { bg: '#FCE4EC', icon: PawPrint },
  bienestar:  { bg: '#EDE7F6', icon: Sparkles },
  ofertas:    { bg: '#FFF8E1', icon: Flame },
  muebles:    { bg: '#E3F2FD', icon: Armchair },
  electronica:{ bg: '#F3E5F5', icon: Smartphone },
  personal:   { bg: '#FFF0F5', icon: Shirt },
};

function ImageGallery({ images, placeholder }) {
  const [idx, setIdx] = useState(0);
  const [broken, setBroken] = useState(false);
  const hasMultiple = images.length > 1;

  useEffect(() => {
    setBroken(false);
  }, [idx, images]);

  const prev = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIdx(i => (i - 1 + images.length) % images.length);
  };
  const next = (e) => {
    e.stopPropagation();
    e.preventDefault();
    setIdx(i => (i + 1) % images.length);
  };

  if (images.length === 0 || broken) {
    return (
      <div className="plp-gallery-empty" style={{ background: placeholder.bg, color: 'rgba(0,0,0,0.2)' }}>
        {React.createElement(placeholder.icon, { size: 64, strokeWidth: 1.5 })}
      </div>
    );
  }

  return (
    <div className="plp-gallery">
      <img key={idx} src={images[idx]} alt={`Foto ${idx + 1}`} className="plp-gallery-img" onError={() => setBroken(true)} />
      {hasMultiple && (
        <>
          <button type="button" className="plp-arrow plp-left" onClick={prev} aria-label="Foto anterior"><ChevronLeft size={24} /></button>
          <button type="button" className="plp-arrow plp-right" onClick={next} aria-label="Siguiente foto"><ChevronRight size={24} /></button>
          <div className="plp-dots">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                className={`plp-dot ${i === idx ? 'plp-dot-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setIdx(i);
                }}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ClientPage({ product }) {
  const router = useRouter();
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // We rely on the Server Component for JSON-LD and Metadata.
  useEffect(() => {
    // Dynamic JSON-LD is already set by Server Component? 
    // Actually, Server Components don't automatically generate JSON-LD script tags unless we add them to the JSX.
    // Let's add it here dynamically just to be safe.
    const existingScript = document.getElementById('product-jsonld');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'product-jsonld';
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description || 'Producto disponible en Bazarito Cancún con entrega local.',
      image: product.images?.length ? product.images : (product.image ? [product.image] : []),
      sku: product.id,
      brand: {
        '@type': 'Brand',
        name: 'Bazarito Cancún',
      },
      offers: {
        '@type': 'Offer',
        url: `https://bazaritocancun.com/p/${product.slug || product.id}`,
        priceCurrency: 'MXN',
        price: product.price,
        priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        availability: (product.status === 'sold' || product.status === 'out_of_stock')
          ? 'https://schema.org/OutOfStock'
          : 'https://schema.org/InStock',
        seller: {
          '@type': 'Organization',
          name: 'Bazarito Cancún',
        },
        shippingDetails: {
          '@type': 'OfferShippingDetails',
          shippingRate: {
            '@type': 'MonetaryAmount',
            value: 50,
            currency: 'MXN',
          },
          deliveryTime: {
            '@type': 'ShippingDeliveryTime',
            handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
            transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 1, unitCode: 'DAY' },
          },
        },
      },
    });
    document.head.appendChild(script);

    return () => {
      const existingScript = document.getElementById('product-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [product]);

  async function handleShare() {
    const url = `${window.location.origin}/p/${product.slug || product.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product?.name} | Bazarito Cancún`,
          text: `Mira este producto en Bazarito Cancún: ${product?.name}`,
          url,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
        console.error('Error sharing:', err);
      }
    }

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

  const images = filterValidImages(product.images?.length ? product.images : (product.image ? [product.image] : []));
  const ph = PLACEHOLDER_COLORS[product.category] || { bg: '#FFF8D6', icon: Package };
  const isAvailable = product.status !== 'sold' && product.status !== 'out_of_stock';
  const deliveryEnabled = product.delivery_enabled !== false;

  return (
    <div>
      <div className="plp-container">
        <div className="plp-content">
          <div className="plp-image-section">
            <ImageGallery images={images} placeholder={ph} />
          </div>
          
          <div className="plp-info-section">
            <h1 className="plp-title">{product.name}</h1>
            <div className="plp-price">${Number(product.price).toLocaleString('es-MX')} <span className="plp-currency">MXN</span></div>
            
            {/* Urgency microcopy — psychological trigger */}
            {isAvailable && product.status !== 'archived' && (
              <div className="plp-urgency">⚡ ¡Últimas piezas disponibles!</div>
            )}

            {/* Quantity selector — only for stock-type (repeatable) products */}
            {isAvailable && product.type !== 'one_off' && (
              <div className="plp-qty-row">
                <div>
                  <p className="plp-qty-label">Cantidad</p>
                  {product.stock != null && product.stock <= 5 && (
                    <p className="plp-qty-stock">⚡ Solo {product.stock} disponibles</p>
                  )}
                </div>
                <div className="plp-qty-controls">
                  <button
                    className="plp-qty-btn"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    aria-label="Quitar una pieza"
                  >−</button>
                  <span className="plp-qty-val">{quantity}</span>
                  <button
                    className="plp-qty-btn"
                    onClick={() => setQuantity(q => Math.min(product.stock ?? 99, q + 1))}
                    disabled={product.stock != null && quantity >= product.stock}
                    aria-label="Añadir una pieza"
                  >+</button>
                </div>
              </div>
            )}

            <p className="plp-desc">{product.description || 'Producto disponible con entrega rápida en Cancún. Contáctanos para más información.'}</p>

            <div className="plp-action">
              {isAvailable ? (
                <button className="btn btn-primary plp-buy-btn" onClick={() => setShowCheckout(true)}>
                  <ShoppingBag size={20} />
                  {quantity > 1 ? `Lo quiero ×${quantity}` : 'Lo quiero ahora'}
                </button>
              ) : (
                <button className="btn plp-buy-btn" disabled style={{ background: 'var(--bg-muted)', color: 'var(--text-secondary)' }}>
                  Producto agotado
                </button>
              )}
              <button className="plp-share-btn" onClick={handleShare} aria-label="Compartir producto">
                {copied ? <Check size={18} /> : <Share2 size={18} />}
                {copied ? '¡Enlace copiado!' : 'Compartir'}
              </button>
            </div>
            
            {/* Delivery info */}
            <div className="plp-delivery">
              <div className="plp-ditem">
                <MapPin size={16} className="plp-dicon" />
                <div>
                  <p className="plp-dlabel">Recolección gratis</p>
                  <p className="plp-dval">Región 96, Cancún · Producto listo en 15–30 min</p>
                </div>
              </div>
              {deliveryEnabled && (
                <>
                  <div className="plp-ditem">
                    <Truck size={16} className="plp-dicon" />
                    <div>
                      <p className="plp-dlabel">Entrega a domicilio</p>
                      <p className="plp-dval">$50 (1–6 km) · $80 (6–10 km)</p>
                    </div>
                  </div>
                  <div className="plp-ditem">
                    <Clock size={16} className="plp-dicon" />
                    <div>
                      <p className="plp-dlabel">Horario nocturno</p>
                      <p className="plp-dval">Después de 8 PM $100</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Payment Methods */}
            <div className="plp-pay">
              <p className="plp-pay-title">Métodos de pago</p>
              <div className="plp-pay-methods">
                <span className="plp-pay-method">💳 Mercado Pago</span>
                {deliveryEnabled && (
                  <span className="plp-pay-method">💵 Efectivo al recibir <span className="plp-pay-note">(envío $80 · depósito $50)</span></span>
                )}
                <span className="plp-pay-method">🏪 Efectivo en recolección <span className="plp-pay-note">(listo en 15–30 min)</span></span>
              </div>
            </div>

            <div className="plp-trust-badges">
              <span className="trust-badge">🛡️ Compra segura</span>
              <span className="trust-badge">🤝 Paga al recibir</span>
              <span className="trust-badge">✅ Entrega express</span>
            </div>
          </div>
        </div>

        {showCheckout && (
          <CheckoutModal product={product} quantity={quantity} onClose={() => setShowCheckout(false)} />
        )}

        <style>{`
          .plp-container {
            min-height: calc(100vh - 64px);
            background: var(--bg);
            padding-bottom: env(safe-area-inset-bottom);
          }
          .plp-content {
            max-width: 500px;
            margin: 0 auto;
            background: var(--bg-card);
            border: 1.5px solid var(--border);
            min-height: calc(100vh - 64px);
          }
          .plp-image-section {
            width: 100%;
            aspect-ratio: 1/1;
            background: var(--bg-muted);
          }
          .plp-gallery { position: relative; width: 100%; height: 100%; }
          .plp-gallery-img { width: 100%; height: 100%; object-fit: cover; display: block; }
          .plp-gallery-empty {
            width: 100%; height: 100%;
            display: flex; align-items: center; justify-content: center; font-size: 5rem;
          }
          
          .plp-arrow {
            position: absolute; top: 50%; transform: translateY(-50%);
            background: rgba(255,255,255,0.9); border: none; border-radius: 50%;
            width: 40px; height: 40px;
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            transition: all 0.2s ease;
            z-index: 5;
          }
          .plp-arrow:hover { background: white; transform: translateY(-50%) scale(1.1); }
          .plp-left { left: 15px; } .plp-right { right: 15px; }
          .plp-dots {
            position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 8px;
            z-index: 5;
          }
          .plp-dot {
            width: 8px; height: 8px; border-radius: 50%;
            background: rgba(255,255,255,0.5); border: none; cursor: pointer;
            transition: all 0.2s ease;
          }
          .plp-dot-active { background: white; transform: scale(1.2); }

          .plp-info-section { padding: 1.5rem; display: flex; flex-direction: column; gap: 12px; }
          .plp-title {
            font-family: var(--font-display);
            font-size: 1.75rem; font-weight: 800;
            margin: 0; line-height: 1.2;
            color: var(--text-primary);
          }
          .plp-price {
            font-size: 1.5rem; font-weight: 900;
            color: var(--orange);
            display: flex; align-items: baseline; gap: 4px;
          }
          .plp-currency {
            font-size: 0.8rem; font-weight: 600;
            color: var(--text-secondary);
          }
          .plp-urgency {
            display: inline-block;
            background: rgba(232, 75, 9, 0.1);
            color: var(--orange);
            font-size: 0.85rem; font-weight: 700;
            padding: 6px 12px;
            border-radius: var(--radius-full);
            border: 1px solid rgba(232, 75, 9, 0.2);
          }
          /* Quantity selector */
          .plp-qty-row {
            display: flex; align-items: center; justify-content: space-between;
            padding: 12px 14px;
            background: var(--bg-muted);
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
          }
          .plp-qty-label {
            font-size: 0.78rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); margin: 0;
          }
          .plp-qty-stock {
            font-size: 0.72rem; font-weight: 700;
            color: var(--orange); margin: 4px 0 0;
          }
          .plp-qty-controls {
            display: flex; align-items: center; gap: 0;
            border: 2px solid var(--border); border-radius: var(--radius-full);
            overflow: hidden; background: var(--bg-card);
          }
          .plp-qty-btn {
            width: 38px; height: 38px;
            background: var(--bg-card); border: none;
            font-size: 1.3rem; font-weight: 700;
            color: var(--text-primary);
            cursor: pointer; display: flex; align-items: center; justify-content: center;
            transition: background 150ms ease;
          }
          .plp-qty-btn:hover:not(:disabled) { background: var(--yellow); }
          .plp-qty-btn:disabled { color: var(--text-muted); cursor: not-allowed; }
          .plp-qty-val {
            min-width: 38px; text-align: center;
            font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
            color: var(--text-primary);
            border-left: 1.5px solid var(--border);
            border-right: 1.5px solid var(--border);
            padding: 0 4px; line-height: 38px;
          }
          .plp-desc {
            font-size: 1rem; color: var(--text-secondary);
            line-height: 1.6; margin: 0; white-space: pre-wrap;
          }
          
          .plp-action { display: flex; flex-direction: column; gap: 10px; }
          .plp-buy-btn {
            width: 100%; padding: 1.1rem;
            font-size: 1.05rem;
            display: flex; justify-content: center; align-items: center; gap: 10px;
            border-radius: var(--radius-lg);
            box-shadow: 0 4px 15px rgba(255, 208, 0, 0.3);
          }
          .plp-share-btn {
            display: flex; align-items: center; justify-content: center; gap: 8px;
            background: none; border: 1.5px solid var(--border);
            border-radius: var(--radius-lg);
            padding: 0.75rem;
            font-size: 0.9rem; font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all 0.2s ease;
            font-family: var(--font-display);
          }
          .plp-share-btn:hover {
            border-color: var(--teal);
            color: var(--teal);
            background: rgba(26,122,109,0.05);
          }
          .plp-delivery {
            display: flex; flex-direction: column; gap: 10px;
            padding: 14px; background: var(--bg-card);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          .plp-ditem { display: flex; align-items: flex-start; gap: 10px; }
          .plp-dicon { color: var(--teal); flex-shrink: 0; margin-top: 2px; }
          .plp-dlabel { font-weight: 600; font-size: 0.85rem; color: var(--text-primary); margin: 0; }
          .plp-dval   { font-size: 0.82rem; color: var(--text-muted); margin: 0; }

          /* Payment methods */
          .plp-pay {
            padding: 14px; background: var(--bg-muted);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          .plp-pay-title {
            font-size: 0.72rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); margin: 0 0 8px 0;
          }
          .plp-pay-methods { display: flex; flex-direction: column; gap: 6px; }
          .plp-pay-method { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); }
          .plp-pay-note { font-size: 0.78rem; color: var(--text-muted); font-weight: 400; }
          
          .plp-trust-badges {
            display: flex; justify-content: center; gap: 12px; margin-top: 4px;
          }
          .trust-badge {
            font-size: 0.72rem; color: var(--text-secondary); font-weight: 600; display: flex; align-items: center; gap: 4px;
          }
          
          .plp-error {
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            height: calc(100vh - 64px); gap: 1rem;
            color: var(--text-primary);
          }

          @media (min-width: 768px) {
            .plp-content {
              max-width: 900px;
              display: grid;
              grid-template-columns: 1fr 1fr;
              margin: 2rem auto;
              border-radius: var(--radius-lg);
              overflow: hidden;
              box-shadow: var(--shadow-md, 0 4px 24px rgba(26,18,8,0.10));
              min-height: auto;
            }
            .plp-image-section { aspect-ratio: unset; min-height: 400px; }
          }
        `}</style>
      </div>
    </div>
  );
}
