import { supabase } from '../supabaseClient';
import { notificationService } from './notificationService';

export const setupAdminRealtime = (onQuote, onOrder) => {
  const quoteSub = supabase
    .channel('admin-quotes')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cotizaciones' }, payload => {
      notificationService.notifyNewQuote(payload.new);
      onQuote();
    })
    .subscribe();

  const orderSub = supabase
    .channel('admin-orders')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pedidos' }, payload => {
      notificationService.notifyNewOrder(payload.new);
      onOrder();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(quoteSub);
    supabase.removeChannel(orderSub);
  };
};
