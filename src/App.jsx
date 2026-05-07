import React from 'react';
import { StoreProvider } from './context/StoreContext';
import Header from './components/Header';
import Hero from './components/Hero';
import MainContent from './components/MainContent';
import Footer from './components/Footer';
import ProductModal from './components/ProductModal';
import AdminPanel from './components/AdminPanel';
import WhatsAppFloat from './components/WhatsAppFloat';

function App() {
  return (
    <StoreProvider>
      <div className="app-container">
        <Header />
        <main>
          <Hero />
          <MainContent />
        </main>
        <Footer />
        <ProductModal />
        <AdminPanel />
        <WhatsAppFloat />
      </div>
    </StoreProvider>

  );
}

export default App;
