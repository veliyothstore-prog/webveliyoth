import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import dbData from '../data/db.json';
import toast from 'react-hot-toast';

const StoreContext = createContext();

export const StoreProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    products: [],
    categories: [],
    brands: [],
    promotions: [],
    heroImage: '/hero.png',
    version: '1.5'
  });

  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [quoteDetails, setQuoteDetails] = useState([]);
  const [admins, setAdmins] = useState([]);
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
          { data: config },
          { data: gallery }
        ] = await Promise.all([
          supabase.from('products').select('*'),
          supabase.from('categories').select('*'),
          supabase.from('brands').select('*'),
          supabase.from('promotions').select('*'),
          supabase.from('config').select('*'),
          supabase.from('product_gallery').select('*')
        ]);

        const storeConfig = config?.find(c => c.key === 'store_config')?.value || {};

        setData({
          products: products || [],
          categories: categories || [],
          brands: brands || [],
          promotions: promotions || [],
          gallery: gallery || [],
          heroImage: storeConfig.heroImage || '/hero.png',
          version: storeConfig.version || '1.5'
        });
      } catch (error) {
        console.error('Error cargando datos de Supabase:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    fetchOrders();
    fetchQuotes();
    fetchQuoteDetails();
    fetchAdmins();

    // Listener de Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      setIsAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) throw authError;

    // Verificar si el email está en la tabla de admins autorizados y está activo
    const { data: adminRecord, error: adminError } = await supabase
      .from('admins')
      .select('email, active')
      .eq('email', email)
      .single();

    if (adminError || !adminRecord) {
      await supabase.auth.signOut();
      throw new Error('Acceso Denegado: Tu correo no está autorizado como administrador.');
    }

    if (!adminRecord.active) {
      await supabase.auth.signOut();
      throw new Error('Acceso Suspendido: Tu cuenta ha sido desactivada por un administrador.');
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setIsAuthenticated(false);
    setIsAdminOpen(false);
  };

  const fetchOrders = async () => {
    const { data: ordersData, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error al cargar pedidos:', error);
    } else {
      setOrders(ordersData || []);
    }
  };

  const deleteOrder = async (id) => {
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) throw error;
    await fetchOrders();
  };

  const updateOrder = async (id, updates) => {
    const { error } = await supabase.from('pedidos').update(updates).eq('id', id);
    if (error) throw error;
    await fetchOrders();
  };

  const addOrder = async (orderData) => {
    const { error } = await supabase.from('pedidos').insert([{ 
      ...orderData, 
      contacted: true, // Automático al ser pedido
      status: 'Pendiente' 
    }]);
    if (error) {
      toast.error('Error al registrar pedido');
      throw error;
    }
    await fetchOrders();
  };

  const fetchQuotes = async () => {
    const { data: quotesData, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) console.error('Error al cargar cotizaciones:', error);
    else setQuotes(quotesData || []);
  };

  const fetchQuoteDetails = async () => {
    const { data, error } = await supabase.from('quotes').select('*');
    if (error) console.error('Error al cargar detalles de clientes:', error);
    else setQuoteDetails(data || []);
  };
  const saveQuoteDetails = async (details) => {
    try {
      console.log('Intentando guardar en quotes:', details);
      const { data: existing, error: findError } = await supabase
        .from('quotes')
        .select('id')
        .eq('reference', details.reference);
      
      if (findError) throw findError;

      if (existing && existing.length > 0) {
        const { error: updError } = await supabase
          .from('quotes')
          .update(details)
          .eq('id', existing[0].id);
        if (updError) throw updError;
      } else {
        const { error: insError } = await supabase
          .from('quotes')
          .insert([details]);
        if (insError) {
          console.error('ERROR COMPLETO SUPABASE:', insError);
          throw insError;
        }
      }
    } catch (err) {
      console.error('Error crítico en saveQuoteDetails:', err);
    }
  };

  const registerQuote = async (product, customerData = null) => {
    const year = new Date().getFullYear();
    const random = Math.floor(1000 + Math.random() * 9000);
    const reference = `VT-${year}-${random}`;

    return new Promise(async (resolve) => {
      const timer = setTimeout(() => {
        console.warn('Registro de cotización tardó demasiado. Usando modo offline.');
        resolve(`VT-OFF-${random}`);
      }, 2500);

      try {
        const { error } = await supabase.from('cotizaciones').insert([{
          product_id: String(product.id),
          product_title: product.title,
          brand: product.brand,
          price: product.price,
          reference,
          status: 'Enviado'
        }]);

        if (error) console.error('Error insertando cotización:', error.message);

        if (customerData) {
          await saveQuoteDetails({ 
            reference, 
            product_id: String(product.id),
            customer_name: customerData.customer_name,
            customer_phone: customerData.customer_phone,
            status: 'Enviado'
          });
        }

        clearTimeout(timer);
        await fetchQuotes();
        await fetchQuoteDetails();
        resolve(reference);
      } catch (err) {
        clearTimeout(timer);
        console.error('Error fatal en registro:', err);
        resolve(`VT-FAIL-${random}`);
      }
    });
  };

  const updateQuote = async (id, updates) => {
    const { error } = await supabase.from('cotizaciones').update(updates).eq('id', id);
    if (error) {
      toast.error('Error al actualizar cotización');
      throw error;
    }
    await fetchQuotes();
  };

  const deleteQuote = async (id) => {
    const { error } = await supabase.from('cotizaciones').delete().eq('id', id);
    if (error) {
      toast.error('Error al eliminar cotización');
      throw error;
    }
    await fetchQuotes();
    toast.success('Cotización eliminada');
  };

  const fetchAdmins = async () => {
    const { data, error } = await supabase.from('admins').select('*');
    if (error) console.error('Error fetching admins:', error);
    else setAdmins(data || []);
  };

  const addAdmin = async (email, active = true) => {
    const { error } = await supabase.from('admins').insert([{ email, active }]);
    if (error) throw error;
    await fetchAdmins();
  };

  const updateAdmin = async (id, updates) => {
    const { error } = await supabase.from('admins').update(updates).eq('id', id);
    if (error) throw error;
    await fetchAdmins();
  };

  const signUpAdmin = async (email, password, active = true) => {
    // 1. Crear usuario en Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({ 
      email, 
      password 
    });
    if (authError) throw authError;

    // 2. Añadir a nuestra lista de admins autorizados
    await addAdmin(email, active);
  };

  const deleteAdmin = async (id) => {
    const { error } = await supabase.from('admins').delete().eq('id', id);
    if (error) throw error;
    await fetchAdmins();
  };


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
      toast.error('Error al actualizar producto: ' + error.message);
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
      toast.error('Error al añadir categoría: ' + error.message);
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
      toast.error('Error al añadir producto: ' + error.message);
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
      toast.error('Error al eliminar: ' + error.message);
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
      toast.error('Error al editar categoría: ' + error.message);
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
      toast.error('Error al borrar categoría: ' + error.message);
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
      toast.error('Error al actualizar promoción: ' + error.message);
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
      toast.error('Error al añadir marca: ' + error.message);
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
      toast.error('Error al editar marca: ' + error.message);
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
      toast.error('Error al borrar marca: ' + error.message);
    } else {
      setData(prev => ({
        ...prev,
        brands: prev.brands.filter(b => b.id !== brandId)
      }));
    }
  };

  const changePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
  };

  const updateHeroImage = async (newImage) => {
    const { error } = await supabase.from('config').update({ value: { heroImage: newImage, version: data.version } }).eq('key', 'store_config');
    if (error) {
      toast.error('Error al cambiar imagen de portada: ' + error.message);
    } else {
      setData(prev => ({ ...prev, heroImage: newImage }));
    }
  };

  const addGalleryImage = async (productId, imageUrl) => {
    const { data: newImg, error } = await supabase
      .from('product_gallery')
      .insert([{ product_id: productId, image_url: imageUrl }])
      .select();
    
    if (error) {
      toast.error('Error al añadir imagen a la galería');
      throw error;
    }

    setData(prev => ({
      ...prev,
      gallery: [...prev.gallery, newImg[0]]
    }));
  };

  const deleteGalleryImage = async (imageId) => {
    const { error } = await supabase.from('product_gallery').delete().eq('id', imageId);
    if (error) {
      toast.error('Error al eliminar imagen');
      throw error;
    }

    setData(prev => ({
      ...prev,
      gallery: prev.gallery.filter(img => img.id !== imageId)
    }));
  };

  return (
    <StoreContext.Provider value={{ 
      data, 
      loading,
      user,
      login,
      logout,
      orders,
      fetchOrders,
      addOrder,
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
      changePassword,
      updateHeroImage,
      admins,
      fetchAdmins,
      addAdmin,
      updateAdmin,
      signUpAdmin,
      deleteAdmin,
      deleteOrder,
      updateOrder,
      quotes,
      fetchQuotes,
      quoteDetails,
      fetchQuoteDetails,
      registerQuote,
      saveQuoteDetails,
      deleteQuote,
      updateQuote,
      addGalleryImage,
      deleteGalleryImage
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => useContext(StoreContext);

