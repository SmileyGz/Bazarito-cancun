import React, { useState } from 'react';
import { X, CheckCircle, DollarSign, Package, Truck, MapPin } from 'lucide-react';
import { DELIVERY_METHODS, PRODUCT_TYPES } from '../data/store';

export default function SaleModal({ product, onConfirm, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    salePrice: product.price,
    quantity:  1,
    delivery:  DELIVERY_METHODS.PICKUP,
    saleDate:  today,
    notes:     '',
  });

  const maxQty    = product.type === PRODUCT_TYPES.ONE_OFF ? 1 : (product.stock || 1);
  const qty       = Math.min(Math.max(1, Number(form.quantity)), maxQty);
  const revenue   = form.salePrice * qty;
  const profit    = (form.salePrice - product.cost) * qty;
  const margin    = product.cost > 0 ? Math.round(((form.salePrice - product.cost) / product.cost) * 100) : 0;
  const remainingAfter = Math.max(0, (product.stock || 1) - qty);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({ ...form, quantity: qty, salePrice: Number(form.salePrice) });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box sale-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="sale-header">
          <div className="sale-header-icon">
            <CheckCircle size={22} />
          </div>
          <div>
            <h3>Registrar Venta</h3>
            <p className="sale-product-name">{product.name}</p>
          </div>
          <button className="btn btn-icon" onClick={onClose} style={{ color:'var(--text-muted)', marginLeft:'auto' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="sale-form">
          {/* Price + Qty */}
          <div className="sale-row">
            <div className="input-group">
              <label>Precio de venta (MXN)</label>
              <div style={{ position:'relative' }}>
                <span className="sale-prefix">$</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  style={{ paddingLeft: 28 }}
                  value={form.salePrice}
                  onChange={e => set('salePrice', Number(e.target.value))}
                  required
                />
              </div>
              <span className="sale-hint">Precio lista: ${product.price.toLocaleString('es-MX')}</span>
            </div>

            {product.type !== PRODUCT_TYPES.ONE_OFF && (
              <div className="input-group">
                <label>Cantidad vendida</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  max={maxQty}
                  value={form.quantity}
                  onChange={e => set('quantity', e.target.value)}
                  required
                />
                <span className="sale-hint">Máx disponible: {maxQty}</span>
              </div>
            )}
          </div>

          {/* Sale summary card */}
          <div className="sale-summary">
            <div className="sale-summary-row">
              <span>Ingreso</span>
              <span className="sale-sum-revenue">${revenue.toLocaleString('es-MX')} MXN</span>
            </div>
            <div className="sale-summary-row">
              <span>Costo ({qty} × ${product.cost.toLocaleString()})</span>
              <span style={{ color:'var(--text-muted)' }}>-${(product.cost * qty).toLocaleString('es-MX')}</span>
            </div>
            <div className="sale-summary-divider" />
            <div className="sale-summary-row">
              <span style={{ fontWeight: 700 }}>Ganancia</span>
              <span className={`sale-sum-profit ${profit >= 0 ? '' : 'sale-loss'}`}>
                ${profit.toLocaleString('es-MX')} MXN
              </span>
            </div>
            <div className="sale-summary-row">
              <span>Margen</span>
              <span className={`badge ${margin >= 50 ? 'badge-green' : margin >= 0 ? 'badge-yellow' : 'badge-red'}`}
                style={{ fontSize:'0.78rem' }}>
                {margin}%
              </span>
            </div>
            {product.type !== PRODUCT_TYPES.ONE_OFF && (
              <div className="sale-summary-row sale-stock-row">
                <span>Stock restante</span>
                <span className={remainingAfter <= 2 ? 'sale-low-stock' : 'sale-ok-stock'}>
                  {remainingAfter} unidades {remainingAfter === 0 ? '⚠️ Se agota' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Delivery */}
          <div className="input-group">
            <label>Método de entrega</label>
            <div className="sale-delivery-opts">
              <label className={`sale-delivery-opt ${form.delivery === DELIVERY_METHODS.PICKUP ? 'active' : ''}`}>
                <input type="radio" name="delivery" value={DELIVERY_METHODS.PICKUP}
                  checked={form.delivery === DELIVERY_METHODS.PICKUP}
                  onChange={() => set('delivery', DELIVERY_METHODS.PICKUP)} />
                <MapPin size={16} />
                <span>Pickup</span>
              </label>
              <label className={`sale-delivery-opt ${form.delivery === DELIVERY_METHODS.DELIVERY ? 'active' : ''}`}>
                <input type="radio" name="delivery" value={DELIVERY_METHODS.DELIVERY}
                  checked={form.delivery === DELIVERY_METHODS.DELIVERY}
                  onChange={() => set('delivery', DELIVERY_METHODS.DELIVERY)} />
                <Truck size={16} />
                <span>Entrega</span>
              </label>
            </div>
          </div>

          {/* Date */}
          <div className="input-group">
            <label>Fecha de venta</label>
            <input className="input" type="date" value={form.saleDate}
              max={today}
              onChange={e => set('saleDate', e.target.value)} />
          </div>

          {/* Notes */}
          <div className="input-group">
            <label>Notas (opcional)</label>
            <input className="input" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Ej: cliente negociado, pago en efectivo..." />
          </div>

          {/* Actions */}
          <div className="sale-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-teal">
              <CheckCircle size={16} />
              Confirmar venta
            </button>
          </div>
        </form>

        <style>{`
          .sale-modal { width: 100%; max-width: 480px; }
          .sale-header {
            display: flex; align-items: center; gap: 14px;
            padding: 20px 24px;
            border-bottom: 1.5px solid var(--border);
          }
          .sale-header-icon {
            width: 44px; height: 44px; flex-shrink: 0;
            background: #E8F6EC; color: #2E7D32;
            border-radius: var(--radius-md);
            display: flex; align-items: center; justify-content: center;
          }
          .sale-header h3 { font-size: 1.1rem; }
          .sale-product-name { font-size: 0.82rem; color: var(--text-muted); margin-top: 2px; }
          .sale-form { padding: 20px 24px 24px; display: flex; flex-direction: column; gap: 16px; }
          .sale-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
          .sale-prefix {
            position: absolute; left: 12px; top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted); font-weight: 600;
          }
          .sale-hint { font-size: 0.75rem; color: var(--text-muted); }
          .sale-summary {
            background: var(--bg-muted);
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            padding: 14px;
            display: flex; flex-direction: column; gap: 8px;
          }
          .sale-summary-row {
            display: flex; justify-content: space-between; align-items: center;
            font-size: 0.875rem; color: var(--text-secondary);
          }
          .sale-summary-divider { height: 1px; background: var(--border); }
          .sale-sum-revenue { color: var(--teal-dark); font-weight: 700; font-family: var(--font-display); }
          .sale-sum-profit  { color: #2E7D32; font-weight: 800; font-family: var(--font-display); font-size: 1rem; }
          .sale-loss        { color: #C62828 !important; }
          .sale-low-stock   { color: #E65100; font-weight: 700; }
          .sale-ok-stock    { color: #2E7D32; font-weight: 700; }
          .sale-stock-row   { padding-top: 4px; border-top: 1px dashed var(--border); }
          .sale-delivery-opts { display: flex; gap: 8px; }
          .sale-delivery-opt {
            flex: 1;
            display: flex; align-items: center; gap: 8px;
            padding: 10px 14px;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            cursor: pointer;
            font-size: 0.875rem; font-weight: 600;
            color: var(--text-secondary);
            transition: all var(--dur-fast);
          }
          .sale-delivery-opt input[type=radio] { display: none; }
          .sale-delivery-opt.active {
            border-color: var(--teal); background: #E8F4F3; color: var(--teal);
          }
          .sale-delivery-opt:hover { border-color: var(--teal-light); }
          .sale-actions { display: flex; gap: 10px; justify-content: flex-end; }
          @media (max-width: 480px) {
            .sale-row { grid-template-columns: 1fr; }
            .sale-actions { flex-direction: column; }
            .sale-actions .btn { width: 100%; justify-content: center; }
          }
        `}</style>
      </div>
    </div>
  );
}
