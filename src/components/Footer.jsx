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
        
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
          Productos reales · Entregas seguras · Región 96, Cancún, México
        </p>
        
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} Bazarito Cancun. Todos los derechos reservados
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
      `}</style>
    </footer>
  );
}
