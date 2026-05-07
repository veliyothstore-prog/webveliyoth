import React from 'react';
import { useStore } from '../context/StoreContext';

const Footer = () => {
  const { setIsAdminOpen } = useStore();

  return (
    <footer style={{
      background: 'var(--bg-dark)',
      padding: '4rem 0 2rem',
      borderTop: '1px solid #333',
      marginTop: '4rem',
      color: 'white'
    }}>
      <div className="container">
        <div className="grid" style={{
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem'
        }}>
          <div>
            <div className="logo flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
              <div style={{ background: 'var(--primary)', padding: '0.4rem 0.8rem', color: 'black', display: 'flex', alignItems: 'center' }}>
                <img src="/logo.png" alt="VeliYoth Store" style={{ height: '30px' }} />
              </div>
            </div>
            <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Tu socio tecnológico de confianza en Perú. Especialistas en equipos informáticos de alto rendimiento y soluciones de seguridad integral para hogares y empresas.
            </p>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Contacto</h4>
            <ul style={{ listStyle: 'none', color: '#aaa', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>📍 Las Flores, SJL, Lima, Perú</li>
              <li>📞 WhatsApp: +51 936424026</li>
              <li>✉️ veliyothstore@gmail.com</li>
              <li>⏰ Lun - Sáb: 9am - 7pm</li>
            </ul>
          </div>

          <div>
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.1em' }}>Enlaces Rápidos</h4>
            <ul style={{ listStyle: 'none', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Inicio</a></li>
              <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Laptops</a></li>
              <li><a href="#" style={{ color: '#aaa', textDecoration: 'none' }}>Cámaras</a></li>
              <li>
                <button 
                  onClick={() => setIsAdminOpen(true)} 
                  style={{ background: 'none', border: 'none', color: '#aaa', padding: 0, cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  Acceso Admin
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid #333',
          paddingTop: '2rem',
          textAlign: 'center',
          color: '#666',
          fontSize: '0.8rem'
        }}>
          © 2026 VeliYoth Store. Todos los derechos reservados.
        </div>
      </div>
      
      <style>{`
        a:hover, button:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
