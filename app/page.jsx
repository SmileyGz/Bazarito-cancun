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
