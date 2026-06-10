import React from 'react';
import { Package, TrendingUp, DollarSign, ShoppingBag, CheckCircle, AlertTriangle, BarChart2 } from 'lucide-react';

export default function StatsBar({ stats }) {
  return (
    <div className="stats-wrap">
      <div className="stats-grid">
        <StatCard icon={<Package size={18} />}      label="En catálogo"   value={stats.active}                                          color="teal" />
        <StatCard icon={<ShoppingBag size={18} />}  label="Uds. vendidas" value={stats.totalUnitsSold || 0}                             color="yellow" />
        <StatCard icon={<DollarSign size={18} />}   label="Ingresos"      value={`$${((stats.totalRevenue||0)/1000).toFixed(1)}k`}      color="teal" />
        <StatCard icon={<TrendingUp size={18} />}   label="Ganancia"      value={`$${((stats.totalProfit||0)/1000).toFixed(1)}k`}       color="green" />
        <StatCard icon={<BarChart2 size={18} />}    label="Margen prom."  value={`${stats.avgMargin}%`}                                 color="orange" />
        <StatCard icon={<AlertTriangle size={18} />}label="Stock bajo"    value={stats.lowStock || 0}   warn={stats.lowStock > 0}       color="orange" />
      </div>

      <style>{`
        .stats-wrap { }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
        }
        @media (max-width: 1000px) { .stats-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 560px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
      `}</style>
    </div>
  );
}

function StatCard({ icon, label, value, color, warn }) {
  const colors = {
    teal:   { bg: '#E8F4F3', accent: 'var(--teal)' },
    yellow: { bg: '#FFF8D6', accent: 'var(--yellow-dark)' },
    orange: { bg: warn ? '#FFF3E0' : '#FFF0E8', accent: warn ? '#E65100' : 'var(--orange)' },
    green:  { bg: '#E8F6EC', accent: '#2E7D32' },
  };
  const c = colors[color] || colors.teal;

  return (
    <div className="stat-card" style={{ borderColor: warn ? '#FFB74D' : undefined }}>
      <div className="stat-icon" style={{ background: c.bg, color: c.accent }}>{icon}</div>
      <div className="stat-value" style={{ color: warn ? '#E65100' : undefined }}>{value}</div>
      <div className="stat-label">{label}</div>

      <style>{`
        .stat-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 14px;
          display: flex; flex-direction: column; gap: 6px;
          box-shadow: var(--shadow-sm);
          transition: all var(--dur-fast);
        }
        .stat-icon {
          width: 36px; height: 36px;
          border-radius: var(--radius-md);
          display: flex; align-items: center; justify-content: center;
        }
        .stat-value {
          font-family: var(--font-display);
          font-size: 1.3rem; font-weight: 900;
          color: var(--text-primary); line-height: 1;
        }
        .stat-label {
          font-size: 0.72rem; font-weight: 700;
          color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em;
        }
      `}</style>
    </div>
  );
}
