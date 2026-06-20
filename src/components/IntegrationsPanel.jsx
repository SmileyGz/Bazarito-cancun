import React, { useState } from 'react';
import { Globe, ShoppingBag, BarChart2, Activity, ExternalLink } from 'lucide-react';

export default function IntegrationsPanel() {
  const [fbStatus] = useState('active');
  const [tiktokStatus] = useState('pending');

  return (
    <div className="integrations-panel">
      
      <div className="integrations-section">
        <h2>📊 Analítica y Tráfico</h2>
        <div className="integrations-grid">
          
          <div className="integration-card">
            <div className="integration-header">
              <Activity color="#1877F2" size={28} />
              <div>
                <h3>Meta Pixel</h3>
                <p>Rastreo de eventos de Facebook e Instagram.</p>
              </div>
              <StatusBadge status="active" />
            </div>
            <div className="integration-body">
              <p>Tu pixel (ID: 933683316366381) está activo recopilando datos de PageView en tiempo real.</p>
              <div className="actions">
                <a href="https://business.facebook.com/events_manager2" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  Ver Eventos <ExternalLink size={14} style={{marginLeft: 4}}/>
                </a>
              </div>
            </div>
          </div>

          <div className="integration-card">
            <div className="integration-header">
              <BarChart2 color="#F4B400" size={28} />
              <div>
                <h3>Google Tag Manager</h3>
                <p>Gestor de etiquetas y Google Analytics 4.</p>
              </div>
              <StatusBadge status="active" />
            </div>
            <div className="integration-body">
              <p>El contenedor GTM-T2GGQLP7 está inyectado y activo para todos los visitantes.</p>
              <div className="actions">
                <a href="https://tagmanager.google.com/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  Abrir Tag Manager <ExternalLink size={14} style={{marginLeft: 4}}/>
                </a>
                <a href="https://analytics.google.com/" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">
                  Abrir Analytics <ExternalLink size={14} style={{marginLeft: 4}}/>
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="integrations-section">
        <h2>🛍️ Catálogos y Tiendas</h2>
        <div className="integrations-grid">
          
          <div className="integration-card">
            <div className="integration-header">
              <Globe color="#1877F2" size={28} />
              <div>
                <h3>Facebook Catalog Sync</h3>
                <p>Sincroniza tus productos con Facebook Shops.</p>
              </div>
              <StatusBadge status={fbStatus} />
            </div>
            <div className="integration-body">
              <p>Tus productos se sincronizan automáticamente cada vez que agregas o actualizas el inventario.</p>
              <div className="actions">
                <button className="btn btn-outline btn-sm">Configuración de API</button>
                <button className="btn btn-teal btn-sm" onClick={() => alert('Sincronizando...')}>Sincronizar</button>
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
              <p>Conecta tu cuenta de TikTok Shop Partner para habilitar el inventario bidireccional.</p>
              <div className="actions">
                <button className="btn btn-teal btn-sm">Conectar Cuenta</button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        .integrations-panel {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        .integrations-section h2 {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .integrations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .integration-card {
          background: var(--bg-card);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-lg);
          padding: 24px;
          display: flex;
          flex-direction: column;
        }
        .integration-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 16px;
        }
        .integration-header h3 {
          margin: 0;
          font-size: 1.1rem;
        }
        .integration-header p {
          margin: 0;
          font-size: 0.85rem;
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
        .status-active { background: #E8F6EC; color: #2E7D32; border: 1px solid #C8E6C9; }
        .status-pending { background: #FFF8D6; color: #E65100; border: 1px solid #FFECB3; }
        .status-error { background: #FFEBEE; color: #C62828; border: 1px solid #FFCDD2; }
        
        .integration-body {
          border-top: 1px solid var(--border);
          padding-top: 16px;
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .integration-body p {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
          line-height: 1.5;
          flex-grow: 1;
        }
        .actions {
          display: flex;
          gap: 10px;
        }
        .actions a { text-decoration: none; }
      `}</style>
    </div>
  );
}

function StatusBadge({ status }) {
  if (status === 'active') return <span className="status-badge status-active">Activo</span>;
  if (status === 'pending') return <span className="status-badge status-pending">Pendiente</span>;
  return <span className="status-badge status-error">Error</span>;
}
