"use client";

import React, { useState, useEffect } from 'react';
import HeroSection from '../src/components/HeroSection';
import CategoryFilter from '../src/components/CategoryFilter';
import ProductGrid from '../src/components/ProductGrid';
import { getPublicProducts } from '../src/data/store';
import { useRouter } from 'next/navigation';

export default function CatalogPage() {
  const [products, setProducts]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      setProducts(await getPublicProducts());
      setIsLoading(false);
    }
    load();
  }, []);

  // Re-load on visibility (when admin makes changes), with 30s cooldown
  useEffect(() => {
    let lastFetch = Date.now();
    async function onVisible() {
      if (document.visibilityState === 'visible') {
        const now = Date.now();
        if (now - lastFetch > 30000) {
          // Don't show skeleton on background refresh to avoid flashing
          setProducts(await getPublicProducts());
          lastFetch = now;
        }
      }
    }
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

  const filtered = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <>
      <HeroSection />
      <CategoryFilter active={activeCategory} onChange={setActiveCategory} />

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {!isLoading && (
          <>
            <div className="catalog-meta">
              <span className="catalog-count">
                {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
                {activeCategory !== 'all' ? ' en esta categoría' : ' en total'}
              </span>
              <span className="catalog-hint">Toca cualquier producto para ver detalles 👆</span>
            </div>

            <ProductGrid products={filtered} onProductClick={(p) => router.push('/p/' + (p.slug || p.id))} />
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="catalog-footer">
        <div className="container" style={{ textAlign:'center', paddingTop: 32, paddingLeft: 20, paddingRight: 20, paddingBottom: 'calc(32px + env(safe-area-inset-bottom))' }}>
          <img 
            src={'/Logo.png'}
            alt="Bazarito Cancún" 
            style={{ height: 50, display: 'block', margin: '0 auto 12px auto' }} 
          />
          <p style={{ fontSize:'0.85rem', color:'var(--text-secondary)', fontWeight: 600, marginBottom: 4 }}>
            Productos reales · Entregas seguras · Región 96, Cancún, México
          </p>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
            © 2026 Bazarito Cancun. Todos los derechos reservados
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
      </footer>


      <style>{`
        .catalog-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 20px;
        }
        .catalog-count {
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text-secondary);
          font-size: 0.9rem;
        }
        .catalog-hint {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .catalog-footer {
          background: var(--bg-muted);
          border-top: 1.5px solid var(--border);
        }
      `}</style>
    </>
  );
}
