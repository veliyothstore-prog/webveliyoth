import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import toast from 'react-hot-toast';
import { generateProfessionalPDF } from '../utils/pdfGenerator';

const CartModal = ({ isOpen, onClose }) => {
  const { cart, removeFromCart, updateCartQty, clearCart, registerQuote } = useStore();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeRef, setActiveRef] = useState(null);
  const registrationPromise = React.useRef(null);

  if (!isOpen) return null;

  const total = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  const getOrRegisterRef = async () => {
    if (activeRef) return activeRef;
    
    if (registrationPromise.current) {
      return await registrationPromise.current;
    }

    registrationPromise.current = (async () => {
      try {
        const ref = await registerQuote(cart, { name, phone });
        setActiveRef(ref);
        return ref;
      } finally {
        registrationPromise.current = null;
      }
    })();

    return await registrationPromise.current;
  };

  const handleWhatsApp = async () => {
    if (!name || !phone) return toast.error('Ingresa tu nombre y WhatsApp');
    setIsSubmitting(true);
    try {
      const ref = await getOrRegisterRef();
      const itemsList = cart.map(i => `- ${i.title} (x${i.quantity})`).join('\n');
      const message = `Hola VeliYoth Store, soy ${name}. Deseo cotizar:\n${itemsList}\nTotal aprox: S/ ${Number(total).toFixed(2)}\nRef: ${ref}`;
      const url = `https://wa.me/51936424026?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
      toast.success('¡Cotización enviada!');
      setIsSuccess(true); // Mostrar pantalla de éxito
    } catch (e) {
      console.error('Error en cotización:', e);
      toast.error('Error al procesar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePDF = async () => {
    if (!name || !phone) return toast.error('Ingresa tu nombre y WhatsApp para el PDF');
    toast.loading('Preparando presupuesto...', { id: 'pdf' });
    try {
      const ref = await getOrRegisterRef();
      // Usar isPreview=true para obtener un BlobURL en lugar de descargar
      const blobUrl = await generateProfessionalPDF(cart, { name, phone, reference: ref }, true);
      if (blobUrl) {
        window.open(blobUrl, '_blank');
        toast.success('¡Vista previa abierta!', { id: 'pdf' });
        setIsSuccess(true);
      } else {
        toast.error('Error al generar PDF', { id: 'pdf' });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error al generar PDF', { id: 'pdf' });
    }
  };

  const handleFinish = () => {
    clearCart();
    setName('');
    setPhone('');
    setActiveRef(null);
    setIsSuccess(false);
    onClose();
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.85)', zIndex: 6000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', backdropFilter: 'blur(5px)' }}>
      <div className="modal-content" style={{ background: 'white', width: '100%', maxWidth: '600px', borderRadius: '16px', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '95vh' }}>
        <div style={{ padding: '1.5rem', background: '#1e293b', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontWeight: 900 }}>{isSuccess ? '¡COTIZACIÓN REGISTRADA!' : 'TU CARRITO DE COTIZACIÓN'}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
              <div style={{ width: '80px', height: '80px', background: '#dcfce7', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', fontSize: '2.5rem' }}>✅</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#1e293b', marginBottom: '0.5rem' }}>¡Gracias, {name.split(' ')[0]}!</h2>
              <p style={{ color: '#64748b', fontSize: '1rem', marginBottom: '2rem' }}>Hemos registrado tu cotización con la referencia <b style={{ color: 'var(--primary)', background: '#000', padding: '2px 8px', borderRadius: '4px' }}>{activeRef}</b></p>
              
              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '15px', marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
                <p style={{ fontSize: '0.9rem', fontWeight: 700, color: '#475569', marginBottom: '1rem' }}>¿Qué deseas hacer ahora?</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <button 
                    onClick={handlePDF}
                    style={{ width: '100%', padding: '1rem', background: 'white', border: '2px solid #1e293b', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                  >
                    📄 DESCARGAR MI PRESUPUESTO PDF
                  </button>
                  <button 
                    onClick={handleFinish}
                    style={{ width: '100%', padding: '1rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    FINALIZAR Y SEGUIR COMPRANDO
                  </button>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Un asesor revisará tu pedido y te contactará si es necesario.</p>
            </div>
          ) : cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <span style={{ fontSize: '3rem' }}>🛒</span>
              <p style={{ fontWeight: 700, color: '#64748b' }}>Tu carrito está vacío</p>
              <button onClick={onClose} style={{ marginTop: '1rem', padding: '0.8rem 2rem', background: 'var(--primary)', border: 'none', borderRadius: '8px', fontWeight: 900, cursor: 'pointer' }}>VOLVER A LA TIENDA</button>
            </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: '1rem', paddingBottom: '1rem', marginBottom: '1rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center' }}>
                  <img src={item.image} alt="" style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f8fafc', borderRadius: '8px' }} />
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 0.3rem 0', fontSize: '0.9rem', fontWeight: 800 }}>{item.title}</h4>
                    <p style={{ margin: 0, color: 'var(--primary)', fontWeight: 900, fontSize: '0.9rem' }}>S/ {Number(item.price).toFixed(2)}</p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button onClick={() => updateCartQty(item.id, item.quantity - 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>-</button>
                    <span style={{ fontWeight: 900 }}>{item.quantity}</span>
                    <button onClick={() => updateCartQty(item.id, item.quantity + 1)} style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid #ddd', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>+</button>
                  </div>
                  <button onClick={() => removeFromCart(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}>🗑️</button>
                </div>
              ))}

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', marginTop: '1rem' }}>
                <h4 style={{ margin: '0 0 1rem 0', fontSize: '0.8rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase' }}>Datos del Cliente</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <input 
                    type="text" 
                    placeholder="TU NOMBRE COMPLETO" 
                    value={name}
                    onChange={e => setName(e.target.value.toUpperCase())}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1', textTransform: 'uppercase', fontWeight: 700 }}
                  />
                  <input 
                    type="tel" 
                    placeholder="NÚMERO DE WHATSAPP" 
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^0-9+ ]/g, ''))}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.5rem', padding: '1rem', borderTop: '2px dashed #f1f5f9' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ fontWeight: 800, color: '#64748b' }}>TOTAL ESTIMADO:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a' }}>S/ {Number(total).toFixed(2)}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                  <button 
                    disabled={isSubmitting}
                    onClick={handleWhatsApp}
                    style={{ width: '100%', padding: '1.2rem', background: 'var(--primary)', border: 'none', borderRadius: '12px', fontWeight: 900, cursor: 'pointer', boxShadow: '0 4px 15px rgba(255, 222, 0, 0.4)' }}
                  >
                    🚀 {isSubmitting ? 'PROCESANDO...' : 'COTIZAR TODO POR WHATSAPP'}
                  </button>
                  <button 
                    onClick={handlePDF}
                    style={{ width: '100%', padding: '1rem', background: '#1e293b', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}
                  >
                    📄 GENERAR PRESUPUESTO PDF
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartModal;
