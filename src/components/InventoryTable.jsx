import React, { useState } from 'react';
import { Edit2, Trash2, CheckCircle, ChevronUp, ChevronDown, Search, AlertTriangle } from 'lucide-react';
import { CATEGORIES, STATUSES, PRODUCT_TYPES } from '../data/store';

const STATUS_MAP = {
  [STATUSES.AVAILABLE]:   { label: 'Disponible', cls: 'badge-green' },
  [STATUSES.SOLD]:        { label: 'Vendido',     cls: 'badge-red'   },
  [STATUSES.OUT_OF_STOCK]:{ label: 'Sin stock',   cls: 'badge-gray'  },
};

export default function InventoryTable({ products, onEdit, onDelete, onSale }) {
  const [search, setSearch]     = useState('');
  const [sortKey, setSortKey]   = useState('createdAt');
  const [sortDir, setSortDir]   = useState('desc');
  const [filterCat, setFilterCat]       = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  function toggleSort(key) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
  }

  const filtered = products
    .filter(p => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || (p.supplier || '').toLowerCase().includes(q);
      const matchCat    = filterCat === 'all' || p.category === filterCat;
      const matchStatus = filterStatus === 'all' || p.status === filterStatus;
      return matchSearch && matchCat && matchStatus;
    })
    .sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (sortKey === 'margin') {
        av = (a.price - a.cost) / a.cost;
        bv = (b.price - b.cost) / b.cost;
      }
      if (typeof av === 'string') av = av.toLowerCase();
      if (typeof bv === 'string') bv = bv.toLowerCase();
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });

  function SortIcon({ k }) {
    if (sortKey !== k) return <ChevronUp size={13} style={{ opacity:0.3 }} />;
    return sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />;
  }
  function Col({ label, k }) {
    return (
      <th className="itbl-th itbl-sort" onClick={() => toggleSort(k)}>
        {label} <SortIcon k={k} />
      </th>
    );
  }

  return (
    <div className="itbl-wrap">
      {/* Filters */}
      <div className="itbl-filters">
        <div className="itbl-search-wrap">
          <Search size={15} className="itbl-search-icon" />
          <input className="input itbl-search" placeholder="Buscar producto o proveedor..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="select itbl-sel" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
        <select className="select itbl-sel" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">Todos los estados</option>
          <option value={STATUSES.AVAILABLE}>✅ Disponible</option>
          <option value={STATUSES.SOLD}>🔴 Vendido</option>
          <option value={STATUSES.OUT_OF_STOCK}>⚠️ Sin stock</option>
        </select>
        <span className="itbl-count">{filtered.length} producto{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      <div className="itbl-scroll">
        <table className="itbl">
          <thead>
            <tr>
              <th className="itbl-th">Producto</th>
              <Col label="Categoría"  k="category" />
              <Col label="Tipo"       k="type" />
              <Col label="Costo"      k="cost" />
              <Col label="Precio"     k="price" />
              <Col label="Margen"     k="margin" />
              <Col label="Stock"      k="stock" />
              <Col label="Proveedor"  k="supplier" />
              <th className="itbl-th">Estado</th>
              <th className="itbl-th">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="itbl-empty">No hay productos que coincidan</td></tr>
            )}
            {filtered.map(p => {
              const margin   = Math.round(((p.price - p.cost) / p.cost) * 100);
              const cat      = CATEGORIES.find(c => c.id === p.category);
              const st       = STATUS_MAP[p.status] || STATUS_MAP[STATUSES.AVAILABLE];
              const isSold   = p.status === STATUSES.SOLD;
              const isLow    = p.type === PRODUCT_TYPES.STOCK && (p.stock || 0) <= 2 && !isSold;

              return (
                <tr key={p.id} className={`itbl-row ${isSold ? 'itbl-row-sold' : ''}`}>
                  <td className="itbl-td itbl-name-cell">
                    <div className="itbl-product">
                      <div className="itbl-thumb" style={{ background: isSold ? '#f0e8cc' : 'var(--bg-muted)' }}>
                        {p.image
                          ? <img src={p.image} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} />
                          : <span style={{ fontSize:'1.2rem' }}>{cat?.emoji || '📦'}</span>
                        }
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div className="itbl-pname">{p.name}</div>
                        {p.lastSoldAt && (
                          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>
                            Último: {new Date(p.lastSoldAt).toLocaleDateString('es-MX', { day:'numeric', month:'short' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="itbl-td">{cat?.emoji} {cat?.label}</td>
                  <td className="itbl-td">
                    <span className={`badge ${p.type === PRODUCT_TYPES.STOCK ? 'badge-teal' : 'badge-orange'}`} style={{ fontSize:'0.7rem' }}>
                      {p.type === PRODUCT_TYPES.STOCK ? 'Stock' : 'Única'}
                    </span>
                  </td>
                  <td className="itbl-td itbl-num">${p.cost.toLocaleString('es-MX')}</td>
                  <td className="itbl-td itbl-num itbl-price">${p.price.toLocaleString('es-MX')}</td>
                  <td className="itbl-td">
                    <span className={`badge ${margin >= 50 ? 'badge-green' : margin >= 0 ? 'badge-yellow' : 'badge-red'}`}
                      style={{ fontSize:'0.7rem' }}>
                      {margin}%
                    </span>
                  </td>
                  <td className="itbl-td itbl-num">
                    <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                      {p.stock}
                      {isLow && <AlertTriangle size={13} style={{ color:'#E65100', flexShrink:0 }} title="Stock bajo" />}
                    </div>
                  </td>
                  <td className="itbl-td itbl-muted">{p.supplier || '—'}</td>
                  <td className="itbl-td">
                    <span className={`badge ${st.cls}`} style={{ fontSize:'0.7rem' }}>{st.label}</span>
                  </td>
                  <td className="itbl-td">
                    <div className="itbl-actions">
                      <button className="btn btn-icon itbl-btn" title="Editar" onClick={() => onEdit(p)}>
                        <Edit2 size={14} />
                      </button>
                      {!isSold && (
                        <button className="btn btn-icon itbl-btn itbl-btn-green" title="Registrar venta" onClick={() => onSale(p)}>
                          <CheckCircle size={14} />
                        </button>
                      )}
                      <button className="btn btn-icon itbl-btn itbl-btn-red" title="Eliminar" onClick={() => onDelete(p.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <style>{`
        .itbl-wrap { display: flex; flex-direction: column; gap: 14px; }
        .itbl-filters { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
        .itbl-search-wrap { position: relative; flex: 1; min-width: 200px; }
        .itbl-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); }
        .itbl-search { padding-left: 36px !important; }
        .itbl-sel { width: auto; flex-shrink: 0; }
        .itbl-count { font-size: 0.82rem; color: var(--text-muted); font-weight: 600; white-space: nowrap; }
        .itbl-scroll { overflow-x: auto; border: 1.5px solid var(--border); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-sm); }
        .itbl { width: 100%; border-collapse: collapse; min-width: 800px; }
        .itbl-th {
          padding: 11px 13px; text-align: left;
          font-family: var(--font-display); font-size: 0.75rem; font-weight: 700;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
          border-bottom: 1.5px solid var(--border); white-space: nowrap;
          background: var(--bg-muted);
        }
        .itbl-sort { cursor: pointer; user-select: none; }
        .itbl-sort:hover { color: var(--teal); }
        .itbl-th svg { vertical-align: middle; margin-left: 3px; }
        .itbl-row { transition: background var(--dur-fast); }
        .itbl-row:hover { background: var(--bg-muted); }
        .itbl-row-sold { opacity: 0.55; }
        .itbl-td { padding: 11px 13px; font-size: 0.85rem; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .itbl-num   { font-family: var(--font-display); font-weight: 600; }
        .itbl-price { color: var(--teal-dark); font-weight: 700; }
        .itbl-muted { color: var(--text-muted); }
        .itbl-product { display: flex; align-items: center; gap: 10px; min-width: 180px; }
        .itbl-thumb {
          width: 38px; height: 38px; flex-shrink: 0;
          border-radius: var(--radius-md); overflow: hidden;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border);
        }
        .itbl-pname { font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
        .itbl-actions { display: flex; gap: 4px; }
        .itbl-btn { background: var(--bg-muted) !important; color: var(--text-secondary) !important; width: 30px !important; height: 30px !important; border-radius: var(--radius-sm) !important; }
        .itbl-btn:hover      { background: var(--border) !important; }
        .itbl-btn-green:hover { background: #E8F6EC !important; color: #2E7D32 !important; }
        .itbl-btn-red:hover   { background: #FFEBEE !important; color: #C62828 !important; }
        .itbl-empty { text-align: center; padding: 40px; color: var(--text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
