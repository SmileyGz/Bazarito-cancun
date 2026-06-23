import React, { useState, useEffect, useCallback } from 'react';
import { Plus, LogOut, Eye, Package, TrendingUp, ClipboardList, AlertTriangle, DollarSign, Globe, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginGate     from '../components/LoginGate';
import StatsBar      from '../components/StatsBar';
import InventoryTable from '../components/InventoryTable';
import AdminProductForm from '../components/AdminProductForm';
import SaleModal     from '../components/SaleModal';
import InsightsPanel from '../components/InsightsPanel';
import SalesLog      from '../components/SalesLog';
import FinancePanel  from '../components/FinancePanel';
import IntegrationsPanel from '../components/IntegrationsPanel';
import MarketingPanel from '../components/MarketingPanel';
import {
  getProducts, addProduct, updateProduct, deleteProduct,
  recordSale, getStats, STATUSES, PRODUCT_TYPES,
} from '../data/store';
import { supabase } from '../lib/supabase';

// ─── Toast ────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return <div className="toast">{message}</div>;
}

// ─── Low stock alert ──────────────────────────
function LowStockBanner({ products }) {
  const low = products.filter(p =>
    p.status === STATUSES.AVAILABLE &&
    p.type   === PRODUCT_TYPES.STOCK &&
    (p.stock || 0) <= 2
  );
  if (low.length === 0) return null;
  return (
    <div className="low-stock-banner">
      <AlertTriangle size={16} />
      <strong>Stock bajo:</strong>
      {low.map(p => <span key={p.id} className="low-tag">{p.name} ({p.stock} uds)</span>)}
    </div>
  );
}

const TABS = [
  { id: 'inventory', label: 'Inventario', icon: <Package size={17} /> },
  { id: 'sales',     label: 'Ventas',     icon: <ClipboardList size={17} /> },
  { id: 'marketing', label: 'Marketing',  icon: <Megaphone size={17} /> },
  { id: 'insights',  label: 'Insights',   icon: <TrendingUp size={17} /> },
  { id: 'finance',   label: 'Finanzas',   icon: <DollarSign size={17} /> },
  { id: 'integrations', label: 'Integraciones', icon: <Globe size={17} /> },
];

export default function AdminPage() {
  const [authed, setAuthed]     = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);
  const [tab, setTab]           = useState('inventory');
  const [products, setProducts] = useState([]);
  const [stats, setStats]       = useState({ total:0,active:0,sold:0,avgMargin:0,totalValue:0,totalRevenue:0,totalProfit:0,totalUnitsSold:0,lowStock:0 });
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing]   = useState(null);
  const [saleProduct, setSaleProduct] = useState(null);
  const [toast, setToast]       = useState(null);
  const [refresh, setRefresh]   = useState(0);

  const reload = useCallback(() => {
    async function doReload() {
      setProducts(await getProducts());
      setStats(await getStats());
      setRefresh(r => r + 1);
    }
    doReload();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthed(!!session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { if (authed) reload(); }, [authed, reload]);

  function handleLogout() { supabase.auth.signOut(); }

  async function handleSave(data) {
    // Re-throw on error so AdminProductForm can show the error state
    if (editing) {
      await updateProduct(editing.id, data);
      setToast('✅ Producto actualizado');
    } else {
      await addProduct(data);
      setToast('✅ Producto agregado');
    }
    setFormOpen(false);
    setEditing(null);
    reload();
  }

  async function handleSaleConfirm(saleData) {
    try {
      await recordSale({ productId: saleProduct.id, ...saleData });
      setSaleProduct(null);
      const total = (Number(saleData.salePrice) * saleData.quantity) + (saleData.deliveryFeeAmount || 0);
      setToast(`🔴 Venta registrada — $${total.toLocaleString('es-MX')} MXN`);
      reload();
    } catch (err) {
      setToast(`❌ Error al registrar: ${err.message}`);
      console.error('handleSaleConfirm error:', err);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este producto?')) return;
    await deleteProduct(id); setToast('🗑️ Producto eliminado'); reload();
  }

  if (loadingSession) return <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>Cargando...</div>;
  if (!authed) return <LoginGate onSuccess={() => {}} />;

  return (
    <div className="admin-page">
      {/* Header */}
      <header className="admin-header">
        <div className="container admin-header-inner">
          {/* Row 1: logo + actions */}
          <div className="admin-header-row1">
            <div className="admin-logo">
              <img src={`${import.meta.env.BASE_URL}Logo.png`} alt="Bazarito Cancún" style={{ height: 42 }} />
              <div style={{ marginLeft: 8, display: 'flex', alignItems: 'center' }}>
                <span style={{ fontSize:'0.7rem',color:'var(--teal)',fontWeight:800,letterSpacing:'0.07em',textTransform:'uppercase' }}>
                  Admin
                </span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display:'flex',gap:8,marginLeft:'auto' }}>
              <Link to="/" className="btn btn-outline btn-sm" target="_blank" rel="noopener noreferrer">
                <Eye size={14} /> <span className="hide-xs">Catálogo</span>
              </Link>
              {tab === 'inventory' && (
                <button className="btn btn-sm btn-teal hide-xs" onClick={() => { setEditing(null); setFormOpen(true); }}>
                  <Plus size={15} /> Agregar
                </button>
              )}
              <button className="btn btn-icon btn-sm" onClick={handleLogout} title="Salir"
                style={{ background:'var(--bg-muted)',color:'var(--text-muted)' }}>
                <LogOut size={15} />
              </button>
            </div>
          </div>

          {/* Row 2: Tabs — always full width */}
          <div className="admin-tabs">
            {TABS.map(t => (
              <button key={t.id} className={`admin-tab ${tab === t.id ? 'admin-tab-active' : ''}`}
                onClick={() => setTab(t.id)}>
                {t.icon} <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container admin-main">
        {/* Low stock banner */}
        <LowStockBanner products={products} />

        {/* Stats bar — always visible */}
        <StatsBar stats={stats} />

        {/* Tab content */}
        {tab === 'inventory' && (
          <div className="animate-fade-in">
            <div className="admin-section-header">
              <div>
                <h2>Inventario</h2>
                <p>Gestiona productos, precios y stock en tiempo real</p>
              </div>
              <button className="btn btn-teal" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus size={16} /> Nuevo producto
              </button>
            </div>
            <InventoryTable
              products={products}
              onEdit={p => { setEditing(p); setFormOpen(true); }}
              onDelete={handleDelete}
              onSale={p => setSaleProduct(p)}
            />
          </div>
        )}

        {tab === 'sales' && (
          <div className="animate-fade-in">
            <div className="admin-section-header">
              <div>
                <h2>Historial de Ventas</h2>
                <p>Navega por mes, filtra por categoría y revisa ganancias</p>
              </div>
            </div>
            <SalesLog key={refresh} onDelete={reload} />
          </div>
        )}

        {tab === 'marketing' && (
          <div className="animate-fade-in">
            <MarketingPanel products={products} reload={reload} />
          </div>
        )}

        {tab === 'insights' && (
          <div className="animate-fade-in">
            <div className="admin-section-header">
              <div>
                <h2>Insights</h2>
                <p>Análisis de ventas, márgenes y tendencias</p>
              </div>
            </div>
            <InsightsPanel key={refresh} />
          </div>
        )}

        {tab === 'finance' && (
          <div className="animate-fade-in">
            <FinancePanel />
          </div>
        )}

        {tab === 'integrations' && (
          <div className="animate-fade-in">
            <div className="admin-section-header">
              <div>
                <h2>Integraciones</h2>
                <p>Gestiona la conexión con Facebook, Instagram y TikTok Shop</p>
              </div>
            </div>
            <IntegrationsPanel />
          </div>
        )}
      </main>

      {/* Modals */}
      {formOpen && (
        <AdminProductForm product={editing} onSave={handleSave}
          onClose={() => { setFormOpen(false); setEditing(null); }} />
      )}
      {saleProduct && (
        <SaleModal product={saleProduct} onConfirm={handleSaleConfirm}
          onClose={() => setSaleProduct(null)} />
      )}

      {/* Toast */}
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      <style>{`
        .admin-page  { min-height: 100vh; background: var(--bg); }
        .admin-header {
          background: var(--bg-card);
          border-bottom: 1.5px solid var(--border);
          box-shadow: var(--shadow-sm);
          position: sticky; top: 0; z-index: 100;
        }
        .admin-header-inner {
          display: flex;
          flex-direction: column;
          padding: 10px 0;
          gap: 8px;
        }
        .admin-header-row1 {
          display: flex;
          align-items: center;
          gap: 12px;
          min-height: 40px;
        }
        .admin-logo { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }

        .admin-tabs {
          display: flex; gap: 2px;
          background: var(--bg-muted);
          border-radius: var(--radius-full);
          padding: 3px;
          width: 100%;
        }
        .admin-tab {
          flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
          padding: 7px 10px;
          border-radius: var(--radius-full);
          font-family: var(--font-display);
          font-size: 0.82rem; font-weight: 700;
          color: var(--text-muted);
          transition: all var(--dur-fast);
          white-space: nowrap;
        }
        .admin-tab:hover { color: var(--text-secondary); background: rgba(255,255,255,0.5); }
        .admin-tab-active { background: var(--white); color: var(--teal); box-shadow: var(--shadow-sm); }

        .admin-main { padding-top: 24px; padding-bottom: 60px; display: flex; flex-direction: column; gap: 20px; }

        .low-stock-banner {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
          background: #FFF3E0; border: 1.5px solid #FFB74D;
          border-radius: var(--radius-md); padding: 10px 16px;
          font-size: 0.85rem; color: #E65100; font-weight: 600;
        }
        .low-tag {
          background: #FFE0B2; border-radius: var(--radius-full);
          padding: 2px 10px; font-size: 0.78rem;
        }

        .admin-section-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
        }
        .admin-section-header h2 { font-size: 1.4rem; }
        .admin-section-header p  { font-size: 0.85rem; color: var(--text-muted); margin-top: 2px; }

        /* hide-xs: only hide on very small screens */
        @media (max-width: 400px) {
          .hide-xs { display: none; }
        }
        @media (max-width: 560px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </div>
  );
}
