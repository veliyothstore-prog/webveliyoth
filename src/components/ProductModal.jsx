import React from 'react';
import { useStore } from '../context/StoreContext';

const ProductModal = () => {
  const { selectedProduct, setSelectedProduct } = useStore();

  if (!selectedProduct) return null;

  const handleQuote = () => {
    const message = `Hola VeliYoth Store, deseo cotizar el producto: ${selectedProduct.brand} ${selectedProduct.title || ''}`;
    const url = `https://wa.me/51936424026?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <div 
      onClick={() => setSelectedProduct(null)}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.6)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          background: 'white',
          width: '100%',
          maxWidth: '850px',
          borderRadius: 'var(--radius)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
        }}
      >
        <button 
          onClick={() => setSelectedProduct(null)}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            background: 'none',
            border: 'none',
            fontSize: '1.5rem',
            fontWeight: 300,
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          ×
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          <div style={{ padding: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fcfcfc' }}>
            <img 
              src={selectedProduct.image} 
              alt={selectedProduct.title} 
              style={{ maxWidth: '100%', maxHeight: '350px', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '1.2rem', lineHeight: '1.3' }}>{selectedProduct.title}</h2>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                <tbody>
                  {Object.entries(selectedProduct.details).map(([key, value]) => (
                    <tr key={key} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: 700, textTransform: 'capitalize', width: '100px', color: '#333' }}>{key}:</td>
                      <td style={{ padding: '0.5rem 0', color: '#666' }}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: 'var(--text-main)' }}>
                S/ {Math.round(selectedProduct.price).toLocaleString()}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                <button onClick={() => setSelectedProduct(null)} className="btn-secondary" style={{ padding: '0.7rem', fontSize: '0.85rem' }}>Cerrar</button>
                <button onClick={handleQuote} className="btn-primary" style={{ padding: '0.7rem', fontSize: '0.85rem', lineHeight: '1.2' }}>COTIZAR POR WHATSAPP</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;
