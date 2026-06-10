import React, { useState, useEffect, useRef } from 'react';
import { X, ImagePlus, Trash2 } from 'lucide-react';
import { CATEGORIES, PRODUCT_TYPES, STATUSES } from '../data/store';

const MAX_IMAGES = 3;
const MAX_SIZE_MB = 2; // compress target

const EMPTY = {
  name: '', description: '', category: 'hogar',
  type: PRODUCT_TYPES.STOCK, cost: '', price: '',
  status: STATUSES.AVAILABLE, stock: 1,
  supplier: '', images: [], featured: false,
};

// Compress & resize image to base64 via canvas
function compressImage(file, maxW = 900, quality = 0.80) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxW) { height = Math.round(height * maxW / width); width = maxW; }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function AdminProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(EMPTY);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const fileRef = useRef();

  useEffect(() => {
    if (product) {
      // Support legacy `image` string field → convert to images array
      const imgs = product.images?.length
        ? product.images
        : (product.image ? [product.image] : []);
      setForm({ ...EMPTY, ...product, images: imgs });
    } else {
      setForm(EMPTY);
    }
  }, [product]);

  const margin = form.cost && form.price
    ? Math.round(((Number(form.price) - Number(form.cost)) / Number(form.cost)) * 100)
    : null;

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); }

  // ── Image handling ────────────────────────────

  async function addFiles(files) {
    if (!files?.length) return;
    const remaining = MAX_IMAGES - (form.images?.length || 0);
    if (remaining <= 0) return;
    setUploading(true);
    try {
      const toProcess = Array.from(files).slice(0, remaining);
      const compressed = await Promise.all(toProcess.map(f => compressImage(f)));
      setForm(prev => ({ ...prev, images: [...(prev.images || []), ...compressed] }));
    } catch (err) {
      console.error('Image error', err);
    }
    setUploading(false);
  }

  function removeImage(idx) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  function onDragOver(e) { e.preventDefault(); setDragging(true); }
  function onDragLeave() { setDragging(false); }
  function onDrop(e) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }

  // ── Submit ────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setSaveError('');
    try {
      await onSave({
        ...form,
        cost:   Number(form.cost),
        price:  Number(form.price),
        stock:  Number(form.stock),
        image:  form.images?.[0] || '',   // keep legacy field in sync
        images: form.images || [],
      });
    } catch (err) {
      setSaveError(err.message || 'Error al guardar.');
      setSaving(false);
    }
  }

  const canAddMore = (form.images?.length || 0) < MAX_IMAGES;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box apf-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="apf-header">
          <h3>{product ? 'Editar Producto' : 'Nuevo Producto'}</h3>
          <button className="btn btn-icon" onClick={onClose} style={{ color:'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="apf-form">
          {/* ── Images ── */}
          <div className="input-group">
            <label>Fotos del producto <span style={{ color:'var(--text-muted)', fontWeight:400 }}>(máx. {MAX_IMAGES})</span></label>

            <div className="apf-images-grid">
              {/* Existing images */}
              {(form.images || []).map((src, idx) => (
                <div key={idx} className="apf-img-thumb">
                  <img src={src} alt={`Foto ${idx+1}`} />
                  {idx === 0 && <span className="apf-img-main-badge">Principal</span>}
                  <button type="button" className="apf-img-remove" onClick={() => removeImage(idx)}>
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}

              {/* Drop zone / add button — show only if slots remain */}
              {canAddMore && (
                <div
                  className={`apf-dropzone ${dragging ? 'apf-dropzone-active' : ''} ${uploading ? 'apf-dropzone-loading' : ''}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => !uploading && fileRef.current?.click()}
                >
                  {uploading ? (
                    <div className="apf-spinner" />
                  ) : (
                    <>
                      <ImagePlus size={24} />
                      <span>Subir foto</span>
                      <span className="apf-dz-hint">o arrastra aquí</span>
                    </>
                  )}
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display:'none' }}
                onChange={e => { addFiles(e.target.files); e.target.value = ''; }}
              />
            </div>

            {(form.images?.length || 0) > 0 && (
              <p style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>
                La primera foto es la principal. Toca 🗑️ para eliminar.
              </p>
            )}
          </div>

          {/* ── Name ── */}
          <div className="input-group">
            <label>Nombre del producto *</label>
            <input className="input" required value={form.name}
              onChange={e => set('name', e.target.value)} placeholder="Ej: Organizador de cocina" />
          </div>

          {/* ── Description ── */}
          <div className="input-group">
            <label>Descripción</label>
            <textarea className="textarea" value={form.description}
              onChange={e => set('description', e.target.value)}
              placeholder="Describe brevemente el producto..." />
          </div>

          {/* ── Category + Type ── */}
          <div className="apf-row">
            <div className="input-group">
              <label>Categoría *</label>
              <select className="select" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Tipo *</label>
              <select className="select" value={form.type} onChange={e => set('type', e.target.value)}>
                <option value={PRODUCT_TYPES.STOCK}>📦 Stock (repetible)</option>
                <option value={PRODUCT_TYPES.ONE_OFF}>🏷️ Única (one-off)</option>
              </select>
            </div>
          </div>

          {/* ── Prices ── */}
          <div className="apf-row">
            <div className="input-group">
              <label>Costo (MXN) *</label>
              <input className="input" type="number" required min="0" value={form.cost}
                onChange={e => set('cost', e.target.value)} placeholder="0" />
            </div>
            <div className="input-group">
              <label>Precio venta (MXN) *</label>
              <input className="input" type="number" required min="0" value={form.price}
                onChange={e => set('price', e.target.value)} placeholder="0" />
            </div>
          </div>

          {/* Margin indicator */}
          {margin !== null && (
            <div className={`apf-margin ${margin >= 50 ? 'apf-margin-good' : margin >= 0 ? 'apf-margin-ok' : 'apf-margin-bad'}`}>
              Margen: <strong>{margin}%</strong>
              {margin >= 100 ? ' 🔥 Excelente' : margin >= 50 ? ' ✅ Bueno' : margin >= 0 ? ' ⚠️ Bajo' : ' ❌ Pérdida'}
            </div>
          )}

          {/* ── Stock + Status ── */}
          <div className="apf-row">
            <div className="input-group">
              <label>Stock / Cantidad</label>
              <input className="input" type="number" min="0" value={form.stock}
                onChange={e => set('stock', e.target.value)} />
            </div>
            <div className="input-group">
              <label>Estado</label>
              <select className="select" value={form.status} onChange={e => set('status', e.target.value)}>
                <option value={STATUSES.AVAILABLE}>✅ Disponible</option>
                <option value={STATUSES.SOLD}>🔴 Vendido</option>
                <option value={STATUSES.OUT_OF_STOCK}>⚠️ Sin stock</option>
              </select>
            </div>
          </div>

          {/* ── Supplier ── */}
          <div className="input-group">
            <label>Proveedor / Fuente</label>
            <input className="input" value={form.supplier}
              onChange={e => set('supplier', e.target.value)}
              placeholder="Ej: Mercado Central, Marketplace..." />
          </div>

          {/* ── Featured ── */}
          <label className="apf-check">
            <input type="checkbox" checked={form.featured} onChange={e => set('featured', e.target.checked)} />
            <span>⭐ Destacado en el catálogo</span>
          </label>

          {saveError && (
            <div className="apf-save-error">⚠️ {saveError}</div>
          )}

          {/* ── Actions ── */}
          <div className="apf-actions">
            <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>Cancelar</button>
            <button type="submit" className="btn btn-teal" disabled={saving}>
              {saving ? 'Guardando...' : (product ? 'Guardar cambios' : 'Agregar producto')}
            </button>
          </div>
        </form>

        <style>{`
          .apf-modal { width: 100%; max-width: 580px; }
          .apf-header {
            display: flex; align-items: center; justify-content: space-between;
            padding: 20px 24px 0;
          }
          .apf-header h3 { font-size: 1.2rem; }
          .apf-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }
          .apf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

          /* Images grid */
          .apf-images-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }
          .apf-img-thumb {
            position: relative;
            aspect-ratio: 1;
            border-radius: var(--radius-md);
            overflow: hidden;
            border: 1.5px solid var(--border);
            background: var(--bg-muted);
          }
          .apf-img-thumb img {
            width: 100%; height: 100%; object-fit: cover;
          }
          .apf-img-main-badge {
            position: absolute; top: 6px; left: 6px;
            background: var(--teal); color: white;
            font-size: 0.62rem; font-weight: 700;
            padding: 2px 7px; border-radius: var(--radius-full);
            letter-spacing: 0.03em;
          }
          .apf-img-remove {
            position: absolute; top: 5px; right: 5px;
            width: 26px; height: 26px;
            background: rgba(255,255,255,0.9);
            border: none; border-radius: var(--radius-full);
            display: flex; align-items: center; justify-content: center;
            cursor: pointer; color: #C62828;
            transition: all var(--dur-fast);
            box-shadow: var(--shadow-sm);
          }
          .apf-img-remove:hover { background: #FFEBEE; transform: scale(1.1); }

          /* Drop zone */
          .apf-dropzone {
            aspect-ratio: 1;
            border: 2px dashed var(--border);
            border-radius: var(--radius-md);
            display: flex; flex-direction: column;
            align-items: center; justify-content: center;
            gap: 6px; cursor: pointer;
            background: var(--bg-muted);
            color: var(--text-muted);
            font-size: 0.78rem; font-weight: 600;
            transition: all var(--dur-fast);
          }
          .apf-dropzone:hover, .apf-dropzone-active {
            border-color: var(--teal);
            background: #E8F4F3;
            color: var(--teal);
          }
          .apf-dropzone-loading { cursor: wait; pointer-events: none; }
          .apf-dz-hint { font-size: 0.68rem; font-weight: 400; color: var(--text-muted); }

          /* Spinner */
          .apf-spinner {
            width: 24px; height: 24px;
            border: 3px solid var(--border);
            border-top-color: var(--teal);
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }

          /* Margin */
          .apf-margin { padding: 10px 14px; border-radius: var(--radius-md); font-size: 0.9rem; font-weight: 600; }
          .apf-margin-good { background: #E8F6EC; color: #2E7D32; border: 1.5px solid #A5D6A7; }
          .apf-margin-ok   { background: #FFF8D6; color: #E65100; border: 1.5px solid var(--yellow); }
          .apf-margin-bad  { background: #FFEBEE; color: #C62828; border: 1.5px solid #EF9A9A; }

          /* Featured */
          .apf-check {
            display: flex; align-items: center; gap: 10px;
            cursor: pointer; font-weight: 600; font-size: 0.9rem; color: var(--text-secondary);
          }
          .apf-check input { accent-color: var(--teal); width: 18px; height: 18px; cursor: pointer; }

          /* Save error */
          .apf-save-error {
            background: #FFEBEE; border: 1.5px solid #EF9A9A;
            border-radius: var(--radius-md); padding: 10px 14px;
            font-size: 0.85rem; color: #C62828; font-weight: 600;
          }

          /* Actions */
          .apf-actions {
            display: flex; gap: 10px; justify-content: flex-end;
            padding-top: 8px; border-top: 1.5px solid var(--border);
          }

          @media (max-width: 480px) {
            .apf-row { grid-template-columns: 1fr; }
            .apf-actions { flex-direction: column; }
            .apf-actions .btn { width: 100%; justify-content: center; }
            .apf-images-grid { grid-template-columns: repeat(3, 1fr); }
          }
        `}</style>
      </div>
    </div>
  );
}
