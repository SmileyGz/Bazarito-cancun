import React, { useState, useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import CategoryFilter from '../components/CategoryFilter';
import ProductGrid from '../components/ProductGrid';
import ProductModal from '../components/ProductModal';
import { getProducts } from '../data/store';

export default function CatalogPage() {
  const [products, setProducts]     = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    async function load() {
      setProducts(await getProducts());
    }
    load();
  }, []);

  // Re-load on visibility (when admin makes changes)
  useEffect(() => {
    async function onVisible() {
      if (document.visibilityState === 'visible') {
        setProducts(await getProducts());
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
        {/* Counts */}
        <div className="catalog-meta">
          <span className="catalog-count">
            {filtered.length} producto{filtered.length !== 1 ? 's' : ''}
            {activeCategory !== 'all' ? ' en esta categoría' : ' en total'}
          </span>
          <span className="catalog-hint">Toca cualquier producto para ver detalles 👆</span>
        </div>

        <ProductGrid products={filtered} onProductClick={setSelectedProduct} />
      </main>

      {/* Footer */}
      <footer className="catalog-footer">
        <div className="container" style={{ textAlign:'center', padding:'24px 20px' }}>
          <div style={{ fontSize:'1.5rem', marginBottom:4 }}>☀️🌴</div>
          <p style={{ fontFamily:'var(--font-display)', fontWeight:700, color:'var(--teal)', fontSize:'1rem' }}>
            Bazarito Cancún
          </p>
          <p style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginTop:4 }}>
            Productos reales · Precios locales · Entregas seguras · Región 96, Cancún
          </p>
        </div>
      </footer>

      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

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
