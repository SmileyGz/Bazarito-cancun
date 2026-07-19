import React from 'react';
import { X, Mail, MessageCircle, FileText } from 'lucide-react';

export default function ReceiptModal({ sale, onClose }) {
  if (!sale) return null;

  const d = new Date(sale.saleDate);
  const dateStr = d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
  const total = sale.salePrice * sale.quantity;

  const receiptText = `
*Bazarito Cancún*
--------------------------------
🧾 *RECIBO DE COMPRA*
📅 Fecha: ${dateStr}
--------------------------------
🛍️ *Producto:* ${sale.productName}
📦 *Cantidad:* ${sale.quantity}
💰 *Total:* $${total.toLocaleString('es-MX')} MXN
--------------------------------
${sale.notes ? `📝 *Notas:* ${sale.notes}\n--------------------------------` : ''}

¡Gracias por tu preferencia! ✨
  `.trim();

  function handleEmail() {
    // Attempt to extract email from notes if present. We expect "Cliente: Nombre | Tel | Email"
    let email = '';
    const emailMatch = sale.notes?.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
    if (emailMatch) {
      email = emailMatch[1];
    }

    const subject = encodeURIComponent(`Recibo de Compra - Bazarito Cancún`);
    const body = encodeURIComponent(receiptText);
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  }

  function handleWhatsApp() {
    let phone = '';
    // Look for a Mexican phone number pattern in notes (e.g., 10 digits)
    const phoneMatch = sale.notes?.match(/(\d{10})/);
    if (phoneMatch) {
      phone = '52' + phoneMatch[1]; // assuming MX
    }

    const text = encodeURIComponent(receiptText);
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box receipt-modal" onClick={e => e.stopPropagation()}>
        <div className="receipt-header">
          <h3><FileText size={18} style={{ marginRight: 6, verticalAlign: 'middle' }} /> Recibo</h3>
          <button className="btn btn-icon" onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="receipt-paper">
          <div className="receipt-logo">
            <img src="/Logo.png" alt="Bazarito" />
          </div>
          <h4>RECIBO DE COMPRA</h4>
          <p className="receipt-date">{dateStr}</p>
          
          <div className="receipt-divider"></div>
          
          <div className="receipt-row">
            <span>Producto</span>
            <strong>{sale.productName}</strong>
          </div>
          <div className="receipt-row">
            <span>Cantidad</span>
            <strong>{sale.quantity}</strong>
          </div>
          <div className="receipt-row receipt-total">
            <span>Total</span>
            <strong>${total.toLocaleString('es-MX')} MXN</strong>
          </div>
          
          {sale.notes && (
            <>
              <div className="receipt-divider"></div>
              <div className="receipt-notes">
                <strong>Detalles:</strong>
                <p>{sale.notes}</p>
              </div>
            </>
          )}

          <div className="receipt-footer">¡Gracias por tu compra!</div>
        </div>

        <div className="receipt-actions">
          <button className="btn btn-outline receipt-btn" onClick={handleEmail}>
            <Mail size={16} /> Correo
          </button>
          <button className="btn receipt-btn whatsapp-btn" onClick={handleWhatsApp}>
            <MessageCircle size={16} /> WhatsApp
          </button>
        </div>
      </div>

      <style>{`
        .receipt-modal { width: 100%; max-width: 400px; padding: 0; background: #f8fafc; }
        .receipt-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          background: white; border-radius: var(--radius-lg) var(--radius-lg) 0 0;
        }
        .receipt-header h3 { font-size: 1.1rem; color: var(--text-primary); margin: 0; }
        
        .receipt-paper {
          background: white;
          margin: 20px;
          padding: 24px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0;
          text-align: center;
        }
        .receipt-logo img { height: 40px; margin-bottom: 12px; }
        .receipt-paper h4 { margin: 0; font-family: var(--font-display); font-size: 1.2rem; margin-bottom: 4px; letter-spacing: 0.05em; color: var(--text-primary); }
        .receipt-date { font-size: 0.85rem; color: var(--text-muted); margin: 0 0 16px; }
        
        .receipt-divider { border-top: 1px dashed #cbd5e1; margin: 16px 0; }
        
        .receipt-row {
          display: flex; justify-content: space-between; align-items: flex-start;
          font-size: 0.9rem; text-align: left; margin-bottom: 8px;
        }
        .receipt-row span { color: var(--text-secondary); width: 40%; }
        .receipt-row strong { color: var(--text-primary); width: 60%; text-align: right; }
        .receipt-total { font-size: 1.1rem; margin-top: 12px; }
        .receipt-total strong { color: var(--teal-dark); font-weight: 800; font-family: var(--font-display); }
        
        .receipt-notes { text-align: left; font-size: 0.85rem; color: var(--text-secondary); background: #f8fafc; padding: 10px; border-radius: 6px; margin: 0; }
        .receipt-notes strong { display: block; margin-bottom: 4px; color: var(--text-primary); }
        .receipt-notes p { margin: 0; }
        
        .receipt-footer { margin-top: 24px; font-size: 0.85rem; font-weight: 600; color: var(--teal); }
        
        .receipt-actions {
          display: flex; gap: 12px; padding: 0 20px 20px;
        }
        .receipt-btn { flex: 1; justify-content: center; font-size: 0.9rem; }
        .whatsapp-btn { background: #25D366; color: white; border: none; }
        .whatsapp-btn:hover { background: #1EBE5D; transform: translateY(-1px); box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); }
      `}</style>
    </div>
  );
}
