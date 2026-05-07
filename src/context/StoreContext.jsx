import React, { createContext, useContext, useState, useEffect } from 'react';
import dbData from '../data/db.json';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem('veliyoth_db');
    let initialData = saved ? JSON.parse(saved) : dbData;
    
    // Force update if version is different or missing
    if (!initialData.version || initialData.version !== dbData.version) {
      console.log('Nueva versión detectada. Actualizando base de datos...');
      initialData = { ...dbData };
    }
    
    // Ensure brands exists
    if (!initialData.brands) {
      initialData.brands = [
        { id: 'hikvision', name: 'HIKVISION' },
        { id: 'dahua', name: 'DAHUA' },
        { id: 'ezviz', name: 'EZVIZ' },
        { id: 'lenovo', name: 'LENOVO' },
        { id: 'hp', name: 'HP' },
        { id: 'epson', name: 'EPSON' }
      ];
    }
    
    // Ensure password exists
    if (!initialData.adminPassword) {
      initialData.adminPassword = 'adminveliyoth';
    }

    // Ensure hero image exists
    if (!initialData.heroImage) {
      initialData.heroImage = '/hero.png';
    }

    return initialData;
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    brand: 'all',
    range: 'all',
    type: 'all',
    minPrice: 0,
    maxPrice: 10000
  });

  useEffect(() => {
    localStorage.setItem('veliyoth_db', JSON.stringify(data));
  }, [data]);

  const updateProduct = (productId, updates) => {
    setData(prev => ({
      ...prev,
      products: prev.products.map(p => p.id === productId ? { ...p, ...updates } : p)
    }));
  };

  const updateProductPrice = (productId, newPrice) => {
    updateProduct(productId, { price: newPrice });
  };

  const addCategory = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setData(prev => ({
      ...prev,
      categories: [...prev.categories, { id, name }]
    }));
  };

  const addProduct = (product) => {
    setData(prev => ({
      ...prev,
      products: [...prev.products, { ...product, id: Date.now().toString() }]
    }));
  };

  const deleteProduct = (productId) => {
    setData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
  };

  const updateCategory = (catId, newName) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.map(c => c.id === catId ? { ...c, name: newName } : c)
    }));
  };

  const deleteCategory = (catId) => {
    setData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c.id !== catId)
    }));
  };

  const updatePromotion = (promoId, updates) => {
    setData(prev => ({
      ...prev,
      promotions: prev.promotions.map(p => p.id === promoId ? { ...p, ...updates } : p)
    }));
  };

  const addBrand = (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    setData(prev => ({
      ...prev,
      brands: [...prev.brands, { id, name }]
    }));
  };

  const updateBrand = (brandId, newName) => {
    setData(prev => ({
      ...prev,
      brands: prev.brands.map(b => b.id === brandId ? { ...b, name: newName } : b)
    }));
  };

  const deleteBrand = (brandId) => {
    setData(prev => ({
      ...prev,
      brands: prev.brands.filter(b => b.id !== brandId)
    }));
  };

  const updateAdminPassword = (newPassword) => {
    setData(prev => ({
      ...prev,
      adminPassword: newPassword
    }));
  };

  const updateHeroImage = (newImage) => {
    setData(prev => ({
      ...prev,
      heroImage: newImage
    }));
  };

  return (
    <StoreContext.Provider value={{ 
      data, 
      setData,
      activeCategory, 
      setActiveCategory, 
      filters, 
      setFilters,
      selectedProduct,
      setSelectedProduct,
      isAdminOpen,
      setIsAdminOpen,
      isAuthenticated,
      setIsAuthenticated,
      updateProduct,
      updateProductPrice,
      addCategory,
      updateCategory,
      deleteCategory,
      addBrand,
      updateBrand,
      deleteBrand,
      addProduct,
      deleteProduct,
      updatePromotion,
      updateAdminPassword,
      updateHeroImage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);
