import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, CheckCircle, Rocket } from 'lucide-react';
import { updateProductAds } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${type} copiado.`);
  };

  const openLink = (url) => window.open(url, '_blank');

  // Find "What's Next"
  // Logic: 
  // 1. Find all products that have at least 1 pending ad.
  // 2. Determine the "last posted date" for each product.
  // 3. Sort products by the oldest "last posted date" (null/never posted goes first).
  // 4. Pick the #1 product.
  // 5. Get its first pending ad.
  
  let nextUp = null;

  const validProducts = products.filter(p => p.marketing_ads && p.marketing_ads.some(ad => ad.status === 'pending'));

  if (validProducts.length > 0) {
    const productsWithStats = validProducts.map(p => {
      // Find latest posted date for this product
      const postedAds = p.marketing_ads.filter(ad => ad.status === 'posted' && ad.postedAt);
      let lastPosted = 0; // Epoch 0 means never posted
      if (postedAds.length > 0) {
        // Get the most recent date
        const dates = postedAds.map(ad => new Date(ad.postedAt).getTime());
        lastPosted = Math.max(...dates);
      }
      
      const nextPendingIndex = p.marketing_ads.findIndex(ad => ad.status === 'pending');
      
      return {
        product: p,
        lastPosted,
        nextAd: p.marketing_ads[nextPendingIndex],
        nextAdIndex: nextPendingIndex
      };
    });

    // Sort by oldest lastPosted first.
    // If they have the same date (e.g. both 0), sort by product createdAt to be deterministic.
    productsWithStats.sort((a, b) => {
      if (a.lastPosted === b.lastPosted) {
        return new Date(a.product.createdAt || 0).getTime() - new Date(b.product.createdAt || 0).getTime();
      }
      return a.lastPosted - b.lastPosted;
    });

    nextUp = productsWithStats[0];
  }

  const handleMarkPosted = async () => {
    if (!nextUp) return;
    const { product, nextAdIndex } = nextUp;
    const newAds = [...product.marketing_ads];
    newAds[nextAdIndex] = { ...newAds[nextAdIndex], status: 'posted', postedAt: new Date().toISOString() };
    
    try {
      await updateProductAds(product.id, newAds);
      showToast('✅ ¡Anuncio publicado!');
      reload();
    } catch (err) {
      showToast('❌ Error al actualizar.');
    }
  };

  return (
    <div className="marketing-panel">
      {toast && <div className="toast">{toast}</div>}
      
      <div className="admin-section-header" style={{ textAlign: 'center', marginBottom: '20px' }}>
        <h2>Lo que sigue para publicar hoy</h2>
        <p>El sistema analiza tu inventario y te muestra automáticamente el anuncio exacto que debes publicar.</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {!nextUp ? (
          <div className="empty-state" style={{ maxWidth: 500, width: '100%' }}>
            <Rocket size={48} color="var(--teal)" style={{ marginBottom: 15 }} />
            <h3 style={{ margin: 0, marginBottom: 10 }}>¡Todo al día!</h3>
            <p>No tienes anuncios pendientes por publicar en tu inventario.</p>
          </div>
        ) : (
          <div className="next-card">
            <div className="next-card-header">
              <h3>{nextUp.product.name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <span className="badge badge-category">{nextUp.nextAd.category}</span>
                <span className="badge badge-profile">{nextUp.nextAd.profile || 'Sin Perfil'}</span>
              </div>
            </div>
            
            <div className="next-card-body">
              <div className="ad-preview">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                  <div style={{ flex: 1 }}>
                    <label>Headline</label>
                    <p className="ad-copy">{nextUp.nextAd.copy}</p>
                  </div>
                  <button className="btn btn-icon" onClick={() => handleCopy(nextUp.nextAd.copy, 'Headline')}>
                    <Copy size={16} /> Copiar
                  </button>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15}}>
                  <div style={{ flex: 1 }}>
                    <label>Precio</label>
                    <p className="ad-price">{nextUp.nextAd.priceStr}</p>
                  </div>
                  <button className="btn btn-icon" onClick={() => handleCopy(nextUp.nextAd.priceStr, 'Precio')}>
                    <Copy size={16} /> Copiar
                  </button>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div style={{ flex: 1, paddingRight: 15 }}>
                    <label>Descripción</label>
                    <pre className="ad-desc">{nextUp.nextAd.description}</pre>
                  </div>
                  <button className="btn btn-icon" onClick={() => handleCopy(nextUp.nextAd.description, 'Descripción')}>
                    <Copy size={16} /> Copiar
                  </button>
                </div>
              </div>
            </div>
            
            <div className="next-card-actions">
              <div className="links-group">
                <button className="btn btn-outline" onClick={() => openLink('https://www.facebook.com/marketplace/create/item')}>
                  Abrir Marketplace <ExternalLink size={14} />
                </button>
                <button className="btn btn-outline" onClick={() => openLink('https://www.facebook.com/profile.php?id=61574976372140')}>
                  Abrir Página FB <ExternalLink size={14} />
                </button>
                <button className="btn btn-outline" onClick={() => openLink('https://www.facebook.com/groups/1255207176392664')}>
                  Abrir Grupo FB <ExternalLink size={14} />
                </button>
              </div>

              <button className="btn btn-teal btn-lg" onClick={handleMarkPosted} style={{ width: '100%', marginTop: 20 }}>
                <CheckCircle size={20} /> Marcar como Publicado y ver el siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .marketing-panel { display: flex; flex-direction: column; gap: 20px; }
        
        .next-card {
          background: var(--bg-card);
          border: 2px solid var(--teal);
          border-radius: var(--radius-lg);
          padding: 30px;
          max-width: 650px;
          width: 100%;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }

        .next-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 15px;
        }

        .next-card-header h3 {
          margin: 0;
          font-size: 1.4rem;
          color: var(--text);
        }

        .badge {
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .badge-category { background: var(--bg-muted); color: var(--text-secondary); }
        .badge-profile { background: #E0F2F1; color: #00796B; }

        .ad-preview label {
          display: block;
          font-size: 0.8rem;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .ad-copy { font-weight: 600; margin: 0; font-size: 1.1rem; color: var(--text); }
        .ad-price { font-size: 1.1rem; color: var(--teal); font-weight: bold; margin: 0; }
        .ad-desc { font-size: 0.95rem; color: var(--text-secondary); white-space: pre-wrap; font-family: inherit; margin: 0; background: var(--bg-muted); padding: 15px; border-radius: 8px; border: 1px solid var(--border); }
        
        .next-card-actions { margin-top: 30px; }
        
        .links-group {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 15px;
        }

        .btn-lg {
          padding: 15px;
          font-size: 1.1rem;
          justify-content: center;
        }

        .btn-icon { background: var(--bg-muted); border: 1px solid var(--border); padding: 8px 12px; border-radius: 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; }
        .btn-icon:hover { background: var(--border); color: var(--text); }

        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--text-muted); text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
      `}</style>
    </div>
  );
}
