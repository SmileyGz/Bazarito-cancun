import React, { useState } from 'react';
import { Trash2, Truck, MapPin, ChevronLeft, ChevronRight } from 'lucide-react';
import { getSales, deleteSale, CATEGORIES, DELIVERY_METHODS } from '../data/store';

const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                   'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

export default function SalesLog({ onDelete }) {
  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filterCat, setFilterCat] = useState('all');
  const [allSales, setAllSales] = useState([]);

  React.useEffect(() => {
    async function load() {
      setAllSales(await getSales());
    }
    load();
  }, []);

  // Filter by selected month + category
  const filtered = allSales.filter(s => {
    const d = new Date(s.saleDate);
    const matchMonth = d.getFullYear() === year && d.getMonth() === month;
    const matchCat   = filterCat === 'all' || s.category === filterCat;
    return matchMonth && matchCat;
  });

  const revenue   = filtered.reduce((s, sl) => s + sl.salePrice * sl.quantity, 0);
  const profit    = filtered.reduce((s, sl) => s + sl.profit, 0);
  const units     = filtered.reduce((s, sl) => s + sl.quantity, 0);
  const avgMargin = revenue > 0 ? Math.round((profit / (revenue - profit)) * 100) : 0;

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  }
  function nextMonth() {
    const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();
    if (isCurrentMonth) return;
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  }
  const isCurrentMonth = year === now.getFullYear() && month === now.getMonth();

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este registro de venta?')) return;
    await deleteSale(id);
    onDelete();
  }

  return (
    <div className="slog">
      {/* Month nav */}
      <div className="slog-header">
        <div className="slog-month-nav">
          <button className="btn btn-icon" onClick={prevMonth}
            style={{ background:'var(--bg-muted)', color:'var(--text-secondary)' }}>
            <ChevronLeft size={18} />
          </button>
          <h3 className="slog-month-label">{MONTHS_ES[month]} {year}</h3>
          <button className="btn btn-icon" onClick={nextMonth}
            disabled={isCurrentMonth}
            style={{
              background: isCurrentMonth ? 'var(--border)' : 'var(--bg-muted)',
              color: isCurrentMonth ? 'var(--text-muted)' : 'var(--text-secondary)',
              cursor: isCurrentMonth ? 'not-allowed' : 'pointer',
            }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {/* Category filter */}
        <select className="select slog-cat-sel" value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          <option value="all">Todas las categorías</option>
          {CATEGORIES.filter(c => c.id !== 'all').map(c => (
            <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
          ))}
        </select>
      </div>

      {/* Month summary */}
      <div className="slog-summary">
        <div className="slog-sum-item">
          <span className="slog-sum-val teal">${revenue.toLocaleString('es-MX')}</span>
          <span className="slog-sum-label">Ingresos</span>
        </div>
        <div className="slog-sum-divider" />
        <div className="slog-sum-item">
          <span className="slog-sum-val green">${profit.toLocaleString('es-MX')}</span>
          <span className="slog-sum-label">Ganancia</span>
        </div>
        <div className="slog-sum-divider" />
        <div className="slog-sum-item">
          <span className="slog-sum-val orange">{units}</span>
          <span className="slog-sum-label">Unidades</span>
        </div>
        <div className="slog-sum-divider" />
        <div className="slog-sum-item">
          <span className="slog-sum-val yellow">{avgMargin}%</span>
          <span className="slog-sum-label">Margen</span>
        </div>
        <div className="slog-sum-divider" />
        <div className="slog-sum-item">
          <span className="slog-sum-val">{filtered.length}</span>
          <span className="slog-sum-label">Ventas</span>
        </div>
      </div>

      {/* Sales list */}
      {filtered.length === 0 ? (
        <div className="slog-empty">
          <span style={{ fontSize:'2.5rem' }}>📭</span>
          <p>No hay ventas registradas en {MONTHS_ES[month]} {year}</p>
        </div>
      ) : (
        <div className="slog-list">
          {filtered
            .sort((a, b) => new Date(b.saleDate) - new Date(a.saleDate))
            .map(sale => {
              const cat = CATEGORIES.find(c => c.id === sale.category);
              const d   = new Date(sale.saleDate);
              const dateStr = d.toLocaleDateString('es-MX', { day:'numeric', month:'short', year:'numeric' });
              const saleMargin = Math.round(((sale.salePrice - sale.cost) / sale.cost) * 100);

              return (
                <div key={sale.id} className="slog-item">
                  {/* Date */}
                  <div className="slog-date-col">
                    <div className="slog-date-day">{d.getDate()}</div>
                    <div className="slog-date-month">{MONTHS_ES[d.getMonth()].slice(0,3)}</div>
                  </div>

                  {/* Info */}
                  <div className="slog-info">
                    <div className="slog-name">{cat?.emoji} {sale.productName}</div>
                    <div className="slog-meta-row">
                      <span className="slog-meta-tag">{cat?.label}</span>
                      <span className="slog-delivery-tag">
                        {sale.delivery === DELIVERY_METHODS.PICKUP
                          ? <><MapPin size={11} /> Pickup</>
                          : <><Truck size={11} /> Entrega</>}
                      </span>
                      {sale.quantity > 1 && (
                        <span className="slog-meta-tag">×{sale.quantity} uds</span>
                      )}
                    </div>
                    {sale.notes && (
                      <div className="slog-notes">📝 {sale.notes}</div>
                    )}
                  </div>

                  {/* Financials */}
                  <div className="slog-financials">
                    <div className="slog-fin-price">${(sale.salePrice * sale.quantity).toLocaleString('es-MX')}</div>
                    <div className="slog-fin-profit">+${sale.profit.toLocaleString('es-MX')} ganancia</div>
                    <span className={`badge ${saleMargin >= 50 ? 'badge-green' : saleMargin >= 0 ? 'badge-yellow' : 'badge-red'}`}
                      style={{ fontSize:'0.7rem', alignSelf:'flex-end' }}>
                      {saleMargin}%
                    </span>
                  </div>

                  {/* Delete */}
                  <button className="btn btn-icon slog-del" onClick={() => handleDelete(sale.id)} title="Eliminar registro">
                    <Trash2 size={14} />
                  </button>
                </div>
              );
            })}
        </div>
      )}

      <style>{`
        .slog { display: flex; flex-direction: column; gap: 16px; }
        .slog-header {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }
        .slog-month-nav {
          display: flex; align-items: center; gap: 10px;
        }
        .slog-month-label {
          font-size: 1.1rem; font-weight: 800;
          min-width: 160px; text-align: center;
        }
        .slog-cat-sel { width: auto; flex-shrink: 0; }

        .slog-summary {
          display: flex; align-items: center;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px 20px;
          gap: 0;
          box-shadow: var(--shadow-sm);
          overflow-x: auto;
        }
        .slog-sum-item { display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1; min-width: 80px; }
        .slog-sum-val {
          font-family: var(--font-display); font-size: 1.4rem; font-weight: 900;
          color: var(--text-primary);
        }
        .slog-sum-val.teal   { color: var(--teal-dark); }
        .slog-sum-val.green  { color: #2E7D32; }
        .slog-sum-val.orange { color: var(--orange); }
        .slog-sum-val.yellow { color: var(--yellow-dark); }
        .slog-sum-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .slog-sum-divider { width: 1px; background: var(--border); height: 40px; flex-shrink: 0; }

        .slog-empty {
          text-align: center; padding: 60px 20px; color: var(--text-muted);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          background: var(--bg-card); border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
        }
        .slog-list { display: flex; flex-direction: column; gap: 8px; }

        .slog-item {
          display: flex; align-items: center; gap: 14px;
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-md);
          padding: 14px 16px;
          transition: all var(--dur-fast);
          box-shadow: var(--shadow-sm);
        }
        .slog-item:hover { border-color: var(--yellow); box-shadow: var(--shadow-md); }

        .slog-date-col {
          display: flex; flex-direction: column; align-items: center;
          background: var(--yellow); color: var(--black);
          border-radius: var(--radius-sm);
          padding: 6px 10px; min-width: 44px; flex-shrink: 0;
        }
        .slog-date-day   { font-family: var(--font-display); font-size: 1.2rem; font-weight: 900; line-height: 1; }
        .slog-date-month { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; }

        .slog-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .slog-name { font-weight: 700; font-size: 0.9rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .slog-meta-row { display: flex; gap: 6px; flex-wrap: wrap; align-items: center; }
        .slog-meta-tag {
          display: inline-flex; align-items: center; gap: 3px;
          font-size: 0.72rem; color: var(--text-muted);
          background: var(--bg-muted); border-radius: var(--radius-full);
          padding: 2px 8px; font-weight: 600;
        }
        .slog-delivery-tag {
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 0.72rem; color: var(--teal); font-weight: 600;
          background: #E8F4F3; border-radius: var(--radius-full);
          padding: 2px 8px;
        }
        .slog-notes {
          font-size: 0.75rem; color: var(--text-muted);
          background: var(--bg-muted); padding: 6px 10px;
          border-radius: var(--radius-sm); margin-top: 4px;
          line-height: 1.3;
        }

        .slog-financials {
          display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0;
        }
        .slog-fin-price { font-family: var(--font-display); font-weight: 900; font-size: 1rem; color: var(--teal-dark); }
        .slog-fin-profit { font-size: 0.75rem; font-weight: 600; color: #2E7D32; }

        .slog-del {
          background: transparent !important;
          color: var(--text-muted) !important;
          width: 32px !important; height: 32px !important;
          border-radius: var(--radius-sm) !important;
          flex-shrink: 0;
        }
        .slog-del:hover { background: #FFEBEE !important; color: #C62828 !important; }

        @media (max-width: 600px) {
          .slog-financials { display: none; }
          .slog-item { padding: 12px; }
        }
      `}</style>
    </div>
  );
}
