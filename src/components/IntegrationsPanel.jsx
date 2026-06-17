import React, { useState } from 'react';
import { Globe, ShoppingBag, CheckCircle2, AlertCircle } from 'lucide-react';

export default function IntegrationsPanel() {
  const [fbStatus, setFbStatus] = useState('active'); // active, pending, error
  const [tiktokStatus, setTiktokStatus] = useState('pending');

  return (
    <div className="integrations-panel">
      <div className="integration-card">
        <div className="integration-header">
          <Globe color="#1877F2" size={28} />
          <div>
            <h3>Facebook Catalog Sync</h3>
            <p>Sincroniza tus productos con Facebook Shops e Instagram.</p>
          </div>
          <StatusBadge status={fbStatus} />
        </div>
        
        <div className="integration-body">
          <p>
            Tus productos se sincronizan automáticamente cada vez que agregas o actualizas el inventario. 
            Las ventas en Facebook descontarán el stock automáticamente.
          </p>
          <div className="actions">
            <button className="btn btn-outline btn-sm">Configuración de API</button>
            <button className="btn btn-teal btn-sm" onClick={() => alert('Sincronizando...')}>Sincronizar Ahora</button>
          </div>
        </div>
      </div>

      <div className="integration-card">
        <div className="integration-header">
          <ShoppingBag color="#000000" size={28} />
          <div>
            <h3>TikTok Shop</h3>
            <p>Vende tus productos directamente en TikTok.</p>
          </div>
          <StatusBadge status={tiktokStatus} />
        </div>
        
        <div className="integration-body">
          <p>
            Conecta tu cuenta de TikTok Shop Partner para habilitar el inventario bidireccional.
          </p>
          <div className="actions">
            <button className="btn btn-teal btn-sm">Conectar Cuenta</button>
          </div>
        </div>
      </div>

      <style>{`
        .integrations-panel {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .integration-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
        }
        .integration-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .integration-header h3 {
          margin: 0;
          font-size: 1.2rem;
        }
        .integration-header p {
          margin: 0;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .status-badge {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .status-active { background: #E8F5E9; color: #2E7D32; }
        .status-pending { background: #FFF3E0; color: #E65100; }
        .status-error { background: #FFEBEE; color: #C62828; }
        
        .integration-body {
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }
        .integration-body p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
        }
        .actions {
          display: flex;
          gap: 12px;
        }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'active') {
    return <span className="status-badge status-active"><CheckCircle2 size={16} /> Conectado</span>;
  }
  if (status === 'error') {
    return <span className="status-badge status-error"><AlertCircle size={16} /> Error</span>;
  }
  return <span className="status-badge status-pending"><Globe size={16} /> Pendiente</span>;
}
