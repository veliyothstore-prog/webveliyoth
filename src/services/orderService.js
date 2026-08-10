import { supabase } from '../supabaseClient';

export const orderService = {
  fetchOrders: async () => {
    const { data, error } = await supabase.from('pedidos').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  addOrder: async (orderData) => {
    const { error } = await supabase.from('pedidos').insert([{ ...orderData, contacted: true, status: 'Pendiente' }]);
    if (error) throw error;
  },

  updateOrder: async (id, updates) => {
    const { error } = await supabase.from('pedidos').update(updates).eq('id', id);
    if (error) throw error;
  },

  deleteOrder: async (id) => {
    const { error } = await supabase.from('pedidos').delete().eq('id', id);
    if (error) throw error;
  },

  fetchQuotes: async () => {
    const { data, error } = await supabase.from('cotizaciones').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  fetchQuoteDetails: async () => {
    const { data, error } = await supabase.from('quotes').select('*');
    if (error) throw error;
    return data || [];
  },

  registerQuote: async (items, customerData = null) => {
    try {
      const productList = Array.isArray(items) ? items : [items];
      const reference = `VT-${Math.floor(1000 + Math.random() * 9000)}`;
      const firstItem = productList[0];
      
      // 1. Calcular totales para la tabla MAESTRA (cotizaciones)
      const total_price = Number(productList.reduce((acc, i) => 
        acc + (Number(i.price) * Number(i.quantity || 1)), 0
      ).toFixed(2));

      // Resumen del título para compatibilidad con la tabla actual
      const summary_title = productList.length > 1 
        ? `${productList[0].title} y ${productList.length - 1} más...`
        : productList[0].title;

      // Insertar en la tabla Maestra (cotizaciones)
      const { error: masterError } = await supabase.from('cotizaciones').insert([{
        reference,
        product_id: String(firstItem.id),
        product_title: summary_title.substring(0, 250),
        brand: firstItem.brand || 'MULTI',
        price: total_price,
        status: 'Enviado'
      }]);
      
      if (masterError) throw masterError;

      // 2. Insertar los DETALLES en la nueva tabla (cotizacion_items)
      const quoteItems = productList.map(item => ({
        reference,
        product_id: String(item.id),
        product_title: item.title.substring(0, 250),
        brand: item.brand || 'GENÉRICO',
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
      }));

      const { error: detailError } = await supabase.from('cotizacion_items').insert(quoteItems);
      if (detailError) throw detailError;

      // 3. Guardar datos del cliente
      if (customerData) {
        await orderService.saveQuoteDetails({ 
          customer_name: customerData.name,
          customer_phone: customerData.phone,
          reference, 
          product_id: String(firstItem.id) 
        });
      }

      return reference;
    } catch (err) {
      console.error('Error fatal en registerQuote:', err);
      throw err;
    }
  },

  saveQuoteDetails: async (details) => {
    const { data: existing, error: findError } = await supabase.from('quotes').select('id').eq('reference', details.reference);
    if (findError) throw findError;

    if (existing && existing.length > 0) {
      const { error } = await supabase.from('quotes').update(details).eq('id', existing[0].id);
      if (error) throw error;
    } else {
      const { error } = await supabase.from('quotes').insert([details]);
      if (error) throw error;
    }
  },

  deleteQuote: async (id) => {
    const { error } = await supabase.from('cotizaciones').delete().eq('id', id);
    if (error) throw error;
  },

  updateQuote: async (id, updates) => {
    const { error } = await supabase.from('cotizaciones').update(updates).eq('id', id);
    if (error) throw error;
  },

  getQuoteItems: async (reference) => {
    const { data, error } = await supabase
      .from('cotizacion_items')
      .select('*')
      .eq('reference', reference);
    if (error) throw error;
    return data;
  },

  saveQuoteItems: async (reference, items) => {
    const total_price = Number(items.reduce((acc, i) => acc + (Number(i.price) * Number(i.quantity || 1)), 0).toFixed(2));
    
    // 1. Eliminar ítems anteriores
    const { error: delError } = await supabase.from('cotizacion_items').delete().eq('reference', reference);
    if (delError) throw delError;
    
    // 2. Insertar nuevos ítems
    const quoteItems = items.map(item => ({
        reference,
        product_id: String(item.product_id),
        product_title: item.product_title || item.title || '',
        brand: item.brand || 'GENÉRICO',
        price: Number(item.price),
        quantity: Number(item.quantity || 1)
    }));
    
    if (quoteItems.length > 0) {
      const { error: insError } = await supabase.from('cotizacion_items').insert(quoteItems);
      if (insError) throw insError;
    }
    
    // 3. Actualizar el precio total en la cotización maestra
    const { error: updError } = await supabase.from('cotizaciones').update({ price: total_price }).eq('reference', reference);
    if (updError) throw updError;

    // 4. Sincronizar el precio si ya existe en pedidos
    await supabase.from('pedidos').update({ price: total_price }).eq('reference', reference);
  }
};
