import React from 'react';
import { useStore } from '../context/StoreContext';

const ProductCard = ({ product }) => {
  const { setSelectedProduct } = useStore();

  const handleQuote = () => {
    const message = `Hola VeliYoth Store, deseo cotizar el producto: ${product.brand} ${product.title || ''}`;
    const url = `https://wa.me/51936424026?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '1.5rem',
      display: 'flex',
      flexDirection: 'column',
      transition: 'var(--transition)',
      position: 'relative'
    }}>
      <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
        <img 
          src={product.image} 
          alt={product.title} 
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} 
        />
      </div>

      <div style={{ flex: 1 }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#999', textTransform: 'uppercase' }}>{product.brand}</span>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: '0.5rem 0', minHeight: '3rem' }}>{product.title}</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '1.4rem', fontWeight: 900 }}>S/ {Math.round(product.price).toLocaleString()}</span>
        </div>

        <div className="product-actions" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button 
            onClick={() => setSelectedProduct(product)}
            className="btn-outline"
            style={{ padding: '0.6rem 1.2rem', fontSize: '0.8rem', flex: 1 }}
          >
            Detalles
          </button>
          <button 
            onClick={handleQuote}
            className="btn-primary"
            style={{ padding: '0.6rem', fontSize: '0.8rem', borderRadius: '4px' }}
          >
            Cotizar
          </button>
        </div>
      </div>

      <style>{`
        div:hover {
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        @media (max-width: 600px) {
          .product-actions {
            grid-template-columns: 1fr !important;
            gap: 0.8rem !important;
          }
          .product-actions button {
            padding: 1rem !important;
            font-size: 0.9rem !important;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductCard;
