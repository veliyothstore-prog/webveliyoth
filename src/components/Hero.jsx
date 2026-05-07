import React from 'react';
import { useStore } from '../context/StoreContext';

const Hero = () => {
  const { data } = useStore();

  return (
    <section style={{ background: 'var(--bg-dark)', padding: '4rem 0', color: 'white', marginBottom: '3rem' }}>
      <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '4rem', alignItems: 'center' }}>
        <div style={{ zIndex: 2 }}>
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.5rem' }}>
            Tecnología y Seguridad al <span style={{ color: 'var(--primary)' }}>Mejor Precio</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: '#aaa', marginBottom: '2.5rem', maxWidth: '500px' }}>
            Laptops de las mejores marcas y kits de cámaras de seguridad para tu hogar o negocio.
          </p>
          <div className="hero-actions">
            <button 
              onClick={() => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' })}
              className="btn-primary" 
              style={{ color: '#000' }}
            >
              VER CATÁLOGO
            </button>
            <button 
              onClick={() => window.open('https://wa.me/51936424026', '_blank')}
              className="btn-outline hero-btn-outline" 
            >
              <span>💬</span> Cotizar por WhatsApp
            </button>
          </div>

          <style>{`
            .hero-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
            .hero-btn-outline { 
              color: white !important; 
              border-color: #444 !important; 
              padding: 1rem 2rem; 
              display: flex; 
              align-items: center; 
              gap: 0.8rem; 
              background: transparent;
              font-weight: 700;
              border-radius: var(--radius);
              cursor: pointer;
            }
            .btn-primary { 
              padding: 1rem 2rem; 
              border: none; 
              cursor: pointer; 
              color: #000 !important; 
              font-weight: 700;
            }
            .btn-primary:active { color: #000 !important; }
            
            @media (max-width: 600px) {
              .hero-actions { flex-direction: column; }
              .hero-actions button { width: 100%; justify-content: center; }
            }
          `}</style>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%',
            height: '120%',
            background: 'radial-gradient(circle, rgba(255,222,0,0.1) 0%, rgba(0,0,0,0) 70%)',
            zIndex: -1
          }}></div>
          <img 
            src={data.heroImage} 
            alt="Featured Product" 
            style={{ width: '100%', height: 'auto', borderRadius: '12px' }} 
          />
        </div>
      </div>
    </section>
  );
};

export default Hero;
