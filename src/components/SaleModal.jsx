import React, { useState } from 'react';
import { X, CheckCircle, Truck, MapPin, User, Phone, Mail } from 'lucide-react';
import { DELIVERY_METHODS, PRODUCT_TYPES } from '../data/store';

const BAZARITO_WA = '529543388332'; // WhatsApp business number

const PAY_METHODS = [
  { id: 'mercadopago', label: 'Mercado Pago', icon: '💳' },
  { id: 'cash_delivery', label: 'Efectivo · Domicilio', icon: '💵' },
  { id: 'cash_pickup',   label: 'Efectivo · Recolección', icon: '🏪' },
];

const DELIVERY_FEE_OPTIONS = [
  { amount: 50, label: '$50 (corta distancia)' },
  { amount: 80, label: '$80 (larga distancia)' },
];

function buildConfirmationText(product, form, isDelivery) {
  if (isDelivery) {
    return (
`✨ ¡Confirmado!
Tu pedido está listo y sale a envío.
Manténte pendiente de tu teléfono 📲; el repartidor te contactará al llegar a tu domicilio.

⏱️ Tiempo de espera máximo: 10–15 minutos.
Ten en cuenta que el repartidor puede llevar más entregas en ruta.

⚠️ Importante: Si no logramos contactarte o recibir el pedido dentro de ese tiempo, este será regresado y podrá contar como dos traslados, por lo que te pedimos estar muy pendiente para evitar cualquier contratiempo.`
    );
  }
  return (
`✅ ¡Tu pedido está listo para recoger!
📦 ${product.name}
📍 Dirección: Región 96, Cancún
⏱️ Pasa a recoger en los próximos 15–30 minutos.

¡Gracias por tu compra! 🙏`
  );
}

function buildWhatsAppLink(phone, text) {
  // Strip non-digits; add Mexico prefix if not present
  let digits = phone.replace(/\D/g, '');
  if (!digits.startsWith('52') && digits.length === 10) digits = '52' + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

export default function SaleModal({ product, onConfirm, onClose }) {
  const today = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    salePrice:          product.price,
    quantity:           1,
    delivery:           DELIVERY_METHODS.PICKUP,
    saleDate:           today,
    payMethod:          'mercadopago',
    notes:              '',
    deliveryFee:        false,
    deliveryFeeAmount:  80,
    clientName:         '',
    clientPhone:        '',
    clientEmail:        '',
  });

  const maxQty         = product.type === PRODUCT_TYPES.ONE_OFF ? 1 : (product.stock || 1);
  const qty            = Math.min(Math.max(1, Number(form.quantity)), maxQty);
  const unitRevenue    = Number(form.salePrice) || 0;
  const feeRevenue     = form.delivery === DELIVERY_METHODS.DELIVERY && form.deliveryFee ? Number(form.deliveryFeeAmount) : 0;
  const revenue        = (unitRevenue * qty) + feeRevenue;
  const profit         = (unitRevenue - product.cost) * qty + feeRevenue;
  const margin         = product.cost > 0 ? Math.round(((unitRevenue - product.cost) / product.cost) * 100) : 0;
  const remainingAfter = Math.max(0, (product.stock || 1) - qty);

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); }

  function handleSubmit(e) {
    e.preventDefault();
    onConfirm({
      ...form,
      quantity:          qty,
      salePrice:         unitRevenue,
      deliveryFeeAmount: feeRevenue > 0 ? feeRevenue : 0,
    });
  }

  const isDelivery = form.delivery === DELIVERY_METHODS.DELIVERY;

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

          {/* ── Price + Qty ── */}
          <div className="sale-row">
            <div className="input-group">
              <label>Precio de venta (MXN)</label>
              <div style={{ position:'relative' }}>
                <span className="sale-prefix">$</span>
                <input
                  className="input"
                  type="number"
                  min="0"
                  step="any"
                  style={{ paddingLeft: 28 }}
                  value={form.salePrice}
                  onChange={e => set('salePrice', e.target.value)}
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

          {/* ── Sale summary ── */}
          <div className="sale-summary">
            <div className="sale-summary-row">
              <span>Ingreso{feeRevenue > 0 ? ` (+ $${feeRevenue} envío)` : ''}</span>
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

          {/* ── Delivery method ── */}
          <div className="input-group">
            <label>Método de entrega</label>
            <div className="sale-delivery-opts">
              <label className={`sale-delivery-opt ${form.delivery === DELIVERY_METHODS.PICKUP ? 'active' : ''}`}>
                <input type="radio" name="delivery" value={DELIVERY_METHODS.PICKUP}
                  checked={form.delivery === DELIVERY_METHODS.PICKUP}
                  onChange={() => set('delivery', DELIVERY_METHODS.PICKUP)} />
                <MapPin size={16} />
                <span>Recolección</span>
              </label>
              <label className={`sale-delivery-opt ${form.delivery === DELIVERY_METHODS.DELIVERY ? 'active' : ''}`}>
                <input type="radio" name="delivery" value={DELIVERY_METHODS.DELIVERY}
                  checked={form.delivery === DELIVERY_METHODS.DELIVERY}
                  onChange={() => set('delivery', DELIVERY_METHODS.DELIVERY)} />
                <Truck size={16} />
                <span>Domicilio</span>
              </label>
            </div>

            {/* Delivery fee checkbox — only shown when delivery selected */}
            {isDelivery && (
              <div className="sale-fee-row">
                <label className="sale-fee-check">
                  <input
                    type="checkbox"
                    checked={form.deliveryFee}
                    onChange={e => set('deliveryFee', e.target.checked)}
                  />
                  <span>Cobrar costo de envío (ingreso adicional)</span>
                </label>
                {form.deliveryFee && (
                  <div className="sale-fee-opts">
                    {DELIVERY_FEE_OPTIONS.map(opt => (
                      <label key={opt.amount} className={`sale-delivery-opt ${form.deliveryFeeAmount === opt.amount ? 'active' : ''}`} style={{ flex: 'none', padding: '8px 14px' }}>
                        <input
                          type="radio"
                          name="deliveryFeeAmount"
                          checked={form.deliveryFeeAmount === opt.amount}
                          onChange={() => set('deliveryFeeAmount', opt.amount)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Payment method ── */}
          <div className="input-group">
            <label>Método de pago</label>
            <div className="sale-pay-opts">
              {PAY_METHODS.map(pm => (
                <label key={pm.id} className={`sale-delivery-opt ${form.payMethod === pm.id ? 'active' : ''}`}>
                  <input type="radio" name="payMethod" value={pm.id}
                    checked={form.payMethod === pm.id}
                    onChange={() => set('payMethod', pm.id)} />
                  <span>{pm.icon} {pm.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Sale date ── */}
          <div className="input-group">
            <label>Fecha de venta</label>
            <input className="input" type="date" value={form.saleDate}
              max={today}
              onChange={e => set('saleDate', e.target.value)} />
            {form.saleDate !== today && (
              <span className="sale-hint" style={{ color:'#E65100' }}>⚠️ Registrando venta para {form.saleDate}</span>
            )}
          </div>

          {/* ── Client info (optional, for records) ── */}
          <div className="sale-client">
            <p className="sale-client-title">Datos del cliente <span>(opcional — para tus registros)</span></p>
            <div className="sale-client-grid">
              <div className="input-group">
                <label>Nombre</label>
                <div style={{ position:'relative' }}>
                  <User size={14} className="sale-input-icon" />
                  <input className="input" style={{ paddingLeft:32 }}
                    value={form.clientName}
                    onChange={e => set('clientName', e.target.value)}
                    placeholder="Nombre del cliente" />
                </div>
              </div>
              <div className="input-group">
                <label>Teléfono / WhatsApp</label>
                <div style={{ position:'relative' }}>
                  <Phone size={14} className="sale-input-icon" />
                  <input className="input" style={{ paddingLeft:32 }} type="tel"
                    value={form.clientPhone}
                    onChange={e => set('clientPhone', e.target.value)}
                    placeholder="+52 998 000 0000" />
                </div>
              </div>
              <div className="input-group" style={{ gridColumn: '1 / -1' }}>
                <label>Email <span style={{ fontWeight:400, color:'var(--text-muted)' }}>(para futuro envío de recibo)</span></label>
                <div style={{ position:'relative' }}>
                  <Mail size={14} className="sale-input-icon" />
                  <input className="input" style={{ paddingLeft:32 }} type="email"
                    value={form.clientEmail}
                    onChange={e => set('clientEmail', e.target.value)}
                    placeholder="cliente@email.com" />
                </div>
              </div>
            </div>

            {/* WhatsApp confirmation button — shown when phone is entered */}
            {form.clientPhone.trim() && (
              <a
                href={buildWhatsAppLink(
                  form.clientPhone,
                  buildConfirmationText(product, form, isDelivery)
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="sale-wa-btn"
              >
                <span style={{ fontSize:'1.1rem' }}>📲</span>
                Enviar confirmación por WhatsApp
              </a>
            )}
          </div>

          {/* ── Notes ── */}
          <div className="input-group">
            <label>Notas (opcional)</label>
            <input className="input" value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="Ej: negociado, pago en efectivo, acuerdo especial..." />
          </div>

          {/* ── Actions ── */}
          <div className="sale-actions">
            <button type="button" className="btn btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-teal">
              <CheckCircle size={16} />
              Confirmar venta
            </button>
          </div>
        </form>

        <style>{`
          .sale-modal { width: 100%; max-width: 500px; max-height: 92vh; overflow-y: auto; }
          .sale-header {
            display: flex; align-items: center; gap: 14px;
            padding: 20px 24px;
            border-bottom: 1.5px solid var(--border);
            position: sticky; top: 0; background: var(--bg-card); z-index: 5;
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
          .sale-input-icon {
            position: absolute; left: 10px; top: 50%;
            transform: translateY(-50%); color: var(--text-muted);
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
          .sale-delivery-opts { display: flex; gap: 8px; flex-wrap: wrap; }
          .sale-pay-opts { display: flex; gap: 8px; flex-direction: column; }
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
            white-space: nowrap;
          }
          .sale-delivery-opt input[type=radio] { display: none; }
          .sale-delivery-opt.active {
            border-color: var(--teal); background: #E8F4F3; color: var(--teal);
          }
          .sale-delivery-opt:hover { border-color: var(--teal-light); }
          /* Delivery fee */
          .sale-fee-row { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
          .sale-fee-check {
            display: flex; align-items: center; gap: 8px;
            font-size: 0.85rem; font-weight: 600; color: var(--text-secondary);
            cursor: pointer;
          }
          .sale-fee-check input { accent-color: var(--teal); width: 16px; height: 16px; }
          .sale-fee-opts { display: flex; gap: 8px; }
          /* Client section */
          .sale-client {
            background: var(--bg-muted);
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            padding: 14px;
          }
          .sale-client-title {
            font-size: 0.78rem; font-weight: 700;
            text-transform: uppercase; letter-spacing: 0.06em;
            color: var(--text-muted); margin-bottom: 12px;
          }
          .sale-client-title span { font-weight: 400; text-transform: none; letter-spacing: 0; }
          .sale-client-grid {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          }
          /* WhatsApp button */
          .sale-wa-btn {
            display: flex; align-items: center; gap: 10px;
            margin-top: 12px;
            background: #25D366; color: white;
            border-radius: var(--radius-md);
            padding: 11px 18px;
            font-weight: 700; font-size: 0.9rem;
            text-decoration: none;
            transition: all var(--dur-fast);
            box-shadow: 0 2px 8px rgba(37,211,102,0.3);
          }
          .sale-wa-btn:hover { background: #1ebe59; transform: translateY(-1px); box-shadow: 0 4px 14px rgba(37,211,102,0.4); }
          .sale-actions { display: flex; gap: 10px; justify-content: flex-end; }
          @media (max-width: 480px) {
            .sale-row { grid-template-columns: 1fr; }
            .sale-client-grid { grid-template-columns: 1fr; }
            .sale-actions { flex-direction: column; }
            .sale-actions .btn { width: 100%; justify-content: center; }
          }
        `}</style>
      </div>
    </div>
  );
}
