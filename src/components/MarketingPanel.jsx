import React, { useState } from 'react';
import { Megaphone, CheckCircle, Copy, Import, Settings, Archive } from 'lucide-react';
import { updateProductAds, addProduct } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [view, setView] = useState('queue');
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);

  const productsWithAds = products.filter(p => p.marketing_ads && p.marketing_ads.length > 0);
  
  const dailyQueue = [];
  productsWithAds.forEach(p => {
    const nextPendingIndex = p.marketing_ads.findIndex(ad => ad.status === 'pending');
    if (nextPendingIndex !== -1) {
      dailyQueue.push({
        product: p,
        ad: p.marketing_ads[nextPendingIndex],
        adIndex: nextPendingIndex
      });
    }
  });

  const archiveQueue = [];
  productsWithAds.forEach(p => {
    p.marketing_ads.forEach((ad, adIndex) => {
      if (ad.status === 'posted') {
        archiveQueue.push({
          product: p,
          ad,
          adIndex
        });
      }
    });
  });
  
  archiveQueue.sort((a, b) => new Date(b.ad.postedAt) - new Date(a.ad.postedAt));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleImportLegacy = async () => {
    if (!window.confirm('¿Importar datos legacy desde el archivo JSON?')) return;
    setImporting(true);
    try {
      const mod = await import('../data/legacy-ads.json');
      const legacyData = mod.default || mod;
      
      let count = 0;
      for (const pData of legacyData) {
        if (pData.ads.length < 2) continue;
        const priceNum = parseFloat(pData.ads[0].priceStr.replace(/[^0-9.]/g, '')) || 0;
        await addProduct({
          name: pData.name || 'Imported Product',
          description: pData.ads[0].description,
          status: 'draft',
          price: priceNum,
          cost: 0,
          type: 'one_off',
          marketing_ads: pData.ads
        });
        count++;
      }
      showToast(`✅ Importados ${count} productos con anuncios.`);
      reload();
    } catch (err) {
      console.error(err);
      showToast('❌ Error al importar. Asegúrate de que src/data/legacy-ads.json exista.');
    }
    setImporting(false);
  };

  const handleMarkPosted = async (product, adIndex) => {
    const newAds = [...product.marketing_ads];
    newAds[adIndex] = { ...newAds[adIndex], status: 'posted', postedAt: new Date().toISOString() };
    try {
      await updateProductAds(product.id, newAds);
      showToast('✅ Anuncio marcado como publicado.');
      reload();
    } catch (err) {
      showToast('❌ Error al actualizar anuncio.');
    }
  };

  const handleCopyAndGo = (ad) => {
    const textToCopy = `${ad.copy}\n\n${ad.priceStr}\n\n${ad.description}`;
    navigator.clipboard.writeText(textToCopy);
    showToast('✅ Copiado al portapapeles. Abriendo Marketplace...');
    window.open('https://www.facebook.com/marketplace/create/item', '_blank');
  };

  return (
    <div className="marketing-panel">
      {toast && <div className="toast">{toast}</div>}
      
      <div className="admin-section-header">
        <div>
          <h2>Campañas y Anuncios</h2>
          <p>Gestiona tu rotación diaria de anuncios en Facebook</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className={`btn ${view === 'archive' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('archive')}>
            <Archive size={16} /> Historial
          </button>
          <button className={`btn ${view === 'queue' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('queue')}>
            <Megaphone size={16} /> Cola Diaria
          </button>
          <button className={`btn ${view === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('settings')}>
            <Settings size={16} /> Ajustes
          </button>
          <button className="btn btn-teal" onClick={handleImportLegacy} disabled={importing}>
            <Import size={16} /> {importing ? 'Importando...' : 'Importar Legacy'}
          </button>
        </div>
      </div>

      {view === 'queue' && (
        <div className="queue-container">
          {dailyQueue.length === 0 ? (
            <div className="empty-state">
              <Megaphone size={40} color="var(--border)" />
              <p>No hay anuncios pendientes en la cola.</p>
            </div>
          ) : (
            <div className="queue-list">
              {dailyQueue.map(({ product, ad, adIndex }) => (
                <div key={`${product.id}-${ad.id}`} className="queue-card">
                  <div className="queue-card-header">
                    <h3>{product.name}</h3>
                    <span className="badge badge-category">{ad.category}</span>
                  </div>
                  
                  <div className="queue-card-body">
                    <p className="queue-profile"><strong>Perfil Asignado:</strong> {ad.profile || 'Sin Asignar'}</p>
                    <div className="ad-preview">
                      <p className="ad-copy">{ad.copy}</p>
                      <p className="ad-price"><strong>Precio Sugerido:</strong> {ad.priceStr}</p>
                      <pre className="ad-desc">{ad.description.substring(0, 150)}...</pre>
                    </div>
                  </div>
                  
                  <div className="queue-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleCopyAndGo(ad)}>
                      <Copy size={14} /> Copy & Go Marketplace
                    </button>
                    <button className="btn btn-outline btn-sm" onClick={() => handleMarkPosted(product, adIndex)}>
                      <CheckCircle size={14} /> Marcar como Publicado
                    </button>
                  </div>
                  <div className="queue-card-progress">
                    Variante {adIndex + 1} de {product.marketing_ads.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'archive' && (
        <div className="queue-container">
          {archiveQueue.length === 0 ? (
            <div className="empty-state">
              <Archive size={40} color="var(--border)" />
              <p>No hay anuncios en el historial.</p>
            </div>
          ) : (
            <div className="queue-list">
              {archiveQueue.map(({ product, ad, adIndex }) => (
                <div key={`${product.id}-${ad.id}-archived`} className="queue-card" style={{ opacity: 0.8 }}>
                  <div className="queue-card-header">
                    <h3>{product.name}</h3>
                    <span className="badge badge-category">{ad.category}</span>
                  </div>
                  
                  <div className="queue-card-body">
                    <p className="queue-profile"><strong>Perfil Asignado:</strong> {ad.profile || 'Sin Asignar'}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      Publicado el: {new Date(ad.postedAt).toLocaleDateString()}
                    </p>
                    <div className="ad-preview" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
                      <p className="ad-copy">{ad.copy}</p>
                      <p className="ad-price"><strong>Precio:</strong> {ad.priceStr}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {view === 'settings' && (
        <div className="settings-container">
          <div className="settings-card">
            <h3>Perfiles de Facebook</h3>
            <p className="text-muted" style={{ marginBottom: 15 }}>Gestiona los perfiles que usas para publicar en Marketplace.</p>
            <p><strong>Perfiles actuales detectados:</strong> JG, L, J, B, A</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              (Los perfiles se asignan actualmente durante la importación o creación del anuncio).
            </p>
          </div>
        </div>
      )}

      <style>{`
        .marketing-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .queue-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }
        .queue-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          display: flex;
          flex-direction: column;
          box-shadow: var(--shadow-sm);
        }
        .queue-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }
        .queue-card-header h3 {
          margin: 0;
          font-size: 1.1rem;
          color: var(--text);
        }
        .badge-category {
          background: var(--bg-muted);
          color: var(--text-secondary);
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .queue-profile {
          font-size: 0.85rem;
          color: var(--teal);
          margin-bottom: 10px;
        }
        .ad-preview {
          background: var(--bg-muted);
          padding: 12px;
          border-radius: var(--radius-md);
          margin-bottom: 15px;
        }
        .ad-copy {
          font-weight: 600;
          margin-bottom: 8px;
          font-size: 0.95rem;
        }
        .ad-price {
          font-size: 0.9rem;
          color: var(--text-secondary);
          margin-bottom: 8px;
        }
        .ad-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          white-space: pre-wrap;
          font-family: inherit;
          margin: 0;
        }
        .queue-card-actions {
          display: flex;
          gap: 10px;
          margin-top: auto;
          flex-wrap: wrap;
        }
        .queue-card-progress {
          margin-top: 15px;
          font-size: 0.75rem;
          color: var(--text-muted);
          text-align: right;
          border-top: 1px solid var(--border);
          padding-top: 10px;
        }
        .settings-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          max-width: 600px;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          color: var(--text-muted);
          text-align: center;
          background: var(--bg-card);
          border-radius: var(--radius-lg);
          border: 1px dashed var(--border);
        }
      `}</style>
    </div>
  );
}
