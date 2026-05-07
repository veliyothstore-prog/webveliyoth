import React from 'react';
import { useStore } from '../context/StoreContext';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  const { data, activeCategory, filters } = useStore();

  const filteredProducts = data.products.filter(product => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        product.title?.toLowerCase().includes(searchLower) ||
        product.brand?.toLowerCase().includes(searchLower) ||
        product.details?.description?.toLowerCase().includes(searchLower);
      
      if (!matchesSearch) return false;
    }

    // Category filter
    if (activeCategory !== 'all' && product.category !== activeCategory) return false;

    // Price filter
    if (product.price < filters.minPrice || product.price > filters.maxPrice) return false;

    // Specific filters for laptops
    if (product.category === 'laptops') {
      if (filters.brand !== 'all' && product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.range !== 'all' && product.range.toLowerCase() !== filters.range.toLowerCase()) return false;
    }

    // Specific filters for cameras
    if (product.category === 'cameras') {
      if (filters.brand !== 'all' && product.brand.toLowerCase() !== filters.brand.toLowerCase()) return false;
      if (filters.type !== 'all' && product.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    }

    return true;
  });

  return (
    <div className="product-grid-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900 }}>
          {activeCategory === 'all' 
            ? 'Todos los Productos' 
            : data.categories.find(c => c.id === activeCategory)?.name || 'Productos'}
        </h2>
        <span style={{ color: 'var(--text-muted)' }}>{filteredProducts.length} productos encontrados</span>
      </div>

      <div 
        key={`${activeCategory}-${filteredProducts.length}`}
        className="products-grid fade-in" 
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '2rem'
        }}
      >
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      <style>{`
        @media (max-width: 1300px) {
          .products-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 700px) {
          .products-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
          <p>No se encontraron productos que coincidan con los filtros.</p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
