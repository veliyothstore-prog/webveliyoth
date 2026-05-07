import React from 'react';
import { useStore } from '../context/StoreContext';

const Header = () => {
  const { setActiveCategory } = useStore();

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 1000 }}>
      {/* Top Bar with Logo */}
      <div style={{ background: 'var(--bg-dark)', borderBottom: '1px solid #333' }}>
        <div className="container flex justify-between items-center" style={{ height: '80px' }}>
          <div 
            onClick={() => setActiveCategory('all')}
            style={{ 
              background: 'var(--primary)', 
              height: '100%', 
              padding: '0 2rem', 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer',
              color: 'black',
              clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
            }}
          >
            <img src="/logo.png" alt="VeliYoth Store" style={{ height: '50px', objectFit: 'contain' }} />
          </div>

          <div 
            onClick={() => window.open('https://wa.me/51936424026', '_blank')}
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.8rem', 
              background: 'var(--primary)', 
              color: 'black', 
              padding: '0.6rem 1.2rem', 
              borderRadius: '50px',
              fontWeight: 800,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(255, 222, 0, 0.3)'
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>📞</span> 936424026
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
