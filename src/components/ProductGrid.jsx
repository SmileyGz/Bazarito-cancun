import React from 'react';
import ProductCard from './ProductCard';
import { Package, PackageX } from 'lucide-react';

export default function ProductGrid({ products, onProductClick }) {
  if (products.length === 0) {
    return (
      <div className="grid-empty">
        <PackageX size={48} className="empty-icon" />
        <h3>No hay productos aquí</h3>
        <p>Prueba otra categoría o vuelve pronto 👀</p>
      </div>
    );
  }

  return (
    <>
      <div className="pgrid">
        {products.map((p, i) => (
          <div
            key={p.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${Math.min(i * 50, 400)}ms` }}
          >
            <ProductCard product={p} onClick={onProductClick} />
          </div>
        ))}
      </div>

      <style>{`
        .pgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
        }
        .pcard-skeleton {
          pointer-events: none;
        }
        .pcard-skeleton .pcard-img {
          height: 200px;
        }
        .grid-empty {
          text-align: center;
          padding: 80px 20px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .empty-icon {
          width: 80px; height: 80px;
          background: var(--bg-muted);
          border-radius: var(--radius-lg);
          display: flex; align-items: center; justify-content: center;
          color: var(--text-muted);
        }
        .grid-empty h3 {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }
        .grid-empty p { font-size: 0.9rem; }
        @media (max-width: 480px) {
          .pgrid { 
            grid-template-columns: repeat(2, minmax(0, 1fr)); 
            gap: 12px; 
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
