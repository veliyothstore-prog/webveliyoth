import { supabase } from '../supabaseClient';

export const productService = {
  fetchInitialData: async () => {
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

    return {
      products: products || [],
      categories: categories || [],
      brands: brands || [],
      promotions: promotions || [],
      gallery: gallery || [],
      heroImage: storeConfig.heroImage || '/hero.png',
      version: storeConfig.version || '1.5',
      commercialConditions: storeConfig.commercialConditions || 'Forma de pago: 70% de adelanto al aceptar la cotización y 30% al finalizar la instalación.\nPlazo de entrega e instalación: Dentro de 2 días hábiles luego del adelanto.\nValidez Proforma: 2 días calendario\nGarantía: 12 meses por defecto de fábrica y 3 meses por instalación.'
    };
  },

  updateProduct: async (id, updates) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) throw error;
  },

  addProduct: async (product) => {
    const { data, error } = await supabase.from('products').insert([product]).select();
    if (error) throw error;
    return data[0];
  },

  deleteProduct: async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) throw error;
  },

  uploadImage: async (file, folder = 'otros') => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage.from('catalogo').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('catalogo').getPublicUrl(filePath);
    return data.publicUrl;
  },

  addGalleryImage: async (productId, imageUrl) => {
    const { data, error } = await supabase.from('product_gallery').insert([{ product_id: productId, image_url: imageUrl }]).select();
    if (error) throw error;
    return data[0];
  },

  deleteGalleryImage: async (id) => {
    const { error } = await supabase.from('product_gallery').delete().eq('id', id);
    if (error) throw error;
  },

  addCategory: async (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('categories').insert([{ id, name }]);
    if (error) throw error;
    return { id, name };
  },

  updateCategory: async (id, name) => {
    const { error } = await supabase.from('categories').update({ name }).eq('id', id);
    if (error) throw error;
  },

  deleteCategory: async (id) => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
  },

  addBrand: async (name) => {
    const id = name.toLowerCase().replace(/\s+/g, '-');
    const { error } = await supabase.from('brands').insert([{ id, name }]);
    if (error) throw error;
    return { id, name };
  },

  updateBrand: async (id, name) => {
    const { error } = await supabase.from('brands').update({ name }).eq('id', id);
    if (error) throw error;
  },

  deleteBrand: async (id) => {
    const { error } = await supabase.from('brands').delete().eq('id', id);
    if (error) throw error;
  },

  updatePromotion: async (id, updates) => {
    const { error } = await supabase.from('promotions').update(updates).eq('id', id);
    if (error) throw error;
  },

  updateStoreConfig: async (newConfig) => {
    const { error } = await supabase.from('config').update({ value: newConfig }).eq('key', 'store_config');
    if (error) throw error;
  }
};
