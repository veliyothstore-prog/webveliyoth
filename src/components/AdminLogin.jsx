import React, { useState } from 'react';
import toast from 'react-hot-toast';

const AdminLogin = ({ onLogin, onCancel }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const pass = e.target.password.value;
    
    setLoading(true);
    const t = toast.loading('Verificando credenciales...');
    try {
      await onLogin(email, pass);
      toast.success('¡Bienvenido de nuevo!', { id: t });
    } catch (err) {
      toast.error(err.message || 'Error al ingresar', { id: t });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
      zIndex: 5000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Inter', sans-serif", padding: '1rem'
    }}>
      {/* Elementos decorativos animados */}
      <div style={{
        position: 'absolute', width: '300px', height: '300px', 
        background: 'var(--primary)', borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.15, top: '10%', left: '10%', animation: 'float 6s infinite alternate'
      }} />
      <div style={{
        position: 'absolute', width: '250px', height: '250px', 
        background: '#3b82f6', borderRadius: '50%', filter: 'blur(100px)',
        opacity: 0.1, bottom: '15%', right: '15%', animation: 'float 8s infinite alternate-reverse'
      }} />

      <style>{`
        @keyframes float {
          from { transform: translateY(0) scale(1); }
          to { transform: translateY(-20px) scale(1.1); }
        }
        .login-card {
          backdrop-filter: blur(16px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-input {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.3s;
        }
        .login-input:focus {
          border-color: var(--primary);
          background: rgba(255, 255, 255, 0.08);
          box-shadow: 0 0 0 2px rgba(255, 222, 0, 0.2);
        }
      `}</style>

      <div className="login-card" style={{
        padding: '3rem 2.5rem', borderRadius: '24px', width: '100%', maxWidth: '420px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', position: 'relative', zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '60px', height: '60px', background: 'var(--primary)', 
            borderRadius: '16px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', fontSize: '2rem', margin: '0 auto 1.5rem',
            boxShadow: '0 10px 20px rgba(255, 222, 0, 0.3)'
          }}>⚡</div>
          <h2 style={{ margin: 0, color: 'white', fontWeight: 900, fontSize: '1.8rem', letterSpacing: '-0.5px' }}>VELIYOTH <span style={{ color: 'var(--primary)' }}>STORE</span></h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.6rem', fontWeight: 500 }}>Panel de Control Administrativo</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Correo Electrónico</label>
            <input 
              name="email" type="email" required placeholder="admin@veliyoth.store" 
              className="login-input"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', outline: 'none', fontSize: '1rem' }} 
            />
          </div>
          
          <div style={{ marginBottom: '2.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.7rem', fontWeight: 800, marginBottom: '0.6rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px' }}>Contraseña</label>
            <input 
              name="password" type="password" required placeholder="••••••••" 
              className="login-input"
              style={{ width: '100%', padding: '1rem', borderRadius: '12px', outline: 'none', fontSize: '1rem' }} 
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ 
              width: '100%', padding: '1.1rem', background: 'var(--primary)', 
              color: 'black', border: 'none', borderRadius: '12px', 
              fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s',
              fontSize: '1rem', boxShadow: '0 10px 15px -3px rgba(255, 222, 0, 0.2)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {loading ? 'ACCEDIENDO...' : 'ENTRAR AL SISTEMA'}
          </button>

          <button 
            type="button" 
            onClick={onCancel}
            style={{ 
              width: '100%', padding: '1rem', background: 'transparent', 
              color: '#64748b', border: 'none', marginTop: '1rem', 
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
              transition: 'color 0.2s'
            }}
            onMouseOver={(e) => e.target.style.color = '#94a3b8'}
            onMouseOut={(e) => e.target.style.color = '#64748b'}
          >
            ← Volver a la vitrina
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
