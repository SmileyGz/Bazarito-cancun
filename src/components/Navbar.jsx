import React from 'react';
import { ShoppingCart, Package } from 'lucide-react';
import { MESSENGER_URL } from '../data/store';

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        {/* Logo */}
        <a href="/" className="navbar-logo">
          <img src="/Logo.png" alt="Bazarito Cancún" style={{ height: 44 }} />
        </a>

        {/* Actions */}
        <div className="navbar-actions">
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary btn-sm"
          >
            <ShoppingCart size={16} />
            <span className="hide-mobile">Preguntar</span>
          </a>
        </div>
      </div>

      <style>{`
        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(255,251,238,0.92);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 1.5px solid var(--border);
          box-shadow: 0 2px 12px rgba(26,18,8,0.06);
          padding-top: env(safe-area-inset-top);
        }
        .navbar-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          background: var(--yellow);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.3rem;
          box-shadow: 0 2px 8px rgba(255,208,0,0.3);
          flex-shrink: 0;
        }
        .logo-text {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logo-bazarito {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          color: var(--teal);
          letter-spacing: -0.01em;
        }
        .logo-cancun {
          font-family: var(--font-display);
          font-weight: 900;
          font-size: 1.1rem;
          color: var(--orange);
          letter-spacing: -0.01em;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        @media (max-width: 480px) {
          .hide-mobile { display: none; }
        }
      `}</style>
    </nav>
  );
}
