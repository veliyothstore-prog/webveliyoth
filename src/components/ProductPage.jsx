import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';
import Header from './Header';
import Footer from './Footer';

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, addToCart } = useStore();
  const [quantity, setQuantity] = React.useState(1);
  const [currentImage, setCurrentImage] = React.useState(null);

  const product = data.products.find(p => p.id.toString() === id.toString());
  const productGallery = data.gallery?.filter(img => img.product_id === product?.id) || [];

  React.useEffect(() => {
    if (product) {
      setCurrentImage(product.image);
      window.scrollTo(0, 0);
    }
  }, [product]);

  if (!product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
        <h2>Producto no encontrado</h2>
        <button onClick={() => navigate('/')} className="btn-primary">Volver al catálogo</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      <Header />
      
      <main className="container" style={{ padding: '2rem 1rem 5rem 1rem' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'none', 
            border: 'none', 
            color: '#64748b', 
            fontSize: '0.9rem', 
            fontWeight: 600, 
            cursor: 'pointer',
            marginBottom: '2rem'
          }}
        >
          ← Volver al catálogo
        </button>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '3rem',
          alignItems: 'start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ 
              background: '#fcfcfc', 
              borderRadius: '20px', 
              padding: '2rem', 
              border: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '400px'
            }}>
              <img 
                src={currentImage || product.image} 
                alt={product.title} 
                style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }} 
              />
            </div>

            {productGallery.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                <div 
                  onClick={() => setCurrentImage(product.image)}
                  style={{ width: '80px', height: '80px', borderRadius: '12px', border: currentImage === product.image ? '3px solid var(--primary)' : '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', background: 'white', padding: '4px' }}
                >
                  <img src={product.image} alt="principal" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                {productGallery.map(img => (
                  <div 
                    key={img.id}
                    onClick={() => setCurrentImage(img.image_url)}
                    style={{ width: '80px', height: '80px', borderRadius: '12px', border: currentImage === img.image_url ? '3px solid var(--primary)' : '1px solid #e2e8f0', overflow: 'hidden', cursor: 'pointer', background: 'white', padding: '4px' }}
                  >
                    <img src={img.image_url} alt="galeria" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase' }}>{product.brand}</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem', lineHeight: 1.2 }}>{product.title}</h1>
              <p style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 700 }}>CÓDIGO: {product.id}</p>
            </div>

            <div style={{ fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)' }}>
              S/ {Math.round(product.price).toLocaleString()}
            </div>

            <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <span style={{ fontWeight: 800, color: '#475569' }}>CANTIDAD</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <button onClick={() => setQuantity(q => Math.max(1, q - 1))} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 900 }}>-</button>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900 }}>{quantity}</span>
                  <button onClick={() => setQuantity(q => q + 1)} style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 900 }}>+</button>
                </div>
              </div>

              <button 
                onClick={() => {
                  addToCart(product, quantity);
                  toast.success('¡AÑADIDO AL CARRITO!');
                }}
                style={{ width: '100%', padding: '1.2rem', background: 'var(--primary)', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '1rem', cursor: 'pointer' }}
              >
                AÑADIR AL CARRITO
              </button>
            </div>

            <div style={{ padding: '1rem 0' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1rem' }}>Descripción</h3>
              <div style={{ color: '#475569', lineHeight: 1.8, fontSize: '1rem', whiteSpace: 'pre-line' }}>
                {typeof product.details === 'object' ? product.details.description : product.details}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
