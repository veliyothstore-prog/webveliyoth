import React from 'react';

const WhatsAppFloat = () => {
  const phoneNumber = '51936424026';
  const message = 'Hola VeliYoth Store! 👋 Deseo más información sobre sus productos.';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <>
      <a 
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        title="Chatea con nosotros"
      >
        <span style={{ fontSize: '2rem' }}>💬</span>
      </a>

      <style>{`
        .whatsapp-float {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 65px;
          height: 65px;
          background-color: #25d366;
          color: #FFF;
          border-radius: 50px;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          z-index: 1000;
          text-decoration: none;
          transition: all 0.3s ease;
          animation: pulse 2s infinite;
        }

        .whatsapp-float:hover {
          transform: scale(1.1);
          background-color: #128c7e;
          box-shadow: 0 6px 20px rgba(0,0,0,0.4);
        }

        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7);
          }
          70% {
            box-shadow: 0 0 0 15px rgba(37, 211, 102, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(37, 211, 102, 0);
          }
        }

        @media (max-width: 768px) {
          .whatsapp-float {
            bottom: 20px;
            right: 20px;
            width: 55px;
            height: 55px;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppFloat;
