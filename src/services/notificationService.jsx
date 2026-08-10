import React from 'react';
import toast from 'react-hot-toast';

export const notificationService = {
  notifyNewQuote: (quote) => {
    toast.success((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontWeight: 800 }}>📄 ¡NUEVA COTIZACIÓN!</span>
        <span style={{ fontSize: '0.8rem' }}>{quote.product_title}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>Ref: {quote.reference}</span>
        <button 
          onClick={() => toast.dismiss(t.id)}
          style={{ background: '#111', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', fontSize: '0.7rem', marginTop: '0.2rem', cursor: 'pointer' }}
        > Entendido </button>
      </div>
    ), { duration: 6000, position: 'top-right' });
  },

  notifyNewOrder: (order) => {
    toast.success((t) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <span style={{ fontWeight: 800, color: '#10b981' }}>🛒 ¡NUEVO PEDIDO PAGADO!</span>
        <span style={{ fontSize: '0.8rem' }}>{order.product_title}</span>
        <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>S/ {order.price}</span>
        <button 
          onClick={() => toast.dismiss(t.id)}
          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.3rem', borderRadius: '4px', fontSize: '0.7rem', marginTop: '0.2rem', cursor: 'pointer' }}
        > Ver Pedido </button>
      </div>
    ), { duration: 8000, position: 'top-right' });
  }
};
