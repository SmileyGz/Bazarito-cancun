import React, { useState, useEffect, useMemo } from 'react';
import { 
  DollarSign, TrendingUp, TrendingDown, Wallet, Plus, Trash2, Edit2, Search, 
  ChevronLeft, ChevronRight, X, Sparkles, PieChart, Landmark 
} from 'lucide-react';
import { 
  getFinanceTransactions, addFinanceTransaction, updateFinanceTransaction, deleteFinanceTransaction,
  getFinancePortfolio, addFinancePortfolioAsset, updateFinancePortfolioAsset, deleteFinancePortfolioAsset 
} from '../data/store';

// Standard business categories list
const FINANCE_CATEGORIES = [
  'Ventas Online',
  'Ventas Físicas',
  'Ingreso por Envíos',
  'Costo de Inventario (COGS)',
  'Logística y Envíos',
  'Empaque e Insumos',
  'Comisiones (Plataformas)',
  'Marketing y Ads',
  'Software y Suscripciones',
  'Sueldo / Retiro de Dueño',
  'Reembolsos / Devoluciones',
  'Otros'
];

const PORTFOLIO_CATEGORIES = [
  'Efectivo / Caja Líquida',
  'Bancos',
  'Valor de Inventario',
  'Cuentas por Cobrar',
  'Cuentas por Pagar (Pasivo)'
];

export default function FinancePanel() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState([]);
  
  // Filtering & pagination
  const [selectedYear, setSelectedYear] = useState('2026');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // Modals & Editors state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [txForm, setTxForm] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    type: 'expense',
    category: 'Otros',
    notes: ''
  });

  const [assetModalOpen, setAssetModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({
    name: '',
    category: 'Ahorro',
    value: '',
    icon: '💰',
    notes: ''
  });

  // Chart hover state
  const [hoveredMonth, setHoveredMonth] = useState(null);

  // Load initial data
  const loadData = async () => {
    setLoading(true);
    try {
      const txs = await getFinanceTransactions();
      const port = await getFinancePortfolio();
      setTransactions(txs);
      setPortfolio(port);
    } catch (err) {
      console.error('Error loading finance data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // List of unique years available
  const availableYears = useMemo(() => {
    const years = new Set(transactions.map(t => new Date(t.date).getFullYear()));
    // Ensure 2026 is always in the list
    years.add(2026);
    return Array.from(years).sort((a, b) => b - a);
  }, [transactions]);

  // Format currency MXN
  const formatMXN = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val);
  };

  // Filter transactions by year and search query
  const filteredTxs = useMemo(() => {
    return transactions.filter(t => {
      const tYear = new Date(t.date).getFullYear().toString();
      const matchesYear = selectedYear === 'all' || tYear === selectedYear;
      
      const text = `${t.description} ${t.category} ${t.notes || ''}`.toLowerCase();
      const matchesSearch = text.includes(searchQuery.toLowerCase());
      
      return matchesYear && matchesSearch;
    });
  }, [transactions, selectedYear, searchQuery]);

  // Calculations for Business KPI Cards
  const kpis = useMemo(() => {
    let income = 0;
    let expense = 0;
    
    let salesRevenue = 0;
    let cogs = 0;
    let marketingSpend = 0;
    let salesTxCount = 0;
    
    filteredTxs.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') {
        income += amt;
        if (t.category.includes('Ventas')) {
          salesRevenue += amt;
          salesTxCount += 1;
        }
      } else {
        expense += amt;
        if (t.category === 'Costo de Inventario (COGS)') {
          cogs += amt;
        } else if (t.category === 'Marketing y Ads') {
          marketingSpend += amt;
        }
      }
    });

    const portfolioTotal = portfolio.reduce((sum, item) => sum + Number(item.value), 0);
    const grossMargin = salesRevenue > 0 ? ((salesRevenue - cogs) / salesRevenue) * 100 : 0;
    const aov = salesTxCount > 0 ? (salesRevenue / salesTxCount) : 0;
    const cac = salesTxCount > 0 ? (marketingSpend / salesTxCount) : 0;

    return {
      income,
      expense,
      net: income - expense,
      portfolioTotal,
      grossMargin,
      aov,
      cac
    };
  }, [filteredTxs, portfolio]);

  // Calculate monthly stats for the chart (Ene to Dic)
  const monthlyData = useMemo(() => {
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const income = new Array(12).fill(0);
    const expense = new Array(12).fill(0);

    filteredTxs.forEach(t => {
      const date = new Date(t.date);
      const mIdx = date.getMonth();
      const amt = Number(t.amount);
      if (t.type === 'income') income[mIdx] += amt;
      else expense[mIdx] += amt;
    });

    // Find the max value to scale the chart
    const maxVal = Math.max(...income, ...expense, 1000); // default minimum cap

    return {
      labels: months,
      income,
      expense,
      maxVal
    };
  }, [filteredTxs]);

  // Pagination calculations
  const paginatedTxs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTxs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTxs, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredTxs.length / itemsPerPage));

  // Reset page when filter/search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, searchQuery]);

  // Handle transaction CRUD
  const handleTxClick = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setTxForm({
        date: tx.date,
        description: tx.description,
        amount: tx.amount,
        type: tx.type,
        category: tx.category,
        notes: tx.notes || ''
      });
    } else {
      setEditingTx(null);
      setTxForm({
        date: new Date().toISOString().split('T')[0],
        description: '',
        amount: '',
        type: 'expense',
        category: 'Otros',
        notes: ''
      });
    }
    setTxModalOpen(true);
  };

  const handleTxSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...txForm,
        amount: parseFloat(txForm.amount)
      };

      if (editingTx) {
        await updateFinanceTransaction(editingTx.id, payload);
      } else {
        await addFinanceTransaction(payload);
      }
      setTxModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error guardando transacción: ' + err.message);
    }
  };

  const handleTxDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este movimiento?')) return;
    try {
      await deleteFinanceTransaction(id);
      loadData();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  // Handle asset portfolio CRUD
  const handleAssetClick = (asset = null) => {
    if (asset) {
      setEditingAsset(asset);
      setAssetForm({
        name: asset.name,
        category: asset.category,
        value: asset.value,
        icon: asset.icon || '💰',
        notes: asset.notes || ''
      });
    } else {
      setEditingAsset(null);
      setAssetForm({
        name: '',
        category: 'Ahorro',
        value: '',
        icon: '💰',
        notes: ''
      });
    }
    setAssetModalOpen(true);
  };

  const handleAssetSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...assetForm,
        value: parseFloat(assetForm.value) || 0
      };

      if (editingAsset) {
        await updateFinancePortfolioAsset(editingAsset.id, payload);
      } else {
        await addFinancePortfolioAsset(payload);
      }
      setAssetModalOpen(false);
      loadData();
    } catch (err) {
      alert('Error guardando activo: ' + err.message);
    }
  };

  const handleAssetDelete = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar este activo del portfolio?')) return;
    try {
      await deleteFinancePortfolioAsset(id);
      loadData();
    } catch (err) {
      alert('Error al eliminar activo: ' + err.message);
    }
  };

  // Quick edit amount inline
  const handleInlineAmountUpdate = async (asset, newValueStr) => {
    const cleanValue = parseFloat(newValueStr.replace(/[^\d.-]/g, ''));
    if (isNaN(cleanValue)) return;
    try {
      await updateFinancePortfolioAsset(asset.id, {
        ...asset,
        value: cleanValue
      });
      loadData();
    } catch (err) {
      console.error('Error updating amount inline:', err);
    }
  };

  return (
    <div className="finance-panel">
      {/* 1. Header and Year filter */}
      <div className="admin-section-header">
        <div>
          <h2>Finanzas & Riqueza</h2>
          <p>Supervisa flujo de caja, gastos personales y crecimiento de portfolio</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select 
            value={selectedYear} 
            onChange={(e) => setSelectedYear(e.target.value)}
            className="glass-input"
            style={{ padding: '8px 16px', fontWeight: 600, width: 130 }}
          >
            <option value="all">Todos los años</option>
            {availableYears.map(y => (
              <option key={y} value={y.toString()}>{y}</option>
            ))}
          </select>
          <button className="btn btn-teal" onClick={() => handleTxClick()}>
            <Plus size={16} /> Nuevo Movimiento
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state glass-panel">
          <Sparkles className="pulse" size={24} style={{ color: 'var(--teal)' }} />
          <p style={{ marginTop: 8 }}>Cargando base de datos financiera...</p>
        </div>
      ) : (
        <div className="finance-layout">
          {/* 2. KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card glass-panel gradient-border-teal">
              <div className="kpi-header">
                <h3>Margen Bruto</h3>
                <TrendingUp size={18} style={{ color: 'var(--success)' }} />
              </div>
              <p className="amount text-green">{kpis.grossMargin.toFixed(1)}%</p>
              <span className="trend">Rentabilidad antes de gastos fijos</span>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-header">
                <h3>Ticket Promedio (AOV)</h3>
                <Landmark size={18} style={{ color: 'var(--teal)' }} />
              </div>
              <p className="amount">{formatMXN(kpis.aov)}</p>
              <span className="trend-muted">Valor por transacción de venta</span>
            </div>

            <div className="kpi-card glass-panel">
              <div className="kpi-header">
                <h3>Costo de Adq. (CAC)</h3>
                <TrendingDown size={18} style={{ color: 'var(--red)' }} />
              </div>
              <p className="amount text-red">{formatMXN(kpis.cac)}</p>
              <span className="trend-muted">Gasto Marketing / Ventas</span>
            </div>

            <div className="kpi-card glass-panel highlight-bg-gold">
              <div className="kpi-header">
                <h3>Flujo de Caja Neto</h3>
                <Wallet size={18} style={{ color: '#C8973A' }} />
              </div>
              <p className={`amount ${kpis.net >= 0 ? 'text-gold' : 'text-red'}`}>{formatMXN(kpis.net)}</p>
              <span className="trend-muted">Ingresos Totales vs Gastos Totales</span>
            </div>
          </div>

          {/* 3. Cashflow Chart (SVG rendering) */}
          <div className="glass-panel chart-card">
            <div className="chart-header">
              <div>
                <h3>Análisis de Flujo de Caja</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Comparativa mensual de ingresos vs gastos</p>
              </div>
              {hoveredMonth !== null && (
                <div className="chart-tooltip-indicator">
                  <strong>{monthlyData.labels[hoveredMonth]}: </strong>
                  <span className="text-green">+{formatMXN(monthlyData.income[hoveredMonth])}</span>
                  {' / '}
                  <span className="text-red">-{formatMXN(monthlyData.expense[hoveredMonth])}</span>
                </div>
              )}
            </div>

            <div className="chart-wrapper-svg">
              <svg width="100%" height="220" viewBox="0 0 1000 240" preserveAspectRatio="none">
                {/* Horizontal gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                  const y = 20 + ratio * 180;
                  const labelVal = monthlyData.maxVal * (1 - ratio);
                  return (
                    <g key={idx}>
                      <line x1="60" y1={y} x2="980" y2={y} stroke="rgba(0,104,71,0.08)" strokeWidth="1" />
                      <text x="5" y={y + 4} fill="var(--text-muted)" fontSize="11" fontFamily="Inter">
                        {formatMXN(labelVal).split('.')[0]}
                      </text>
                    </g>
                  );
                })}

                {/* Bars */}
                {monthlyData.labels.map((label, idx) => {
                  const xBase = 80 + idx * 75;
                  const incHeight = (monthlyData.income[idx] / monthlyData.maxVal) * 180;
                  const expHeight = (monthlyData.expense[idx] / monthlyData.maxVal) * 180;

                  // coordinates
                  const incY = 200 - incHeight;
                  const expY = 200 - expHeight;

                  return (
                    <g 
                      key={idx} 
                      onMouseEnter={() => setHoveredMonth(idx)} 
                      onMouseLeave={() => setHoveredMonth(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Income Bar (Green) */}
                      <rect 
                        x={xBase} 
                        y={incY} 
                        width="24" 
                        height={Math.max(incHeight, 1)} 
                        rx="4" 
                        fill="url(#greenGrad)"
                        opacity={hoveredMonth === null || hoveredMonth === idx ? 0.95 : 0.4}
                        style={{ transition: 'all 0.2s' }}
                      />
                      {/* Expense Bar (Red) */}
                      <rect 
                        x={xBase + 28} 
                        y={expY} 
                        width="24" 
                        height={Math.max(expHeight, 1)} 
                        rx="4" 
                        fill="url(#redGrad)"
                        opacity={hoveredMonth === null || hoveredMonth === idx ? 0.95 : 0.4}
                        style={{ transition: 'all 0.2s' }}
                      />
                      {/* Label */}
                      <text x={xBase + 14} y="222" fill="var(--text-muted)" fontSize="12" textAnchor="middle" fontWeight="bold">
                        {label}
                      </text>
                    </g>
                  );
                })}

                {/* Definitions for gradients */}
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00c885" />
                    <stop offset="100%" stopColor="#006847" />
                  </linearGradient>
                  <linearGradient id="redGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5252" />
                    <stop offset="100%" stopColor="#c2185b" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* 4. Portfolio Grid */}
          <div className="portfolio-section">
            <div className="section-title-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Landmark size={20} style={{ color: '#C8973A' }} />
                <h3>Distribución de Portfolio</h3>
              </div>
              <button className="btn btn-sm btn-outline" onClick={() => handleAssetClick()}>
                <Plus size={14} /> Añadir Activo
              </button>
            </div>

            <div className="portfolio-grid">
              {portfolio.map(asset => (
                <div key={asset.id} className="portfolio-card glass-panel">
                  <div className="portfolio-card-header">
                    <span className="asset-icon">{asset.icon || '💰'}</span>
                    <div>
                      <h4>{asset.name}</h4>
                      <span className="asset-category-badge">{asset.category}</span>
                    </div>
                  </div>
                  
                  <div className="portfolio-card-body">
                    {/* Inline editor input for easy amount modifications */}
                    <div className="asset-value-wrapper">
                      <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>MXN</span>
                      <input 
                        type="text" 
                        defaultValue={asset.value}
                        onBlur={(e) => handleInlineAmountUpdate(asset, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleInlineAmountUpdate(asset, e.target.value);
                            e.target.blur();
                          }
                        }}
                        className="asset-value-input"
                        title="Haz clic para editar"
                      />
                    </div>
                    {asset.notes && <p className="asset-notes">{asset.notes}</p>}
                  </div>

                  <div className="portfolio-card-footer">
                    <button className="btn-icon btn-sm" onClick={() => handleAssetClick(asset)} title="Editar Detalles">
                      <Edit2 size={13} />
                    </button>
                    <button className="btn-icon btn-sm hover-red" onClick={() => handleAssetDelete(asset.id)} title="Eliminar Activo">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
              {portfolio.length === 0 && (
                <div className="empty-portfolio-state glass-panel">
                  <PieChart size={32} style={{ color: 'var(--text-muted)' }} />
                  <p>No tienes activos en tu portfolio. Agrega algunos para empezar.</p>
                </div>
              )}
            </div>
          </div>

          {/* 5. Transactions Table */}
          <div className="glass-panel table-container">
            <div className="table-search-bar">
              <h3>Transacciones Recientes</h3>
              <div className="search-input-wrapper">
                <Search size={16} />
                <input 
                  type="text" 
                  placeholder="Buscar movimiento..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input search-input"
                />
              </div>
            </div>

            <div className="table-responsive">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Fecha</th>
                    <th>Concepto</th>
                    <th className="text-right">Monto</th>
                    <th>Tipo</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTxs.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{tx.date}</td>
                      <td>
                        <strong>{tx.description}</strong>
                        <div style={{ display: 'flex', gap: 6, marginTop: 3, flexWrap: 'wrap' }}>
                          <span className="badge-category">{tx.category}</span>
                          {tx.notes && <span className="badge-notes" title={tx.notes}>{tx.notes}</span>}
                        </div>
                      </td>
                      <td className={`text-right font-mono font-bold ${tx.type === 'income' ? 'text-green' : 'text-red'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatMXN(tx.amount)}
                      </td>
                      <td>
                        <span className={`badge-type ${tx.type}`}>
                          {tx.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                          <button className="btn-icon btn-sm" onClick={() => handleTxClick(tx)} title="Editar">
                            <Edit2 size={12} />
                          </button>
                          <button className="btn-icon btn-sm hover-red" onClick={() => handleTxDelete(tx.id)} title="Eliminar">
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredTxs.length === 0 && (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                        No se encontraron movimientos financieros.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="pagination-bar">
                <button 
                  className="btn btn-icon btn-sm" 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft size={16} />
                </button>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Página {currentPage} de {totalPages} ({filteredTxs.length} registros)
                </span>
                <button 
                  className="btn btn-icon btn-sm" 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. Transaction Modal */}
      {txModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>{editingTx ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h3>
              <button className="modal-close-btn" onClick={() => setTxModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleTxSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Fecha</label>
                  <input 
                    type="date" 
                    value={txForm.date}
                    onChange={(e) => setTxForm({ ...txForm, date: e.target.value })}
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Tipo</label>
                  <select 
                    value={txForm.type}
                    onChange={(e) => setTxForm({ ...txForm, type: e.target.value })}
                    className="glass-input w-full"
                  >
                    <option value="expense">💸 Gasto</option>
                    <option value="income">💰 Ingreso</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="form-label">Monto (MXN)</label>
                <input 
                  type="number" 
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  value={txForm.amount}
                  onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })}
                  className="glass-input w-full font-mono"
                  required
                />
              </div>

              <div>
                <label className="form-label">Concepto</label>
                <input 
                  type="text" 
                  placeholder="Ej. Soriana, Telcel, Pago Upwork..."
                  value={txForm.description}
                  onChange={(e) => setTxForm({ ...txForm, description: e.target.value })}
                  className="glass-input w-full"
                  required
                />
              </div>

              <div>
                <label className="form-label">Categoría</label>
                <select 
                  value={txForm.category}
                  onChange={(e) => setTxForm({ ...txForm, category: e.target.value })}
                  className="glass-input w-full"
                >
                  {FINANCE_CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Notas (opcional)</label>
                <input 
                  type="text" 
                  placeholder="Comentarios adicionales"
                  value={txForm.notes}
                  onChange={(e) => setTxForm({ ...txForm, notes: e.target.value })}
                  className="glass-input w-full"
                />
              </div>

              <div className="modal-footer" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setTxModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-teal">
                  {editingTx ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Asset Modal */}
      {assetModalOpen && (
        <div className="modal-overlay">
          <div className="modal-box glass-panel" style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3>{editingAsset ? 'Editar Activo' : 'Nuevo Activo'}</h3>
              <button className="modal-close-btn" onClick={() => setAssetModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAssetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Nombre del Activo</label>
                  <input 
                    type="text" 
                    placeholder="Ej. CETES, Monse, Caja Chica"
                    value={assetForm.name}
                    onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                    className="glass-input w-full"
                    required
                  />
                </div>
                <div style={{ width: 80 }}>
                  <label className="form-label">Ícono</label>
                  <input 
                    type="text" 
                    value={assetForm.icon}
                    onChange={(e) => setAssetForm({ ...assetForm, icon: e.target.value })}
                    className="glass-input w-full"
                    style={{ textAlign: 'center', fontSize: '1.2rem' }}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Categoría</label>
                  <select 
                    value={assetForm.category}
                    onChange={(e) => setAssetForm({ ...assetForm, category: e.target.value })}
                    className="glass-input w-full"
                  >
                    {PORTFOLIO_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label">Valor (MXN)</label>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    step="0.01"
                    value={assetForm.value}
                    onChange={(e) => setAssetForm({ ...assetForm, value: e.target.value })}
                    className="glass-input w-full font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="form-label">Notas (opcional)</label>
                <input 
                  type="text" 
                  placeholder="Detalles del activo, plazos, intereses..."
                  value={assetForm.notes}
                  onChange={(e) => setAssetForm({ ...assetForm, notes: e.target.value })}
                  className="glass-input w-full"
                />
              </div>

              <div className="modal-footer" style={{ marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={() => setAssetModalOpen(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-teal">
                  {editingAsset ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Styled JSX scoped to finance module */}
      <style>{`
        .finance-panel { display: flex; flex-direction: column; gap: 24px; animation: fadeIn 0.4s ease-out; }
        .finance-layout { display: flex; flex-direction: column; gap: 24px; }
        
        .loading-state { 
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 80px 20px; text-align: center; color: var(--text-muted);
        }
        
        .gradient-border-teal {
          border-left: 5px solid var(--teal) !important;
        }

        .kpi-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .kpi-header h3 { font-size: 0.82rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-muted); margin: 0; }
        .kpi-card { background: var(--bg-card); padding: 18px 22px; border-radius: var(--radius-lg); border: 1.5px solid var(--border); box-shadow: var(--shadow-sm); }
        .kpi-card .amount { font-size: 1.6rem; font-weight: 800; font-family: var(--font-display); margin: 4px 0; letter-spacing: -0.02em; }
        .kpi-card .trend { font-size: 0.76rem; font-weight: 700; color: var(--text-muted); }
        .kpi-card .trend-muted { font-size: 0.76rem; color: var(--text-muted); }

        .text-green { color: var(--success) !important; }
        .text-red { color: var(--red) !important; }
        .text-gold { color: #C8973A !important; }
        .highlight-bg-gold { border-left: 5px solid #C8973A !important; }

        /* Chart */
        .chart-card { background: var(--bg-card); border-radius: var(--radius-lg); border: 1.5px solid var(--border); padding: 20px; }
        .chart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .chart-header h3 { font-size: 1.05rem; margin: 0; }
        .chart-tooltip-indicator { background: var(--bg-muted); padding: 6px 14px; border-radius: var(--radius-full); font-size: 0.8rem; border: 1px solid var(--border); }
        .chart-wrapper-svg { padding: 10px 0; overflow-x: auto; }

        /* Portfolio */
        .portfolio-section { display: flex; flex-direction: column; gap: 14px; }
        .section-title-bar { display: flex; justify-content: space-between; align-items: center; }
        .section-title-bar h3 { font-size: 1.1rem; margin: 0; }
        
        .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .portfolio-card { 
          background: var(--bg-card); border-radius: var(--radius-lg); border: 1.5px solid var(--border); 
          padding: 16px; display: flex; flex-direction: column; justify-content: space-between; gap: 14px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .portfolio-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
        .portfolio-card-header { display: flex; align-items: center; gap: 12px; }
        .asset-icon { font-size: 1.8rem; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; background: var(--bg-muted); border-radius: var(--radius-md); border: 1px solid var(--border); }
        .portfolio-card-header h4 { font-size: 0.95rem; margin: 0; font-weight: 700; }
        .asset-category-badge { font-size: 0.68rem; background: var(--bg-muted); color: var(--text-muted); padding: 2px 8px; border-radius: var(--radius-full); border: 1px solid var(--border); display: inline-block; margin-top: 3px; font-weight: 700; }
        
        .asset-value-wrapper { display: flex; align-items: center; gap: 8px; border-bottom: 2px solid var(--border); padding-bottom: 6px; }
        .asset-value-input { 
          flex: 1; border: none; background: transparent; font-family: var(--font-display); 
          font-size: 1.35rem; font-weight: 800; color: var(--text-secondary); outline: none; padding: 0;
          text-align: right;
        }
        .asset-value-input:focus { border-bottom: 2px solid var(--teal); }
        .asset-notes { font-size: 0.78rem; color: var(--text-muted); margin: 6px 0 0 0; line-height: 1.4; }
        
        .portfolio-card-footer { display: flex; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--border); padding-top: 10px; }
        .empty-portfolio-state { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--text-muted); grid-column: 1 / -1; }

        /* Transactions table */
        .table-search-bar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 16px; }
        .table-search-bar h3 { font-size: 1.1rem; margin: 0; }
        .search-input-wrapper { display: flex; align-items: center; gap: 8px; background: var(--bg-muted); border: 1.5px solid var(--border); border-radius: var(--radius-full); padding: 6px 14px; width: 260px; }
        .search-input-wrapper svg { color: var(--text-muted); }
        .search-input { border: none !important; background: transparent !important; padding: 0 !important; font-size: 0.85rem; width: 100%; }
        .search-input:focus { outline: none !important; box-shadow: none !important; }

        .finance-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
        .finance-table th { background: var(--bg-muted); color: var(--text-muted); font-weight: 700; text-align: left; padding: 12px 16px; border-bottom: 1.5px solid var(--border); }
        .finance-table td { padding: 12px 16px; border-bottom: 1px solid var(--border); color: var(--text-secondary); vertical-align: middle; }
        
        .badge-category { font-size: 0.65rem; background: var(--bg-muted); color: var(--text-muted); padding: 1px 6px; border-radius: var(--radius-full); border: 1px solid var(--border); font-weight: 700; }
        .badge-notes { font-size: 0.65rem; background: rgba(200, 151, 58, 0.1); color: #C8973A; padding: 1px 6px; border-radius: var(--radius-full); border: 1px solid rgba(200, 151, 58, 0.2); font-weight: 600; text-overflow: ellipsis; overflow: hidden; max-width: 150px; white-space: nowrap; }
        .badge-type { font-size: 0.72rem; padding: 2px 8px; border-radius: var(--radius-full); font-weight: 700; display: inline-block; }
        .badge-type.income { background: rgba(0, 200, 133, 0.12); color: var(--success); }
        .badge-type.expense { background: rgba(255, 82, 82, 0.12); color: var(--red); }

        .pagination-bar { display: flex; justify-content: space-between; align-items: center; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--border); }

        /* Form styling */
        .form-label { font-size: 0.75rem; font-weight: 700; color: var(--text-muted); margin-bottom: 4px; display: block; text-transform: uppercase; }
        .w-full { width: 100%; }
        
        /* Pulse animation */
        .pulse { animation: pulseAnim 2s infinite; }
        @keyframes pulseAnim {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.6; }
          100% { transform: scale(1); opacity: 1; }
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .table-search-bar { flex-direction: column; align-items: stretch; }
          .search-input-wrapper { width: 100%; }
        }
      `}</style>
    </div>
  );
}
