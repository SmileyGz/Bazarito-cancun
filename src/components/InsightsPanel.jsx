import React, { useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Award, Truck, MapPin } from 'lucide-react';
import { getMonthlySummary, getTopProducts, getCategoryBreakdown, CATEGORIES } from '../data/store';

// ─── Simple bar chart (no library) ─────────────
function BarChart({ data, valueKey, labelKey, color = 'var(--teal)', prefix = '$' }) {
  const max = Math.max(...data.map(d => d[valueKey]), 1);
  return (
    <div className="bar-chart">
      {data.map((d, i) => {
        const pct = Math.max(4, (d[valueKey] / max) * 100);
        return (
          <div key={i} className="bar-item">
            <div className="bar-label">{d[labelKey]}</div>
            <div className="bar-track">
              <div
                className="bar-fill"
                style={{ width: `${pct}%`, background: color }}
                title={`${prefix}${d[valueKey].toLocaleString('es-MX')}`}
              />
              <span className="bar-val">
                {prefix}{d[valueKey] >= 1000
                  ? `${(d[valueKey]/1000).toFixed(1)}k`
                  : d[valueKey].toLocaleString('es-MX')}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Donut-style category pie (CSS only) ───────
function CategoryDonut({ breakdown }) {
  const cats   = CATEGORIES.filter(c => c.id !== 'all');
  const colors = ['#1A7A6D','#E84B09','#FFD000','#2E7D32','#7B1FA2','#1565C0','#E65100','#C62828'];
  const total  = Object.values(breakdown).reduce((s,v) => s + v.revenue, 0);

  if (total === 0) return <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>Sin ventas aún</p>;

  let offset = 0;
  const segments = cats
    .filter(c => breakdown[c.id]?.revenue > 0)
    .map((c, i) => {
      const pct = (breakdown[c.id].revenue / total) * 100;
      const seg = { cat: c, pct, offset, color: colors[i % colors.length] };
      offset += pct;
      return seg;
    });

  const circumference = 2 * Math.PI * 40;

  return (
    <div className="donut-wrap">
      <svg width="120" height="120" viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" strokeWidth="18" />
        {segments.map((s, i) => (
          <circle key={i} cx="50" cy="50" r="40" fill="none"
            stroke={s.color} strokeWidth="18"
            strokeDasharray={`${(s.pct / 100) * circumference} ${circumference}`}
            strokeDashoffset={-((s.offset / 100) * circumference)}
            transform="rotate(-90 50 50)"
            style={{ transition: 'all 0.5s ease' }}
          />
        ))}
        <text x="50" y="55" textAnchor="middle"
          style={{ fontSize:10, fontFamily:'var(--font-display)', fontWeight:800, fill:'var(--text-primary)' }}>
          {segments.length}
        </text>
      </svg>
      <div className="donut-legend">
        {segments.map((s, i) => (
          <div key={i} className="donut-leg-item">
            <span className="donut-dot" style={{ background: s.color }} />
            <span className="donut-leg-label">{s.cat.emoji} {s.cat.label}</span>
            <span className="donut-leg-pct">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Insights Panel ────────────────────────
export default function InsightsPanel() {
  const [months]    = useState(6);
  const monthly     = getMonthlySummary(months);
  const topProducts = getTopProducts(5);
  const breakdown   = getCategoryBreakdown();

  const totalRevenue = monthly.reduce((s, m) => s + m.revenue, 0);
  const totalProfit  = monthly.reduce((s, m) => s + m.profit, 0);
  const totalUnits   = monthly.reduce((s, m) => s + m.units, 0);
  const avgMargin    = totalRevenue > 0 ? Math.round((totalProfit / (totalRevenue - totalProfit)) * 100) : 0;

  // Month-over-month growth
  const last   = monthly[monthly.length - 1];
  const prev   = monthly[monthly.length - 2];
  const growth = prev?.profit > 0
    ? Math.round(((last.profit - prev.profit) / prev.profit) * 100)
    : null;

  return (
    <div className="insights">
      {/* Top KPIs */}
      <div className="ins-kpi-grid">
        <KpiCard icon={<DollarSign size={20} />} label="Ingresos totales" value={`$${totalRevenue.toLocaleString('es-MX')}`} sub={`últimos ${months} meses`} color="teal" />
        <KpiCard icon={<TrendingUp size={20} />} label="Ganancia total" value={`$${totalProfit.toLocaleString('es-MX')}`}
          sub={growth !== null ? `${growth >= 0 ? '▲' : '▼'} ${Math.abs(growth)}% vs mes anterior` : 'vs. mes anterior'}
          color={growth !== null && growth >= 0 ? 'green' : 'orange'} />
        <KpiCard icon={<ShoppingBag size={20} />} label="Unidades vendidas" value={totalUnits} sub={`en ${months} meses`} color="yellow" />
        <KpiCard icon={<Award size={20} />} label="Margen promedio" value={`${avgMargin}%`} sub="sobre costo" color="teal" />
      </div>

      <div className="ins-grid-2col">
        {/* Revenue chart */}
        <div className="ins-card">
          <div className="ins-card-header">
            <h4>📈 Ingresos por mes</h4>
          </div>
          <BarChart data={monthly} valueKey="revenue" labelKey="label" color="var(--teal)" prefix="$" />
        </div>

        {/* Profit chart */}
        <div className="ins-card">
          <div className="ins-card-header">
            <h4>💰 Ganancia por mes</h4>
          </div>
          <BarChart data={monthly} valueKey="profit" labelKey="label" color="#2E7D32" prefix="$" />
        </div>
      </div>

      <div className="ins-grid-2col">
        {/* Units sold */}
        <div className="ins-card">
          <div className="ins-card-header">
            <h4>📦 Unidades vendidas por mes</h4>
          </div>
          <BarChart data={monthly} valueKey="units" labelKey="label" color="var(--orange)" prefix="" />
        </div>

        {/* Category breakdown */}
        <div className="ins-card">
          <div className="ins-card-header">
            <h4>🗂️ Ventas por categoría</h4>
          </div>
          <CategoryDonut breakdown={breakdown} />
        </div>
      </div>

      {/* Top products */}
      <div className="ins-card">
        <div className="ins-card-header">
          <h4>🏆 Productos más rentables</h4>
          <span className="ins-card-sub">por ganancia total acumulada</span>
        </div>
        <div className="ins-top-list">
          {topProducts.length === 0 && (
            <p style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>No hay ventas registradas aún</p>
          )}
          {topProducts.map((p, i) => {
            const cat = CATEGORIES.find(c => c.id === p.category);
            const maxProfit = topProducts[0]?.profit || 1;
            return (
              <div key={i} className="ins-top-item">
                <div className="ins-rank">{i + 1}</div>
                <div className="ins-top-info">
                  <div className="ins-top-name">{cat?.emoji} {p.name}</div>
                  <div className="ins-top-bar-track">
                    <div className="ins-top-bar-fill" style={{ width: `${(p.profit / maxProfit) * 100}%` }} />
                  </div>
                </div>
                <div className="ins-top-stats">
                  <span className="ins-top-profit">${p.profit.toLocaleString('es-MX')}</span>
                  <span className="ins-top-units">{p.units} uds</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .insights { display: flex; flex-direction: column; gap: 20px; }
        .ins-kpi-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .ins-grid-2col {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        .ins-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }
        .ins-card-header {
          display: flex; align-items: baseline; gap: 10px; margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .ins-card-header h4 { font-size: 0.95rem; color: var(--text-primary); }
        .ins-card-sub { font-size: 0.78rem; color: var(--text-muted); }

        /* Bar chart */
        .bar-chart { display: flex; flex-direction: column; gap: 10px; }
        .bar-item { display: flex; flex-direction: column; gap: 4px; }
        .bar-label { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .bar-track { display: flex; align-items: center; gap: 8px; }
        .bar-fill {
          height: 24px; border-radius: var(--radius-sm);
          transition: width 0.6s var(--ease-smooth);
          min-width: 4px;
        }
        .bar-val { font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); white-space: nowrap; }

        /* Donut */
        .donut-wrap { display: flex; align-items: center; gap: 20px; flex-wrap: wrap; }
        .donut-svg { flex-shrink: 0; }
        .donut-legend { display: flex; flex-direction: column; gap: 6px; flex: 1; min-width: 120px; }
        .donut-leg-item { display: flex; align-items: center; gap: 6px; font-size: 0.78rem; }
        .donut-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .donut-leg-label { flex: 1; color: var(--text-secondary); }
        .donut-leg-pct { font-weight: 700; color: var(--text-primary); }

        /* Top products */
        .ins-top-list { display: flex; flex-direction: column; gap: 12px; }
        .ins-top-item { display: flex; align-items: center; gap: 12px; }
        .ins-rank {
          width: 28px; height: 28px; flex-shrink: 0;
          background: var(--yellow); color: var(--black);
          border-radius: var(--radius-sm);
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-weight: 900; font-size: 0.85rem;
        }
        .ins-top-info { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .ins-top-name { font-size: 0.875rem; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .ins-top-bar-track { height: 6px; background: var(--border); border-radius: var(--radius-full); overflow: hidden; }
        .ins-top-bar-fill { height: 100%; background: var(--teal); border-radius: var(--radius-full); transition: width 0.6s var(--ease-smooth); }
        .ins-top-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; flex-shrink: 0; }
        .ins-top-profit { font-family: var(--font-display); font-weight: 700; font-size: 0.9rem; color: var(--teal-dark); }
        .ins-top-units  { font-size: 0.72rem; color: var(--text-muted); }

        @media (max-width: 900px) {
          .ins-kpi-grid  { grid-template-columns: repeat(2, 1fr); }
          .ins-grid-2col { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .ins-kpi-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}

function KpiCard({ icon, label, value, sub, color }) {
  const colors = {
    teal:   { bg:'#E8F4F3', fg:'var(--teal)' },
    yellow: { bg:'#FFF8D6', fg:'var(--yellow-dark)' },
    orange: { bg:'#FFF0E8', fg:'var(--orange)' },
    green:  { bg:'#E8F6EC', fg:'#2E7D32' },
  };
  const c = colors[color] || colors.teal;
  return (
    <div className="kpi-card">
      <div className="kpi-icon" style={{ background: c.bg, color: c.fg }}>{icon}</div>
      <div className="kpi-val">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      <style>{`
        .kpi-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 16px;
          box-shadow: var(--shadow-sm);
          display: flex; flex-direction: column; gap: 6px;
        }
        .kpi-icon { width: 38px; height: 38px; border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; }
        .kpi-val  { font-family: var(--font-display); font-size: 1.5rem; font-weight: 900; color: var(--text-primary); line-height: 1; }
        .kpi-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.04em; }
        .kpi-sub   { font-size: 0.75rem; color: var(--text-muted); }
      `}</style>
    </div>
  );
}
