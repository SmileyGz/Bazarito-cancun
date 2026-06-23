import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Calendar, X } from 'lucide-react';
import { updateProductAds } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [selectedAd, setSelectedAd] = useState(null); // { product, ad, adIndex }
  const [toast, setToast] = useState(null);

  // Filter products that have marketing ads
  const productsWithAds = products.filter(p => p.marketing_ads && p.marketing_ads.length > 0);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${type} copiado.`);
  };

  const handleMarkPosted = async () => {
    if (!selectedAd) return;
    const { product, adIndex } = selectedAd;
    const newAds = [...product.marketing_ads];
    newAds[adIndex] = { ...newAds[adIndex], status: 'posted', postedAt: new Date().toISOString() };
    
    try {
      await updateProductAds(product.id, newAds);
      showToast('✅ Marcado como publicado hoy.');
      reload();
      setSelectedAd(null); // Close modal
    } catch (err) {
      showToast('❌ Error al actualizar.');
    }
  };

  const openLink = (url) => {
    window.open(url, '_blank');
  };

  // Sort products alphabetically or by some stable order
  const sortedProducts = [...productsWithAds].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="marketing-panel">
      {toast && <div className="toast">{toast}</div>}
      
      <div className="admin-section-header">
        <div>
          <h2>Matriz de Publicaciones</h2>
          <p>Navega por tus productos fila por fila. Haz clic en una caja para ver el contenido, copiarlo y registrar la fecha de publicación.</p>
        </div>
      </div>

      <div className="matrix-container">
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ width: '300px', textAlign: 'left' }}>Producto</th>
              <th colSpan={8} style={{ textAlign: 'center' }}>Variaciones (Cajas de Fecha)</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.map(product => (
              <tr key={product.id}>
                <td className="product-name-cell">
                  <strong>{product.name.substring(0, 40)}{product.name.length > 40 ? '...' : ''}</strong>
                </td>
                <td className="boxes-cell" colSpan={8}>
                  <div className="boxes-row">
                    {product.marketing_ads.map((ad, idx) => {
                      const isPosted = ad.status === 'posted' && ad.postedAt;
                      const dateStr = isPosted ? new Date(ad.postedAt).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit' }) : '';
                      
                      return (
                        <div 
                          key={ad.id || idx} 
                          className={`ad-box ${isPosted ? 'posted' : 'pending'}`}
                          onClick={() => setSelectedAd({ product, ad, adIndex: idx })}
                          title={`Categoría: ${ad.category} | Perfil: ${ad.profile}`}
                        >
                          <div className="box-profile">{ad.profile || `V${idx+1}`}</div>
                          <div className="box-date">{dateStr || '-'}</div>
                        </div>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL para ver el anuncio y publicar */}
      {selectedAd && (
        <div className="modal-overlay" onClick={() => setSelectedAd(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedAd.product.name}</h3>
              <button className="btn-icon" onClick={() => setSelectedAd(null)}><X size={20} /></button>
            </div>
            
            <div className="modal-body">
              <div className="info-tags">
                <span className="badge">Categoría: {selectedAd.ad.category}</span>
                <span className="badge badge-profile">Perfil: {selectedAd.ad.profile}</span>
              </div>

              <div className="content-section">
                <div className="content-header">
                  <strong>Headline / Copy</strong>
                  <button className="btn btn-outline btn-sm" onClick={() => handleCopy(selectedAd.ad.copy, 'Copy')}>
                    <Copy size={14} /> Copiar
                  </button>
                </div>
                <div className="content-box">{selectedAd.ad.copy}</div>
              </div>

              <div className="content-section">
                <div className="content-header">
                  <strong>Precio</strong>
                  <button className="btn btn-outline btn-sm" onClick={() => handleCopy(selectedAd.ad.priceStr, 'Precio')}>
                    <Copy size={14} /> Copiar
                  </button>
                </div>
                <div className="content-box">{selectedAd.ad.priceStr}</div>
              </div>

              <div className="content-section">
                <div className="content-header">
                  <strong>Descripción</strong>
                  <button className="btn btn-outline btn-sm" onClick={() => handleCopy(selectedAd.ad.description, 'Descripción')}>
                    <Copy size={14} /> Copiar
                  </button>
                </div>
                <div className="content-box desc-box">{selectedAd.ad.description}</div>
              </div>
            </div>

            <div className="modal-actions-grid">
              <div className="links-group">
                <button className="btn btn-fb" onClick={() => openLink('https://www.facebook.com/marketplace/create/item')}>
                  Marketplace <ExternalLink size={14} />
                </button>
                <button className="btn btn-fb" onClick={() => openLink('https://www.facebook.com/profile.php?id=61574976372140')}>
                  Página FB <ExternalLink size={14} />
                </button>
                <button className="btn btn-fb" onClick={() => openLink('https://www.facebook.com/groups/1255207176392664')}>
                  Grupo FB <ExternalLink size={14} />
                </button>
              </div>

              <div className="mark-group">
                <button className="btn btn-teal" onClick={handleMarkPosted} style={{ width: '100%' }}>
                  <Calendar size={16} /> Marcar Fecha de Hoy en la Caja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .marketing-panel { display: flex; flex-direction: column; gap: 20px; }
        
        .matrix-container {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-lg);
          overflow-x: auto;
          box-shadow: var(--shadow-sm);
        }
        
        .matrix-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }
        
        .matrix-table th {
          background: var(--bg-muted);
          padding: 12px 16px;
          border-bottom: 2px solid var(--border);
          font-weight: 600;
          color: var(--text-secondary);
        }
        
        .matrix-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--border);
          vertical-align: middle;
        }

        .matrix-table tr:hover {
          background: var(--bg-muted);
        }

        .product-name-cell {
          color: var(--text);
          font-size: 0.95rem;
        }

        .boxes-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .ad-box {
          width: 60px;
          height: 50px;
          border: 1px solid var(--border);
          border-radius: 6px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          background: var(--bg-card);
        }

        .ad-box:hover {
          border-color: var(--teal);
          transform: translateY(-2px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .box-profile {
          font-size: 0.7rem;
          font-weight: bold;
          color: var(--text-secondary);
        }

        .box-date {
          font-size: 0.75rem;
          color: var(--text);
          font-weight: 500;
        }

        .ad-box.posted {
          background: #E8F6EC;
          border-color: #A5D6A7;
        }
        .ad-box.posted .box-date {
          color: #2E7D32;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }
        
        .modal-content {
          background: var(--bg-card);
          width: 100%;
          max-width: 650px;
          border-radius: var(--radius-lg);
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          max-height: 90vh;
        }

        .modal-header {
          padding: 20px;
          border-bottom: 1px solid var(--border);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 { margin: 0; font-size: 1.2rem; }
        
        .modal-body {
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .info-tags { display: flex; gap: 10px; margin-bottom: 10px; }
        .badge { background: var(--bg-muted); padding: 4px 10px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; }
        .badge-profile { background: #E0F2F1; color: #00796B; }

        .content-section {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .content-box {
          background: var(--bg-muted);
          padding: 12px;
          border-radius: 6px;
          font-size: 0.9rem;
          border: 1px solid var(--border);
        }

        .desc-box {
          white-space: pre-wrap;
          max-height: 200px;
          overflow-y: auto;
        }

        .modal-actions-grid {
          padding: 20px;
          border-top: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: var(--bg-muted);
          border-bottom-left-radius: var(--radius-lg);
          border-bottom-right-radius: var(--radius-lg);
        }

        .links-group {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }

        .btn-fb {
          background: #1877F2;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-weight: 600;
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
        }
        .btn-fb:hover { background: #166FE5; }

        .btn-icon { background: transparent; border: none; cursor: pointer; color: var(--text-secondary); }
        .btn-icon:hover { color: var(--text); }
      `}</style>
    </div>
  );
}
