import React from 'react';
import { useStore } from '../context/StoreContext';

const Filters = () => {
  const { data, activeCategory, filters, setFilters } = useStore();

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getBrands = () => {
    // Get brands that have products in the current category
    const activeProducts = activeCategory === 'all' 
      ? data.products 
      : data.products.filter(p => p.category === activeCategory);
    
    const availableBrandNames = [...new Set(activeProducts.map(p => p.brand))];
    
    // Return names from global brands list that are available in current inventory
    return availableBrandNames.sort();
  };

  return (
    <div style={{ background: '#fff', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)', marginBottom: '2rem' }}>
      
      <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase' }}>Buscar</h3>
        <input 
          type="text" 
          placeholder="¿Qué estás buscando?"
          value={filters.search}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', borderRadius: 'var(--radius)' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
        <div className="filter-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>MARCA</label>
          <select 
            value={filters.brand} 
            onChange={(e) => handleFilterChange('brand', e.target.value)}
            style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', background: '#fff' }}
          >
            <option value="all">Todas</option>
            {getBrands().map(brand => (
              <option key={brand} value={brand}>{brand}</option>
            ))}
          </select>
        </div>

        {activeCategory === 'laptops' && (
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>GAMA</label>
            <select 
              value={filters.range} 
              onChange={(e) => handleFilterChange('range', e.target.value)}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', background: '#fff' }}
            >
              <option value="all">Todas</option>
              <option value="economica">Económica</option>
              <option value="medio">Media</option>
              <option value="alta">Alta</option>
            </select>
          </div>
        )}

        {activeCategory === 'cameras' && (
          <div className="filter-group">
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>TIPO</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
              style={{ width: '100%', padding: '0.8rem', border: '1px solid var(--border)', background: '#fff' }}
            >
              <option value="all">Todos</option>
              <option value="wifi">WIFI</option>
              <option value="ip">IP</option>
              <option value="analoga">Análoga</option>
            </select>
          </div>
        )}

        <div className="filter-group">
          <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>PRECIO: S/ {filters.maxPrice}</label>
          <input 
            type="range" 
            min="0" 
            max="10000" 
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', parseInt(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--primary)' }}
          />
        </div>
      </div>
      
      <button 
        onClick={() => setFilters({ search: '', brand: 'all', range: 'all', type: 'all', minPrice: 0, maxPrice: 10000 })}
        style={{ marginTop: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }}
      >
        Limpiar Filtros
      </button>
    </div>
  );
};

export default Filters;
