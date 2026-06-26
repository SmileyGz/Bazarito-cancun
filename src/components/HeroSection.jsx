import React from 'react';
import { Truck, MapPin, Star } from 'lucide-react';
import { MESSENGER_URL } from '../data/store';

// ── Sticker-style floating emoji objects ─────────────────
// White card background, drop shadow, rotation — like peel-off stickers
const STICKERS = [
  // Left column
  { emoji: '📦', style: 'card',    top: '6%',  left: '2%',  mTop: '4%',  mLeft: '4%',  size: '2.4rem', rotate: '-14deg', delay: '0s',   dur: '3.6s' },
  { emoji: '👍', style: 'circle',  top: '38%', left: '2%',  mTop: '32%', mLeft: '3%',  size: '2.2rem', rotate: '0deg',   delay: '0.5s', dur: '4.2s', circleColor: '#1A7A6D' },
  { emoji: '🎧', style: 'card',    top: '68%', left: '3%',  mTop: '65%', mLeft: '2%',  size: '2.3rem', rotate: '10deg',  delay: '0.3s', dur: '3.9s' },
  { emoji: '🌮', style: 'card',    top: '82%', left: '18%', mTop: '85%', mLeft: '15%', size: '2rem',   rotate: '-6deg',  delay: '0.9s', dur: '3.4s' },
  // Right column
  { emoji: '📱', style: 'circle',  top: '8%',  right: '3%', mTop: '6%',  mRight: '4%', size: '2.2rem', rotate: '0deg',   delay: '0.2s', dur: '4s',  circleColor: '#1A7A6D' },
  { emoji: '🛒', style: 'card',    top: '34%', right: '2%', mTop: '28%', mRight: '2%', size: '2.5rem', rotate: '8deg',   delay: '0.7s', dur: '3.7s' },
  { emoji: '🍎', style: 'card',    top: '65%', right: '4%', mTop: '58%', mRight: '4%', size: '2rem',   rotate: '-10deg', delay: '0.4s', dur: '4.4s' },
  { emoji: '👗', style: 'card',    top: '80%', right: '18%',mTop: '82%', mRight: '12%', size: '2rem',   rotate: '6deg',   delay: '1.1s', dur: '3.2s' },
];

// ── Badge stickers (SALE / NUEVO / OFERTA style) ─────────
const BADGES = [
  { text: 'OFERTA',  top: '5%',  right: '22%', mTop: '3%',  mRight: '26%', bg: '#E84B09', rotate: '12deg',  delay: '0.3s', shape: 'oval'      },
  { text: '20% OFF', top: '70%', left: '20%', mTop: '74%', mLeft: '18%',  bg: '#E84B09', rotate: '-8deg', delay: '0.8s', shape: 'starburst'  },
  { text: 'NUEVO', top: '15%', left: '22%',  mTop: '12%', mLeft: '24%',  bg: '#1A7A6D', rotate: '-6deg',  delay: '0.6s', shape: 'oval'      },
];

// ── Confetti dashes ──────────────────────────────────────
const DASHES = [
  { color:'#1A7A6D', top:'10%', left:'34%',  mTop:'8%',  mLeft:'38%',  w:26, h:7,  rot:'-30deg', delay:'0.2s' },
  { color:'#E84B09', top:'88%', left:'40%',  mTop:'92%', mLeft:'45%',  w:20, h:6,  rot:'22deg',  delay:'0.5s' },
  { color:'#FFD000', top:'22%', right:'30%', mTop:'20%', mRight:'35%', w:16, h:6,  rot:'-45deg', delay:'0.8s' },
  { color:'#1A7A6D', top:'74%', right:'28%', mTop:'78%', mRight:'32%', w:22, h:6,  rot:'35deg',  delay:'0.3s' },
  { color:'#E84B09', top:'48%', left:'8%',   mTop:'45%', mLeft:'12%',  w:18, h:5,  rot:'-18deg', delay:'0.9s' },
  { color:'#FFD000', top:'40%', right:'8%',  mTop:'36%', mRight:'14%', w:14, h:5,  rot:'48deg',  delay:'0.6s' },
  { color:'#1A7A6D', top:'55%', left:'26%',  mTop:'52%', mLeft:'28%',  w:12, h:5,  rot:'-38deg', delay:'1s'   },
  { color:'#E84B09', top:'30%', right:'24%', mTop:'25%', mRight:'20%', w:10, h:5,  rot:'60deg',  delay:'0.4s' },
];

export default function HeroSection() {
  return (
    <section className="hero">
      {/* Warm yellow ambient glow */}
      <div className="hero-blob blob-1" />
      <div className="hero-blob blob-2" />
      <div className="hero-blob blob-3" />

      {/* ── Emoji sticker objects ── */}
      {STICKERS.map((s, i) => (
        <div
          key={i}
          className={`hero-sticker hero-sticker-${s.style}`}
          style={{
            '--top': s.top, '--left': s.left, '--right': s.right,
            '--m-top': s.mTop, '--m-left': s.mLeft, '--m-right': s.mRight,
            fontSize: s.size,
            '--rotate': s.rotate,
            animationDelay: s.delay,
            animationDuration: s.dur,
            ...(s.circleColor ? { background: s.circleColor } : {}),
          }}
        >
          {s.emoji}
        </div>
      ))}

      {/* ── Badge stickers (SALE / NUEVO / etc.) ── */}
      {BADGES.map((b, i) => (
        <div
          key={i}
          className={`hero-badge hero-badge-${b.shape}`}
          style={{
            '--top': b.top, '--left': b.left, '--right': b.right,
            '--m-top': b.mTop, '--m-left': b.mLeft, '--m-right': b.mRight,
            background: b.bg,
            '--rotate': b.rotate,
            animationDelay: b.delay,
          }}
        >
          {b.text}
        </div>
      ))}

      {/* ── Confetti dashes ── */}
      {DASHES.map((d, i) => (
        <div
          key={i}
          className="hero-dash"
          style={{
            '--top': d.top, '--left': d.left, '--right': d.right,
            '--m-top': d.mTop, '--m-left': d.mLeft, '--m-right': d.mRight,
            width: d.w, height: d.h,
            background: d.color,
            transform: `rotate(${d.rot})`,
            animationDelay: d.delay,
          }}
        />
      ))}

      {/* ── Main content ── */}
      <div className="container hero-content">

        {/* Location tag */}
        <div className="hero-tag animate-fade-in-up">
          <span>🌴</span>
          <span>Cancún, México</span>
          <span>🌊</span>
        </div>

        {/* Headline */}
        <h1 className="hero-title animate-fade-in-up delay-1">
          <span className="title-teal">Descubre productos</span>
          <br />
          <span className="title-orange">increíbles a precios locales</span>
          <br />
          <span className="title-sub">Con entrega rápida en Cancún</span>
        </h1>

        {/* Sub */}
        <p className="hero-sub animate-fade-in-up delay-2">
          Productos reales · Precios locales · Entrega rápida
        </p>

        {/* Pills */}
        <div className="hero-pills animate-fade-in-up delay-3">
          <div className="hero-pill"><MapPin size={14} /><span>Región 96</span></div>
          <div className="hero-pill"><Truck size={14} /><span>Entrega desde $50</span></div>
          <div className="hero-pill"><Star size={14} /><span>Cientos de productos</span></div>
          <div className="hero-pill hero-pill-trust">🛡️<span>Pago Seguro</span></div>
        </div>
      </div>

      <style>{`
        /* ── Shell ── */
        .hero {
          position: relative;
          padding: 72px 0 60px;
          overflow: hidden;
          text-align: center;
          min-height: 500px;
          background: var(--bg);
        }

        /* ── Blobs ── */
        .hero-blob { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
        .blob-1 { width: 540px; height: 540px; background: rgba(255,208,0,0.30); top: -180px; right: -120px; }
        .blob-2 { width: 360px; height: 360px; background: rgba(26,122,109,0.10); bottom: -120px; left: -80px; }
        .blob-3 { width: 300px; height: 300px; background: rgba(232,75,9,0.06); top: 50%; left: 50%; transform: translate(-50%,-50%); }

        /* ── Float keyframes ── */
        @keyframes heroFloat {
          0%   { transform: translateY(0px)   rotate(var(--rotate, 0deg)); }
          100% { transform: translateY(-11px) rotate(var(--rotate, 0deg)); }
        }

        /* ── Base sticker ── */
        .hero-sticker {
          position: absolute;
          top: var(--top); left: var(--left); right: var(--right);
          z-index: 2;
          user-select: none;
          pointer-events: none;
          line-height: 1;
          display: flex; align-items: center; justify-content: center;
          animation: heroFloat var(--dur, 3.8s) ease-in-out infinite alternate;
          will-change: transform;
        }

        /* White card sticker */
        .hero-sticker-card {
          background: #fff;
          border-radius: 14px;
          padding: 10px 12px;
          box-shadow:
            0 4px 18px rgba(0,0,0,0.14),
            0 1px 3px rgba(0,0,0,0.08),
            inset 0 1px 0 rgba(255,255,255,0.9);
          border: 1.5px solid rgba(240,230,176,0.6);
        }

        /* Colored circle sticker */
        .hero-sticker-circle {
          width: 56px; height: 56px;
          border-radius: 50%;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          border: 3px solid rgba(255,255,255,0.35);
        }

        /* ── Badge stickers ── */
        .hero-badge {
          position: absolute; z-index: 3;
          top: var(--top); left: var(--left); right: var(--right);
          font-family: var(--font-display);
          font-weight: 900; color: #fff;
          font-size: 0.72rem; letter-spacing: 0.06em;
          pointer-events: none; user-select: none;
          display: flex; align-items: center; justify-content: center;
          text-align: center;
          animation: heroFloat 3.6s ease-in-out infinite alternate;
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
        }

        /* Oval badge (SALE, NUEVO) */
        .hero-badge-oval {
          border-radius: 999px;
          padding: 7px 16px;
          transform: rotate(var(--rotate, 0deg));
        }

        /* Starburst badge (20% OFF) — layered circles for star feel */
        .hero-badge-starburst {
          width: 58px; height: 58px;
          border-radius: 50%;
          font-size: 0.62rem; line-height: 1.25;
          transform: rotate(var(--rotate, 0deg));
          /* Fake starburst with box-shadow points */
          box-shadow:
            0 0 0 6px rgba(232,75,9,0.3),
            0 0 0 11px rgba(232,75,9,0.12),
            0 4px 16px rgba(232,75,9,0.35);
        }

        /* ── Dashes ── */
        .hero-dash {
          position: absolute; z-index: 1;
          top: var(--top); left: var(--left); right: var(--right);
          border-radius: 999px;
          pointer-events: none; opacity: 0.8;
          animation: heroFloat 4.2s ease-in-out infinite alternate;
        }

        /* ── Content ── */
        .hero-content {
          position: relative; z-index: 4;
          display: flex; flex-direction: column;
          align-items: center; gap: 20px;
        }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--yellow); color: var(--black);
          padding: 7px 20px; border-radius: var(--radius-full);
          font-family: var(--font-display); font-weight: 700; font-size: 0.87rem;
          box-shadow: 0 2px 14px rgba(255,208,0,0.45);
          letter-spacing: 0.01em;
        }
        .hero-title {
          font-size: clamp(2.2rem, 6vw, 3.8rem);
          line-height: 1.13; max-width: 700px;
        }
        .title-teal   { color: var(--teal); }
        .title-orange { color: var(--orange); }
        .title-sub {
          color: var(--text-secondary); font-size: 0.62em;
          font-weight: 700; letter-spacing: 0.07em;
        }
        .hero-sub {
          font-size: 1.05rem; color: var(--text-secondary);
          font-weight: 500; max-width: 440px;
        }

        /* ── Pills ── */
        .hero-pills { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .hero-pill {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(255,255,255,0.88);
          border: 1.5px solid var(--border);
          border-radius: var(--radius-full); padding: 7px 16px;
          font-size: 0.83rem; font-weight: 600; color: var(--text-secondary);
          box-shadow: 0 2px 8px rgba(26,18,8,0.07);
        }
        .hero-pill svg { color: var(--teal); flex-shrink: 0; }
        .hero-pill-trust { font-weight: 700; }

        /* ── Mobile ── */
        @media (max-width: 640px) {
          .hero { padding: 48px 0 44px; min-height: auto; }
          .hero-title { font-size: 2.1rem; }
          .hero-sub   { font-size: 0.95rem; }
          
          /* Cluster everything closer and scale it down */
          .hero-sticker, .hero-badge, .hero-dash {
            top: var(--m-top, var(--top)) !important;
            left: var(--m-left, var(--left)) !important;
            right: var(--m-right, var(--right)) !important;
            transform-origin: center;
            transform: scale(0.65) rotate(var(--rotate, 0deg)) !important;
            animation: none !important; /* Disable float on mobile to avoid transform override issues */
          }
        }
      `}</style>
    </section>
  );
}
