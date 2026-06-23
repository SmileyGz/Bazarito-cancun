import React, { useState, useEffect } from 'react';
import { ExternalLink, Copy, CheckCircle, Rocket, Send, Megaphone, Plus, Archive, Settings, Trash2, Import } from 'lucide-react';
import { updateProductAds, addProduct } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [view, setView] = useState('queue'); // queue, intake, archive, settings
  const [toast, setToast] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [importing, setImporting] = useState(false);

  // Settings: Profiles
  const [profiles, setProfiles] = useState(() => {
    const saved = localStorage.getItem('bazarito_marketing_profiles');
    return saved ? JSON.parse(saved) : ['JG', 'L', 'J', 'B', 'A'];
  });
  const [newProfile, setNewProfile] = useState('');

  // Intake State
  const [intakeProductId, setIntakeProductId] = useState('');
  const [intakeAds, setIntakeAds] = useState([{ category: '', profile: profiles[0] || '', copy: '', priceStr: '', description: '' }]);

  useEffect(() => {
    localStorage.setItem('bazarito_marketing_profiles', JSON.stringify(profiles));
  }, [profiles]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${type} copiado.`);
  };

  const openLink = (url) => window.open(url, '_blank');

  // --- "What's Next" Queue Logic ---
  let productsWithStats = [];
  const validProducts = products.filter(p => {
    // Hide one-off products that are already sold from the queue
    if (p.type === 'one_off' && p.status === 'archived') {
      return false;
    }
    return p.marketing_ads && p.marketing_ads.some(ad => ad.status === 'pending');
  });

  if (validProducts.length > 0) {
    productsWithStats = validProducts.map(p => {
      const postedAds = p.marketing_ads.filter(ad => ad.status === 'posted' && ad.postedAt);
      let lastPosted = 0;
      if (postedAds.length > 0) {
        const dates = postedAds.map(ad => new Date(ad.postedAt).getTime());
        lastPosted = Math.max(...dates);
      }
      const nextPendingIndex = p.marketing_ads.findIndex(ad => ad.status === 'pending');
      return { product: p, lastPosted, nextAd: p.marketing_ads[nextPendingIndex], nextAdIndex: nextPendingIndex };
    });

    productsWithStats.sort((a, b) => {
      if (a.lastPosted === b.lastPosted) {
        // Prioritize newest created products if they have the same lastPosted date (e.g. both 0)
        return new Date(b.product.createdAt || 0).getTime() - new Date(a.product.createdAt || 0).getTime();
      }
      return a.lastPosted - b.lastPosted;
    });
  }

  const handleMarkPosted = async (item) => {
    if (!item) return;
    const { product, nextAdIndex } = item;
    const newAds = [...product.marketing_ads];
    newAds[nextAdIndex] = { ...newAds[nextAdIndex], status: 'posted', postedAt: new Date().toISOString() };
    
    try {
      await updateProductAds(product.id, newAds);
      showToast('✅ ¡Marcado como publicado!');
      reload();
    } catch (err) {
      showToast('❌ Error al actualizar en la base de datos.');
    }
  };

  const handleUpdateProfile = async (product, adIndex) => {
    const currentProfile = product.marketing_ads[adIndex].profile || '';
    const newProfile = window.prompt("Ingresa la nueva letra del perfil (Ej: A, B, C):", currentProfile);
    
    if (newProfile !== null) {
      const newAds = [...product.marketing_ads];
      newAds[adIndex] = { ...newAds[adIndex], profile: newProfile.toUpperCase().trim() };
      try {
        await updateProductAds(product.id, newAds);
        showToast('✅ Perfil re-asignado exitosamente');
        reload();
      } catch (err) {
        showToast('❌ Error al actualizar el perfil');
      }
    }
  };

  const postToFacebookAPI = async (target, item) => {
    if (!item) return;
    
    const token = localStorage.getItem('fb_page_access_token');
    const pageId = localStorage.getItem('fb_page_id');
    const groupId = localStorage.getItem('fb_group_id');
    
    if (!token) {
      showToast('❌ Falta Access Token. Configúralo en la pestaña Integraciones.');
      return;
    }
    
    const targetId = target === 'page' ? pageId : groupId;
    if (!targetId) {
      showToast(`❌ Falta el ID de la ${target === 'page' ? 'Página' : 'Grupo'}. Configúralo en Integraciones.`);
      return;
    }

    setIsPosting(true);
    const { nextAd } = item;
    const message = `${nextAd.copy}\n\nPrecio: ${nextAd.priceStr}\n\n${nextAd.description}`;
    
    try {
      const res = await fetch(`https://graph.facebook.com/v19.0/${targetId}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: token,
          message: message
        })
      });
      
      const data = await res.json();
      if (data.id) {
        showToast(`✅ Publicado exitosamente en el ${target === 'page' ? 'Página' : 'Grupo'}!`);
      } else {
        console.error('FB API Error:', data);
        showToast(`❌ Error FB: ${data.error?.message || 'Revisa la consola'}`);
      }
    } catch (err) {
      console.error(err);
      showToast('❌ Error de conexión con Facebook API.');
    } finally {
      setIsPosting(false);
    }
  };

  // --- Archive Logic ---
  const archiveQueue = [];
  products.forEach(p => {
    if (p.marketing_ads) {
      p.marketing_ads.forEach((ad, adIndex) => {
        if (ad.status === 'posted') {
          archiveQueue.push({ product: p, ad, adIndex });
        }
      });
    }
  });
  archiveQueue.sort((a, b) => new Date(b.ad.postedAt) - new Date(a.ad.postedAt));

  // --- Settings Logic ---
  const handleSaveSettings = () => {
    if (newProfile.trim() && !profiles.includes(newProfile.trim())) {
      setProfiles([...profiles, newProfile.trim()]);
      setNewProfile('');
      showToast('✅ Perfil agregado.');
    }
  };
  const removeProfile = (prof) => setProfiles(profiles.filter(p => p !== prof));

  // --- Intake Logic ---
  const handleSaveIntake = async () => {
    if (!intakeProductId) {
      showToast('❌ Selecciona un producto.');
      return;
    }
    const product = products.find(p => p.id === intakeProductId);
    const validAds = intakeAds.filter(ad => ad.copy.trim() || ad.description.trim());
    if (validAds.length === 0) {
      showToast('❌ Añade al menos un anuncio válido.');
      return;
    }

    const formattedAds = validAds.map(ad => ({
      id: crypto.randomUUID(),
      ...ad,
      status: 'pending'
    }));

    const existingAds = product.marketing_ads || [];
    try {
      await updateProductAds(product.id, [...existingAds, ...formattedAds]);
      showToast('✅ Campaña guardada correctamente.');
      setIntakeAds([{ category: '', profile: profiles[0] || '', copy: '', priceStr: '', description: '' }]);
      setIntakeProductId('');
      reload();
      setView('queue');
    } catch (err) {
      showToast('❌ Error al guardar campaña.');
    }
  };

  const addIntakeAd = () => {
    setIntakeAds([...intakeAds, { category: '', profile: profiles[0] || '', copy: '', priceStr: '', description: '' }]);
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

  return (
    <div className="marketing-panel">
      {toast && <div className="toast">{toast}</div>}
      
      {/* --- Top Navigation --- */}
      <div className="admin-section-header">
        <div>
          <h2>FB Ads Management</h2>
          <p>Gestiona tu rotación diaria, crea nuevas campañas y revisa tu historial.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className={`btn ${view === 'intake' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('intake')}>
            <Plus size={16} /> Crear Campaña
          </button>
          <button className={`btn ${view === 'archive' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('archive')}>
            <Archive size={16} /> Historial
          </button>
          <button className={`btn ${view === 'queue' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('queue')}>
            <Megaphone size={16} /> Cola Diaria
          </button>
          <button className={`btn ${view === 'settings' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setView('settings')}>
            <Settings size={16} /> Ajustes
          </button>
        </div>
      </div>

      {/* --- "What's Next" Queue View --- */}
      {view === 'queue' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 20, gap: 30 }}>
          {!productsWithStats || productsWithStats.length === 0 ? (
            <div className="empty-state" style={{ maxWidth: 500, width: '100%' }}>
              <Rocket size={48} color="var(--teal)" style={{ marginBottom: 15 }} />
              <h3 style={{ margin: 0, marginBottom: 10 }}>¡Todo al día!</h3>
              <p>No tienes anuncios pendientes por publicar en tu inventario.</p>
            </div>
          ) : (
            <div className="compact-queue-list">
              {productsWithStats.map((item, index) => {
                const isFirst = index === 0;
                return (
                  <div key={item.product.id} className={`compact-queue-row ${isFirst ? 'row-first' : ''}`}>
                    
                    {/* Left: Rank & Info */}
                    <div className="row-info">
                      <div className="row-rank">#{index + 1}</div>
                      <div>
                        <h4 className="row-title">{item.product.name}</h4>
                        <div style={{ display: 'flex', gap: 6, marginTop: 4, alignItems: 'center' }}>
                          <span className="badge badge-category" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>{item.nextAd.category}</span>
                          <span 
                            className="badge badge-profile" 
                            style={{ fontSize: '0.7rem', padding: '2px 6px', cursor: 'pointer', border: '1px dashed var(--teal)' }}
                            onClick={() => handleUpdateProfile(item.product, item.nextAdIndex)}
                            title="Clic para re-asignar letra de perfil"
                          >
                            {item.nextAd.profile || 'Sin Asignar'} ✏️
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Middle: Copy Snippets */}
                    <div className="row-snippet" style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ minWidth: '65px' }}>Headline:</strong> 
                        <span className="truncate-text" style={{ flex: 1 }}>{item.nextAd.copy || ''}</span>
                        <button className="btn btn-icon btn-sm" onClick={() => handleCopy(item.nextAd.copy || '', 'Headline')} title="Copiar Headline" style={{ padding: '2px 6px', height: '24px' }}>
                          <Copy size={12} />
                        </button>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <strong style={{ minWidth: '65px' }}>Desc:</strong> 
                        <span className="truncate-text" style={{ flex: 1, color: 'var(--text-muted)' }}>{(item.nextAd.description || '').split('\n')[0]}...</span>
                        <button className="btn btn-icon btn-sm" onClick={() => handleCopy(item.nextAd.description || '', 'Descripción')} title="Copiar Descripción" style={{ padding: '2px 6px', height: '24px' }}>
                          <Copy size={12} />
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: '2px' }}>
                        <strong style={{ minWidth: '65px' }}>Precio:</strong> 
                        <span className="truncate-text" style={{ flex: 1, color: 'var(--teal)', fontWeight: 'bold' }}>{item.nextAd.priceStr || ''}</span>
                      </div>
                    </div>

                    {/* Right: Actions (Aligned Together) */}
                    <div className="row-actions" style={{ display: 'flex', flexDirection: 'row', gap: '8px', alignItems: 'center' }}>
                      <button className="btn btn-sm btn-api" onClick={() => postToFacebookAPI('page', item)} disabled={isPosting} title="Publicar Página">
                        <Send size={14} /> <span className="hide-mobile">Página</span>
                      </button>
                      <button className="btn btn-sm btn-api" onClick={() => postToFacebookAPI('group', item)} disabled={isPosting} title="Publicar Grupo">
                        <Send size={14} /> <span className="hide-mobile">Grupo</span>
                      </button>
                      <button className="btn btn-sm btn-teal" onClick={() => handleMarkPosted(item)} title="Marcar como Terminado">
                        <CheckCircle size={14} /> <span className="hide-mobile">Terminar</span>
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- Archive View --- */}
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
                    <div className="ad-preview" style={{ background: 'transparent', border: '1px solid var(--border)', padding: 10 }}>
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

      {/* --- Settings View --- */}
      {view === 'settings' && (
        <div className="settings-container">
          <div className="settings-card">
            <h3>Perfiles de Facebook</h3>
            <p className="text-muted" style={{ marginBottom: 15 }}>Añade o elimina los perfiles (cuentas) que utilizas para publicar.</p>
            
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input 
                type="text" 
                className="input" 
                placeholder="Nuevo perfil (ej. JG, Maria, etc)" 
                value={newProfile}
                onChange={e => setNewProfile(e.target.value)}
              />
              <button className="btn btn-teal" onClick={handleSaveSettings}>Añadir</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {profiles.map(p => (
                <div key={p} className="badge badge-category" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', fontSize: '0.9rem' }}>
                  {p}
                  <Trash2 size={14} style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => removeProfile(p)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Intake View --- */}
      {view === 'intake' && (
        <div className="settings-container" style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="settings-card" style={{ maxWidth: '800px', width: '100%' }}>
            <h3>Crear Campaña (Intake)</h3>
            <p className="text-muted" style={{ marginBottom: 20 }}>Pega las variaciones generadas por tu IA y asígnalas a un producto del inventario.</p>
            
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', marginBottom: 5, fontWeight: 600 }}>Producto a Promocionar</label>
              <select className="input" style={{ width: '100%' }} value={intakeProductId} onChange={e => setIntakeProductId(e.target.value)}>
                <option value="">-- Selecciona un producto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {intakeAds.map((ad, idx) => (
                <div key={idx} style={{ background: 'var(--bg-muted)', padding: 15, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 15 }}>
                    <strong>Variante {idx + 1}</strong>
                    <button className="btn btn-icon btn-sm" onClick={() => setIntakeAds(intakeAds.filter((_, i) => i !== idx))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>Categoría</label>
                      <input type="text" className="input" style={{ width: '100%' }} value={ad.category} onChange={e => {
                        const newAds = [...intakeAds];
                        newAds[idx].category = e.target.value;
                        setIntakeAds(newAds);
                      }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>Perfil a Publicar</label>
                      <select className="input" style={{ width: '100%' }} value={ad.profile} onChange={e => {
                        const newAds = [...intakeAds];
                        newAds[idx].profile = e.target.value;
                        setIntakeAds(newAds);
                      }}>
                        <option value="">Sin Asignar</option>
                        {profiles.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>Headline / Copy Corto</label>
                    <input type="text" className="input" style={{ width: '100%' }} value={ad.copy} onChange={e => {
                      const newAds = [...intakeAds];
                      newAds[idx].copy = e.target.value;
                      setIntakeAds(newAds);
                    }} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>Precio (Texto, ej. $240,00)</label>
                    <input type="text" className="input" style={{ width: '100%' }} value={ad.priceStr} onChange={e => {
                      const newAds = [...intakeAds];
                      newAds[idx].priceStr = e.target.value;
                      setIntakeAds(newAds);
                    }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: 5 }}>Descripción (Larga)</label>
                    <textarea className="input" rows="4" style={{ width: '100%' }} value={ad.description} onChange={e => {
                      const newAds = [...intakeAds];
                      newAds[idx].description = e.target.value;
                      setIntakeAds(newAds);
                    }}></textarea>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-outline" onClick={addIntakeAd}>
                <Plus size={16} /> Añadir Otra Variante
              </button>
              <button className="btn btn-teal" onClick={handleSaveIntake} style={{ marginLeft: 'auto' }}>
                <CheckCircle size={16} /> Guardar Campaña
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .marketing-panel { display: flex; flex-direction: column; gap: 20px; }
        
        /* Next Card & Compact List Styles */
        .compact-queue-list { display: flex; flex-direction: column; gap: 12px; width: 100%; max-width: 900px; }
        .compact-queue-row {
          display: grid;
          grid-template-columns: 200px 1fr auto;
          gap: 20px;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-md);
          padding: 16px;
          box-shadow: var(--shadow-sm);
          transition: transform var(--dur-fast);
        }
        .row-first {
          border: 2px solid var(--teal);
          box-shadow: 0 8px 24px rgba(26,122,109,0.15);
          transform: scale(1.02);
          background: #FDFFFC;
        }
        .row-info { display: flex; gap: 12px; align-items: flex-start; }
        .row-rank {
          font-family: var(--font-display);
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--teal);
          margin-top: 2px;
        }
        .row-title { margin: 0; font-size: 0.95rem; font-weight: 700; color: var(--text-primary); }
        .row-snippet {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }
        .truncate-text {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          display: block;
        }
        .row-first .row-snippet { font-size: 0.95rem; }
        .row-actions { display: flex; flex-direction: column; gap: 8px; align-items: flex-end; }
        
        @media (max-width: 768px) {
          .compact-queue-row {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .row-actions { flex-direction: row; flex-wrap: wrap; justify-content: flex-start; align-items: center; width: 100%; }
          .row-actions .btn { flex: 1; justify-content: center; }
        }

        
        /* Queue & Archive Styles */
        .queue-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .queue-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; box-shadow: var(--shadow-sm); }
        .queue-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .queue-card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text); }
        .queue-profile { font-size: 0.85rem; color: var(--teal); margin-bottom: 10px; }
        
        /* General Settings */
        .badge { padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 600; }
        .badge-category { background: var(--bg-muted); color: var(--text-secondary); }
        .badge-profile { background: #E0F2F1; color: #00796B; }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 800px; width: 100%; }
        
        /* Buttons */
        .links-group { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        .btn-api { background: #1877F2; color: white; border: none; padding: 12px; border-radius: 6px; display: flex; align-items: center; justify-content: center; gap: 8px; font-weight: 600; cursor: pointer; }
        .btn-api:hover { background: #166FE5; }
        .btn-api:disabled { opacity: 0.7; cursor: not-allowed; }
        .btn-lg { padding: 15px; font-size: 1.1rem; justify-content: center; }
        .btn-icon { background: var(--bg-muted); border: 1px solid var(--border); padding: 8px 12px; border-radius: 6px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; gap: 6px; font-weight: 600; }
        .btn-icon:hover { background: var(--border); color: var(--text); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--text-muted); text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
      `}</style>
    </div>
  );
}
