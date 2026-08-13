// Invalidate cache
import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import Header from './components/Header';
import Hero from './components/Hero';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import AdminPanel from './components/AdminPanel';
import WhatsAppFloat from './components/WhatsAppFloat';
import ImageLightbox from './components/ImageLightbox';
import CartFloat from './components/CartFloat';
import CartModal from './components/CartModal';
import { Toaster } from 'react-hot-toast';
import { HashRouter, Routes, Route } from 'react-router-dom';
import ProductPage from './components/ProductPage';

function StoreApp() {
  const { isAdminOpen } = useStore();
  const [isCartOpen, setIsCartOpen] = React.useState(false);

  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
          <>
            <Header />
            <main>
              <Hero />
              <MainContent />
            </main>
            <Footer />
            <ProductModal />
          </>
        } />
        <Route path="/product/:id" element={<ProductPage />} />
      </Routes>

      {/* Overlays shared across all routes */}
      {isAdminOpen && <AdminPanel />}
      <WhatsAppFloat />
      <ImageLightbox />
      <CartFloat onOpen={() => setIsCartOpen(true)} />
      <CartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <StoreProvider>
        <Toaster position="top-right" reverseOrder={false} />
        <StoreApp />
      </StoreProvider>
    </HashRouter>
  );
}

export default App;
