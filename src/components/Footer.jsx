import React from 'react';

export default function Footer() {
  return (
    <footer className="global-footer">
      <div className="container" style={{ textAlign: 'center', paddingTop: 40, paddingLeft: 20, paddingRight: 20, paddingBottom: 'calc(40px + env(safe-area-inset-bottom))' }}>
        <img 
          src={'/Logo.png'}
          alt="Bazarito Cancún" 
          style={{ height: 50, display: 'block', margin: '0 auto 16px auto' }} 
        />
        
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          <span className="footer-trust-badge">🛡️ Compra 100% Segura</span>
          <span className="footer-trust-badge">🤝 Pago Contra Entrega</span>
          <span className="footer-trust-badge">📍 Negocio Local (Región 96)</span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 8, lineHeight: 1.5 }}>
          Productos útiles · Entregas rápidas en Cancún<br />
          ¿Dudas? Contáctanos por WhatsApp al <a href="https://wa.me/529983388332" style={{ color: 'var(--teal)', textDecoration: 'none' }}>998 338 8332</a>
        </p>
        
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Bazarito Cancún. Todos los derechos reservados.
        </p>

        <div style={{ marginTop: 24 }}>
          <a 
            href="#" 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{ fontSize: '0.75rem', color: 'var(--teal)', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', opacity: 0.8 }}
          >
            ⚡ Powered by Jonla Agencia
          </a>
        </div>
      </div>

      <style>{`
        .global-footer {
          background: var(--bg-muted);
          border-top: 1.5px solid var(--border);
          margin-top: auto;
        }
        .footer-trust-badge {
          background: rgba(26, 18, 8, 0.05);
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-secondary);
        }
      `}</style>
    </footer>
  );
}
