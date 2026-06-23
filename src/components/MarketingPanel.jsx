import React, { useState } from 'react';
import { ExternalLink, Copy, CheckCircle, Settings, Archive, Plus, Trash2 } from 'lucide-react';
import { updateProductAds, addProduct } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [view, setView] = useState('sheet-1'); // sheet-1 to sheet-8, settings, intake, archive
  const [toast, setToast] = useState(null);

  // Filter products that have marketing ads
  const productsWithAds = products.filter(p => p.marketing_ads && p.marketing_ads.length > 0);
  
  // Sort products to maintain a consistent order (new products go to the bottom)
  // Assuming products have a createdAt, or just by ID/name to keep it stable
  const sortedProducts = [...productsWithAds].sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${type} copiado.`);
  };

  const handleMarkPosted = async (product, adIndex) => {
    const newAds = [...product.marketing_ads];
    newAds[adIndex] = { ...newAds[adIndex], status: 'posted', postedAt: new Date().toISOString() };
    try {
      await updateProductAds(product.id, newAds);
      showToast('✅ Marcado como publicado.');
      reload();
    } catch (err) {
      showToast('❌ Error al actualizar.');
    }
  };

  const openLink = (url) => window.open(url, '_blank');

  // Helper to render the current sheet
  const renderSheet = (sheetIndex) => { // 0 to 7
    return (
      <div className="queue-list">
        {sortedProducts.map((product) => {
          const ad = product.marketing_ads[sheetIndex];
          if (!ad) return null; // If product doesn't have an ad at this index

          const isPosted = ad.status === 'posted';

          return (
            <div key={`${product.id}-${sheetIndex}`} className={`queue-card ${isPosted ? 'is-posted' : ''}`}>
              <div className="queue-card-header">
                <h3>{product.name.substring(0, 45)}{product.name.length > 45 ? '...' : ''}</h3>
                <span className="badge badge-category">{ad.category}</span>
              </div>
              
              <div className="queue-card-body">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <p className="queue-profile"><strong>Perfil Asignado:</strong> {ad.profile || 'Sin Asignar'}</p>
                  {isPosted && <span className="badge-posted">✅ Publicado ({new Date(ad.postedAt).toLocaleDateString()})</span>}
                </div>
                
                <div className="ad-preview">
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <p className="ad-copy">{ad.copy}</p>
                    <button className="btn btn-icon btn-sm" onClick={() => handleCopy(ad.copy, 'Headline')} title="Copiar Copy">
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="ad-price"><strong>Precio:</strong> {ad.priceStr}</p>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10}}>
                    <pre className="ad-desc">{ad.description.substring(0, 120)}...</pre>
                    <button className="btn btn-icon btn-sm" onClick={() => handleCopy(ad.description, 'Descripción')} title="Copiar Descripción">
                      <Copy size={14} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="queue-card-actions">
                <button className="btn btn-primary btn-sm" onClick={() => handleMarkPosted(product, sheetIndex)} disabled={isPosted} style={{flex: 1}}>
                  <CheckCircle size={14} /> {isPosted ? 'Ya Publicado' : 'Marcar Publicado'}
                </button>
                <div style={{display: 'flex', gap: 5}}>
                  <button className="btn btn-outline btn-sm" onClick={() => openLink('https://www.facebook.com/marketplace/create/item')} title="Marketplace">
                    <ExternalLink size={14} /> Mkt
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => openLink('https://www.facebook.com/profile.php?id=61574976372140')} title="Facebook Page">
                    <ExternalLink size={14} /> Pág
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => openLink('https://www.facebook.com/groups/1255207176392664')} title="Facebook Group">
                    <ExternalLink size={14} /> Grp
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="marketing-panel">
      {toast && <div className="toast">{toast}</div>}
      
      <div className="admin-section-header">
        <div>
          <h2>Sistema de Listas (1 al 8)</h2>
          <p>Navega lista por lista. Cada lista contiene una variación específica para todos tus productos.</p>
        </div>
      </div>

      <div className="sheet-tabs">
        {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
          <button 
            key={num} 
            className={`sheet-tab ${view === `sheet-${num}` ? 'active' : ''}`}
            onClick={() => setView(`sheet-${num}`)}
          >
            Lista {num}
          </button>
        ))}
        <div style={{ borderLeft: '1px solid var(--border)', margin: '0 10px' }}></div>
        <button className={`sheet-tab ${view === 'intake' ? 'active' : ''}`} onClick={() => setView('intake')}>
          <Plus size={14} /> Crear
        </button>
      </div>

      <div className="queue-container">
        {view.startsWith('sheet-') && renderSheet(parseInt(view.replace('sheet-', '')) - 1)}
        
        {view === 'intake' && (
          <div className="empty-state">
            <p>Sección de creación de campañas. (Vuelve a las Listas para ver lo que sigue).</p>
          </div>
        )}
      </div>

      <style>{`
        .marketing-panel { display: flex; flex-direction: column; gap: 20px; }
        
        .sheet-tabs {
          display: flex;
          background: var(--bg-card);
          padding: 8px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--border);
          overflow-x: auto;
          box-shadow: var(--shadow-sm);
        }

        .sheet-tab {
          padding: 8px 16px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 600;
          color: var(--text-secondary);
          border-radius: 6px;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .sheet-tab:hover {
          background: var(--bg-muted);
          color: var(--text);
        }

        .sheet-tab.active {
          background: var(--teal);
          color: white;
        }

        .queue-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        
        .queue-card { 
          background: var(--bg-card); 
          border: 1px solid var(--border); 
          border-radius: var(--radius-lg); 
          padding: 20px; 
          display: flex; 
          flex-direction: column; 
          box-shadow: var(--shadow-sm); 
          transition: opacity 0.3s;
        }

        .queue-card.is-posted {
          opacity: 0.5;
          order: 9999; /* Move to bottom if desired, or keep in place. Keeping in place for now */
        }
        
        .queue-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .queue-card-header h3 { margin: 0; font-size: 1.05rem; color: var(--text); }
        .badge-category { background: var(--bg-muted); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .queue-profile { font-size: 0.85rem; color: var(--teal); margin: 0; }
        .badge-posted { font-size: 0.75rem; font-weight: bold; color: #2E7D32; background: #E8F6EC; padding: 2px 8px; border-radius: 12px; }
        
        .ad-preview { background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); }
        .ad-copy { font-weight: 600; margin: 0; font-size: 0.95rem; flex: 1; }
        .ad-price { font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px; margin-bottom: 8px; }
        .ad-desc { font-size: 0.8rem; color: var(--text-muted); white-space: pre-wrap; font-family: inherit; margin: 0; flex: 1; }
        
        .queue-card-actions { display: flex; gap: 10px; margin-top: 15px; flex-wrap: wrap; }
        
        .btn-icon { background: transparent; border: 1px solid var(--border); padding: 4px; border-radius: 4px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: var(--bg-card-hover); color: var(--text); }
        
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--text-muted); text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
      `}</style>
    </div>
  );
}
