import React from 'react';
import { useStore } from '../context/StoreContext';

const CategorySidebar = () => {
  const { data, activeCategory, setActiveCategory, filters, setFilters } = useStore();

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getBrands = () => {
    const activeProducts = activeCategory === 'all' 
      ? data.products 
      : data.products.filter(p => p.category === activeCategory);
    const availableBrandNames = [...new Set(activeProducts.map(p => p.brand))];
    return availableBrandNames.sort();
  };

  return (
    <aside className="sidebar-container">
      <h3 className="sidebar-title">Explorar</h3>
      <div className="category-list">
        <button 
          onClick={() => setActiveCategory('all')}
          className={`category-btn ${activeCategory === 'all' ? 'active' : ''}`}
        >
          Todos
        </button>
        {data.categories.map(cat => (
          <button 
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="filter-box">
        <h4 style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>Filtrar</h4>
        
        <div style={{ marginBottom: '1rem' }}>
          <input 
            type="text" 
            placeholder="Buscar..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: '0.8rem' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <select 
            value={filters.brand} 
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            style={{ width: '100%', padding: '0.6rem', border: '1px solid var(--border)', background: '#fff', fontSize: '0.8rem' }}
          >
            <option value="all">Marca: Todas</option>
            {getBrands().map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, marginBottom: '0.3rem', color: '#999' }}>MAX: S/ {filters.maxPrice}</label>
          <input 
            type="range" min="0" max="10000" step="100"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      <div className="support-card">
        <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem', fontSize: '0.8rem' }}>Atención</h4>
        <button 
           onClick={() => window.open('https://wa.me/51936424026', '_blank')}
           style={{ width: '100%', padding: '0.5rem', background: 'var(--primary)', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: '0.8rem' }}
        >
           WhatsApp
        </button>
      </div>

      <style>{`
        .sidebar-container { 
          position: sticky; 
          top: 100px; 
          max-width: 100%;
        }
        .sidebar-title { fontSize: 0.75rem; fontWeight: 800; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.2rem; color: #888; }
        .category-list { 
          display: flex; 
          flex-direction: column; 
          gap: 0.4rem; 
          margin-bottom: 2.5rem; 
          max-width: 100%;
        }
        .category-btn {
          text-align: left; padding: 0.8rem 1.2rem;
          background: #eee; color: var(--text-main);
          border: none; border-radius: var(--radius);
          font-weight: 600; font-size: 0.85rem;
          cursor: pointer; transition: var(--transition);
          white-space: nowrap;
          min-width: fit-content;
          text-transform: uppercase;
        }
        .category-btn.active { 
          background: var(--primary) !important; 
          color: #000 !important; 
          font-weight: 800; 
        }
        
        @media (max-width: 1100px) {
          .sidebar-container { 
            position: relative; 
            top: 0; 
            margin-bottom: 2rem; 
            width: 100%;
            overflow: hidden;
          }
          .sidebar-title { display: none; }
          .category-list { 
            flex-direction: row; 
            overflow-x: auto; 
            padding-bottom: 1rem; 
            margin-bottom: 1.5rem;
            scrollbar-width: none;
            gap: 0.6rem;
            width: 100%;
          }
          .category-list::-webkit-scrollbar { display: none; }
          .category-btn { 
            padding: 0.8rem 1rem; 
            font-size: 0.75rem; 
            background: #eee; 
            flex: 0 0 auto;
            min-width: 120px;
            text-align: center;
          }
          .filter-box { 
            display: grid; 
            grid-template-columns: 1fr; 
            gap: 1rem; 
            align-items: end; 
            background: #fff; 
            padding: 1.2rem; 
            border: 1px solid var(--border);
            border-radius: var(--radius);
            width: 100% !important;
            box-sizing: border-box;
          }
          .filter-box input, .filter-box select {
            width: 100% !important;
            box-sizing: border-box !important;
          }
          .filter-box > div { margin-bottom: 0 !important; width: 100%; }
          .support-card { display: none; }
        }

        @media (max-width: 600px) {
          .filter-box { grid-template-columns: 1fr; }
        }
      `}</style>
    </aside>
  );
};

export default CategorySidebar;
