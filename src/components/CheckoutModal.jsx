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

// ── Pickup time slots: 9am–6pm, every 30 min ────────────────────────────────
function buildPickupSlots() {
  const slots = [];
  for (let h = 9; h <= 18; h++) {
    for (let m = 0; m < 60; m += 30) {
      if (h === 18 && m > 0) continue; // Don't go past 6:00 PM
      const mm = String(m).padStart(2, '0');
      
      let h12 = h;
      let suffix = 'AM';
      if (h >= 12) {
        suffix = 'PM';
        if (h > 12) h12 = h - 12;
      }
      
      const label = `${h12}:${mm} ${suffix}`;
      slots.push({ value: label, label });
    }
  }
  return slots;
}
const PICKUP_SLOTS = buildPickupSlots();

// ── Edge Function URL ───────────────────────────────────────────────────────
const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-preference`;

export default function CheckoutModal({ product, onClose, quantity = 1 }) {
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);
  
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
          quantity:       quantity,
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
  const productTotal = product.price * quantity;
  const totalFull    = productTotal + (deliveryType === 'delivery' ? deliveryFee : 0);

  // Form validity
  const isContactValid = name.trim().length >= 2 && phone.trim().length >= 8;
  const isDeliveryValid = deliveryType === 'delivery' ? !!zone : !!pickupTime;
  const isReadyToPay = isContactValid && isDeliveryValid;

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

        {/* ── MP Wallet rendered after preference created ── */}
        {prefId ? (
          <div className="co-body animate-fade-in">
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
              ← Volver a opciones de pago
            </button>
          </div>
        ) : (
          <div className="co-body animate-fade-in">
            {/* 1. Contacto */}
            <div className="co-section-title">1. ¿A quién le entregamos?</div>
            <div className="input-group">
              <input
                id="co-name"
                className="input"
                required
                placeholder="Nombre completo (Ej: Juan García)"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="input-group">
              <input
                id="co-phone"
                className="input"
                required
                type="tel"
                placeholder="WhatsApp / Teléfono (Ej: 998 123 4567)"
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>

            {/* 2. Método de entrega */}
            {deliveryEnabled && (
              <>
                <div className="co-section-title" style={{ marginTop: 12 }}>2. ¿Cómo lo quieres recibir?</div>
                <div className="co-delivery-opts">
                  <button
                    type="button"
                    id="co-opt-pickup"
                    className={`co-delivery-opt ${deliveryType === 'pickup' ? 'co-delivery-opt-active' : ''}`}
                    onClick={() => setDelivery('pickup')}
                  >
                    <MapPin size={20} />
                    <span>Recolección</span>
                    <small>Región 96, Cancún</small>
                  </button>

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
                </div>
              </>
            )}

            {!deliveryEnabled && (
              <div className="co-info-box" style={{ marginTop: 12 }}>
                <p>📍 Este producto solo está disponible para <strong>recolección en tienda</strong> (Región 96, Cancún).</p>
              </div>
            )}

            {/* 2b. Opciones específicas */}
            {deliveryType === 'delivery' ? (
              <div className="co-zones animate-fade-in">
                <div className="co-section-title">Selecciona tu zona de envío</div>
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
                    <span className="co-zone-fee">+ ${z.fee} MXN</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className="co-section-title" style={{ marginTop: 8 }}>¿A qué hora pasas a recoger?</div>
                <div className="co-select-wrapper">
                  <select
                    id="co-pickup-time-select"
                    className="co-select"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    aria-label="Selecciona un horario de recogida"
                  >
                    <option value="">-- Elige un horario (9 AM - 6 PM) --</option>
                    {PICKUP_SLOTS.map(slot => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 3. Pagos (Aparece cuando 1 y 2 están listos) */}
            <div className={`co-payment-section ${isReadyToPay ? 'ready' : 'locked'}`}>
              <div className="co-section-title" style={{ marginTop: 12 }}>3. ¿Cómo prefieres pagar?</div>
              
              {!isReadyToPay && (
                <div className="co-locked-msg">
                  Completa tus datos y opciones de entrega arriba para ver los métodos de pago.
                </div>
              )}

              {isReadyToPay && error && <div className="co-error">⚠️ {error}</div>}

              {isReadyToPay && deliveryType === 'pickup' && (
                <div className="animate-fade-in">
                  <div className="co-info-box" style={{ marginBottom: 12 }}>
                    <p>📍 <strong>Dirección:</strong> Región 96, Cancún</p>
                    <p style={{ marginTop: 6 }}>📞 Te enviaremos nuestra ubicación exacta y teléfono por <strong>WhatsApp</strong> al confirmar tu pedido.</p>
                  </div>
                  <button
                    id="co-pickup-confirm-btn"
                    className="btn btn-teal"
                    style={{ width: '100%', padding: '14px 20px', fontSize: '1rem' }}
                    disabled={!pickupTime}
                    onClick={() => {
                      const BAZARITO_WA = '529543388332';
                      const msg = encodeURIComponent(
                        `🛒 ¡Hola Bazarito! Quiero apartar el producto:\n"${product.name}"${quantity > 1 ? ` x${quantity}` : ''} ($${productTotal.toLocaleString('es-MX')} MXN)\n\n👤 Nombre: ${name.trim()}\n📱 Teléfono: ${phone.trim()}\n⏰ Hora de recogida: ${pickupTime}\n\n¿Me puedes confirmar la dirección exacta? ¡Gracias!`
                      );
                      window.open(`https://wa.me/${BAZARITO_WA}?text=${msg}`, '_blank');
                      onClose();
                    }}
                  >
                    ✅ Pagar en efectivo al recoger (${productTotal.toLocaleString('es-MX')} MXN)
                  </button>
                </div>
              )}

              {isReadyToPay && deliveryType === 'delivery' && (
                <div className="animate-fade-in">
                  <div className="co-pay-card">
                    <div className="co-pay-card-header">
                      <ShieldCheck size={20} className="co-pay-icon-green" />
                      <div>
                        <p className="co-pay-card-title">Reserva tu envío — ${deliveryFee} MXN</p>
                        <p className="co-pay-card-sub">Paga ahora solo el costo de envío por Mercado Pago</p>
                      </div>
                    </div>
                    <div className="co-pay-terms">
                      ✅ <strong>Paga el resto en efectivo</strong> directo a tu repartidor al recibir tu pedido (${productTotal.toLocaleString('es-MX')} MXN).
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

                  <div className="co-pay-card co-pay-card-alt" style={{ marginTop: 12 }}>
                    <div className="co-pay-card-header">
                      <CreditCard size={20} className="co-pay-icon-blue" />
                      <div>
                        <p className="co-pay-card-title">Pago total — ${totalFull.toLocaleString('es-MX')} MXN</p>
                        <p className="co-pay-card-sub">Producto + envío, todo por Mercado Pago</p>
                      </div>
                    </div>
                    <button
                      id="co-pay-full-btn"
                      className="btn btn-blue"
                      style={{ width: '100%', marginTop: 10 }}
                      disabled={loading}
                      onClick={() => createPreference('full')}
                    >
                      {loading && paymentType === 'full'
                        ? 'Preparando pago...'
                        : `💳 Pagar todo ahora · $${totalFull.toLocaleString('es-MX')} MXN`}
                    </button>
                  </div>
                </div>
              )}
            </div>
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
            font-size: 0.8rem; font-weight: 800;
            color: var(--text-primary);
          }
          .co-payment-section {
            transition: all 0.3s ease;
          }
          .co-payment-section.locked {
            opacity: 0.5; pointer-events: none;
          }
          .co-locked-msg {
            background: var(--bg-muted); border: 1.5px dashed var(--border);
            padding: 12px; border-radius: var(--radius-md); font-size: 0.8rem;
            color: var(--text-muted); text-align: center; margin-top: 8px;
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
          .co-zones { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
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
          /* Pickup time dropdown */
          .co-select-wrapper {
            position: relative;
            width: 100%;
            margin-top: 8px;
          }
          .co-select {
            width: 100%;
            padding: 12px 16px;
            font-size: 0.95rem;
            font-weight: 600;
            color: var(--text-primary);
            background: var(--bg-card);
            border: 2px solid var(--border);
            border-radius: var(--radius-md);
            cursor: pointer;
            outline: none;
            appearance: none;
            -webkit-appearance: none;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }
          .co-select:focus {
            border-color: var(--teal);
            box-shadow: 0 0 0 3px rgba(26, 122, 109, 0.15);
          }
          .co-select-wrapper::after {
            content: '';
            position: absolute;
            right: 16px;
            top: 50%;
            width: 8px;
            height: 8px;
            border-right: 2px solid var(--text-secondary);
            border-bottom: 2px solid var(--text-secondary);
            pointer-events: none;
            transform: translateY(-70%) rotate(45deg);
            transition: border-color 0.2s ease;
          }
          .co-select-wrapper:focus-within::after {
            border-color: var(--teal);
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
            text-align: center; padding: 4px; margin-top: 12px;
            transition: color var(--dur-fast);
            display: block; width: 100%;
          }
          .co-back-link:hover { color: var(--teal); }
        `}</style>
      </div>
    </div>
  );
}
