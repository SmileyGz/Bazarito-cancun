import React from 'react';
import { MessageCircle, Truck, MapPin, Star } from 'lucide-react';
import { MESSENGER_URL } from '../data/store';

// Floating sticker items scattered around the hero — Bazarito Cancún themed
const STICKERS = [
  { emoji: '🌮', top: '8%',  left: '4%',  size: '2.8rem', rotate: '-12deg', delay: '0s',   duration: '3.2s' },
  { emoji: '🌴', top: '6%',  left: '18%', size: '2.2rem', rotate: '8deg',   delay: '0.4s', duration: '3.8s' },
  { emoji: '🛵', top: '5%',  right: '22%',size: '2.4rem', rotate: '-6deg',  delay: '0.2s', duration: '3.5s' },
  { emoji: '🏠', top: '55%', left: '2%',  size: '2.6rem', rotate: '10deg',  delay: '0.6s', duration: '4s'   },
  { emoji: '☀️', top: '62%', left: '16%', size: '2.2rem', rotate: '-8deg',  delay: '0.8s', duration: '3.3s' },
  { emoji: '🐠', top: '20%', right: '4%', size: '2rem',   rotate: '15deg',  delay: '0.3s', duration: '2.8s' },
  { emoji: '📦', top: '58%', right: '3%', size: '2.5rem', rotate: '-10deg', delay: '0.5s', duration: '3.6s' },
  { emoji: '🌊', top: '72%', right: '18%',size: '2rem',   rotate: '6deg',   delay: '0.7s', duration: '4.2s' },
  { emoji: '🥭', top: '30%', left: '6%',  size: '1.8rem', rotate: '0deg',   delay: '1s',   duration: '3s'   },
  { emoji: '💧', top: '78%', left: '5%',  size: '2rem',   rotate: '-14deg', delay: '0.9s', duration: '3.7s' },
  { emoji: '🐾', top: '15%', right: '8%', size: '2.2rem', rotate: '12deg',  delay: '0.1s', duration: '4.1s' },
  { emoji: '🍋', top: '80%', right: '8%', size: '2rem',   rotate: '-5deg',  delay: '1.1s', duration: '3.4s' },
];

// Colorful confetti dashes
const DASHES = [
  { color:'#1A7A6D', top:'12%', left:'32%',  w:28, rot:'-30deg', delay:'0.2s' },
  { color:'#E84B09', top:'88%', left:'42%',  w:22, rot:'20deg',  delay:'0.5s' },
  { color:'#FFD000', top:'20%', right:'38%', w:18, rot:'-45deg', delay:'0.8s' },
  { color:'#1A7A6D', top:'75%', right:'30%', w:24, rot:'35deg',  delay:'0.3s' },
  { color:'#E84B09', top:'42%', left:'10%',  w:20, rot:'-20deg', delay:'0.9s' },
  { color:'#FFD000', top:'35%', right:'10%', w:16, rot:'50deg',  delay:'0.6s' },
];

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Background blobs */}
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="hero-blob blob-3" />

      {/* Floating emoji stickers */}
      {STICKERS.map((s, i) => (
        <div key={i} className="hero-sticker" style={{
          top: s.top, left: s.left, right: s.right,
          fontSize: s.size,
          transform: `rotate(${s.rotate})`,
          animationDelay: s.delay,
          animationDuration: s.duration,
        }}>
          {s.emoji}
        </div>
      ))}

      {/* Confetti dashes */}
      {DASHES.map((d, i) => (
        <div key={i} className="hero-dash" style={{
          top: d.top, left: d.left, right: d.right,
          width: d.w, background: d.color,
          transform: `rotate(${d.rot})`,
          animationDelay: d.delay,
        }} />
      ))}

      {/* Main content */}
      <div className="container hero-content">
        {/* Location tag */}
        <div className="hero-tag animate-fade-in-up">
          <span>🌴</span>
          <span>Cancún, México</span>
          <span>🌊</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title animate-fade-in-up delay-1">
          <span className="title-teal">Finds útiles</span>
          <br />
          <span className="title-orange">para tu día a día</span>
          <br />
          <span className="title-sub">en Cancún</span>
        </h1>

        {/* Sub */}
        <p className="hero-sub animate-fade-in-up delay-2">
          Productos reales · Precios locales · Entrega rápida
        </p>

        {/* CTA */}
        <div className="hero-cta animate-fade-in-up delay-3">
          <a
            href={MESSENGER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="messenger-btn"
            style={{ maxWidth: 340 }}
          >
            <MessageCircle size={22} />
            Pregunta lo que necesitas
          </a>
        </div>

        {/* Pills */}
        <div className="hero-pills animate-fade-in-up delay-4">
          <div className="hero-pill"><MapPin size={14} /><span>Región 96</span></div>
          <div className="hero-pill"><Truck size={14} /><span>Entrega desde $50</span></div>
          <div className="hero-pill"><Star size={14} /><span>Cientos de productos</span></div>
        </div>
      </div>

      <style>{`
        .hero {
          position: relative;
          padding: 70px 0 56px;
          overflow: hidden;
          text-align: center;
          min-height: 480px;
        }

        /* Blobs */
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(70px); pointer-events: none; }
        .blob-1 { width: 500px; height: 500px; background: rgba(255,208,0,0.28); top: -160px; right: -100px; }
        .blob-2 { width: 350px; height: 350px; background: rgba(26,122,109,0.10); bottom: -100px; left: -80px; }
        .blob-3 { width: 300px; height: 300px; background: rgba(232,75,9,0.06); top: 50%; left: 50%; transform: translate(-50%,-50%); }

        /* Stickers */
        .hero-sticker {
          position: absolute;
          z-index: 0;
          user-select: none;
          pointer-events: none;
          filter: drop-shadow(0 3px 6px rgba(0,0,0,0.12));
          animation: heroFloat var(--dur, 3.5s) ease-in-out infinite alternate;
          will-change: transform;
          line-height: 1;
        }
        @keyframes heroFloat {
          0%   { transform: translateY(0px)    rotate(var(--rot, 0deg)); }
          100% { transform: translateY(-10px)  rotate(var(--rot, 0deg)); }
        }

        /* Dashes */
        .hero-dash {
          position: absolute;
          height: 6px;
          border-radius: 999px;
          pointer-events: none;
          opacity: 0.75;
          animation: heroFloat 4s ease-in-out infinite alternate;
        }

        /* Content */
        .hero-content {
          position: relative;
          z-index: 3;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 20px;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--yellow); color: var(--black);
          padding: 6px 18px; border-radius: var(--radius-full);
          font-family: var(--font-display); font-weight: 700; font-size: 0.85rem;
          box-shadow: 0 2px 10px rgba(255,208,0,0.4);
        }
        .hero-title {
          font-size: clamp(2.2rem, 6vw, 3.6rem);
          line-height: 1.15;
          max-width: 680px;
        }
        .title-teal   { color: var(--teal); }
        .title-orange { color: var(--orange); }
        .title-sub    { color: var(--text-secondary); font-size: 0.68em; font-weight: 700; }
        .hero-sub {
          font-size: 1.05rem; color: var(--text-secondary);
          font-weight: 500; letter-spacing: 0.01em;
        }
        .hero-cta { width: 100%; display: flex; justify-content: center; padding: 0 16px; }
        .hero-pills { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: var(--radius-full); padding: 6px 14px;
          font-size: 0.82rem; font-weight: 600; color: var(--text-secondary);
          box-shadow: var(--shadow-sm);
        }

        /* Hide most stickers on small screens to avoid clutter */
        @media (max-width: 640px) {
          .hero { padding: 48px 0 40px; min-height: auto; }
          .hero-sticker:nth-child(n+6) { display: none; }
          .hero-badge { display: none; }
          .hero-title { font-size: 2rem; }
        }
      `}</style>
    </section>
  );
}
