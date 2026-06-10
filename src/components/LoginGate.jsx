import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { checkPassword } from '../data/store';

export default function LoginGate({ onSuccess }) {
  const [pw, setPw]     = useState('');
  const [show, setShow] = useState(false);
  const [err, setErr]   = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    if (checkPassword(pw)) {
      onSuccess();
    } else {
      setErr(true);
      setPw('');
      setTimeout(() => setErr(false), 2000);
    }
  }

  return (
    <div className="gate-wrap">
      <div className="gate-card animate-fade-in-up">
        <div className="gate-icon">
          <Lock size={28} />
        </div>
        <h2>Panel Admin</h2>
        <p>Acceso exclusivo para Bazarito Cancún</p>

        <form onSubmit={handleSubmit} className="gate-form">
          <div className="input-group">
            <label>Contraseña</label>
            <div className="gate-input-wrap">
              <input
                type={show ? 'text' : 'password'}
                className={`input ${err ? 'input-error' : ''}`}
                value={pw}
                onChange={e => setPw(e.target.value)}
                placeholder="Ingresa la contraseña"
                autoFocus
              />
              <button type="button" className="gate-eye" onClick={() => setShow(!show)}>
                {show ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {err && <span className="gate-err">Contraseña incorrecta 🔒</span>}
          </div>
          <button type="submit" className="btn btn-teal" style={{ width:'100%', justifyContent:'center' }}>
            Entrar al panel
          </button>
        </form>

        <a href="/" className="gate-back">← Volver al catálogo</a>
      </div>

      <style>{`
        .gate-wrap {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          padding: 20px;
        }
        .gate-card {
          background: var(--bg-card);
          border-radius: var(--radius-xl);
          border: 1.5px solid var(--border);
          box-shadow: var(--shadow-lg);
          padding: 40px;
          width: 100%;
          max-width: 380px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          text-align: center;
        }
        .gate-icon {
          width: 64px; height: 64px;
          background: var(--yellow);
          border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center;
          color: var(--black);
          box-shadow: 0 4px 16px rgba(255,208,0,0.35);
          font-size: 1.5rem;
        }
        .gate-card h2 { font-size: 1.5rem; }
        .gate-card p  { font-size: 0.9rem; color: var(--text-muted); }
        .gate-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
          margin-top: 8px;
        }
        .gate-input-wrap { position: relative; }
        .gate-eye {
          position: absolute;
          right: 12px; top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          cursor: pointer;
          border: none; background: none;
          display: flex; align-items: center;
          transition: color var(--dur-fast);
        }
        .gate-eye:hover { color: var(--text-primary); }
        .input-error { border-color: #FF3B30 !important; animation: shake 0.3s; }
        .gate-err { font-size: 0.82rem; color: #FF3B30; font-weight: 600; }
        .gate-back {
          font-size: 0.85rem;
          color: var(--text-muted);
          text-decoration: none;
          transition: color var(--dur-fast);
        }
        .gate-back:hover { color: var(--teal); }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25%      { transform: translateX(-6px); }
          75%      { transform: translateX(6px); }
        }
      `}</style>
    </div>
  );
}
