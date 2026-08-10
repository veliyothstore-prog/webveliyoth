import React from 'react';
import { useStore } from '../context/StoreContext';

const CartFloat = ({ onOpen }) => {
  const { cart } = useStore();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  if (count === 0) return null;

  return (
    <div 
      onClick={onOpen}
      style={{
        position: 'fixed',
        bottom: '100px',
        right: '25px',
        width: '65px',
        height: '65px',
        background: 'var(--primary)',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        boxShadow: '0 8px 30px rgba(255, 222, 0, 0.4)',
        zIndex: 4000,
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        animation: 'bounceIn 0.5s ease',
        border: '4px solid white'
      }}
      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) rotate(-10deg)'}
      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) rotate(0deg)'}
    >
      <span style={{ fontSize: '1.8rem' }}>🛒</span>
      <div style={{
        position: 'absolute',
        top: '-5px',
        right: '-5px',
        background: '#ff4d4d',
        color: 'white',
        minWidth: '24px',
        height: '24px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.75rem',
        fontWeight: 900,
        padding: '0 5px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
        border: '2px solid white'
      }}>
        {count}
      </div>

      <style>{`
        @keyframes bounceIn {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default CartFloat;
