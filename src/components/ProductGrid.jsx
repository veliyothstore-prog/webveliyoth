import React, { useMemo } from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  const { data, activeCategory, filters } = useStore();
  const [sortBy, setSortBy] = React.useState('recommended');

  const filteredProducts = useMemo(() => {
    let result = data.products.filter(product => {
      // 1. Filtro de Búsqueda (Search) - Case Insensitive
      if (filters.search) {
        const searchLower = filters.search.toLowerCase().trim();
        const matchesSearch = 
          (product.title || '').toLowerCase().includes(searchLower) ||
          (product.brand || '').toLowerCase().includes(searchLower) ||
          (() => {
            if (!product.details) return false;
            if (typeof product.details === 'object') return (product.details.description || '').toLowerCase().includes(searchLower);
            return product.details.toString().toLowerCase().includes(searchLower);
          })();
        
        if (!matchesSearch) return false;
      }

      // 2. Filtro de Categoría (ID exacto)
      if (activeCategory !== 'all' && product.category !== activeCategory) return false;

      // 3. Filtro de Precio
      const minP = parseFloat(filters.minPrice) || 0;
      const maxP = parseFloat(filters.maxPrice) || 100000;
      if (product.price < minP || product.price > maxP) return false;

      // 4. Filtro de Marca (EL PROBLEMA ESTABA AQUÍ - Case Insensitive)
      if (filters.brand && filters.brand !== 'all') {
        if ((product.brand || '').toLowerCase() !== filters.brand.toLowerCase()) return false;
      }

      // 5. Filtros específicos (Gama para laptops, Tipo para cámaras)
      if (product.category === 'laptops' && filters.range && filters.range !== 'all') {
        if ((product.range || '').toLowerCase() !== filters.range.toLowerCase()) return false;
      }

      if (product.category === 'cameras' && filters.type && filters.type !== 'all') {
        if ((product.type || '').toLowerCase() !== filters.type.toLowerCase()) return false;
      }

      return true;
    });

    // Ordenamiento
    if (sortBy === 'price-asc') result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'stock') result.sort((a, b) => (b.stock || 0) - (a.stock || 0));

    return result;
  }, [data.products, activeCategory, filters, sortBy]);

  return (
    <div className="product-grid-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '0.2rem', color: '#1e293b' }}>
            {activeCategory === 'all' 
              ? 'Todos los Productos' 
              : data.categories.find(c => c.id === activeCategory)?.name || 'Productos'}
          </h2>
          <span style={{ color: '#64748b', fontSize: '0.85rem', fontWeight: 600 }}>{filteredProducts.length} productos encontrados</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#888', textTransform: 'uppercase' }}>Ordenar por:</span>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ 
              padding: '0.6rem 1rem', 
              borderRadius: '8px', 
              border: '1px solid #eee', 
              background: 'white',
              fontSize: '0.85rem',
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="recommended">Recomendados</option>
            <option value="price-asc">Menor Precio</option>
            <option value="price-desc">Mayor Precio</option>
            <option value="stock">Más Stock</option>
          </select>
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="products-grid fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '2.5rem' }}>
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '20px', border: '2px dashed #e2e8f0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
          <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.5rem' }}>No encontramos productos</h3>
          <p style={{ color: '#64748b' }}>Intenta ajustar los filtros o la búsqueda para encontrar lo que necesitas.</p>
          <button 
            onClick={() => { window.location.reload(); }}
            style={{ marginTop: '1.5rem', padding: '0.8rem 1.5rem', background: 'var(--primary)', border: 'none', borderRadius: '10px', fontWeight: 800, cursor: 'pointer' }}
          >
            LIMPIAR FILTROS
          </button>
        </div>
      )}

      <style>{`
        @media (max-width: 1300px) {
          .products-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 700px) {
          .products-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
};

export default ProductGrid;
