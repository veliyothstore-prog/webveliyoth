import React from 'react';
import { useStore } from '../context/StoreContext';

const ImageLightbox = () => {
  const { viewingImage, setViewingImage } = useStore();

  if (!viewingImage) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0,0,0,0.95)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'zoom-out',
        animation: 'fadeIn 0.3s ease'
      }}
      onClick={() => setViewingImage(null)}
    >
      <button 
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: 'none',
          border: 'none',
          color: 'white',
          fontSize: '2.5rem',
          cursor: 'pointer',
          zIndex: 10000
        }}
      >
        ×
      </button>

      <img 
        src={viewingImage} 
        alt="Visualización" 
        style={{
          maxWidth: '90%',
          maxHeight: '90%',
          objectFit: 'contain',
          borderRadius: '4px',
          boxShadow: '0 0 50px rgba(0,0,0,0.5)',
          animation: 'zoomIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
};

export default ImageLightbox;
