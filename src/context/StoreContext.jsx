import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import dbData from '../data/db.json';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    brands: [],
    promotions: [],
    heroImage: '/hero.png',
    version: '1.5',
    adminPassword: 'adminveliyoth'
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

  // Cargar datos desde Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const [
          { data: products },
          { data: categories },
          { data: brands },
          { data: promotions },
          { data: config }
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('brands').select('*'),
          supabase.from('promotions').select('*'),
          supabase.from('config').select('*')
        ]);

        const storeConfig = config?.find(c => c.key === 'store_config')?.value || {};

        setData({
          products: products || [],
          categories: categories || [],
          brands: brands || [],
          promotions: promotions || [],
          heroImage: storeConfig.heroImage || '/hero.png',
          version: storeConfig.version || '1.5',
          adminPassword: storeConfig.adminPassword || 'adminveliyoth'
        });
      } catch (error) {
        console.error('Error cargando datos de Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  const uploadImage = async (file, folder = 'otros') => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('catalogo')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('catalogo')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      throw error;
    }
  };

  const updateProduct = async (productId, updates) => {
    const { error } = await supabase.from('products').update(updates).eq('id', productId);
    if (error) {
      alert('Error al actualizar producto: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        products: prev.products.map(p => p.id === productId ? { ...p, ...updates } : p)
      }));
    }
  };

  const addCategory = async (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').insert([{ id, name }]);
    if (error) {
      alert('Error al añadir categoría: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        categories: [...prev.categories, { id, name }]
      }));
    }
  };

  const addProduct = async (product) => {
    const { data: newProd, error } = await supabase.from('products').insert([product]).select();
    if (error) {
      alert('Error al añadir producto: ' + error.message);
    } else if (newProd) {
      setData(prev => ({
        ...prev,
        products: [...prev.products, newProd[0]]
      }));
    }
  };

  const deleteProduct = async (productId) => {
    const { error } = await supabase.from('products').delete().eq('id', productId);
    if (error) {
      alert('Error al eliminar: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== productId)
      }));
    }
  };

  const updateCategory = async (catId, newName) => {
    const { error } = await supabase.from('categories').update({ name: newName }).eq('id', catId);
    if (error) {
      alert('Error al editar categoría: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        categories: prev.categories.map(c => c.id === catId ? { ...c, name: newName } : c)
      }));
    }
  };

  const deleteCategory = async (catId) => {
    const { error } = await supabase.from('categories').delete().eq('id', catId);
    if (error) {
      alert('Error al borrar categoría: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        categories: prev.categories.filter(c => c.id !== catId)
      }));
    }
  };

  const updatePromotion = async (promoId, updates) => {
    const { error } = await supabase.from('promotions').update(updates).eq('id', promoId);
    if (error) {
      alert('Error al actualizar promoción: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        promotions: prev.promotions.map(p => p.id === promoId ? { ...p, ...updates } : p)
      }));
    }
  };

  const addBrand = async (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('brands').insert([{ id, name }]);
    if (error) {
      alert('Error al añadir marca: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        brands: [...prev.brands, { id, name }]
      }));
    }
  };

  const updateBrand = async (brandId, newName) => {
    const { error } = await supabase.from('brands').update({ name: newName }).eq('id', brandId);
    if (error) {
      alert('Error al editar marca: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        brands: prev.brands.map(b => b.id === brandId ? { ...b, name: newName } : b)
      }));
    }
  };

  const deleteBrand = async (brandId) => {
    const { error } = await supabase.from('brands').delete().eq('id', brandId);
    if (error) {
      alert('Error al borrar marca: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        brands: prev.brands.filter(b => b.id !== brandId)
      }));
    }
  };

  const updateAdminPassword = async (newPassword) => {
    const { error } = await supabase.from('config').update({ value: { heroImage: data.heroImage, adminPassword: newPassword, version: data.version } }).eq('key', 'store_config');
    if (error) {
      alert('Error al cambiar contraseña: ' + error.message);
    } else {
      setData(prev => ({ ...prev, adminPassword: newPassword }));
    }
  };

  const updateHeroImage = async (newImage) => {
    const { error } = await supabase.from('config').update({ value: { heroImage: newImage, adminPassword: data.adminPassword, version: data.version } }).eq('key', 'store_config');
    if (error) {
      alert('Error al cambiar imagen de portada: ' + error.message);
    } else {
      setData(prev => ({ ...prev, heroImage: newImage }));
    }
  };

  return (
    <StoreContext.Provider value={{ 
      data, 
      loading,
      uploadImage,
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

