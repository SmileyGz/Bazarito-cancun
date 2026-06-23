import React, { useState, useEffect } from 'react';
import { Megaphone, CheckCircle, Copy, Import, Settings, Archive, Plus, Trash2 } from 'lucide-react';
import { updateProductAds, addProduct } from '../data/store';

export default function MarketingPanel({ products, reload }) {
  const [view, setView] = useState('queue'); // queue, archive, settings, intake
  const [importing, setImporting] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedProfile, setSelectedProfile] = useState('All');
  
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

  const productsWithAds = products.filter(p => p.marketing_ads && p.marketing_ads.length > 0);
  
  // Daily Queue
  const allQueue = [];
  productsWithAds.forEach(p => {
    const nextPendingIndex = p.marketing_ads.findIndex(ad => ad.status === 'pending');
    if (nextPendingIndex !== -1) {
      allQueue.push({
        product: p,
        ad: p.marketing_ads[nextPendingIndex],
        adIndex: nextPendingIndex
      });
    }
  });

  const dailyQueue = selectedProfile === 'All' 
    ? allQueue 
    : allQueue.filter(item => item.ad.profile === selectedProfile);

  // Archive Queue
  const archiveQueue = [];
  productsWithAds.forEach(p => {
    p.marketing_ads.forEach((ad, adIndex) => {
      if (ad.status === 'posted') {
        archiveQueue.push({ product: p, ad, adIndex });
      }
    });
  });
  archiveQueue.sort((a, b) => new Date(b.ad.postedAt) - new Date(a.ad.postedAt));

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text);
    showToast(`✅ ${type} copiado al portapapeles.`);
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

  const handleSaveSettings = () => {
    if (newProfile.trim() && !profiles.includes(newProfile.trim())) {
      setProfiles([...profiles, newProfile.trim()]);
      setNewProfile('');
      showToast('✅ Perfil agregado.');
    }
  };

  const removeProfile = (prof) => {
    setProfiles(profiles.filter(p => p !== prof));
  };

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
      
      <div className="admin-section-header">
        <div>
          <h2>Campañas y Anuncios</h2>
          <p>Gestiona tu rotación diaria de anuncios en Facebook</p>
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
          <button className="btn btn-teal" onClick={handleImportLegacy} disabled={importing}>
            <Import size={16} /> {importing ? 'Importando...' : 'Legacy'}
          </button>
        </div>
      </div>

      {view === 'queue' && (
        <div className="queue-container">
          <div style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
            <strong>Filtrar por Perfil:</strong>
            <select className="input" value={selectedProfile} onChange={e => setSelectedProfile(e.target.value)} style={{ width: 200, padding: 8 }}>
              <option value="All">Todos los perfiles</option>
              {profiles.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {dailyQueue.length === 0 ? (
            <div className="empty-state">
              <Megaphone size={40} color="var(--border)" />
              <p>No hay anuncios pendientes para este filtro.</p>
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
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                        <p className="ad-copy">{ad.copy}</p>
                        <button className="btn btn-icon btn-sm" onClick={() => handleCopy(ad.copy, 'Headline')} title="Copiar Copy Corto">
                          <Copy size={14} />
                        </button>
                      </div>
                      <p className="ad-price"><strong>Precio Sugerido:</strong> {ad.priceStr}</p>
                      
                      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10}}>
                        <pre className="ad-desc">{ad.description.substring(0, 150)}...</pre>
                        <button className="btn btn-icon btn-sm" onClick={() => handleCopy(ad.description, 'Descripción')} title="Copiar Descripción Larga">
                          <Copy size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="queue-card-actions">
                    <button className="btn btn-primary btn-sm" onClick={() => handleMarkPosted(product, adIndex)} style={{width: '100%'}}>
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
            <p className="text-muted" style={{ marginBottom: 15 }}>Añade o elimina los perfiles (cuentas) que utilizas para publicar. Esto te permitirá filtrar y organizar tus publicaciones diarias.</p>
            
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

      {view === 'intake' && (
        <div className="settings-container">
          <div className="settings-card" style={{ maxWidth: '800px', width: '100%' }}>
            <h3>Crear Campaña (Intake)</h3>
            <p className="text-muted" style={{ marginBottom: 20 }}>Asigna las variaciones generadas por tu prompt a un producto del inventario.</p>
            
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label>Producto a Promocionar</label>
              <select className="input" value={intakeProductId} onChange={e => setIntakeProductId(e.target.value)}>
                <option value="">-- Selecciona un producto --</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {intakeAds.map((ad, idx) => (
                <div key={idx} style={{ background: 'var(--bg-muted)', padding: 15, borderRadius: 8, border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <strong>Variante {idx + 1}</strong>
                    <button className="btn btn-icon btn-sm" onClick={() => setIntakeAds(intakeAds.filter((_, i) => i !== idx))}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Categoría (ej. Tools, Video Games)</label>
                      <input type="text" className="input" value={ad.category} onChange={e => {
                        const newAds = [...intakeAds];
                        newAds[idx].category = e.target.value;
                        setIntakeAds(newAds);
                      }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem' }}>Perfil a Publicar</label>
                      <select className="input" value={ad.profile} onChange={e => {
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
                    <label style={{ fontSize: '0.8rem' }}>Headline / Copy Corto</label>
                    <input type="text" className="input" value={ad.copy} onChange={e => {
                      const newAds = [...intakeAds];
                      newAds[idx].copy = e.target.value;
                      setIntakeAds(newAds);
                    }} />
                  </div>
                  <div style={{ marginBottom: 10 }}>
                    <label style={{ fontSize: '0.8rem' }}>Precio (Texto, ej. $240,00)</label>
                    <input type="text" className="input" value={ad.priceStr} onChange={e => {
                      const newAds = [...intakeAds];
                      newAds[idx].priceStr = e.target.value;
                      setIntakeAds(newAds);
                    }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.8rem' }}>Descripción (Larga)</label>
                    <textarea className="input" rows="4" value={ad.description} onChange={e => {
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
        .queue-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
        .queue-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; display: flex; flex-direction: column; box-shadow: var(--shadow-sm); }
        .queue-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .queue-card-header h3 { margin: 0; font-size: 1.1rem; color: var(--text); }
        .badge-category { background: var(--bg-muted); color: var(--text-secondary); padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600; }
        .queue-profile { font-size: 0.85rem; color: var(--teal); margin-bottom: 10px; }
        .ad-preview { background: var(--bg-muted); padding: 12px; border-radius: var(--radius-md); margin-bottom: 15px; }
        .ad-copy { font-weight: 600; margin: 0; font-size: 0.95rem; flex: 1; }
        .ad-price { font-size: 0.9rem; color: var(--text-secondary); margin-top: 8px; margin-bottom: 8px; }
        .ad-desc { font-size: 0.8rem; color: var(--text-muted); white-space: pre-wrap; font-family: inherit; margin: 0; flex: 1; }
        .queue-card-actions { display: flex; gap: 10px; margin-top: auto; flex-wrap: wrap; }
        .queue-card-progress { margin-top: 15px; font-size: 0.75rem; color: var(--text-muted); text-align: right; border-top: 1px solid var(--border); padding-top: 10px; }
        .settings-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; max-width: 800px; width: 100%; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 60px 20px; color: var(--text-muted); text-align: center; background: var(--bg-card); border-radius: var(--radius-lg); border: 1px dashed var(--border); }
        .btn-icon { background: transparent; border: 1px solid var(--border); padding: 4px; border-radius: 4px; color: var(--text-secondary); cursor: pointer; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: var(--bg-card-hover); color: var(--text); }
      `}</style>
    </div>
  );
}
