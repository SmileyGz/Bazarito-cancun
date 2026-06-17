import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ChevronLeft, ChevronRight, ShoppingBag, ArrowLeft, Share2, Check } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';
import Navbar from '../components/Navbar';

// Using the same placeholder logic as ProductCard
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

function ImageGallery({ images, placeholder }) {
  const [idx, setIdx] = useState(0);
  const hasMultiple = images.length > 1;

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  if (images.length === 0) {
    return (
      <div className="plp-gallery-empty" style={{ background: placeholder.bg }}>
        <span>{placeholder.emoji}</span>
      </div>
    );
  }

  return (
    <div className="plp-gallery">
      <img key={idx} src={images[idx]} alt={`Foto ${idx + 1}`} className="plp-gallery-img" />
      {hasMultiple && (
        <>
          <button className="plp-arrow plp-left" onClick={prev} aria-label="Foto anterior"><ChevronLeft size={24} /></button>
          <button className="plp-arrow plp-right" onClick={next} aria-label="Siguiente foto"><ChevronRight size={24} /></button>
          <div className="plp-dots">
            {images.map((_, i) => (
              <button
                key={i}
                className={`plp-dot ${i === idx ? 'plp-dot-active' : ''}`}
                onClick={() => setIdx(i)}
                aria-label={`Ver foto ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function ProductLandingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase.from('products').select('*').eq('id', id).single();
        setProduct(data);
        if (data) {
          // Dynamic SEO Tags — include ☀️ brand emoji in title
          document.title = `${data.name} | Bazarito Cancún ☀️`;
          
          const metaDesc = document.querySelector('meta[name="description"]');
          if (metaDesc) {
            metaDesc.setAttribute('content', data.description || 'Encuentra lo que necesitas con entrega rápida en Cancún. Pago seguro con MercadoPago.');
          }

          // Open Graph dynamic tags for social sharing
          const ogTitle = document.querySelector('meta[property="og:title"]');
          if (ogTitle) ogTitle.setAttribute('content', `${data.name} | Bazarito Cancún ☀️`);
          const ogDesc = document.querySelector('meta[property="og:description"]');
          if (ogDesc) ogDesc.setAttribute('content', data.description || 'Producto disponible con entrega en Cancún.');
          if (data.images?.[0]) {
            const ogImg = document.querySelector('meta[property="og:image"]');
            if (ogImg) ogImg.setAttribute('content', data.images[0]);
          }

          // ══════════════════════════════════════════════════════
          // PRODUCT JSON-LD — Feeds Google Rich Results, Shopping,
          // and AI search engines (ChatGPT, Gemini, Perplexity)
          // ══════════════════════════════════════════════════════
          const existingScript = document.getElementById('product-jsonld');
          if (existingScript) existingScript.remove();

          const script = document.createElement('script');
          script.id = 'product-jsonld';
          script.type = 'application/ld+json';
          script.textContent = JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: data.name,
            description: data.description || 'Producto disponible en Bazarito Cancún con entrega local.',
            image: data.images?.length ? data.images : (data.image ? [data.image] : []),
            sku: data.id,
            brand: {
              '@type': 'Brand',
              name: 'Bazarito Cancún',
            },
            offers: {
              '@type': 'Offer',
              url: `https://bazaritocancun.com/p/${data.id}`,
              priceCurrency: 'MXN',
              price: data.price,
              priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
              availability: (data.status === 'sold' || data.status === 'out_of_stock')
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
        }
      } catch (err) {
        console.error('Error fetching product:', err);
      }
      setLoading(false);
    }
    load();
    
    // Cleanup on unmount
    return () => {
      document.title = 'Bazarito Cancún ☀️ — Productos útiles a precios locales';
      const existingScript = document.getElementById('product-jsonld');
      if (existingScript) existingScript.remove();
    };
  }, [id]);

  async function handleShare() {
    const url = `${window.location.origin}/p/${id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${product?.name} | Bazarito Cancún`,
          text: `Mira este producto en Bazarito Cancún: ${product?.name}`,
          url,
        });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  // ── Loading state — use global skeleton shimmer ──────────────────────────
  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="plp-container">
          <div className="plp-content">
            <div className="plp-image-section skeleton" style={{ aspectRatio: '1/1' }} />
            <div className="plp-info-section" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="skeleton" style={{ height: 36, borderRadius: 8, width: '80%' }} />
              <div className="skeleton" style={{ height: 28, borderRadius: 8, width: '40%' }} />
              <div className="skeleton" style={{ height: 80, borderRadius: 8 }} />
              <div className="skeleton" style={{ height: 54, borderRadius: 12 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div>
        <Navbar />
        <div className="plp-error">
          <h2>Producto no encontrado 😢</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Ver catálogo</button>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : (product.image ? [product.image] : []);
  const ph = PLACEHOLDER_COLORS[product.category] || { bg: '#FFF8D6', emoji: '📦' };
  const isAvailable = product.status !== 'sold' && product.status !== 'out_of_stock';

  return (
    <div>
      {/* Global Navbar — essential for navigation and brand recognition */}
      <Navbar />

      <div className="plp-container">
        <div className="plp-content">
          <div className="plp-image-section">
            <ImageGallery images={images} placeholder={ph} />
          </div>
          
          <div className="plp-info-section">
            <h1 className="plp-title">{product.name}</h1>
            <div className="plp-price">${Number(product.price).toLocaleString('es-MX')} <span className="plp-currency">MXN</span></div>
            
            {/* Urgency microcopy — psychological trigger */}
            {isAvailable && (
              <div className="plp-urgency">⚡ ¡Últimas piezas disponibles!</div>
            )}

            <p className="plp-desc">{product.description || 'Producto disponible con entrega rápida en Cancún. Contáctanos para más información.'}</p>

            <div className="plp-action">
              {isAvailable ? (
                <button className="btn btn-primary plp-buy-btn" onClick={() => setShowCheckout(true)}>
                  <ShoppingBag size={20} />
                  Lo quiero ahora
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
            
            <div className="plp-trust">
              <span>🛡️ Compra segura con MercadoPago</span>
              <span>🚚 Recolección gratis · Entrega disponible en Cancún</span>
              <span>✅ Negocio local verificado · Región 96</span>
            </div>
          </div>
        </div>

        {showCheckout && (
          <CheckoutModal product={product} onClose={() => setShowCheckout(false)} />
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
          }
          .plp-arrow:hover { background: white; transform: translateY(-50%) scale(1.1); }
          .plp-left { left: 15px; } .plp-right { right: 15px; }
          .plp-dots {
            position: absolute; bottom: 15px; left: 50%; transform: translateX(-50%);
            display: flex; gap: 8px;
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
          .plp-trust {
            display: flex; flex-direction: column; gap: 6px;
            font-size: 0.82rem; color: var(--text-muted);
            background: var(--bg-muted);
            border-radius: var(--radius-md);
            padding: 12px 14px;
            line-height: 1.5;
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
