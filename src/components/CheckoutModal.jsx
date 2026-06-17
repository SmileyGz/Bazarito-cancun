import React, { useState } from 'react';
import { X, MapPin, Truck, Moon, ShieldCheck, CreditCard, Clock } from 'lucide-react';
import { supabase } from '../lib/supabase';
const ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
import MercadoPagoWallet from './MercadoPagoWallet';

// ── Delivery zones ──────────────────────────────────────────────────────────
const ZONES = [
  { id: 'short',  label: '1–6 km',            fee: 50,  icon: <MapPin  size={16} /> },
  { id: 'long',   label: '6–10 km',           fee: 80,  icon: <Truck   size={16} /> },
  { id: 'night',  label: 'Nocturno (>8 pm)',  fee: 100, icon: <Moon    size={16} /> },
];

// ── Pickup time slots: 9am–6pm, every 15 min ────────────────────────────────
function buildPickupSlots() {
  const slots = [];
  for (let h = 9; h < 18; h++) {
    for (let m = 0; m < 60; m += 15) {
      const hh = String(h).padStart(2, '0');
      const mm = String(m).padStart(2, '0');
      const suffix = h < 12 ? 'AM' : 'PM';
      const h12 = h > 12 ? h - 12 : h;
      slots.push({ value: `${hh}:${mm}`, label: `${h12}:${mm} ${suffix}` });
    }
  }
  return slots;
}
const PICKUP_SLOTS = buildPickupSlots();

const STEPS = { INFO: 'info', PICKUP_TIME: 'pickup_time', PAYMENT: 'payment', DONE: 'done' };

// ── Edge Function URL ───────────────────────────────────────────────────────
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`;

export default function CheckoutModal({ product, onClose }) {
  const [step, setStep]             = useState(STEPS.INFO);
  const [deliveryType, setDelivery] = useState('pickup');   // 'pickup' | 'delivery'
  const [zone, setZone]             = useState('short');
  const [name, setName]             = useState('');
  const [phone, setPhone]           = useState('');
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [prefId, setPrefId]         = useState(null);      // preference_id from MP
  const [paymentType, setPaymentType] = useState(null);    // 'deposit' | 'full'

  const deliveryEnabled = product.delivery_enabled !== false;
  const selectedZone    = ZONES.find(z => z.id === zone);
  const deliveryFee     = selectedZone?.fee || 50;

  // ── Step 1 → Step 2 ──────────────────────────────────────────────────────
  function goToPayment(e) {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    if (deliveryType === 'pickup') {
      setStep(STEPS.PICKUP_TIME);
    } else {
      setStep(STEPS.PAYMENT);
    }
  }

  // ── Create preference with MP ─────────────────────────────────────────────
  async function createPreference(type) {
    setLoading(true);
    setError('');
    setPaymentType(type);
    try {
      const res = await fetch(FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${ANON_KEY}`,
          'apikey': ANON_KEY,
        },
        body: JSON.stringify({
          payment_type:   type,            // 'deposit' | 'full'
          product_id:     product.id,
          product_name:   product.name,
          product_price:  product.price,
          delivery_zone:  deliveryType === 'delivery' ? zone : null,
          delivery_fee:   deliveryType === 'delivery' ? deliveryFee : 0,
          delivery_type:  deliveryType,
          customer_name:  name.trim(),
          customer_phone: phone.trim(),
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Error ${res.status}`);
      }
      const { preference_id } = await res.json();
      setPrefId(preference_id);
    } catch (err) {
      setError(err.message || 'No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  // ── Total display helpers ─────────────────────────────────────────────────
  const totalFull    = product.price + (deliveryType === 'delivery' ? deliveryFee : 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box co-modal" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="co-header">
          <div>
            <p className="co-header-label">{product.name}</p>
            <h3 className="co-header-title">Finalizar compra</h3>
          </div>
          <button className="co-close" aria-label="Cerrar modal de pago" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* ── STEP 1: Client Info ── */}
        {step === STEPS.INFO && (
          <form className="co-body" onSubmit={goToPayment}>
            <div className="co-section-title">Tus datos de contacto</div>

            <div className="input-group">
              <label>Nombre completo *</label>
              <input
                id="co-name"
                className="input"
                required
                placeholder="Ej: Juan García"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label>WhatsApp / Teléfono *</label>
              <input
                id="co-phone"
                className="input"
                required
                type="tel"
                placeholder="Ej: 998 123 4567"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            {/* Delivery type */}
            <div className="co-section-title" style={{ marginTop: 4 }}>¿Cómo quieres recibirlo?</div>
            <div className="co-delivery-opts">
              <button
                type="button"
                id="co-opt-pickup"
                className={`co-delivery-opt ${deliveryType === 'pickup' ? 'co-delivery-opt-active' : ''}`}
                onClick={() => setDelivery('pickup')}
              >
                <MapPin size={20} />
                <span>Recolección</span>
                <small>Región 96, Cancún · Gratis</small>
              </button>

              {deliveryEnabled && (
                <button
                  type="button"
                  id="co-opt-delivery"
                  className={`co-delivery-opt ${deliveryType === 'delivery' ? 'co-delivery-opt-active' : ''}`}
                  onClick={() => setDelivery('delivery')}
                >
                  <Truck size={20} />
                  <span>Envío a domicilio</span>
                  <small>Desde $50 MXN</small>
                </button>
              )}
            </div>

            {/* Zone selector — only if delivery */}
            {deliveryType === 'delivery' && (
              <div className="co-zones">
                <div className="co-section-title">Selecciona tu zona</div>
                {ZONES.map(z => (
                  <button
                    key={z.id}
                    type="button"
                    id={`co-zone-${z.id}`}
                    className={`co-zone-opt ${zone === z.id ? 'co-zone-opt-active' : ''}`}
                    onClick={() => setZone(z.id)}
                  >
                    <span className="co-zone-icon">{z.icon}</span>
                    <span className="co-zone-label">{z.label}</span>
                    <span className="co-zone-fee">${z.fee} MXN</span>
                  </button>
                ))}
              </div>
            )}

            <button id="co-next-btn" type="submit" className="btn btn-teal" style={{ width: '100%', marginTop: 8 }}>
              Continuar →
            </button>
          </form>
        )}

        {/* ── STEP 1.5: Pickup time selector ── */}
        {step === STEPS.PICKUP_TIME && (
          <div className="co-body">
            <div className="co-recap">
              <p className="co-recap-name">{product.name}</p>
              <p className="co-recap-sub">📍 Recolección en Región 96, Cancún</p>
            </div>

            <div className="co-section-title">
              <Clock size={14} style={{ display: 'inline', marginRight: 4 }} />
              ¿A qué hora pasas a recoger?
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: -8 }}>
              Horario de atención: 9:00 AM – 6:00 PM
            </p>

            <div className="co-time-grid">
              {PICKUP_SLOTS.map(slot => (
                <button
                  key={slot.value}
                  type="button"
                  id={`co-time-${slot.value}`}
                  className={`co-time-slot ${pickupTime === slot.value ? 'co-time-slot-active' : ''}`}
                  onClick={() => setPickupTime(slot.value)}
                >
                  {slot.label}
                </button>
              ))}
            </div>

            <div className="co-info-box">
              <p>📍 <strong>Dirección:</strong> Región 96, Cancún</p>
              <p style={{ marginTop: 6 }}>📞 Te enviaremos nuestra ubicación exacta y teléfono por <strong>WhatsApp</strong> al confirmar tu pedido.</p>
              <p style={{ marginTop: 6 }}>💵 Precio del producto: <strong>${product.price.toLocaleString('es-MX')} MXN — pagas en efectivo al recoger.</strong></p>
            </div>

            <button
              id="co-pickup-confirm-btn"
              className="btn btn-teal"
              style={{ width: '100%' }}
              disabled={!pickupTime}
              onClick={() => {
                // Build a pre-filled WhatsApp message to business
                const BAZARITO_WA = '529543388332';
                const msg = encodeURIComponent(
                  `🛒 ¡Hola Bazarito! Quiero apartar el producto:\n"${product.name}" ($${product.price.toLocaleString('es-MX')} MXN)\n\n👤 Nombre: ${name.trim()}\n📱 Teléfono: ${phone.trim()}\n⏰ Hora de recogida: ${pickupTime}\n\n¿Me puedes confirmar la dirección exacta? ¡Gracias!`
                );
                window.open(`https://wa.me/${BAZARITO_WA}?text=${msg}`, '_blank');
                onClose();
              }}
            >
              ✅ Confirmar recogida a las {pickupTime || '—'}
            </button>
            <button
              type="button"
              className="co-back-link"
              onClick={() => { setStep(STEPS.INFO); }}
            >
              ← Cambiar datos
            </button>
          </div>
        )}

        {/* ── STEP 2: Payment selection ── */}
        {step === STEPS.PAYMENT && !prefId && (
          <div className="co-body">
            <div className="co-recap">
              <p className="co-recap-name">{product.name}</p>
              <p className="co-recap-sub">
                {`🚚 Envío ${selectedZone?.label} · $${deliveryFee} MXN`}
              </p>
            </div>

            {/* ── Delivery: 2 CTAs ── */}
            <>
              <div className="co-section-title" style={{ marginTop: 4 }}>Elige cómo pagar</div>

              {error && <div className="co-error">⚠️ {error}</div>}

              {/* CTA 1 — Deposit only */}
              <div className="co-pay-card">
                <div className="co-pay-card-header">
                  <ShieldCheck size={20} className="co-pay-icon-green" />
                  <div>
                    <p className="co-pay-card-title">Reserva tu envío — ${deliveryFee} MXN</p>
                    <p className="co-pay-card-sub">Paga ahora solo el costo de envío por Mercado Pago</p>
                  </div>
                </div>
                <div className="co-pay-terms">
                  ✅ <strong>Paga el resto en efectivo</strong> de forma segura, directo a tu repartidor al recibir tu pedido (${product.price.toLocaleString('es-MX')} MXN).
                </div>
                <button
                  id="co-pay-deposit-btn"
                  className="btn btn-teal"
                  style={{ width: '100%', marginTop: 10 }}
                  disabled={loading}
                  onClick={() => createPreference('deposit')}
                >
                  {loading && paymentType === 'deposit'
                    ? 'Preparando pago...'
                    : `🔒 Pagar anticipo de envío · $${deliveryFee} MXN`}
                </button>
              </div>

              {/* CTA 2 — Full payment */}
              <div className="co-pay-card co-pay-card-alt">
                <div className="co-pay-card-header">
                  <CreditCard size={20} className="co-pay-icon-blue" />
                  <div>
                    <p className="co-pay-card-title">Pago total — ${totalFull.toLocaleString('es-MX')} MXN</p>
                    <p className="co-pay-card-sub">Producto + envío, todo por Mercado Pago</p>
                  </div>
                </div>
                <div className="co-pay-breakdown">
                  <span>Producto</span><span>${product.price.toLocaleString('es-MX')}</span>
                  <span>Envío ({selectedZone?.label})</span><span>+ ${deliveryFee}</span>
                  <span className="co-pay-total-label">Total</span><span className="co-pay-total-val">${totalFull.toLocaleString('es-MX')}</span>
                </div>
                <p className="co-pay-terms">✅ Al recibirlo no necesitas efectivo. Todo está cubierto.</p>
                <button
                  id="co-pay-full-btn"
                  className="btn btn-blue"
                  style={{ width: '100%', marginTop: 10 }}
                  disabled={loading}
                  onClick={() => createPreference('full')}
                >
                  {loading && paymentType === 'full'
                    ? 'Preparando pago...'
                    : `💳 Pagar todo · $${totalFull.toLocaleString('es-MX')} MXN`}
                </button>
              </div>
            </>

            <button
              type="button"
              className="co-back-link"
              onClick={() => { setStep(STEPS.INFO); setPrefId(null); setError(''); }}
            >
              ← Cambiar datos
            </button>
          </div>
        )}

        {/* ── MP Wallet rendered after preference created ── */}
        {step === STEPS.PAYMENT && prefId && (
          <div className="co-body">
            <div className="co-recap">
              <p className="co-recap-name">{product.name}</p>
              <p className="co-recap-sub">
                {paymentType === 'deposit'
                  ? `🔒 Anticipo de envío · $${deliveryFee} MXN`
                  : `💳 Pago total · $${totalFull.toLocaleString('es-MX')} MXN`}
              </p>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
              {paymentType === 'deposit'
                ? `El producto ($${product.price.toLocaleString('es-MX')} MXN) se paga en efectivo al recibirlo. Sin excepciones.`
                : 'Al recibir el producto no necesitas efectivo. ✅'}
            </p>
            <MercadoPagoWallet
              preferenceId={prefId}
              onError={(e) => setError('Error al cargar el botón de pago. ' + (e?.message || ''))}
            />
            {error && <div className="co-error" style={{ marginTop: 12 }}>⚠️ {error}</div>}
            <button
              type="button"
              className="co-back-link"
              onClick={() => { setPrefId(null); setError(''); setPaymentType(null); }}
            >
              ← Volver
            </button>
          </div>
        )}

        <style>{`
          .co-modal {
            width: 100%; max-width: 440px;
            max-height: 92vh; overflow-y: auto;
          }
          .co-header {
            display: flex; align-items: flex-start; justify-content: space-between;
            padding: 20px 20px 0;
          }
          .co-header-label {
            font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.07em; color: var(--teal); margin-bottom: 2px;
          }
          .co-header-title {
            font-family: var(--font-display); font-size: 1.1rem; font-weight: 800;
            color: var(--text-primary); line-height: 1.2;
          }
          .co-close {
            width: 34px; height: 34px; flex-shrink: 0;
            background: var(--bg-muted); border: none; border-radius: var(--radius-full);
            display: flex; align-items: center; justify-content: center;
            color: var(--text-secondary); cursor: pointer;
            transition: all var(--dur-fast);
          }
          .co-close:hover { background: var(--border); }
          .co-body {
            padding: 16px 20px 24px;
            display: flex; flex-direction: column; gap: 14px;
          }
          .co-section-title {
            font-size: 0.72rem; font-weight: 700; text-transform: uppercase;
            letter-spacing: 0.06em; color: var(--text-muted);
          }
          /* Delivery options */
          .co-delivery-opts {
            display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
          }
          .co-delivery-opt {
            display: flex; flex-direction: column; align-items: center; gap: 4px;
            padding: 14px 10px;
            border: 2px solid var(--border); border-radius: var(--radius-md);
            background: var(--bg-card); cursor: pointer;
            transition: all var(--dur-fast); text-align: center;
            color: var(--text-secondary); font-weight: 600; font-size: 0.9rem;
          }
          .co-delivery-opt small {
            font-size: 0.72rem; font-weight: 400; color: var(--text-muted);
          }
          .co-delivery-opt:hover { border-color: var(--teal); background: #E8F4F3; }
          .co-delivery-opt-active {
            border-color: var(--teal) !important;
            background: #E8F4F3 !important; color: var(--teal-dark) !important;
          }
          /* Zone selector */
          .co-zones { display: flex; flex-direction: column; gap: 8px; }
          .co-zone-opt {
            display: flex; align-items: center; gap: 10px;
            padding: 10px 14px;
            border: 2px solid var(--border); border-radius: var(--radius-md);
            background: var(--bg-card); cursor: pointer;
            transition: all var(--dur-fast); text-align: left;
            font-size: 0.88rem; font-weight: 600; color: var(--text-secondary);
          }
          .co-zone-opt:hover { border-color: var(--teal); }
          .co-zone-opt-active { border-color: var(--teal) !important; background: #E8F4F3 !important; color: var(--teal-dark) !important; }
          .co-zone-icon { color: var(--teal); display: flex; }
          .co-zone-label { flex: 1; }
          .co-zone-fee { font-family: var(--font-display); font-weight: 800; color: var(--teal-dark); }
          /* Pickup time grid */
          .co-time-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 6px;
          }
          .co-time-slot {
            padding: 8px 4px;
            border: 1.5px solid var(--border);
            border-radius: var(--radius-md);
            background: var(--bg-card);
            font-size: 0.78rem; font-weight: 600;
            color: var(--text-secondary);
            cursor: pointer;
            transition: all var(--dur-fast);
            text-align: center;
          }
          .co-time-slot:hover { border-color: var(--teal); color: var(--teal); }
          .co-time-slot-active {
            border-color: var(--teal) !important;
            background: #E8F4F3 !important;
            color: var(--teal-dark) !important;
          }
          /* Recap bar */
          .co-recap {
            padding: 12px 14px; background: var(--bg-muted);
            border-radius: var(--radius-md); border: 1.5px solid var(--border);
          }
          .co-recap-name { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
          .co-recap-sub  { font-size: 0.8rem; color: var(--text-muted); margin-top: 2px; }
          /* Payment cards */
          .co-pay-card {
            padding: 16px; border: 2px solid var(--border);
            border-radius: var(--radius-md); background: var(--bg-card);
            display: flex; flex-direction: column; gap: 10px;
          }
          .co-pay-card-alt { border-color: #BBDEFB; background: #F0F8FF; }
          .co-pay-card-header { display: flex; align-items: flex-start; gap: 10px; }
          .co-pay-card-title { font-weight: 700; font-size: 0.95rem; color: var(--text-primary); }
          .co-pay-card-sub   { font-size: 0.78rem; color: var(--text-muted); margin-top: 2px; }
          .co-pay-icon-green { color: #2E7D32; flex-shrink: 0; margin-top: 2px; }
          .co-pay-icon-blue  { color: #1565C0; flex-shrink: 0; margin-top: 2px; }
          .co-pay-terms {
            font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5;
            background: var(--bg-muted); padding: 10px 12px; border-radius: var(--radius-sm);
          }
          .co-pay-breakdown {
            display: grid; grid-template-columns: 1fr auto;
            gap: 4px 12px; font-size: 0.82rem; color: var(--text-secondary);
            padding: 8px 12px; background: var(--bg-muted); border-radius: var(--radius-sm);
          }
          .co-pay-total-label { font-weight: 700; color: var(--text-primary); padding-top: 4px; border-top: 1px solid var(--border); }
          .co-pay-total-val   { font-family: var(--font-display); font-weight: 800; color: var(--teal-dark); padding-top: 4px; border-top: 1px solid var(--border); }
          /* Info box */
          .co-info-box {
            font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;
            padding: 14px; background: var(--bg-muted);
            border: 1.5px solid var(--border); border-radius: var(--radius-md);
          }
          /* Error */
          .co-error {
            background: #FFEBEE; border: 1.5px solid #EF9A9A;
            border-radius: var(--radius-md); padding: 10px 14px;
            font-size: 0.85rem; color: #C62828; font-weight: 600;
          }
          /* Blue button (for full payment) */
          .btn-blue {
            background: #1565C0; color: white; display: flex; align-items: center;
            justify-content: center; gap: 8px; padding: 14px 20px;
            border-radius: var(--radius-md); font-weight: 700; font-size: 0.95rem;
            border: none; cursor: pointer; transition: all var(--dur-fast);
          }
          .btn-blue:hover:not(:disabled) { background: #0D47A1; transform: translateY(-1px); }
          .btn-blue:disabled { opacity: 0.6; cursor: not-allowed; }
          /* Back link */
          .co-back-link {
            background: none; border: none; color: var(--text-muted);
            font-size: 0.82rem; font-weight: 600; cursor: pointer;
            text-align: center; padding: 4px;
            transition: color var(--dur-fast);
          }
          .co-back-link:hover { color: var(--teal); }
          @media (max-width: 380px) {
            .co-time-grid { grid-template-columns: repeat(3, 1fr); }
          }
        `}</style>
      </div>
    </div>
  );
}
