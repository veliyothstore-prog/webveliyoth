import React from 'react';
import { useStore } from '../context/StoreContext';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
  const { data, setActiveCategory, setIsAdminOpen } = useStore();
  const navigate = useNavigate();

  const handleLinkClick = (id) => {
    setActiveCategory(id);
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer style={{ background: 'var(--bg-dark)', padding: '5rem 0 2rem', borderTop: '1px solid #333', color: 'white' }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '4rem', marginBottom: '4rem' }}>
          {/* Info de Marca */}
          <div>
            <div
              style={{
                background: 'var(--primary)',
                display: 'inline-block',
                padding: '0.8rem 1.5rem',
                marginBottom: '1.5rem',
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0% 100%)'
              }}
            >
              <img src="/logo.png" alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.8', marginBottom: '2rem' }}>
              Expertos en seguridad electrónica y soluciones tecnológicas para hogares y empresas en todo el Perú.
            </p>

            {/* Redes Sociales - Mejoradas con SVG */}
            <div style={{ display: 'flex', gap: '1.2rem' }}>
              <a
                href="https://www.facebook.com/profile.php?id=61567388631918"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-new"
                title="Facebook"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
              </a>
              <a
                href="https://instagram.com/veliyoth_store"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-new"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
              </a>
              <a
                href="https://wa.me/51936424026"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link-new"
                title="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.891 11.891-11.891 3.181 0 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.335 11.892-11.891 11.892-1.992 0-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.887 9.884 0 2.221.634 3.813 1.584 5.405l-1.027 3.748 3.931-1.03zm11.367-5.593c-.31-.154-1.829-.902-2.11-.101-.281.199-.749.932-.918 1.127-.169.194-.338.213-.647.06-.311-.154-1.31-.483-2.495-1.539-.922-.821-1.544-1.835-1.724-2.145-.18-.31-.019-.477.136-.63.14-.138.31-.359.466-.539.15-.181.203-.31.304-.518.102-.207.052-.388-.026-.543-.078-.155-.749-1.803-1.026-2.467-.271-.645-.546-.558-.749-.568l-.638-.01c-.225 0-.59.084-.899.414-.309.33-1.179 1.153-1.179 2.809 0 1.656 1.208 3.256 1.377 3.481.169.225 2.38 3.634 5.764 5.094 2.818 1.216 3.393 1.076 4.011.815.619-.261 1.829-.747 2.086-1.439.256-.692.256-1.285.18-1.411-.076-.127-.277-.202-.587-.356z" /></svg>
              </a>
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '2px' }}>Categorías</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <a href="#" onClick={() => handleLinkClick('all')} className="f-link-dark">Catálogo Completo</a>
              {data.categories.map(cat => (
                <a key={cat.id} href="#" onClick={() => handleLinkClick(cat.id)} className="f-link-dark">{cat.name}</a>
              ))}
            </div>
          </div>

          {/* Contacto */}
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: 'white', textTransform: 'uppercase', marginBottom: '2rem', letterSpacing: '2px' }}>Contacto</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: '#94a3b8', fontSize: '0.9rem' }}>
              <p>📍 Las Flores, San Juan de Lurigancho, 15404, Lima. Perú.</p>
              <p>📞 +51 936 424 026</p>
              <p>✉️ veliyothstore@gmail.com</p>

              <div style={{ marginTop: '1.5rem' }}>
                <span
                  onClick={() => setIsAdminOpen(true)}
                  style={{ color: 'white', fontSize: '0.9rem', cursor: 'pointer', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  onMouseOver={(e) => e.target.style.color = 'var(--primary)'}
                  onMouseOut={(e) => e.target.style.color = 'white'}
                >
                  🧑‍💼 Panel Administrativo
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #333', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
          <p>© {new Date().getFullYear()} VeliYoth Store. Todos los derechos reservados.</p>
        </div>
      </div>

      <style>{`
        .f-link-dark {
          color: #94a3b8;
          text-decoration: none;
          font-size: 0.9rem;
          transition: color 0.3s;
          cursor: pointer;
        }
        .f-link-dark:hover {
          color: var(--primary);
        }
        .social-link-new {
          color: #94a3b8;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .social-link-new:hover {
          color: var(--primary);
          transform: translateY(-3px);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
