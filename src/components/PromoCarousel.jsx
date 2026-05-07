import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';

const PromoCarousel = () => {
  const { data } = useStore();
  const activePromos = data.promotions.filter(p => p.active);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (activePromos.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % activePromos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [activePromos.length]);

  const handleQuote = (promo) => {
    const message = `Hola VeliYoth Store, deseo cotizar la promoción: ${promo.title}`;
    const url = `https://wa.me/51936424026?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  if (activePromos.length === 0) return null;

  return (
    <aside style={{ width: '100%', position: 'sticky', top: '100px' }}>
      <div style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        height: '550px',
        position: 'relative',
        boxShadow: 'var(--shadow)'
      }}>
        {activePromos.map((promo, index) => (
          <div 
            key={promo.id}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              opacity: index === current ? 1 : 0,
              transition: 'opacity 0.5s ease',
              display: 'flex',
              flexDirection: 'column',
              zIndex: index === current ? 1 : 0
            }}
          >
            <div style={{
              flex: 1,
              backgroundImage: `url(${promo.image})`,
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundOrigin: 'content-box',
              padding: '1rem',
              backgroundColor: '#fcfcfc'
            }}></div>
            
            {/* Dots inside slide but above content */}
            <div style={{
              display: 'flex',
              gap: '0.4rem',
              padding: '1rem 1.5rem 0.5rem'
            }}>
              {activePromos.map((_, i) => (
                <div 
                  key={i}
                  onClick={() => setCurrent(i)}
                  style={{
                    width: i === current ? '24px' : '8px',
                    height: '4px',
                    borderRadius: '2px',
                    background: i === current ? 'var(--primary)' : '#eee',
                    cursor: 'pointer',
                    transition: 'all 0.3s'
                  }}
                ></div>
              ))}
            </div>

            <div style={{ padding: '0.5rem 1.5rem 1.5rem', background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {promo.showDiscount && (
                  <span style={{ background: '#ff4d4d', color: 'white', padding: '0.2rem 0.5rem', fontSize: '0.7rem', fontWeight: 900 }}>10% OFF</span>
                )}
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 900, marginBottom: '1.2rem', color: 'var(--secondary)' }}>{promo.title}</h4>
              <button 
                className="btn-primary" 
                onClick={() => handleQuote(promo)}
                style={{ width: '100%', fontSize: '0.9rem', padding: '0.8rem' }}
              >
                COTIZAR
              </button>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default PromoCarousel;
